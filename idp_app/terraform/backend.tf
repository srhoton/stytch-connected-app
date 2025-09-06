terraform {
  backend "s3" {
    bucket = "steve-rhoton-tfstate"
    key    = "idp-app/terraform.tfstate"
    region = "us-west-2"
  }
}