import * as types from "./types";
import {actionList} from "./main";

// DEFAULT ACTIONS - REQUIRED
// The following actions are required for the current structure of the execution execution_engine
//When modifying this file for more test scenarios, DO NOT CHANGE THESE action_specs


// Loads actions 
export function loadActionsFromJSON(actions_json:types.Action[]): types.Action[] {
	let actions: types.Action[] = [];
	for (let parse_action of actions_json){
		var action:types.Action = Object.assign({}, parse_action);
		actions.push(action);
	}
	console.log("actions: ", actions);
	return actions;
}

// Currently using global actionList, but can also pass param to function: actionList:types.Action[]
export function getActionByName(name:string):types.Action {
	let possible_actions = actionList.filter((action: types.Action) => action.name === name);

	// if theres an action with this name, return the first one
	if (possible_actions.length > 0){
		return possible_actions[0]
	}
	else{
		// returns false if there is no listed action with this name
		console.log("getActionByName => Couldn't find action with name: ", name);
		console.log("getActionByName => Returning Default: wait_action");
		return getActionByName("wait_action");
	}
}


// Returns a list of requirements of the required type from an action
// Eg. getRequirementByType(action, types.ReqType.location) 
// 			returns types.Requirement[] as types.LocationReq[]
export function getRequirementByType(action: types.Action, reqType: types.ReqType): types.Requirement[]{
	let possible_reqs = action.requirements.filter((requirement: types.Requirement) => requirement.reqType === reqType);
	return possible_reqs;
}
