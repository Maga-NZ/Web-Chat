resource "aws_instance" "public_instance" {
  ami             = "ami-061211670aadd4f55"
  instance_type   = "t2.micro"
  subnet_id       = aws_subnet.public_subnet_1.id
  vpc_security_group_ids = [aws_security_group.public_sg.id]
  key_name = aws_key_pair.project_key_pair.key_name
  tags = {
    Name = "PublicInstance"
  }
}

resource "aws_instance" "private_instance" {
  ami             = "ami-061211670aadd4f55"
  instance_type   = "t2.micro"
  subnet_id       = aws_subnet.private_subnet_1.id
  vpc_security_group_ids = [aws_security_group.public_sg.id]
  key_name = aws_key_pair.project_key_pair.key_name
  tags = {
    Name = "PrivateInstance"
  }
}

resource "aws_instance" "jenkins_server" {
  ami             = "ami-061211670aadd4f55"
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.public_subnet_1.id # Jenkins instance is likely in the public subnet
  vpc_security_group_ids = [aws_security_group.jenkins_sg.id] # Attach to the Jenkins security group
  key_name               = aws_key_pair.project_key_pair.key_name # Reference the key pair resource
  tags = {
    Name = "JenkinsServer"
  }
  # You may also need to add the IAM instance profile if it was attached to the Jenkins instance for SSM/ECR access
  # For example:
  # iam_instance_profile = aws_iam_instance_profile.ssm_instance_profile.name
}
