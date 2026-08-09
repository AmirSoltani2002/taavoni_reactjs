pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timestamps()
    }

    environment {
        IMAGE_NAME = 'taavoni-frontend'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build production image') {
            steps {
                sh '''
                    set -eu
                    docker build --pull \
                      --label org.opencontainers.image.revision="$GIT_COMMIT" \
                      --label org.opencontainers.image.source="$GIT_URL" \
                      --tag "$IMAGE_NAME:$BUILD_NUMBER" .
                '''
            }
        }
    }

    post {
        always {
            sh 'docker image rm "$IMAGE_NAME:$BUILD_NUMBER" >/dev/null 2>&1 || true'
            deleteDir()
        }
    }
}
