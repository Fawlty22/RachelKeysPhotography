import * as cdk from "aws-cdk-lib";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

interface PortfolioPipelineProps {
  /** The S3 bucket the built portfolio HTML is deployed into */
  portfolioBucket: s3.IBucket;
  /** The CloudFront distribution to invalidate after each deploy */
  portfolioDistribution: cloudfront.IDistribution;
}

/**
 * PortfolioPipeline
 *
 * Provisions an automated build-and-deploy pipeline for the portfolio site.
 * Entirely within AWS — no GitHub connection required.
 *
 *   CMS publish
 *       ↓
 *   Lambda (Function URL) — triggered by the CMS with a secret header
 *       ↓
 *   CodeBuild — pulls source from S3, runs `next build`,
 *               syncs out/ to the portfolio S3 bucket,
 *               invalidates CloudFront
 *
 * Source bundle:
 *   CodeBuild reads the portfolio source from a dedicated S3 bucket
 *   (the "source bucket"). You upload a zip of the portfolio/ directory
 *   to s3://<sourceBucket>/portfolio-source.zip whenever the code changes.
 *   Content-only rebuilds (triggered by Rachel publishing in the CMS) reuse
 *   whichever zip is already in that bucket — the code hasn't changed, only
 *   the data fetched from the photos CDN at build time has.
 *
 * Uploading a new source bundle (run from repo root):
 *   zip -r portfolio-source.zip portfolio/ -x "portfolio/node_modules/*" -x "portfolio/.next/*" -x "portfolio/out/*"
 *   aws s3 cp portfolio-source.zip s3://<SourceBucketName>/portfolio-source.zip
 */
export class PortfolioPipeline extends Construct {
  /** Public HTTPS URL the CMS POSTs to trigger a rebuild */
  public readonly triggerUrl: string;
  /** The S3 bucket CodeBuild reads the portfolio source zip from */
  public readonly sourceBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: PortfolioPipelineProps) {
    super(scope, id);

    const account = cdk.Stack.of(this).account;

    // -------------------------------------------------------------------------
    // Source bucket — holds portfolio-source.zip
    // CodeBuild pulls from here; you upload here when code changes.
    // -------------------------------------------------------------------------
    this.sourceBucket = new s3.Bucket(this, "SourceBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      versioned: true, // keeps previous source bundles for easy rollback
    });

    // -------------------------------------------------------------------------
    // CodeBuild — IAM role
    // -------------------------------------------------------------------------
    const buildRole = new iam.Role(this, "BuildRole", {
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
      description: "CodeBuild role for portfolio static site builds",
    });

    // Read source zip from the source bucket
    this.sourceBucket.grantRead(buildRole);

    // Write built output to the portfolio bucket
    props.portfolioBucket.grantReadWrite(buildRole);
    props.portfolioBucket.grantDelete(buildRole);

    // Invalidate CloudFront after deploy
    buildRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["cloudfront:CreateInvalidation"],
        resources: [
          `arn:aws:cloudfront::${account}:distribution/${props.portfolioDistribution.distributionId}`,
        ],
      }),
    );

    // -------------------------------------------------------------------------
    // CodeBuild — project
    // -------------------------------------------------------------------------
    const buildProject = new codebuild.Project(this, "BuildProject", {
      projectName: "rachel-keys-portfolio-build",
      role: buildRole,
      description:
        "Builds the Rachel Keys Photography Next.js portfolio and deploys to S3",

      // Source is a zip file in S3 — no GitHub connection needed.
      // The zip must contain the portfolio/ directory at its root.
      source: codebuild.Source.s3({
        bucket: this.sourceBucket,
        path: "portfolio-source.zip",
      }),

      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.SMALL,
      },

      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            "runtime-versions": { nodejs: "20" },
            commands: [
              // CodeBuild extracts the zip at the workspace root.
              // The zip contains a portfolio/ directory, so cd into it.
              "cd portfolio",
              "npm ci --prefer-offline",
            ],
          },
          build: {
            commands: ["npm run build"],
          },
          post_build: {
            commands: [
              // Sync the static export to the portfolio bucket
              `aws s3 sync out/ s3://${props.portfolioBucket.bucketName}/ --delete`,
              // Invalidate CloudFront so the new build goes live immediately
              `aws cloudfront create-invalidation --distribution-id ${props.portfolioDistribution.distributionId} --paths "/*"`,
            ],
          },
        },
      }),

      logging: {
        cloudWatch: {
          logGroup: new logs.LogGroup(this, "BuildLogs", {
            logGroupName: "/rachel-keys/portfolio-build",
            retention: logs.RetentionDays.ONE_MONTH,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
          }),
        },
      },
    });

    // -------------------------------------------------------------------------
    // Lambda — trigger function
    //
    // The CMS POSTs to this Function URL to kick off a rebuild.
    // Requests without the correct X-Rebuild-Secret header are rejected.
    // -------------------------------------------------------------------------
    const triggerRole = new iam.Role(this, "TriggerRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole",
        ),
      ],
    });

    triggerRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["codebuild:StartBuild"],
        resources: [buildProject.projectArn],
      }),
    );

    const triggerFn = new lambda.Function(this, "TriggerFunction", {
      functionName: "rachel-keys-portfolio-trigger",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      role: triggerRole,
      timeout: cdk.Duration.seconds(10),
      description:
        "Receives a POST from the CMS and starts a CodeBuild portfolio rebuild",
      environment: {
        PROJECT_NAME: buildProject.projectName,
        REBUILD_SECRET: "HarperTheGoose",
      },
      code: lambda.Code.fromInline(`
const { CodeBuildClient, StartBuildCommand } = require('@aws-sdk/client-codebuild');
const client = new CodeBuildClient({});

exports.handler = async (event) => {
  const secret = process.env.REBUILD_SECRET;
  const provided = (event.headers || {})['x-rebuild-secret'];

  if (provided !== secret) {
    console.log('Rejected: invalid or missing X-Rebuild-Secret');
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const result = await client.send(new StartBuildCommand({ projectName: process.env.PROJECT_NAME }));
    const buildId = result.build.id;
    console.log('CodeBuild build started:', buildId);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buildId }),
    };
  } catch (err) {
    console.error('Failed to start build:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to start build' }),
    };
  }
};
      `),
    });

    // Public HTTPS endpoint — auth is handled by the secret header
    const fnUrl = triggerFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["https://admin.rachelkeysphotography.com"],
        allowedMethods: [lambda.HttpMethod.POST],
        allowedHeaders: ["content-type", "x-rebuild-secret"],
      },
    });

    this.triggerUrl = fnUrl.url;

    // -------------------------------------------------------------------------
    // Outputs
    // -------------------------------------------------------------------------
    new cdk.CfnOutput(this, "TriggerUrl", {
      value: fnUrl.url,
      description:
        "POST to this URL from the CMS to trigger a portfolio rebuild (include X-Rebuild-Secret header)",
    });

    new cdk.CfnOutput(this, "SourceBucketName", {
      value: this.sourceBucket.bucketName,
      description:
        "Upload portfolio-source.zip here when portfolio code changes",
    });

    new cdk.CfnOutput(this, "BuildProjectName", {
      value: buildProject.projectName,
      description: "CodeBuild project — check here to monitor build status",
    });
  }
}
