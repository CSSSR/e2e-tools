pipeline {
  agent any
  stages {
    stage('Install dependencies') {
      steps {
        sh """#!/bin/bash
          source ~/.bashrc
          yarn install --frozen-lockfile
        """
      }
    }
    stage('Run tests') {
      steps {
        script {
          sh """#!/bin/bash
            source ~/.bashrc
            yarn test
          """
        }
      }
    }
  }
}
