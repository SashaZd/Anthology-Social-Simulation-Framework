// Utilties File

import * as simTypes from "./agent";
import {actionList} from "./action_specs";


// importing File System module of node
const fs = require('fs');

// // File logging 
export class Logger {
	private stream: any = fs.createWriteStream('file.txt');

	file(log_message: string) {
		// this.stream.write('Hello ', log_message);
		// this.fs.createWriteStream('log.txt', { flags: 'a' });
		// this.fs.write('new entry\n');
		console.log("Logging file: ", log_message);
	}

	readFile(){

	}

	closeLogFile(){
		var stream = fs.createWriteStream('./file.txt');
		stream.on('finish', () => {
			console.log('All the data is transmitted');
		});
	}
}

// Currently using global actionList, but can also pass param to function: actionList:simTypes.Action[]
export function getActionByName(name:string):simTypes.Action | Boolean {
	var possible_actions = actionList.filter((action: simTypes.Action) => action.name === name);
	if (possible_actions.length > 0){
		return possible_actions[0]
	}
	else{
		// returns false if there is no listed action with this name
		console.log("getActionByName => Couldn't find action with name: ", name);
		return false
	}
}




