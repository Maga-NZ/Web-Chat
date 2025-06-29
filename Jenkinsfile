// Jenkinsfile
pipeline {
    agent any

    environment {
        AWS_REGION = 'us-west-2'
        ECR_REPOSITORY_URI = '010526257977.dkr.ecr.us-west-2.amazonaws.com/messaging-app'
        DOCKER_IMAGE_NAME = "${ECR_REPOSITORY_URI}:${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo 'Checking out code...'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${env.DOCKER_IMAGE_NAME} ."
                }
            }
        }

        stage('Push Docker Image to ECR') {
            steps {
                script {
                    def ecrLogin = sh(returnStdout: true, script: "aws ecr get-login-password --region ${env.AWS_REGION}").trim()
                    sh "docker login --username AWS --password-stdin ${env.ECR_REPOSITORY_URI} <<< ${ecrLogin}"
                    sh "docker push ${env.DOCKER_IMAGE_NAME}"
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo "Deploying Docker image ${env.DOCKER_IMAGE_NAME} to application instance"
                script {
                    def targetInstance = "10.0.3.120" // Private IP of the application instance
                    def appUser = "ec2-user" // Or your application user on the target instance
                    def containerName = "messaging-app-container" // Replace with your desired container name

                    // Stop and remove the old container if it's running
                    // The '|| true' allows the command to succeed even if the container is not running
                    sh "ssh ${appUser}@${targetInstance} 'docker stop ${containerName} || true && docker rm ${containerName} || true'"

                    // Run the new container
                    // IMPORTANT: You need to customize the 'docker run' command below
                    // -p host_port:container_port : Map ports
                    // -v host_path:container_path : Mount volumes for persistent data or configs
                    // -e VARIABLE=value : Set environment variables (e.g., database connection, Django settings)
                    // --network your_network_name : Specify a Docker network if needed
                    // --restart unless-stopped : Configure restart policy
                    sh "ssh ${appUser}@${targetInstance} 'docker run -d --name ${containerName} ${env.DOCKER_IMAGE_NAME}'" // *** Customize this line ***
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished (always).
        }
    }
}
