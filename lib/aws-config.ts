
import { S3Client } from '@aws-sdk/client-s3';

export interface BucketConfig {
  bucketName: string;
  folderPrefix: string;
}

export function getBucketConfig(): BucketConfig {
  const bucketName = process.env.AWS_BUCKET_NAME;
  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME environment variable is required');
  }

  return {
    bucketName,
    folderPrefix: process.env.AWS_FOLDER_PREFIX || ''
  };
}

export function createS3Client(): S3Client {
  return new S3Client({
    region: process.env.AWS_REGION || 'us-east-1'
  });
}
