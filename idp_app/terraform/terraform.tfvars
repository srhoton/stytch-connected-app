# AWS Configuration
aws_region = "us-west-2"

# Environment
environment = "sandbox"

# Domain Configuration
domain_name        = "auth.sb.fullbay.com"
parent_zone_domain = "sb.fullbay.com"

# S3 Configuration
s3_bucket_name = "auth-sb-fullbay-com"

# CloudFront Configuration
cloudfront_price_class = "PriceClass_100" # US, Canada, Europe only

# CloudFront Cache Settings
cloudfront_default_ttl = 86400    # 1 day
cloudfront_max_ttl     = 31536000 # 1 year
cloudfront_min_ttl     = 0

# Default Tags
default_tags = {
  Environment = "sandbox"
  Project     = "idp-app"
  ManagedBy   = "terraform"
}