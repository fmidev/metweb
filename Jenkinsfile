#!groovy
pipeline {

  agent any

  stages {

    stage('Environment setup') {
      steps {
        sh "env"
        sh "export"
        sh "ls -lA"
        sh "git describe --tags --exact-match || echo 'no exact tag'"
      }
    }

    stage('For develop branch') {
      when { environment name: 'BRANCH_NAME', value: 'develop' }
      steps {
        echo "only executed in develop"
      }
    }

    stage('For master branch') {
      when { environment name: 'BRANCH_NAME', value: 'master' }
      steps {
        echo "only executed in master"
      }
    }

    stage('For all branches') {
      steps {
        echo "current branch is ${env.BRANCH_NAME}"
        slackSend "Build Started - ${env.JOB_NAME} ${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)"
      }
    }
  }

  post {
    success {
      slackSend "Success with ${env.JOB_NAME} ${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)"
    }
  }
}
