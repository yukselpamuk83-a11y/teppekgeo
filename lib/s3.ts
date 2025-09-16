
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, getBucketConfig } from './aws-config';

const s3Client = createS3Client();
const { bucketName, folderPrefix } = getBucketConfig();

export async function uploadFile(
  buffer: Buffer, 
  fileName: string, 
  contentType?: string
): Promise<string> {
  try {
    const key = `${folderPrefix}uploads/${Date.now()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream',
      ServerSideEncryption: 'AES256'
    });

    await s3Client.send(command);
    return key; // Return the S3 key (cloud_storage_path)
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('File upload failed');
  }
}

export async function downloadFile(key: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    // Generate a signed URL that expires in 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error('Download error:', error);
    throw new Error('File download failed');
  }
}

export async function deleteFile(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Delete error:', error);
    throw new Error('File deletion failed');
  }
}

export async function renameFile(oldKey: string, newKey: string): Promise<string> {
  try {
    // S3 doesn't have a native rename operation, so we copy and delete
    const { CopyObjectCommand } = await import('@aws-sdk/client-s3');
    
    // First, copy the file to the new key
    const copyCommand = new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${oldKey}`,
      Key: newKey
    });

    await s3Client.send(copyCommand);

    // Then delete the old file
    await deleteFile(oldKey);

    return newKey; // Return the new key
  } catch (error) {
    console.error('Rename error:', error);
    throw new Error('File rename failed');
  }
}

export function getFileUrl(key: string): string {
  // For public files, return the direct S3 URL
  return `https://${bucketName}.s3.amazonaws.com/${key}`;
}
