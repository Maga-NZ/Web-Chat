output "public_ip" {
  value = aws_instance.public_instance.public_ip
}

output "private_ip" {
  description = "The private IP address of the private application instance"
  value       = aws_instance.private_instance.private_ip
}
