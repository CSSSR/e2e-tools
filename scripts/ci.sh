ls node_modules | grep lerna || echo "lerna not found"
ls node_modules/.bin

# up versions
yarn lerna version --conventional-commits --allow-branch=master --yes

# auth in npm
printf "//registry.npmjs.org/:_authToken="%s"\n@csssr:registry=https://registry.npmjs.org/\n" "$NPM_TOKEN" >.npmrc

# publish
yarn lerna publish from-git --yes --registry https://registry.npmjs.org/
