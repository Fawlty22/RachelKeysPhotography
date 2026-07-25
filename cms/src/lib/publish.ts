/**
 * Portfolio publish / rebuild helpers.
 *
 * triggerRebuild() — POSTs to the Lambda Function URL to start a CodeBuild job.
 *                    Returns the CodeBuild build ID on success.
 *
 * getBuildStatus() — Polls CodeBuild via the AWS SDK (using Cognito Identity
 *                    Pool credentials) to get the current status of a build.
 */

import { CodeBuildClient, BatchGetBuildsCommand } from '@aws-sdk/client-codebuild';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { getIdToken } from './auth';

const REGION = 'us-east-1';
const IDENTITY_POOL_ID = import.meta.env.VITE_IDENTITY_POOL_ID as string;
const USER_POOL_ID = 'us-east-1_xEoOg1QOx';
const TRIGGER_URL = import.meta.env.VITE_REBUILD_TRIGGER_URL as string;
const REBUILD_SECRET = import.meta.env.VITE_REBUILD_SECRET as string;

export type BuildStatus =
  | 'idle'
  | 'starting'
  | 'IN_PROGRESS'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'STOPPED'
  | 'TIMED_OUT'
  | 'FAULT'
  | 'error';

/**
 * Triggers a portfolio rebuild via the Lambda Function URL.
 * Returns the CodeBuild build ID to use for polling.
 */
export async function triggerRebuild(): Promise<string> {
  if (!TRIGGER_URL) throw new Error('VITE_REBUILD_TRIGGER_URL is not set');

  const res = await fetch(TRIGGER_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-rebuild-secret': REBUILD_SECRET,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Trigger failed (${res.status}): ${text}`);
  }

  const body = await res.json() as { buildId?: string; error?: string };
  if (!body.buildId) throw new Error(body.error ?? 'No buildId returned');
  return body.buildId;
}

function getCodeBuildClient(): CodeBuildClient {
  const idToken = getIdToken();
  if (!idToken) throw new Error('Not authenticated');

  return new CodeBuildClient({
    region: REGION,
    credentials: fromCognitoIdentityPool({
      clientConfig: { region: REGION },
      identityPoolId: IDENTITY_POOL_ID,
      logins: {
        [`cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`]: idToken,
      },
    }),
  });
}

/**
 * Returns the current status of a CodeBuild build.
 * Returns 'error' if the build ID can't be found or the call fails.
 */
export async function getBuildStatus(buildId: string): Promise<BuildStatus> {
  try {
    const client = getCodeBuildClient();
    const result = await client.send(new BatchGetBuildsCommand({ ids: [buildId] }));
    const build = result.builds?.[0];
    if (!build) return 'error';
    return (build.buildStatus as BuildStatus) ?? 'error';
  } catch {
    return 'error';
  }
}

/** Returns true if the build is still running and should keep being polled. */
export function isBuildInProgress(status: BuildStatus): boolean {
  return status === 'starting' || status === 'IN_PROGRESS';
}

/** Returns true if the build reached a terminal state. */
export function isBuildComplete(status: BuildStatus): boolean {
  return (
    status === 'SUCCEEDED' ||
    status === 'FAILED' ||
    status === 'STOPPED' ||
    status === 'TIMED_OUT' ||
    status === 'FAULT' ||
    status === 'error'
  );
}
