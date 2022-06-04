# Anthology

## Install

1. Clone this project, open a terminal, and set the working directory to the root level of this project.

2. Make sure you have both [NodeJS](https://nodejs.org/en/) and [npm](https://www.npmjs.com/).
  
    - **On Mac:** Run `brew install node`.

    - **On Windows:** Go to [NodeJS](https://nodejs.org/en/) and download the installer. Run the installer, and follow its directions until done.

3. At the **root level of the project**, run `npm install` to install all project dependencies.

## How to Run
To refer to the documentation open the `docs/index.html` file from your root folder. 

### To run the default simulation: 
Open `index.html` to run the program in your browser (as previously compiled by the authors)

### To run your own authored or editted configuration
At the root level of your directory, run `gulp`. 
This should create a folder called `dist` with an `index.html` file. 
Open `index.html` to run the program in your browser. 

Note: While `gulp` is running you should be able to make any changes to the .ts file or the data.json file and see the changes compiled and run in your browser in the `dist/index.html` file.

## Generate New Documentation
To generate documentation use tsdoc to add doc comments to the code. 

```
npx typedoc src/*.ts 
```

## Development

### Adding a New TS Module and Regenerating Documentation
If there's a new TS module, add the file to the _files_ list in `tsconfig.json`.

```json
{
  "files": [
    "src/action_manager.ts",
    "src/agent.ts",
    "src/execution_engine.ts",
    "src/location_manager.ts",
    "src/types.ts",
    "src/ui.ts",
    "src/utilities.ts",
    // add new file here
  ],
  "compilerOptions": {
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "target": "es5",
    "typeRoots": [
        "node_modules/@types"
    ],
    "types": [
        "node"
    ],
    "resolveJsonModule": true
  }
}
```

Then run `npx typedoc src/*.ts` in your terminal.

### Checking for unused code
To find unused methods: 

```
ts-prune -p tsconfig.ts-prune.json | grep -v 'used in module'
```

To generate the Dependency Graph 

```
depcruise --include-only "^src" --output-type dot src | dot -T svg > dependencygraph.svg
```

or 

```
npx depcruise --include-only "^src" --output-type dot src > dependency.dot
```
