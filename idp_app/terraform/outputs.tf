output "cloudfront_distribution_id" {
  description = "The ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.static_site.id
}

output "cloudfront_domain_name" {
  description = "The domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.static_site.domain_name
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket"
  value       = aws_s3_bucket.static_site.id
}

output "s3_bucket_arn" {
  description = "The ARN of the S3 bucket"
  value       = aws_s3_bucket.static_site.arn
}

output "website_url" {
  description = "The URL of the deployed website"
  value       = "https://${var.domain_name}"
}

output "acm_certificate_arn" {
  description = "The ARN of the ACM certificate"
  value       = aws_acm_certificate.static_site.arn
}

output "route53_zone_id" {
  description = "The Zone ID of the parent Route53 zone"
  value       = data.aws_route53_zone.parent_zone.zone_id
}