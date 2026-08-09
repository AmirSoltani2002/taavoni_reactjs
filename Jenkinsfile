pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timestamps()
    }

    environment {
        IMAGE_REPOSITORY = 'amirsoltani/taavoni-frontend'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare image tags') {
            steps {
                script {
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}-${sh(
                        script: 'git rev-parse --short=7 HEAD',
                        returnStdout: true
                    ).trim()}"
                }
            }
        }

        stage('Build production image') {
            steps {
                sh '''
                    set -eu
                    docker build --pull \
                      --label org.opencontainers.image.revision="$GIT_COMMIT" \
                      --label org.opencontainers.image.source="$GIT_URL" \
                      --tag "$IMAGE_REPOSITORY:$IMAGE_TAG" \
                      --tag "$IMAGE_REPOSITORY:latest" .
                '''
            }
        }

        stage('Push image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKERHUB_USERNAME',
                    passwordVariable: 'DOCKERHUB_TOKEN'
                )]) {
                    sh '''
                        set -eu
                        printf '%s' "$DOCKERHUB_TOKEN" | docker login --username "$DOCKERHUB_USERNAME" --password-stdin
                        docker push "$IMAGE_REPOSITORY:$IMAGE_TAG"
                        docker push "$IMAGE_REPOSITORY:latest"
                        docker logout
                    '''
                }
            }
        }
    }

    post {
        success {
            sh '''
                docker image rm "$IMAGE_REPOSITORY:$IMAGE_TAG" "$IMAGE_REPOSITORY:latest" >/dev/null 2>&1 || true
            '''
        }
        always {
            deleteDir()
        }
    }
}
