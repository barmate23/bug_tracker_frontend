pipeline {
  agent any

  environment {
    IMAGE_NAME = 'bug-tracker-frontend'
    CONTAINER_NAME = 'bug-tracker-frontend'
    DOCKER_NETWORK = 'updated_orgadmin_rmscadminnetwork'
    VITE_API_BASE_URL = 'https://bugtrackerbackend.sarvosmi.io'
    DOCKER_BUILDKIT = '0'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker build --build-arg VITE_API_BASE_URL=$VITE_API_BASE_URL -t $IMAGE_NAME:latest .'
      }
    }

    stage('Deploy') {
      steps {
        sh 'docker rm -f $CONTAINER_NAME || true'
        sh '''
          docker run -d \
            --name $CONTAINER_NAME \
            --restart unless-stopped \
            --network $DOCKER_NETWORK \
            --network-alias $CONTAINER_NAME \
            -p 3000:80 \
            $IMAGE_NAME:latest
        '''
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
