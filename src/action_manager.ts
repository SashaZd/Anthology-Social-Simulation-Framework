import * as types from "./types";
import {actionList} from "./main";

// DEFAULT ACTIONS - REQUIRED
// The following actions are required for the current structure of the execution execution_engine
//When modifying this file for more test scenarios, DO NOT CHANGE THESE action_specs

export function loadActionsFromJSON(actions_json:any): types.Action[]{
	// var _actions_json = JSON.parse(actions_json);
	var actions: types.Action[] = [];
	for (var parseAction of actions_json){
		var requirementList: types.Requirement[] = [];
		for (var parseReq of parseAction['requirements']){
			var _reqType: keyof typeof types.ReqType = parseReq["type"];
			var requirement: types.Requirement = {
				type: types.ReqType[_reqType],
				req: parseReq['req']
			}
			requirementList.push(requirement);
		}

		var effectsList: types.Effect[] = [];
		for (var parseEffect of parseAction['effects']){
			var _motType: keyof typeof types.MotiveType = parseEffect["motive"];
			var effect: types.Effect = {
				motive: (types.MotiveType as any)[_motType],
				delta: parseEffect['delta']
			}
			effectsList.push(effect);
		}

		var action : types.Action = {
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

// Currently using global actionList, but can also pass param to function: actionList:types.Action[]
export function getActionByName(name:string):types.Action {
	var possible_actions = actionList.filter((action: types.Action) => action.name === name);

	// if theres an action with this name, return the first one
	if (possible_actions.length > 0){
		return possible_actions[0]
	}
	else{
		// returns false if there is no listed action with this name
		console.log("getActionByName => Couldn't find action with name: ", name);
	}
}

