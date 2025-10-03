pipeline {
    agent any

    environment {
        NEXUS_URL = 'http://192.168.56.1:9090'
        NEXUS_REPOSITORY = 'kyj-lib-core'
        NEXUS_CREDENTIALS_ID = 'nexus-credentials'
        PROJECT_NAME = 'pair-time-backend-domain'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }

        stage('Build Domain Module') {
            steps {
                echo 'Building domain module...'
                sh '''
                    chmod +x gradlew
                    ./gradlew :pair-time-backend-domain:clean
                    ./gradlew :pair-time-backend-domain:build -x test
                '''
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running tests...'
                sh './gradlew :pair-time-backend-domain:test'
            }
            post {
                always {
                    junit '**/build/test-results/test/*.xml'
                }
            }
        }

        stage('Publish to Nexus') {
            steps {
                echo 'Publishing to Nexus repository...'
                sh './gradlew :pair-time-backend-domain:publish'
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Verifying deployment...'
                script {
                    def version = sh(
                        script: "grep '^version' pair-time-backend-domain/build.gradle | cut -d \"'\" -f 2",
                        returnStdout: true
                    ).trim()
                    echo "Deployed version: ${version}"
                }
            }
        }
    }

    post {
        success {
            echo 'Domain module successfully published to Nexus!'
        }
        failure {
            echo 'Build or publish failed!'
        }
        always {
            cleanWs()
        }
    }
}
