import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';
import { DnsConstruct } from './dns';
import { PhotosBucket } from './photos-bucket';
import { PortfolioSite } from './portfolio-site';
import { CmsHub } from './cms-hub';
import { CmsAuth } from './cms-auth';
import { CmsIdentityPool } from './cms-identity-pool';
import { PhotosCdn } from './photos-cdn';

export class RachelKeysPhotographyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dns = new DnsConstruct(this, 'Dns');
    const photos = new PhotosBucket(this, 'PhotosBucket');
    const auth = new CmsAuth(this, 'CmsAuth');

    const portfolio = new PortfolioSite(this, 'PortfolioSite', {
      certificate: dns.certificate,
    });

    new CmsIdentityPool(this, 'CmsIdentityPool', {
      userPool: auth.userPool,
      userPoolClient: auth.userPoolClient,
      photosBucket: photos.bucket,
    });

    const cms = new CmsHub(this, 'CmsHub', {
      certificate: dns.certificate,
      photosBucket: photos.bucket,
    });

    const photosCdn = new PhotosCdn(this, 'PhotosCdn', {
      photosBucket: photos.bucket,
      certificate: dns.certificate,
    });

    // Apex A + AAAA → portfolio CloudFront
    new route53.ARecord(this, 'PortfolioARecord', {
      zone: dns.hostedZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(portfolio.distribution)),
    });
    new route53.AaaaRecord(this, 'PortfolioAaaaRecord', {
      zone: dns.hostedZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(portfolio.distribution)),
    });

    // admin.rachelkeysphotography.com A + AAAA → CMS CloudFront
    new route53.ARecord(this, 'CmsARecord', {
      zone: dns.hostedZone,
      recordName: 'admin',
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cms.distribution)),
    });
    new route53.AaaaRecord(this, 'CmsAaaaRecord', {
      zone: dns.hostedZone,
      recordName: 'admin',
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cms.distribution)),
    });

    // photos.rachelkeysphotography.com A + AAAA → photos CloudFront
    new route53.ARecord(this, 'PhotosARecord', {
      zone: dns.hostedZone,
      recordName: 'photos',
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(photosCdn.distribution)),
    });
    new route53.AaaaRecord(this, 'PhotosAaaaRecord', {
      zone: dns.hostedZone,
      recordName: 'photos',
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(photosCdn.distribution)),
    });

    // Outputs
    new cdk.CfnOutput(this, 'PortfolioBucketName', { value: portfolio.bucket.bucketName });
    new cdk.CfnOutput(this, 'CmsBucketName', { value: cms.bucket.bucketName });
    new cdk.CfnOutput(this, 'PhotosBucketName', { value: photos.bucket.bucketName });
    new cdk.CfnOutput(this, 'PortfolioDistributionUrl', { value: `https://${portfolio.distribution.distributionDomainName}` });
    new cdk.CfnOutput(this, 'CmsDistributionUrl', { value: `https://${cms.distribution.distributionDomainName}` });
    new cdk.CfnOutput(this, 'PhotosCdnUrl', { value: 'https://photos.rachelkeysphotography.com' });
    new cdk.CfnOutput(this, 'HostedZoneId', { value: dns.hostedZone.hostedZoneId });
    new cdk.CfnOutput(this, 'CognitoUserPoolId', { value: auth.userPool.userPoolId });
    new cdk.CfnOutput(this, 'CognitoClientId', { value: auth.userPoolClient.userPoolClientId });
    new cdk.CfnOutput(this, 'CognitoHostedUiUrl', { value: auth.userPoolDomain.baseUrl() });
  }
}
