pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        IMAGE_REPOSITORY = 'amirsoltani/taavoni-frontend'
        DEPLOY_HOST = 'host.docker.internal'
        DEPLOY_PORT = '22'
        DEPLOY_USER = 'deploy'
        DEPLOY_SERVICE = 'frontend'
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test tests/') {
            steps {
                sh 'npm run lint:test'
                sh 'npm test -- tests'
            }
        }

        stage('Build application') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Prepare image tag') {
            steps {
                script {
                    def shortCommit = sh(
                        script: 'git rev-parse --short=7 HEAD',
                        returnStdout: true
                    ).trim()

                    env.IMAGE_TAG = "${env.BUILD_NUMBER}-${shortCommit}"
                }
            }
        }

        stage('Build image') {
            steps {
                sh '''
                    set -eu
                    docker build --pull \
                      --label org.opencontainers.image.revision="$GIT_COMMIT" \
                      --label org.opencontainers.image.source="$GIT_URL" \
                      --tag "$IMAGE_REPOSITORY:$IMAGE_TAG" .
                '''
            }
        }

        stage('Push image') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKERHUB_USERNAME',
                    passwordVariable: 'DOCKERHUB_TOKEN'
                )]) {
                    sh '''
                        set -eu
                        trap 'docker logout >/dev/null 2>&1 || true' EXIT
                        printf '%s' "$DOCKERHUB_TOKEN" |
                          docker login --username "$DOCKERHUB_USERNAME" --password-stdin
                        docker push "$IMAGE_REPOSITORY:$IMAGE_TAG"
                        docker tag "$IMAGE_REPOSITORY:$IMAGE_TAG" "$IMAGE_REPOSITORY:latest"
                        docker push "$IMAGE_REPOSITORY:latest"
                    '''
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sshagent(credentials: ['production-ssh-key']) {
                    withCredentials([file(
                        credentialsId: 'production-known-hosts',
                        variable: 'SSH_KNOWN_HOSTS_FILE'
                    )]) {
                        sh './deploy.sh'
                    }
                }
            }
        }
    }

    post {
        always {
            sh '''
                if [ -n "${IMAGE_TAG:-}" ]; then
                  docker image rm "$IMAGE_REPOSITORY:$IMAGE_TAG" >/dev/null 2>&1 || true
                  if [ "${BRANCH_NAME:-}" = "main" ]; then
                    docker image rm "$IMAGE_REPOSITORY:latest" >/dev/null 2>&1 || true
                  fi
                fi
            '''
            deleteDir()
        }
    }
}
