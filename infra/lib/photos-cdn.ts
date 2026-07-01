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
    });

    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(props.photosBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        // content/* (manifests, site-content.json) — max 30s cache so CMS
        // edits appear on the portfolio within half a minute.
        'content/*': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(props.photosBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: shortTtlPolicy,
        },
      },
      certificate: props.certificate,
      domainNames: ['photos.rachelkeysphotography.com'],
    });
  }
}
