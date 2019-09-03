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
            sh """#!/bin/bash
              source ~/.bashrc

              # up versions
              yarn lerna version --conventional-commits --allow-branch=master --yes

              # auth in npm
              printf "//registry.npmjs.org/:_authToken="%s"\n@csssr:registry=https://registry.npmjs.org/\n" "$NPM_TOKEN" >.npmrc

              # publish
              yarn lerna publish from-git --yes --registry https://registry.npmjs.org/
            """
          }
        }
      }
    }
  }
}
