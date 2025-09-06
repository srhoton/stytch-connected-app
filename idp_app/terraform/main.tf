# Main entrypoint for the Terraform module
# This file serves as the primary entry point as per Terraform standard module structure

# Local values for common configurations
locals {
  common_tags = merge(
    var.default_tags,
    {
      Environment = var.environment
      Domain      = var.domain_name
    }
  )
}