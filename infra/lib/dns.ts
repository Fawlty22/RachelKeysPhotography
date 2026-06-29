import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

const DOMAIN = 'rachelkeysphotography.com';

export class DnsConstruct extends Construct {
  public readonly hostedZone: route53.IHostedZone;
  public readonly certificate: acm.Certificate;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Import the hosted zone that Route 53 created automatically during domain registration.
    // This avoids creating a duplicate zone and keeps the existing nameservers intact.
    // Requires CDK context lookup — run `cdk synth` with valid AWS credentials to populate it.
    this.hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: DOMAIN,
    });

    // ACM certificate must be in us-east-1 for CloudFront.
    // This stack is deployed to us-east-1 (set in bin/infra.ts).
    // DNS validation records are created automatically in the hosted zone above.
    this.certificate = new acm.Certificate(this, 'Certificate', {
      domainName: DOMAIN,
      subjectAlternativeNames: [`admin.${DOMAIN}`, `photos.${DOMAIN}`],
      validation: acm.CertificateValidation.fromDns(this.hostedZone),
    });
  }
}
