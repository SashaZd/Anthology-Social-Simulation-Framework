import * as exec from "./execution_engine";
// import {wait_action} from "./action_specs";
import {locationList, actionList, agentList} from "./main";
import * as action_manager from "./action_manager";
import * as utility from "./utilities";
import * as location_manager from "./location_manager";

import * as types from "./types";


// To do: this way.
// const getKeyValue = <U extends keyof T, T extends object>(key: U) => (obj: T) => obj[key];


/**
 * Iterates through all initiated agents in global agentList,
 * and returns the agent with a specific name being searched for
 * 
 * @remarks 
 * Currently using global agentList, but can also pass param to function: actionList:types.Action[]
 * 
 * @param  {string} name - name of the agent to be retrieved
 * @returns {types.Agent} agent - returns the first agent that matches the name searched for 
 */
export function getAgentByName(name:string):types.Agent {
	if(name=="-None-"){
		return null
	}

	let possible_agents = agentList.filter((agent: types.Agent) => agent.name === name);

	if (possible_agents.length > 0){
		return possible_agents[0]		// if theres multiple agents with this name, return the first one
	}
	else{
		// returns false if there is no listed action with this name
		console.log("getAgentByName => Couldn't find agent with name: ", name);
		return null
	}
}


/**
 * Returns whether the agent is content, ie. checks to see if an agent has maximum motives
 * 
 * @param  {types.Agent} agent - Agent being checked
 * @returns {boolean} true if agent has maximum motives; false if agent does not have maximum motives 
 */
export function isContent(agent:types.Agent):boolean {
	for(var motiveType of types.motiveTypes){
		if(agent.motive[motiveType] < exec.MAX_METER){
			return false;
		}
	}
	return true;
}

/**
 * Checks to see whether a specific motive (with keyof type.Motive) of an agent is maximum or not. 
 * 
 * @param  {types.Agent} agent - agent being checked or tested 
 * @param  {keyof    types.Motive} motive - type of motive (types.Motive) that is being checked to see if the value is maximum
 * @returns {boolean} true if the agent's motive is maximum; false if it is not 
 */
export function isMotiveFull(agent:types.Agent, motive:keyof types.Motive):boolean {
	return agent.motive[motive] == exec.MAX_METER;
}

/**
 * Checks to see whether a specific motive (with keyof type.Motive) of an agent is not maxed out. 
 * 
 * @param  {types.Agent} agent - agent being checked or tested 
 * @param  {keyof    types.Motive} motive - type of motive (types.Motive) that is being checked to see if the value is not maxed
 * @returns {boolean} true if the agent's motive is not maximum; false if it is
 */
export function isMotiveNotFull(agent:types.Agent, motive:keyof types.Motive): boolean {
	return agent.motive[motive]	< exec.MAX_METER;
}


/**
 * Selects an action from a list of valid actions to be preformed by a specific agent.
	Selects the action with the maximal utility of the agent (motive increase/time).

 * @param {types.Agent} agent - agent for whom the next action must be determined
 * @returns 
 * selected_action - next action to be executed, 
 * destination - the destination the agent must travel to for the action
 */
export function selectNextActionForAgent(agent:types.Agent): {"selected_action": types.Action, "destination": types.SimLocation} {
	
	// initialized to 0 (no reason to do an action if it will harm you)
	// Should check what the max we'd need for this agent to be satisfied, 
	// 			if that is attained, stop searching through actions? 
	var max_delta_utility:number = 0;

	// initialized to the inaction
	var current_choice:types.Action = action_manager.getActionByName("wait_action");
	var current_destination:types.SimLocation = null;

	// Finds the utility for each action to the given agent
	for (var each_action of actionList){
		// var nearest_location:types.SimLocation = null;
		var travel_time:number = 0;

		var possible_locations: types.SimLocation[] = locationList;
		
		let location_requirement: types.LocationReq[] = action_manager.getRequirementByType(each_action, types.ReqType.location) as types.LocationReq[];
		let people_requirement: types.PeopleReq[] = action_manager.getRequirementByType(each_action, types.ReqType.people) as types.PeopleReq[];
		let motive_requirements: types.MotiveReq[] = action_manager.getRequirementByType(each_action, types.ReqType.motive) as types.MotiveReq[];

		if(location_requirement.length > 0){
			// Get the delta_utility for the nearest location that satisfies this action's location requirement.
			// Get possible locations for this action
			possible_locations = location_manager.locationsSatisfyingLocationRequirement(possible_locations, location_requirement[0])
			// possible_locations = location_manager.getLocationsSortedByDistanceFromOther(possible_locations, agent.currentLocation);
		}
		
		// If location requirement is met, 
		// check for existing people_requirement at each location
		// Todo: If no location possible with PeopleReq, invite people? 
		if(possible_locations.length > 0 && people_requirement.length > 0){
			// console.log("Testing People Requirement", possible_locations, each_action.name, people_requirement)
			possible_locations = location_manager.locationsSatisfyingPeopleRequirement(agent, possible_locations, people_requirement[0]);
		}

		if(possible_locations.length > 0 && motive_requirements.length > 0){
			// Todo
		}

		// If there is a location possible that meets all the requriements 
		// The action can be implemented. Find delta_utility. 
		// If not, check the next action
		if(possible_locations.length > 0){
			var nearest_location =  location_manager.getNearestLocationFromOther(possible_locations, agent.currentLocation)
			var travel_time:number = location_manager.getManhattanDistance(nearest_location, agent.currentLocation);

			// adjust for time (including travel time)
			var delta_utility: number = action_manager.getEffectDeltaForAgentAction(agent, each_action);
			delta_utility = delta_utility/(each_action.time_min + travel_time);

			if (delta_utility > max_delta_utility) {
				max_delta_utility = delta_utility;
				current_choice = each_action;
				current_destination = nearest_location;
			}
		}
	}
	
	return {"selected_action":current_choice, "destination":current_destination};
}


/**
 * Decrements all the motives of the specified agent 
 * 
 * @param {types.Agent} agent - agent whose motives must be decremented
 */
export function decrement_motives(agent: types.Agent) {
	for(var motiveType of types.motiveTypes) {
		agent.motive[motiveType] = utility.clamp(agent.motive[motiveType] - 1, exec.MAX_METER, exec.MIN_METER);
	}
}


/**
 * Updates movement and occupation counters for an agent. 
 * May decrement the motives of an agent once every 10 hours. Chooses or executes an action when necessary. 
 * 
 * @param  {types.Agent} agent - agent whose turn is being executed
 * @param  {number} time - the current time for log purposes 
 * 
 * @returns {boolean} true if the agent is traveling; false if not. Used to determine the speed of the simulation
 */
export function turn(agent:types.Agent, time:number):boolean {
	var movement:boolean = false;
	if (time%600 == 0) {
		if (!isContent(agent)) {
			decrement_motives(agent);
		}
	}

	if (agent.occupiedCounter > 0) {
		agent.occupiedCounter--;

		// If the agent is traveling 
		if(agent.destination != null){
			movement = true;
			location_manager.moveAgentCloserToDestination(agent);
		}
	} 

	// If not traveling (i.e. arrived at destination), and end of occupied, execute planned action effects, select/start next.
	else {
		if (!isContent(agent)) {
			// Find next action to do
			action_manager.execute_action(agent, agent.currentAction, time);
			var {selected_action, destination} = selectNextActionForAgent(agent);

			if (destination != null && !location_manager.isAgentAtLocation(agent, destination)) {
				location_manager.startTravelToLocation(agent, destination, time);
			}
			else{
				action_manager.start_action(agent, selected_action, destination, time)	
			}
		}
  	}
  	return movement;
}
