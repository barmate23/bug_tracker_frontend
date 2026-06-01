pipeline {
  agent any

  environment {
    IMAGE_NAME = 'bug-tracker-frontend'
    CONTAINER_NAME = 'bug-tracker-frontend'
    DOCKER_NETWORK = 'updated_orgadmin_rmscadminnetwork'
    VITE_API_BASE_URL = ''
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker build --no-cache --build-arg VITE_API_BASE_URL=$VITE_API_BASE_URL -t $IMAGE_NAME:latest .'
      }
    }

    stage('Deploy') {
      steps {
        sh 'docker-compose down || true'
        sh 'docker-compose up -d'
      }
    }
  }

  post {
    always {
      cleanWs()
    }
    success {
      echo 'Frontend deployment successful!'
    }
    failure {
      echo 'Frontend deployment failed. Please check the logs.'
    }
  }
}
