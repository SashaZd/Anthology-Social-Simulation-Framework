import * as exec from "./execution_engine";
// import {wait_action} from "./action_specs";
import {locationList, actionList} from "./main";
import * as action_manager from "./action_manager";
import * as utility from "./utilities";
import * as location_manager from "./location_manager";

import * as types from "./types";


/*  Checks to see if an agent has maximum motives
		agent: the agent being tested
		return: a boolean answering the question */

// To do: this way.
// const getKeyValue = <U extends keyof T, T extends object>(key: U) => (obj: T) => obj[key];


// Returns whether the agent is content
export function isContent(agent:types.Agent):boolean {
	for(var motiveType of types.motiveTypes){
		if(agent.motive[motiveType] < exec.MAX_METER){
			return false;
		}
	}
	return true;
}

export function isMotiveFull(agent:types.Agent, motive:keyof types.Motive):boolean {
	return agent.motive[motive] == exec.MAX_METER;
}

export function isMotiveNotFull(agent:types.Agent, motive:keyof types.Motive): boolean {
	return agent.motive[motive]	< exec.MAX_METER;
}


// export function selectNextAction(agent:types.Agent){
// 	var selected_action:types.Action = action_manager.getActionByName("wait_action"); 

// 	// get types of motive not at max for agent 
// 	// location_manager.getLocationsMatchingRequirement()
// }


/*  Selects an action from a list of valid actions to be preformed by a specific agent.
		Choses the action with the maximal utility of the agent (motive increase/time).
		agent: the agent in question
		actionList: the list of valid actions
		locationList: all locations in the world
		return: The single action chosen from the list */
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

		var possible_locations: types.SimLocation[] = [];
		
		let location_requirement: types.LocationReq[] = action_manager.getRequirementByType(each_action, types.ReqType.location) as types.LocationReq[];
		let people_requirement: types.PeopleReq[] = action_manager.getRequirementByType(each_action, types.ReqType.people) as types.PeopleReq[];
		let motive_requirements: types.MotiveReq[] = action_manager.getRequirementByType(each_action, types.ReqType.motive) as types.MotiveReq[];

		if(location_requirement.length > 0){
			// Get the delta_utility for the nearest location that satisfies this action's location requirement.
			// Get possible locations for this action, sorted by distance from agent.
			possible_locations = location_manager.locationsSatisfyingLocationRequirement(location_requirement[0], agent, each_action)
		}
		
		// If location requirement is met, 
		// check for existing people_requirement at each location
		// Todo: If no location possible with PeopleReq, invite people? 
		if(possible_locations.length > 0 && people_requirement.length > 0){
			// console.log("Testing People Requirement", possible_locations, each_action.name, people_requirement)
			possible_locations = location_manager.locationsSatisfyingPeopleRequirement(agent, possible_locations, people_requirement[0]);
		}

		if(possible_locations.length > 0 && motive_requirements.length > 0){
			console.log("Motive Requirement Not Implemented")
			continue;
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

export function decrement_motives(agent: types.Agent) {
	for(var motiveType of types.motiveTypes) {
		agent.motive[motiveType] = utility.clamp(agent.motive[motiveType] - 1, exec.MAX_METER, exec.MIN_METER);
	}
}


/*  updates movement and occupation counters for an agent. chooses and executes a new action if necessary
		agent: agent executing a turn
		actionList: the list of valid actions
		locationList: all locations in the world
		time: current tick time */
export function turn(agent:types.Agent, actionList:types.Action[], locations:types.SimLocation[], time:number):void {
	if (time%600 == 0){
		if (!isContent(agent)) {
			decrement_motives(agent);
		}
	}

	if (agent.occupiedCounter > 0) {
		agent.occupiedCounter--;

		// If the agent is traveling 
		// currentAction == action_manager.getActionByName("travel_action") && !location_manager.isAgentAtLocation(agent, agent.destination)
		if(agent.destination != null){
			location_manager.moveAgentCloserToDestination(agent);
		}
	} 

	// If not traveling (i.e. arrived at destination), and end of occupied, execute planned action effects, select/start next.
	else {
		action_manager.execute_action(agent, agent.currentAction, time);
		
		if (!isContent(agent)) {
			// Find next action to do
			var {selected_action, destination} = selectNextActionForAgent(agent);
			action_manager.start_action(agent, selected_action, destination, time)
		}
  	}
}
