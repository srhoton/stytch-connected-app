# Data source to get the existing parent zone
data "aws_route53_zone" "parent_zone" {
  name         = var.parent_zone_domain
  private_zone = false
}

# Route53 A record for CloudFront distribution
resource "aws_route53_record" "static_site" {
  zone_id = data.aws_route53_zone.parent_zone.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.static_site.domain_name
    zone_id                = aws_cloudfront_distribution.static_site.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 AAAA record for CloudFront distribution (IPv6)
resource "aws_route53_record" "static_site_ipv6" {
  zone_id = data.aws_route53_zone.parent_zone.zone_id
  name    = var.domain_name
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.static_site.domain_name
    zone_id                = aws_cloudfront_distribution.static_site.hosted_zone_id
    evaluate_target_health = false
  }
}