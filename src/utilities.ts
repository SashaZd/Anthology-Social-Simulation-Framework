// Utilties File

import * as simTypes from "./agent";
import {actionList} from "./main";


// Currently using global actionList, but can also pass param to function: actionList:simTypes.Action[]
export function getActionByName(name:string):simTypes.Action {
	var possible_actions = actionList.filter((action: simTypes.Action) => action.name === name);

	// if theres an action with this name, return the first one
	if (possible_actions.length > 0){
		return possible_actions[0]
	}
	else{
		// returns false if there is no listed action with this name
		console.log("getActionByName => Couldn't find action with name: ", name);
	}
}


// Returns a Agent[] using data from the data.json file 
// matches the string:action_name against existing actions and returns the same
export function loadAgentsFromJSON(agent_json:any): simTypes.Agent[]{
	var agents: simTypes.Agent[] = [];
	for (var parseAgent of agent_json){
		var possible_action = getActionByName(parseAgent.currentAction)
		if (possible_action){
			var agent : simTypes.Agent = {
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


export function loadActionsFromJSON(actions_json:any): simTypes.Action[]{
	// var _actions_json = JSON.parse(actions_json);
	var actions: simTypes.Action[] = [];
	for (var parseAction of actions_json){
		var requirementList: simTypes.Requirement[] = [];
		for (var parseReq of parseAction['requirements']){
			var _reqType: keyof typeof simTypes.ReqType = parseReq["type"];
			var requirement: simTypes.Requirement = {
				type: simTypes.ReqType[_reqType],
				req: parseReq['req']
			}
			requirementList.push(requirement);
		}

		var effectsList: simTypes.Effect[] = [];
		for (var parseEffect of parseAction['effects']){
			var _motType: keyof typeof simTypes.MotiveType = parseEffect["motive"];
			var effect: simTypes.Effect = {
				motive: (simTypes.MotiveType as any)[_motType],
				delta: parseEffect['delta']
			}
			effectsList.push(effect);
		}

		var action : simTypes.Action = {
			name: parseAction["name"],
			requirements: requirementList,
			effects: effectsList,
			time_min: parseAction["time_min"]
		}

		actions.push(action);
	}
	console.log("actions: ", actions);
	return actions;
}


export function loadLocationsFromJSON(locations_json:any): simTypes.Location[]{
	var locations: simTypes.Location[] = [];

	for (var parseLocation of locations_json) {
		var location: simTypes.Location = {
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





