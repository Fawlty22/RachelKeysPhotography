import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

const CMS_URL = 'https://admin.rachelkeysphotography.com';
const DOMAIN_PREFIX = 'rachelkeys-cms';

export class CmsAuth extends Construct {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly userPoolDomain: cognito.UserPoolDomain;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'rachelkeys-cms-users',
      selfSignUpEnabled: false,       // invite-only, no public registration
      signInAliases: { username: true, email: true },
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    this.userPoolClient = this.userPool.addClient('CmsAppClient', {
      userPoolClientName: 'cms-app',
      authFlows: { userSrp: true },
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
        callbackUrls: [CMS_URL, 'http://localhost:5173'],
        logoutUrls: [CMS_URL, 'http://localhost:5173'],
      },
      generateSecret: false,           // public SPA client — no secret
      preventUserExistenceErrors: true,
    });

    // Cognito Hosted UI domain
    this.userPoolDomain = this.userPool.addDomain('HostedUiDomain', {
      cognitoDomain: { domainPrefix: DOMAIN_PREFIX },
    });
  }
}
