
import { S3Client } from '@aws-sdk/client-s3';

export interface BucketConfig {
  bucketName: string;
  folderPrefix: string;
}

export function getBucketConfig(): BucketConfig {
  const bucketName = process.env.AWS_BUCKET_NAME;
  if (!bucketName) {
    // Return a default config for build time
    console.warn('AWS_BUCKET_NAME not found, using default config');
    return {
      bucketName: 'default-bucket',
      folderPrefix: ''
    };
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
