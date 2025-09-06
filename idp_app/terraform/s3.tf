# S3 bucket for static website hosting
resource "aws_s3_bucket" "static_site" {
  bucket = var.s3_bucket_name

  tags = local.common_tags
}

# S3 bucket versioning
resource "aws_s3_bucket_versioning" "static_site" {
  bucket = aws_s3_bucket.static_site.id

  versioning_configuration {
    status = "Enabled"
  }
}

# S3 bucket public access block - we'll use CloudFront OAC
resource "aws_s3_bucket_public_access_block" "static_site" {
  bucket = aws_s3_bucket.static_site.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 bucket policy for CloudFront OAC access
resource "aws_s3_bucket_policy" "static_site" {
  bucket = aws_s3_bucket.static_site.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.static_site.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.static_site.arn
          }
        }
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.static_site]
}

# S3 bucket server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "static_site" {
  bucket = aws_s3_bucket.static_site.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 bucket lifecycle configuration for old versions
resource "aws_s3_bucket_lifecycle_configuration" "static_site" {
  bucket = aws_s3_bucket.static_site.id

  rule {
    id     = "delete-old-versions"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# Null resource to build and deploy the React app
resource "null_resource" "build_and_deploy" {
  # Triggers a rebuild when any source file changes
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    command = "bash terraform/build-and-deploy.sh"
    environment = {
      S3_BUCKET       = aws_s3_bucket.static_site.id
      DISTRIBUTION_ID = aws_cloudfront_distribution.static_site.id
      AWS_REGION      = var.aws_region
    }
    working_dir = "${path.module}/.."
  }

  depends_on = [
    aws_s3_bucket.static_site,
    aws_cloudfront_distribution.static_site
  ]
}