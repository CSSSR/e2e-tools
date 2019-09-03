yarn install --frozen-lockfile

# up versions
yarn lerna version --conventional-commits --allow-branch=master --yes

# auth in npm
printf "//registry.npmjs.org/:_authToken="%s"\n@csssr:registry=https://registry.npmjs.org/\n" "$NPM_TOKEN" >.npmrc

# publish
yarn lerna publish from-git --yes --registry https://registry.npmjs.org/
