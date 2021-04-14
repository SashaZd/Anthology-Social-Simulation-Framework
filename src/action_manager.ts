import * as types from "./types";
import {actionList} from "./main";
import * as agent_manager from "./agent";
import * as utility from "./utilities";
import * as exec from "./execution_engine";
import * as location_manager from "./location_manager"

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
		console.log("getActionByName => Couldn't find action with name: ", name, ". Returning Default: wait_action.");
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

// Returns the delta effect for an action for a specific agent 
export function getEffectDeltaForAgentAction(agent:types.Agent, action:types.Action): number{
	var deltaUtility: number = 0

	for (var eachEffect of action.effects){
		var _delta: number = eachEffect.delta;
		var _motivetype:keyof types.Motive = eachEffect.motive;
		deltaUtility += utility.clamp(_delta + agent.motive[_motivetype], exec.MAX_METER, exec.MIN_METER) - agent.motive[_motivetype];
	}

	return deltaUtility;
}

// Returns the locations that satisfy the LocationRequirement, sorted by distance from agent
// export function canActionSatisfyLocReq(action:types.Action, locationReq:types.LocationReq, agent:types.Agent){
// 	let possible_locations:types.SimLocation[] = location_manager.getLocationsMatchingRequirement(locationReq)
// 	return possible_locations
// }


/*  applies the effects of an action to an agent.
		agent: the agent in question
		action: the action in question */
export function execute_action(agent:types.Agent, action:types.Action, time: number):void {
	agent.destination = null;
	agent.occupiedCounter = 0;
	
	// apply each effect of the action by updating the agent's motives
	for(var eachEffect of action.effects){
		var _delta: number = eachEffect.delta;
		var _motivetype: types.MotiveType = types.MotiveType[eachEffect.motive];
	   agent.motive[_motivetype] = utility.clamp(agent.motive[_motivetype] + _delta, exec.MAX_METER, exec.MIN_METER);
	}
	console.log("time: " + time.toString() + " | " + agent.name + ": Finished " + agent.currentAction.name);
}

export function start_action(agent:types.Agent, selected_action:types.Action, destination:types.SimLocation, time:number){
	//set action to selected_action or to travel if agent is not at location for selected_action
	// destination could be null if there's no location requirement? Action can be done anywhere?
	if (destination === null || location_manager.isAgentAtLocation(agent, destination)) {
		agent.currentAction = selected_action;
		agent.occupiedCounter = selected_action.time_min;
		console.log("time: " + time.toString() + " | " + agent.name + ": Started " + agent.currentAction.name);
	} 
	else {
		startTravelToLocation(agent, destination, time);
	}
}

export function startTravelToLocation(agent: types.Agent, destination:types.SimLocation, time:number):void {
	agent.destination = destination;
	agent.currentAction = getActionByName("travel_action");
	agent.occupiedCounter = location_manager.getManhattanDistance(agent.currentLocation, destination);
	console.log("time: " + time.toString() + " | " + agent.name + ": Started " + agent.currentAction.name + "; Destination: " + destination.name);
}



