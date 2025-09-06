variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "sandbox"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "auth.sb.fullbay.com"
}

variable "parent_zone_domain" {
  description = "Parent zone domain name for DNS lookup"
  type        = string
  default     = "sb.fullbay.com"
}

variable "s3_bucket_name" {
  description = "Name for the S3 bucket hosting the static site"
  type        = string
  default     = "auth-sb-fullbay-com"
}

variable "cloudfront_price_class" {
  description = "CloudFront price class for distribution"
  type        = string
  default     = "PriceClass_100" # US, Canada, Europe
}

variable "default_tags" {
  description = "Default tags to apply to all resources"
  type        = map(string)
  default = {
    Environment = "sandbox"
    Project     = "idp-app"
    ManagedBy   = "terraform"
  }
}

variable "cloudfront_default_ttl" {
  description = "Default TTL for CloudFront cache in seconds"
  type        = number
  default     = 86400 # 1 day
}

variable "cloudfront_max_ttl" {
  description = "Maximum TTL for CloudFront cache in seconds"
  type        = number
  default     = 31536000 # 1 year
}

variable "cloudfront_min_ttl" {
  description = "Minimum TTL for CloudFront cache in seconds"
  type        = number
  default     = 0
}