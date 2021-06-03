!! Install dependencies: 

(Needed to use sudo on the mac to make sure they could be called globally since that's not the default)

- make sure you have both Node (https://nodejs.org/en/) and NPM (https://www.npmjs.com/) installed on your machine
- brew install node
- npm init
- node -v 
- npm -v
- sudo npm install --save-dev typescript gulp gulp-typescript
- sudo npm install gulp -g
- sudo npm install --save-dev browserify tsify vinyl-source-stream
- sudo npm install --save-dev watchify fancy-log

!! To Run 
This should create an index.html file in the dist folder. 

- $ gulp 


!! Generate Documentation
To generate documentation use tsdoc to add doc comments to the code 

If there's a new TS module, add the file to the tsconfig.json files list. Then run 

$ npx typedoc src/*.ts 



!! Check for unused code

To find unused methods: 

$ ts-prune -p tsconfig.ts-prune.json | grep -v 'used in module'


To generate the Dependency Graph 

$ depcruise --include-only "^src" --output-type dot src | dot -T svg > dependencygraph.svg


or 


$ npx depcruise --include-only "^src" --output-type dot src > dependency.dot

