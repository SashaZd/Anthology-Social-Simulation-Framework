import * as exec from "./execution_engine";
// import {wait_action} from "./action_specs";
// import {travel_action} from "./action_specs";
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
export function isContent(agent:types.Agent, motive?:keyof types.Motive):boolean {
	if(motive){
		return agent.motive[motive] == exec.MAX_METER;
	}
	else{
		for(var motiveType of types.motiveTypes){
			if(agent.motive[motiveType] < exec.MAX_METER){
				return false;
			}
		}
	}
	return true;
}



/*  Selects an action from a list of valid actions to be preformed by a specific agent.
		Choses the action with the maximal utility of the agent (motive increase/time).
		agent: the agent in question
		actionList: the list of valid actions
		locationList: all locations in the world
		return: The single action chosen from the list */
export function select_action(agent:types.Agent, actionList:types.Action[], locationList:types.SimLocation[]):types.Action {
	
	// initialized to 0 (no reason to do an action if it will harm you)
	var maxDeltaUtility:number = 0;

	// initialized to the inaction
	var currentChoice:types.Action = action_manager.getActionByName("wait_action");

	// Finds the utility for each action to the given agent
	for (var eachAction of actionList){
		var dest:types.SimLocation = null;
		var travelTime:number = 0;
		var check:boolean = true;

		let location_requirements: types.LocationReq[] = action_manager.getRequirementByType(eachAction, types.ReqType.location) as types.LocationReq[];
		let people_requirements: types.PeopleReq[] = action_manager.getRequirementByType(eachAction, types.ReqType.people) as types.PeopleReq[];
		let motive_requirements: types.MotiveReq[] = action_manager.getRequirementByType(eachAction, types.ReqType.motive) as types.MotiveReq[];


		for (var eachRequirement of eachAction.requirements){
			if (eachRequirement.reqType == types.ReqType.location){
				var requirement:types.LocationReq = eachRequirement as types.LocationReq;
				dest = location_manager.getNearestLocation(requirement, locationList, agent.currentLocation.xPos, agent.currentLocation.yPos);
				if (dest == null) {
					// Don't have to travel, already there???
					check = false;
				} else {
					travelTime = Math.abs(dest.xPos - agent.currentLocation.xPos) + Math.abs(dest.yPos - agent.currentLocation.yPos);
				}
			}
		}
		// if an eachAction has satisfiable requirements
		if (check) {
			var deltaUtility:number = 0;

			for (var eachEffect of eachAction.effects){
				var _delta = eachEffect.delta;
				var _motivetype = types.MotiveType[eachEffect.motive];
				deltaUtility += utility.clamp(_delta + agent.motive[_motivetype], exec.MAX_METER, exec.MIN_METER) - agent.motive[_motivetype];
			}

			// adjust for time (including travel time)
			deltaUtility = deltaUtility/(eachAction.time_min + travelTime);
			/// update choice if new utility is maximum seen so far
			if (deltaUtility > maxDeltaUtility) {
				maxDeltaUtility = deltaUtility;
				currentChoice = eachAction;
			}
		}
	}
	return currentChoice;
}

/*  applies the effects of an action to an agent.
		agent: the agent in question
		action: the action in question */
export function execute_action(agent:types.Agent, action:types.Action):void {
	var i:number = 0;
	// apply each effect of the action by updating the agent's motives

	for (i=0; i<action.effects.length; i++){
		var _delta = action.effects[i].delta;
		var _motivetype = types.MotiveType[action.effects[i].motive];
	   agent.motive[_motivetype] = utility.clamp(agent.motive[_motivetype] + _delta, exec.MAX_METER, exec.MIN_METER);
	}
}

/*  updates movement and occupation counters for an agent. chooses and executes a new action if necessary
		agent: agent executing a turn
		actionList: the list of valid actions
		locationList: all locations in the world
		time: current tick time */
export function turn(agent:types.Agent, actionList:types.Action[], locations:types.SimLocation[], time:number):void {
	

	if (time%600 == 0) {
		if (!isContent(agent)) {
			for(var motiveType of types.motiveTypes) {
				agent.motive[motiveType] = utility.clamp(agent.motive[motiveType] - 1, exec.MAX_METER, exec.MIN_METER);
			}
		}
	}
  if (agent.occupiedCounter > 0) {
	agent.occupiedCounter--;
	if (agent.destination != null) {
	  var dest:types.SimLocation = agent.destination;
	  if (agent.currentLocation.xPos != dest.xPos) {
		if (agent.currentLocation.xPos > dest.xPos) {
		  agent.currentLocation.xPos -= 1;
		} else {
		  agent.currentLocation.xPos += 1;
		}
	  } else if (agent.currentLocation.yPos != dest.yPos) {
		if (agent.currentLocation.yPos > dest.yPos) {
		  agent.currentLocation.yPos -= 1;
		} else {
		  agent.currentLocation.yPos += 1;
		}
	  }
	}
	} else {
		if (!isContent(agent)) {
			agent.destination = null;
			execute_action(agent, agent.currentAction);
			console.log("time: " + time.toString() + " | " + agent.name + ": Finished " + agent.currentAction.name);

			var choice: types.Action = select_action(agent, actionList, locations);
			var dest2:types.SimLocation = null;
			var k:number = 0;
			for (k = 0; k<choice.requirements.length; k++) {
				if (choice.requirements[k].reqType == types.ReqType.location) {
					var requirement: types.LocationReq = choice.requirements[k] as types.LocationReq;
					dest = location_manager.getNearestLocation(requirement, locations, agent.currentLocation.xPos, agent.currentLocation.yPos);
				}
			}
			//set action to choice or to travel if agent is not at location for choice
			if (dest2 === null || (dest2.xPos == agent.currentLocation.xPos && dest2.yPos == agent.currentLocation.yPos)) {
				agent.currentAction = choice;
				agent.occupiedCounter = choice.time_min;
				console.log("time: " + time.toString() + " | " + agent.name + ": Started " + agent.currentAction.name);
			} 
			else {
				var travelTime:number = Math.abs(dest2.xPos - agent.currentLocation.xPos) + Math.abs(dest2.yPos - agent.currentLocation.yPos);
				agent.currentAction = action_manager.getActionByName("travel_action");
				agent.occupiedCounter = travelTime;
				agent.destination = dest2;
				console.log("time: " + time.toString() + " | " + agent.name + ": Started " + agent.currentAction.name + "; Destination: " + dest2.name);
			}
	}
  }
}
