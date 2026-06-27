#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { RachelKeysPhotographyStack } from '../lib/rachel-keys-photography-stack';

const app = new cdk.App();

new RachelKeysPhotographyStack(app, 'RachelKeysPhotographyStack', {
  // CloudFront certificates MUST be in us-east-1.
  // Account is required for hosted zone lookup (fromLookup).
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
});
