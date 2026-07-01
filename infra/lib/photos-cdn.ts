import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface PhotosCdnProps {
  photosBucket: s3.IBucket;
  certificate: acm.ICertificate;
}

export class PhotosCdn extends Construct {
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: PhotosCdnProps) {
    super(scope, id);

    // Short TTL policy for content/ — manifests and site-content.json should
    // reflect CMS changes quickly without requiring a manual invalidation.
    const shortTtlPolicy = new cloudfront.CachePolicy(this, 'ShortTtlPolicy', {
      cachePolicyName: 'RachelKeys-ContentShortTtl',
      minTtl: cdk.Duration.seconds(0),
      defaultTtl: cdk.Duration.seconds(30),
      maxTtl: cdk.Duration.seconds(60),
      // Must include Origin in the cache key so CORS responses are cached
      // per-origin rather than a single cached response for all origins.
      headerBehavior: cloudfront.CacheHeaderBehavior.allowList('Origin'),
    });

    // Photos cache policy — also must vary on Origin for CORS
    const photosCachePolicy = new cloudfront.CachePolicy(this, 'PhotosCachePolicy', {
      cachePolicyName: 'RachelKeys-PhotosWithCors',
      minTtl: cdk.Duration.seconds(0),
      defaultTtl: cdk.Duration.days(1),
      maxTtl: cdk.Duration.days(365),
      headerBehavior: cloudfront.CacheHeaderBehavior.allowList('Origin'),
    });

    // Forward Origin header to S3 so it evaluates CORS rules and returns
    // Access-Control-Allow-Origin in the response.
    const corsOriginPolicy = new cloudfront.OriginRequestPolicy(this, 'CorsOriginPolicy', {
      originRequestPolicyName: 'RachelKeys-ForwardOrigin',
      headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList('Origin'),
    });

    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(props.photosBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: photosCachePolicy,
        originRequestPolicy: corsOriginPolicy,
      },
      additionalBehaviors: {
        // content/* (manifests, site-content.json) — max 30s cache so CMS
        // edits appear on the portfolio within half a minute.
        'content/*': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(props.photosBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: shortTtlPolicy,
          originRequestPolicy: corsOriginPolicy,
        },
      },
      certificate: props.certificate,
      domainNames: ['photos.rachelkeysphotography.com'],
    });
  }
}
