ls node_modules | grep lerna || echo "lerna not found"

tree -I node_modules . -L 4

# up versions
yarn lerna version --conventional-commits --yes

# auth in npm
printf "//registry.npmjs.org/:_authToken="%s"\n@csssr:registry=https://registry.npmjs.org/\n" "$NPM_TOKEN" >.npmrc

# publish
yarn lerna publish from-git --yes --registry https://registry.npmjs.org/
