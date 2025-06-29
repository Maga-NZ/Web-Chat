resource "tls_private_key" "project_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "project_key_pair" {
  key_name   = "project-jenkins-key"
  public_key = tls_private_key.project_key.public_key_openssh
}

output "private_key_pem" {
  value     = tls_private_key.project_key.private_key_pem
  sensitive = true
}
