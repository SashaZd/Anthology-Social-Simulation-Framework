// Utilties File

import * as types from "./types";
import * as action_manager from "./action_manager"
import {actionList, locationList, agentList} from "./main";


// Returns a Agent[] using data from the data.json file 
// matches the string:action_name against existing actions and returns the same
export function loadAgentsFromJSON(agent_json:any): types.Agent[]{
	var agents: types.Agent[] = [];
	for (var parseAgent of agent_json){
		var possible_action = action_manager.getActionByName(parseAgent.currentAction)
		if (possible_action){
			var agent : types.Agent = {
				name: parseAgent['name'],
				motive: parseAgent['motive'],
				occupiedCounter: parseAgent['occupiedCounter'],
				currentAction: possible_action,
				destination: parseAgent['destination'],
				currentLocation: parseAgent['currentLocation']
			}
			agents.push(agent);
		}
		
	}
	console.log("agents: ", agents);
	return agents;
}

// Currently using global actionList, but can also pass param to function: actionList:types.Action[]
export function getAgentByName(name:string):types.Agent {
	var possible_agents = agentList.filter((agent: types.Agent) => agent.name === name);

	// if theres an action with this name, return the first one
	if (possible_agents.length > 0){
		return possible_agents[0]
	}
	else{
		// returns false if there is no listed action with this name
		console.log("getAgentByName => Couldn't find agent with name: ", name);
	}
}

export function loadLocationsFromJSON(locations_json:any): types.SimLocation[]{
	var locations: types.SimLocation[] = [];

	for (var parseLocation of locations_json) {
		var location: types.SimLocation = {
			name: (parseLocation as any)['name'],
			xPos: (parseLocation as any)['xPos'],
			yPos: (parseLocation as any)['yPos'],
			tags: (parseLocation as any)['tags']
		}
		locations.push(location);
	}
	console.log("locations: ", locations);
	return locations;
}

export function getLocationByName(name: string): types.SimLocation{
	var possible_locations = locationList.filter((location: types.SimLocation) => location.name === name);

	// if theres an action with this name, return the first one
	if (possible_locations.length > 0){
		return possible_locations[0]
	}
	else{
		// returns false if there is no listed action with this name
		console.log("getLocationByName => Couldn't find location with name: ", name);
	}
}

export function getRequirementByType(requirements: types.Requirement[], reqType: types.ReqType): types.Requirement[]{
	var possible_reqs = requirements.filter((requirement: types.Requirement) => requirement.type === reqType);
	return possible_reqs;
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
		for (var i:number = array.length - 1; i > 0; i--) {
				var j = Math.floor(Math.random() * (i + 1));
				var temp:any = array[i];
				array[i] = array[j];
				array[j] = temp;
		}
}

/*  Array contains all elements of the search array
		https://stackoverflow.com/questions/53606337/check-if-array-contains-all-elements-of-another-array
*/
export function isTargetInArray(arr:any[], target:any[]){
	return target.every(v => arr.includes(v));
}

console.log("isTargetInArray() Test: ", isTargetInArray([1,2,3,4],[1,2,4]))



