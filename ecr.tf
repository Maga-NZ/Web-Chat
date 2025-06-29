resource "aws_ecr_repository" "app_repo" {
  name = "messaging-app"

  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

output "ecr_repository_uri" {
  description = "The URI of the ECR repository"
  value       = aws_ecr_repository.app_repo.repository_url
} 