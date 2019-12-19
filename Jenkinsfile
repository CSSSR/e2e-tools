pipeline {
  agent any

  stages {
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
        sshagent(credentials: ['csssr-team-key']) {
          withCredentials([
            string(credentialsId: 'npm-token', variable: 'NPM_TOKEN'),
          ]) {
            sh """
              # auth in npm
              printf "//registry.npmjs.org/:_authToken="%s"\n@csssr:registry=https://registry.npmjs.org/\n" "$NPM_TOKEN" >.npmrc

              git config user.email tools@csssr.io
              git config user.name "Jenkins CI"
            """

            script {
              if (GIT_BRANCH == 'master') {
                sh """#!/bin/bash
                  source ~/.bashrc
                  set -e

                  # up versions
                  yarn lerna version --conventional-commits --conventional-graduate --allow-branch=master --yes --no-push --sign-git-commit --sign-git-tag

                  # publish
                  yarn lerna publish from-git --yes

                  git push origin master --follow-tags
                """
              }

              if (GIT_BRANCH == 'canary') {
                sh """#!/bin/bash
                  source ~/.bashrc
                  set -e

                  # up versions
                  yarn lerna version --conventional-commits --conventional-prerelease --allow-branch=canary --yes --no-push --sign-git-commit --sign-git-tag

                  # publish
                  yarn lerna publish from-git --yes --canary

                  git push origin canary --follow-tags
                """
              }
            }
          }
        }
      }
    }
  }
}
