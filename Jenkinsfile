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
            userRemoteConfigs: [[credentialsId: 'e2e-tools-repo', url: 'git@github.com:csssr-team/e2e-tools.git']],
            extensions: [[$class: 'LocalBranch', localBranch: "**"]]
          ])
        }
        echo "GIT_BRANCH: ${scmVars.GIT_BRANCH}"
        echo "GIT_COMMIT: ${scmVars.GIT_COMMIT}"
      }
    }

    stage("Check if build is required") {
      steps {
          script {
            def checkCommit = $/"git log -1 --pretty=%s | grep ^Publish$"/$

            isPublishCommit = sh (
              script: checkCommit,
              returnStatus: true
            )

            if (isPublishCommit == 0) {
              currentBuild.result = "ABORTED"
              error('Publish commit, cancel execution')
            }
          }
      }
    }


    stage('Install dependencies') {
      steps {
        script {
          sh """#!/bin/bash
            source ~/.bashrc
            yarn install --frozen-lockfile
          """
        }
      }
    }

    stage('Run CI script (tests, publishing)') {
      steps {
        sshagent(credentials: ['e2e-tools-repo']) {
          withCredentials([
            string(credentialsId: 'npm-token', variable: 'NPM_TOKEN'),
          ]) {
            sh """
              # auth in npm
              printf "//registry.npmjs.org/:_authToken="%s"\n@csssr:registry=https://registry.npmjs.org/\n" "$NPM_TOKEN" >.npmrc
            """

            script {
              if (scmVars.GIT_BRANCH == 'origin/master') {
                sh """#!/bin/bash
                  source ~/.bashrc
                  set -e

                  # up versions
                  yarn lerna version --conventional-commits --allow-branch=master --yes

                  # publish
                  yarn lerna publish from-git --yes --registry https://registry.npmjs.org/
                """
              }

              if (scmVars.GIT_BRANCH == 'origin/canary') {
                sh """#!/bin/bash
                  source ~/.bashrc
                  set -e

                  # up versions
                  yarn lerna version --conventional-commits --allow-branch=canary --yes

                  # publish
                  yarn lerna publish from-git --yes --registry https://registry.npmjs.org/ --canary
                """
              }
            }
          }
        }
      }
    }
  }
}
