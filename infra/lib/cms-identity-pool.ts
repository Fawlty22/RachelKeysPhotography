import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as cognitoIdentityPool from 'aws-cdk-lib/aws-cognito-identitypool';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface CmsIdentityPoolProps {
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  photosBucket: s3.Bucket;
}

export class CmsIdentityPool extends Construct {
  public readonly identityPool: cognitoIdentityPool.IdentityPool;

  constructor(scope: Construct, id: string, props: CmsIdentityPoolProps) {
    super(scope, id);

    this.identityPool = new cognitoIdentityPool.IdentityPool(this, 'IdentityPool', {
      identityPoolName: 'rachelkeys-cms-identity-pool',
      allowUnauthenticatedIdentities: false,
      authenticationProviders: {
        userPools: [
          new cognitoIdentityPool.UserPoolAuthenticationProvider({
            userPool: props.userPool,
            userPoolClient: props.userPoolClient,
          }),
        ],
      },
    });

    // Grant authenticated users access to the photos bucket
    this.identityPool.authenticatedRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          's3:ListBucket',
        ],
        resources: [props.photosBucket.bucketArn],
      }),
    );

    this.identityPool.authenticatedRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          's3:GetObject',
          's3:PutObject',
          's3:DeleteObject',
        ],
        resources: [
          // photos/* covers all photo uploads including photos/events/{eventId}/
          `${props.photosBucket.bucketArn}/photos/*`,
          `${props.photosBucket.bucketArn}/content/*`,
        ],
      }),
    );

    // Allow the CMS to poll CodeBuild build status so it can show
    // live deploy progress after triggering a rebuild.
    this.identityPool.authenticatedRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['codebuild:BatchGetBuilds'],
        // CodeBuild doesn't support resource-level restrictions on BatchGetBuilds
        resources: ['*'],
      }),
    );

    new cdk.CfnOutput(this, 'IdentityPoolId', {
      value: this.identityPool.identityPoolId,
      exportName: 'CmsIdentityPoolId',
    });
  }
}
