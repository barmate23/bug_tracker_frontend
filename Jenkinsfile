pipeline {
  agent any

  environment {
    IMAGE_NAME = 'bug-tracker-frontend'
    CONTAINER_NAME = 'bug-tracker-frontend'
    DOCKER_NETWORK = 'updated_orgadmin_rmscadminnetwork'
    VITE_API_BASE_URL = 'http://localhost:8080'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build') {
      steps {
        sh 'npm ci'
        sh 'npm run build'
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker build --build-arg VITE_API_BASE_URL=$VITE_API_BASE_URL -t $IMAGE_NAME:latest .'
      }
    }

    stage('Deploy') {
      steps {
        sh '''
          docker network inspect "$DOCKER_NETWORK" >/dev/null
          docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
          docker run -d \
            --name "$CONTAINER_NAME" \
            --restart unless-stopped \
            --network "$DOCKER_NETWORK" \
            -p 3000:80 \
            "$IMAGE_NAME:latest"
        '''
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'dist/**', allowEmptyArchive: true
    }
  }
}
