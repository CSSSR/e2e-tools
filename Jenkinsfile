pipeline {
  agent any

  environment {
    scmVars = ""
  }

  stages {
    stage('Clone') {
      steps {
        echo "Branch: ${GIT_BRANCH}"
        script {
          scmVars = checkout([
            $class: 'GitSCM',
            branches: [[name: GIT_BRANCH]],
            doGenerateSubmoduleConfigurations: false,
            userRemoteConfigs: [[credentialsId: 'e2e-tools-repo', url: 'git@github.com:csssr-team/e2e-tools.git']]
          ])
        }
        echo "GIT_BRANCH: ${scmVars.GIT_BRANCH}"
        echo "GIT_COMMIT: ${scmVars.GIT_COMMIT}"
      }
    }

    stage('Install dependencies') {
      steps {
        script {
          sh """
            docker build \
              -f Dockerfile \
              --network host \
              -t e2e-tools/ci:${scmVars.GIT_COMMIT} \
              .
          """
        }
      }
    }

    stage('Run CI script (tests, publishing)') {
      steps {
        script {
          if (scmVars.GIT_BRANCH == 'origin/master') {
            withCredentials([
              string(credentialsId: 'npm-token', variable: 'NPM_TOKEN'),
            ]) {
              sh """
                docker run --network host \
                  -e NPM_TOKEN \
                  --cidfile "$BUILD_TAG-tests.cid" \
                  e2e-tools/ci:${scmVars.GIT_COMMIT}
              """
            }
          }
        }
      }
    }
  }

  post {
    always {
      sh """
        docker rm `cat "$BUILD_TAG-tests.cid"`
        rm "$BUILD_TAG-tests.cid"
      """
    }
  }
}
