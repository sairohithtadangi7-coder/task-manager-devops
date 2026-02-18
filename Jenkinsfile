pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "sairohithtadangi7/task-manager"
    }

    stages {

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE:${BUILD_NUMBER} app/'
            }
        }

        stage('Login to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh 'echo $PASS | docker login -u $USER --password-stdin'
                }
            }
        }

        stage('Push Image') {
            steps {
                sh 'docker push $DOCKER_IMAGE:${BUILD_NUMBER}'
            }
        }

    }
}

