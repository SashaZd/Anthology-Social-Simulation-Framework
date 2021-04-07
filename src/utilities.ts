// Utilties File

import * as types from "./types";
import * as action_manager from "./action_manager"
import {actionList, locationList, agentList} from "./main";


// Returns a Agent[] using data from the data.json file 
// matches the string:action_name against existing actions and returns the same
// JSON object needs to be of type: any, since we're accepting a string name 
export function loadAgentsFromJSON(agent_json:types.JSONAgent[]): types.Agent[] {
	let agents: types.Agent[] = [];
	for (let parse_agent of agent_json){
		let possible_action: types.Action = action_manager.getActionByName(parse_agent.currentAction);
		let agent:types.Agent = Object.assign({}, parse_agent, {
			currentAction: possible_action
		});
		agents.push(agent);
	}
	console.log("agents: ", agents);
	return agents;
}


// Currently using global actionList, but can also pass param to function: actionList:types.Action[]
export function getAgentByName(name:string):types.Agent {
	let possible_agents = agentList.filter((agent: types.Agent) => agent.name === name);

	// if theres an action with this name, return the first one
	if (possible_agents.length > 0){
		return possible_agents[0]
	}
	else{
		// returns false if there is no listed action with this name
		console.log("getAgentByName => Couldn't find agent with name: ", name);
	}
}

/*  Simple mathematical clamp function.
		test: number being tested
		max: maximum value of number
		min: minimum value of number
		return: either the number, or the max/min if it was outside of the range */
export function clamp(test:number, max:number, min:number):number {
	if (test > max) {
		return max;
	} else if (test < min) {
		return min;
	} else {
		return test;
	}
}

/*  Randomize array in-place using Durstenfeld shuffle algorithm
		https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
		*/
export function shuffleArray(array:any[]):void {
		for (let i:number = array.length - 1; i > 0; i--) {
				let j = Math.floor(Math.random() * (i + 1));
				let temp:any = array[i];
				array[i] = array[j];
				array[j] = temp;
		}
}

/*  Array contains all elements of the search array
		https://stackoverflow.com/questions/53606337/check-if-array-contains-all-elements-of-another-array
	Returns true if the array, arr[], includes every element of the target array, all[]
*/
export function arrayIncludesAllOf(arr:any[], other:any[]): boolean{
	return other.every(v => arr.includes(v));
}


export function arrayIncludesSomeOf(arr:any[], other:any[]): boolean{
	return other.some(v => arr.includes(v));
}




/*  checks membership in a list. 
		item: an item to be checked
		list: a list of strings to check against
		return: a boolean answering the question 
*/
export function arrayIncluesItem(arr:any[], item:any):boolean {
	return arr.includes(item)
}


