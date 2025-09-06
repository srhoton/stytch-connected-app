#!/bin/bash

set -e

echo "Building React application..."

# Change to the parent directory (idp_app)
cd "$(dirname "$0")/.."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci
fi

# Build the React app
echo "Running build..."
npm run build

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "Error: dist directory not found after build"
    exit 1
fi

echo "Syncing files to S3..."

# Sync the dist folder to S3
# Delete files in S3 that don't exist locally
# Set appropriate cache headers
aws s3 sync dist/ "s3://${S3_BUCKET}/" \
    --region "${AWS_REGION}" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "*.html" \
    --exclude "*.json"

# Upload HTML files with no-cache headers
aws s3 sync dist/ "s3://${S3_BUCKET}/" \
    --region "${AWS_REGION}" \
    --exclude "*" \
    --include "*.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html"

# Upload JSON files with no-cache headers  
aws s3 sync dist/ "s3://${S3_BUCKET}/" \
    --region "${AWS_REGION}" \
    --exclude "*" \
    --include "*.json" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "application/json"

echo "Creating CloudFront invalidation..."

# Create CloudFront invalidation for all files
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "${DISTRIBUTION_ID}" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

echo "CloudFront invalidation created with ID: ${INVALIDATION_ID}"

echo "Deployment complete!"