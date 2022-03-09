import * as types from "./types";
import * as world from "./world";
import * as utility from "./utilities";
import * as location_manager from "./location_manager"
import * as agent_manager from "./agent"


/**
 * Retrieves an action with specific name from the list of actions available in the simulation
 *
 * @param  {string} name - Name of the action to be retrieved
 * @returns {types.Action} - Action object matching the name
 *
 */
export function getActionByName(name: string): types.Action {
	let possible_actions = world.actionList.filter((action: types.Action) => action.name === name);

	// if theres an action with this name, return the first one
	if (possible_actions.length > 0) {
		return possible_actions[0]
	}
	else {
		// returns false if there is no listed action with this name
		utility.log("getActionByName => Couldn't find action with name: " + name + ". Returning Default: wait_action.");
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
 */
export function execute_action(agent: types.Agent): void {
	agent.destination = null;
	agent.occupiedCounter = 0;
	

	// apply each effect of the action by updating the agent's motives
	if (agent.currentAction.length > 0){
		let action:types.Action = agent.currentAction.shift();
		for (var eachEffect of action.effects) {
			var _delta: number = eachEffect.delta;
			var _motivetype: types.MotiveType = types.MotiveType[eachEffect.motive];
			agent.motive[_motivetype] = utility.clamp(agent.motive[_motivetype] + _delta, utility.MAX_METER, utility.MIN_METER);
		}		
		utility.log("time: " + world.TIME.toString() + " | " + agent.name + ": Finished " + action.name);
	}
	utility.log("time: " + world.TIME.toString() + " | " + agent.name + ": Finished " + agent.currentAction.name);
	if (agent.currentAction?.targetEffects) {
		for (var targ of agent.currentTargets) {
			for (var eachEffect of agent.currentAction.targetEffects) {
				var _delta: number = eachEffect.delta;
				var _motivetype: types.MotiveType = types.MotiveType[eachEffect.motive];
				targ.motive[_motivetype] = utility.clamp(targ.motive[_motivetype] + _delta, utility.MAX_METER, utility.MIN_METER);
			}
			utility.log("time: " + world.TIME.toString() + " | " + targ.name + ": Affected by " + agent.currentAction.name);
		}
	}

	agent.currentAction = getActionByName("wait_action");
	agent.currentTargets = [];
}

// export function nextAction(agent:types.Agent){
// 	var {selected_action, destination} = selectNextActionForAgent(agent);


// }
 


/**
 * Starts an action (if the agent is at location where the action can be performed)
 * else makes the agent travel to the location selected to perform the action
 *
 * @param {types.Agent} agent - agent starting the action
 * @param {types.Action} selected_action - action being started
 * @param {types.SimLocation} destination - destination the agent is required to be in for the action. Can be null if there's no location requirement
 * @param {number} time - time of execution for logs
 *
 */
export function start_action(agent: types.Agent) {   // , selected_action: types.Action, destination: types.SimLocation
	//set action to selected_action or to travel if agent is not at location for selected_action
	// destination could be null if there's no location requirement? Action can be done anywhere?
	if (destination === null || location_manager.isAgentAtLocation(agent, destination)) {
	// if (isActionRequirementSatisfied(selected_action, agent)){
		agent.currentAction = selected_action;
		agent.occupiedCounter = selected_action.time_min;
		if (selected_action?.target) {
			var actionTargets: types.Agent[] = [];
			for (var eachAgent of world.agentList) {
				if (location_manager.isAgentAtLocation(eachAgent, agent.currentLocation)) {
					actionTargets.push(eachAgent);
				}
			}
			agent.currentTargets = actionTargets;
		}
		utility.log("time: " + world.TIME.toString() + " | " + agent.name + ": Started " + agent.currentAction.name);
	}
}


/**
 * Selects an action from a list of valid actions to be preformed by a specific agent.
	Selects the action with the maximal utility of the agent (motive increase/time).

 * @param {types.Agent} agent - agent for whom the next action must be determined
 * @returns
 * selected_action - next action to be executed,
 * destination - the destination the agent must travel to for the action
 */
export function selectNextActionForAgent(agent:types.Agent): void { // {"selected_action": types.Action, "destination": types.SimLocation} {

	// initialized to 0 (no reason to do an action if it will harm you)
	// Should check what the max we'd need for this agent to be satisfied,
	// 			if that is attained, stop searching through actions?
	var max_delta_utility:number = 0;

	// initialized to the inaction
	var current_choice:types.Action = getActionByName("wait_action");
	var current_destination:types.SimLocation = null;

	var action_select_log:string[] = [];

	// Finds the utility for each action to the given agent
	for (var each_action of world.actionList){
		action_select_log.push("Action: " + each_action.name);

		// var nearest_location:types.SimLocation = null;
		var travel_time:number = 0;
		var possible_locations: types.SimLocation[] = world.locationList;

		let motive_requirements: types.MotiveReq[] = getRequirementByType(each_action, types.ReqType.motive) as types.MotiveReq[];
		let location_requirement: types.LocationReq[] = getRequirementByType(each_action, types.ReqType.location) as types.LocationReq[];
		let people_requirement: types.PeopleReq[] = getRequirementByType(each_action, types.ReqType.people) as types.PeopleReq[];


		// If there is a motive requiremnt, evaluate
		// checks if the specified condition is false (ie motiveX >= 2)
		// and empties the possible locations if so.
		// If the condition is violated, the empty list will cause the action not to be considered valid
		// otherwise nothing happens.
		if(possible_locations.length > 0 && motive_requirements.length > 0){
			if (!agent_manager.agentSatisfiesMotiveRequirement(agent, motive_requirements)){
				possible_locations = [];
			}
		}
		if(possible_locations.length > 0 && location_requirement.length > 0){
			// Get the delta_utility for the nearest location that satisfies this action's location requirement.
			// Get possible locations for this action
			possible_locations = location_manager.locationsSatisfyingLocationRequirement(possible_locations, location_requirement[0])
		}

		// If location requirement is met,
		// check for existing people_requirement at each location
		// Todo: If no location possible with PeopleReq, invite people?
		if(possible_locations.length > 0 && people_requirement.length > 0){
			possible_locations = location_manager.locationsSatisfyingPeopleRequirement(agent, possible_locations, people_requirement[0]);
		} else if (possible_locations.length <= 0) {
			action_select_log.push("Action did not pass location requirement");
		}

		// If there is still a valid location, and there is a motive requiremnt, evaluate
		// checks if the specified condition is false (ie motiveX >= 2)
		// and empties the possible locations if so.
		// If the condition is violated, the empty list will cause the action not to be considered valid
		// otherwise nothing happens.
		if(possible_locations.length > 0 && motive_requirements.length > 0){
			switch(motive_requirements[0].op) {
			   case "equals": {
					 if (!(agent.motive[motive_requirements[0].motive] == motive_requirements[0].thresh)) {
						 possible_locations = [];
					 }
			      break;
			   }
			   case "lt": {
					 if (!(agent.motive[motive_requirements[0].motive] < motive_requirements[0].thresh)) {
						 possible_locations = [];
					 }
			      break;
			   }
				 case "gt": {
					 if (!(agent.motive[motive_requirements[0].motive] > motive_requirements[0].thresh)) {
						 possible_locations = [];
					 }
			      break;
			   }
				 case "leq": {
					 if (!(agent.motive[motive_requirements[0].motive] <= motive_requirements[0].thresh)) {
						 possible_locations = [];
					 }
			      break;
			   }
				 case "geq": {
					 if (!(agent.motive[motive_requirements[0].motive] >= motive_requirements[0].thresh)) {
						 possible_locations = [];
					 }
			      break;
			   }
			   default: {
			      if (!(agent.motive[motive_requirements[0].motive] == motive_requirements[0].thresh)) {
							possible_locations = [];
						}
			      break;
			   }
			}
		} else if (possible_locations.length <= 0) {
			action_select_log.push("Action did not pass people requirement");
		}

		// If there is a location possible that meets all the requriements
		// The action can be implemented. Find delta_utility.
		// If not, check the next action
		if(possible_locations.length > 0){
			var nearest_location =  location_manager.getNearestLocationFromOther(possible_locations, agent.currentLocation)
			var travel_time:number = location_manager.getManhattanDistance(nearest_location, agent.currentLocation);

			// adjust for time (including travel time)
			var delta_utility: number = getEffectDeltaForAgentAction(agent, each_action);
			action_select_log.push("Action Utility: " + delta_utility);
			delta_utility = delta_utility/(each_action.time_min + travel_time);
			action_select_log.push("Action Weighted Utility: " + delta_utility);

			if((delta_utility == max_delta_utility && utility.withProbability(0.5)) || delta_utility > max_delta_utility){
				max_delta_utility = delta_utility;
				current_choice = each_action;
				current_destination = nearest_location;
			}		

			action_select_log.push("Current Choice: " + current_choice.name);
			if (current_destination) {
				action_select_log.push("Current Destination: " + current_destination.name);
			} else {
				action_select_log.push("Current Destination: null");
			}

		} else if (possible_locations.length <= 0) {
			action_select_log.push("Action did not pass motive requirement");
		}
	}
	agent.currentAction.push(current_choice)


	if (current_destination != null && !location_manager.isAgentAtLocation(agent, current_destination)) {
		console.log(agent.name, "Unshifting travel in...")
		agent.currentAction.unshift(getActionByName("travel_action"))
		console.log(agent.name, " -- next -- ", agent.currentAction.map(a=>a.name).join(", "));
		location_manager.startTravelToLocation(agent, current_destination, world.TIME);
	}
	else if(current_destination == null || location_manager.isAgentAtLocation(agent, current_destination)) {
		// Sasha: Should not be in here... needs to be separated into turn instead
		start_action(agent); // , selected_action: types.Action, destination: types.SimLocation
	}
}



/**
 * Move an agent closer to another destination.
 *
 * @remarks
 * Uses the manhattan distance to move the agent. So either increments the x axis or the y axis during any time tick.
 *
 * @param {types.Agent} agent agent that must be moved
 */
export function moveAgentCloserToDestination(agent: types.Agent) {
	if (agent.destination != null) {
		// var dest:types.SimLocation = agent.destination;
		if (agent.currentLocation.xPos != agent.destination.xPos)
			agent.currentLocation.xPos > agent.destination.xPos? agent.currentLocation.xPos -= 1: agent.currentLocation.xPos += 1;

		else if (agent.currentLocation.yPos != agent.destination.yPos) {
			agent.currentLocation.yPos > agent.destination.yPos? agent.currentLocation.yPos -= 1: agent.currentLocation.yPos += 1;
		}
	}
}



// /**
//  * Checks if the action can be executed at the given location of the agent
//  * Currently Unused: Need for checking if action can be executed
//  *
//  * @param  {types.Action} action Action to be tested
//  * @param  {types.Agent}  agent  Agent for whom the action must be tested to see if it is executable
//  * @returns {boolean}             True if the action can be executed at the current location; False if not
//  */
// export function isActionRequirementSatisfied(action: types.Action, agent: types.Agent): boolean{
// 	// Check if Location Requirements are met
// 	let location_requirement: types.LocationReq[] = getRequirementByType(action, types.ReqType.location) as types.LocationReq[];
// 	if(location_requirement.length > 0){
// 		if (!location_manager.doesLocationSatisfyLocationRequirement(agent.currentLocation, location_requirement[0])){
// 			return false;
// 		}
// 	}

// 	// Check if People Requirements are met
// 	let people_requirement: types.PeopleReq[] = getRequirementByType(action, types.ReqType.people) as types.PeopleReq[];
// 	if(people_requirement.length > 0){
// 		if (!location_manager.doesAgentCurrentLocationSatisfyPeopleRequirement(agent, people_requirement[0])){
// 			return false;
// 		}
// 	}

// 	// Check if Motive requirements are met
// 	let motive_requirement: types.MotiveReq[] = getRequirementByType(action, types.ReqType.people) as types.MotiveReq[];
// 	if(motive_requirement.length > 0){
// 		// if (!location_manager.doesAgentCurrentLocationSatisfyPeopleRequirement(agent, motive_requirement[0])){
// 			utility.log("Motive Requirement Not Implemented");
// 			return false;
// 		// }
// 	}

// 	return true;
// }
