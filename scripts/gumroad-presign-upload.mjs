#!/usr/bin/env node
/**
 * Gumroad Presigned Upload Script
 * Uploads files to S3-compatible storage and attaches them to Gumroad products.
 * 
 * Usage: node gumroad-presign-upload.mjs <product_id> <file_path>
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { basename } from 'path';

const ACCESS_TOKEN = process.env.GUMROAD_ACCESS_TOKEN;
const PRODUCT_ID = process.argv[2];
const FILE_PATH = process.argv[3];

if (!ACCESS_TOKEN) {
  console.error('❌ GUMROAD_ACCESS_TOKEN not set in environment');
  process.exit(1);
}

if (!PRODUCT_ID || !FILE_PATH) {
  console.error('Usage: node gumroad-presign-upload.mjs <product_id> <file_path>');
  console.error('Example: node gumroad-presign-upload.mjs "abc123==" ./my-product.zip');
  process.exit(1);
}

async function getPresignedUrl(productId, fileName, fileSize) {
  const response = await fetch(
    `https://api.gumroad.com/v2/products/${productId}/files/presign`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        access_token: ACCESS_TOKEN,
        filename: fileName,
        filesize: String(fileSize),
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gumroad presign failed: ${response.status} ${text}`);
  }

  return response.json();
}

async function uploadToS3(presignedData, filePath) {
  const { url, fields } = presignedData;
  
  const fileBuffer = readFileSync(filePath);
  const fileName = basename(filePath);

  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append('file', fileBuffer, fileName);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`S3 upload failed: ${response.status}`);
  }

  return response;
}

async function attachFileToProduct(productId, fileUrl, fileName) {
  const response = await fetch(
    `https://api.gumroad.com/v2/products/${productId}/files`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        access_token: ACCESS_TOKEN,
        url: fileUrl,
        filename: fileName,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Attach failed: ${response.status} ${text}`);
  }

  return response.json();
}

async function main() {
  const stats = readFileSync(FILE_PATH);
  const fileSize = stats.length;
  const fileName = basename(FILE_PATH);

  console.log('📤 Getting presigned URL from Gumroad...');
  const presignedData = await getPresignedUrl(PRODUCT_ID, fileName, fileSize);
  console.log('✅ Got presigned URL');

  console.log('📦 Uploading to S3...');
  await uploadToS3(presignedData, FILE_PATH);
  console.log('✅ Upload complete');

  const fileUrl = presignedData.url + '/' + presignedData.fields.key;
  console.log('🔗 File URL:', fileUrl);

  console.log('📎 Attaching file to product...');
  const result = await attachFileToProduct(PRODUCT_ID, fileUrl, fileName);
  console.log('✅ File attached to product!');
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
