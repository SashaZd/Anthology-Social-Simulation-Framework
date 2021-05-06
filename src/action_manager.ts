import * as types from "./types";
// import { actionList } from "./main";
import * as utility from "./utilities";
import * as location_manager from "./location_manager"

/** @type {types.Action[]} List of actions available within the simulation. Loaded from a JSON input file. */
export var actionList: types.Action[] = [];

/**
 * Loads actions available in the simulation from the data.json file. 
 * 
 * @param  {types.Action[]} actions_json - JSON description of the actions
 * @returns {void} - sets an internal array of actions of type types.Actions that are available in the simulation
 */
export function loadActionsFromJSON(actions_json: types.Action[]): void {
	let actions: types.Action[] = [];
	for (let parse_action of actions_json) {
		var action: types.Action = Object.assign({}, parse_action);
		actions.push(action);
	}
	console.log("actions: ", actions);
	actionList = actions;
}


/**
 * Retrieves an action with specific name from the list of actions available in the simulation
 * 
 * @param  {string} name - Name of the action to be retrieved
 * @returns {types.Action} - Action object matching the name
 * 
 */
export function getActionByName(name: string): types.Action {
	let possible_actions = actionList.filter((action: types.Action) => action.name === name);

	// if theres an action with this name, return the first one
	if (possible_actions.length > 0) {
		return possible_actions[0]
	}
	else {
		// returns false if there is no listed action with this name
		console.log("getActionByName => Couldn't find action with name: ", name, ". Returning Default: wait_action.");
		return getActionByName("wait_action");
	}
}


/**
 * Filter through a list of requirements associated with an action 
 * to find a list of specific given requirement types
 *
 * @remarks 
 * Currently there is only one LocationRequirement and PeopleRequirement for any action, 
 * however, there may be multiple MotiveRequirements per action. 
 * 
 * @param  {types.Action} action - action from which requirements are to be retreived
 * @param  {types.ReqType} reqType - type of requirements to be retreived 
 * @returns {types.Requirement[]} retreived requirement list 
 */
export function getRequirementByType(action: types.Action, reqType: types.ReqType): types.Requirement[] {
	let possible_reqs = action.requirements.filter((requirement: types.Requirement) => requirement.reqType === reqType);
	return possible_reqs;
}


/**
 * Returns the delta effect for an action for a specific agent 
 * Takes into consideration the agent's current motivations
 * 
 * @param  {types.Agent} agent - agent considering the action
 * @param  {types.Action} action - action being considered
 * @returns {number} delta change in motivation or utility if the action is undertaken by the agent
 */
export function getEffectDeltaForAgentAction(agent: types.Agent, action: types.Action): number {
	var deltaUtility: number = 0

	for (var eachEffect of action.effects) {
		var _delta: number = eachEffect.delta;
		var _motivetype: keyof types.Motive = eachEffect.motive;
		deltaUtility += utility.clamp(_delta + agent.motive[_motivetype], utility.MAX_METER, utility.MIN_METER) - agent.motive[_motivetype];
	}

	return deltaUtility;
}


/**
 * Applies the effects of an action to an agent.
 * @param {types.Agent} agent - agent executing the action
 * @param {types.Action} action - action being executed 
 * @param {number} time - time of execution for logs
 */
export function execute_action(agent: types.Agent, action: types.Action, time: number): void {
	agent.destination = null;
	agent.occupiedCounter = 0;

	// apply each effect of the action by updating the agent's motives
	for (var eachEffect of action.effects) {
		var _delta: number = eachEffect.delta;
		var _motivetype: types.MotiveType = types.MotiveType[eachEffect.motive];
		agent.motive[_motivetype] = utility.clamp(agent.motive[_motivetype] + _delta, utility.MAX_METER, utility.MIN_METER);
	}
	console.log("time: " + time.toString() + " | " + agent.name + ": Finished " + agent.currentAction.name);
}


/**
 * Starts an action (if the agent is at location), or makes the agent begin travel to a location where the action can be performed. 
 * 
 * @param {types.Agent} agent - agent starting the action
 * @param {types.Action} selected_action - action being started 
 * @param {types.SimLocation} destination - destination the agent is required to be in for the action. Can be null if there's no location requirement 
 * @param {number} time - time of execution for logs
 * 
 */
export function start_action(agent: types.Agent, selected_action: types.Action, destination: types.SimLocation, time: number) {
	//set action to selected_action or to travel if agent is not at location for selected_action
	// destination could be null if there's no location requirement? Action can be done anywhere?
	if (destination === null || location_manager.isAgentAtLocation(agent, destination)) {
		agent.currentAction = selected_action;
		agent.occupiedCounter = selected_action.time_min;
		console.log("time: " + time.toString() + " | " + agent.name + ": Started " + agent.currentAction.name);
	}
}





