!! Install dependencies: 

(Needed to use sudo on the mac to make sure they could be called globally since that's not the default)

- npm init
- brew install node
- node -v 
- npm -v
- sudo npm install --save-dev typescript gulp@4.0.0 gulp-typescript
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

