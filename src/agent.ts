// import * as action_manager from "./action_manager";
import * as utility from "./utilities";
import * as types from "./types";
import * as world from "./world";


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

	let possible_agents = world.agentList.filter((agent: types.Agent) => agent.name === name);

	if (possible_agents.length > 0){
		return possible_agents[0]		// if theres multiple agents with this name, return the first one
	}
	else{
		// returns false if there is no listed action with this name
		utility.log("getAgentByName => Couldn't find agent with name: " + name);
		return null
	}
}


/**
 * Stopping condition for the simulation
 * Stops the sim when all agents are content
 *
 * @returns {boolean} true if the simulation cna continue; false if the simulation can stop
 */
export function allAgentsContent():boolean {
	for (var agent of world.agentList){
		// If any agent is not content, continue running sim
		if(!isContent(agent)){
			// utility.log(agent.name, " IS NOT content.")
			return false;
		}
	}
	// If all agents are content, stop running
	return true;
}



/**
 * Returns whether the agent is content, ie. checks to see if an agent has maximum motives
 *
 * @param  {types.Agent} agent - Agent being checked
 * @returns {boolean} true if agent has maximum motives; false if agent does not have maximum motives
 */
export function isContent(agent:types.Agent):boolean {
	for(var motiveType of types.motiveTypes){
		if(agent.motive[motiveType] < utility.MAX_METER){
			return false;
		}
	}
	return true;
}


/**
 * Decrements all the motives of the specified agent
 *
 * @param {types.Agent} agent - agent whose motives must be decremented
 */
export function decrement_motives(agent: types.Agent) {
	for(var motiveType of types.motiveTypes) {
		agent.motive[motiveType] = utility.clamp(agent.motive[motiveType] - 1, utility.MAX_METER, utility.MIN_METER);
	}
}

/**
 * Check whether the agent satisfies the motive requirement for an action
 * @param  {types.Agent}       agent               agent for whom we are testing the action
 * @param  {types.MotiveReq[]} motive_requirements motive requirements for the action being evaluated
 * @return {boolean}                               returns true if the motive requirements are met; false if not
 */
export function agentSatisfiesMotiveRequirement(agent:types.Agent, motive_requirements:types.MotiveReq[]): boolean{
	for (var motive_requirement of motive_requirements){
		switch(motive_requirement.op) {
			case "equals": {
				if (!(agent.motive[motive_requirement.motive] == motive_requirement.thresh)) {
					return false
				}
				break;
			}
			case "lt": {
				if (!(agent.motive[motive_requirement.motive] < motive_requirement.thresh)) {
					return false
				}
				break;
			}
			case "gt": {
				if (!(agent.motive[motive_requirement.motive] > motive_requirement.thresh)) {
					return false
				}
				break;
			}
			case "leq": {
				if (!(agent.motive[motive_requirement.motive] <= motive_requirement.thresh)) {
					return false
				}
				break;
			}
			case "geq": {
				if (!(agent.motive[motive_requirement.motive] >= motive_requirement.thresh)) {
					return false
				}
				break;
			}
			default: {
				utility.log("ERROR - JSON BinOp specification mistake for Motive Requirement for action")
				return false
				break;
			}
		}
	}
	return true
}



/**
 * Checks to see whether a specific motive (with keyof type.Motive) of an agent is maximum or not.
 *
 * @param  {types.Agent} agent - agent being checked or tested
 * @param  {keyof    types.Motive} motive - type of motive (types.Motive) that is being checked to see if the value is maximum
 * @returns {boolean} true if the agent's motive is maximum; false if it is not
 */
// export function isMotiveFull(agent:types.Agent, motive:keyof types.Motive):boolean {
// 	return agent.motive[motive] == utility.MAX_METER;
// }

/**
 * Checks to see whether a specific motive (with keyof type.Motive) of an agent is not maxed out.
 *
 * @param  {types.Agent} agent - agent being checked or tested
 * @param  {keyof    types.Motive} motive - type of motive (types.Motive) that is being checked to see if the value is not maxed
 * @returns {boolean} true if the agent's motive is not maximum; false if it is
 */
// export function isMotiveNotFull(agent:types.Agent, motive:keyof types.Motive): boolean {
// 	return agent.motive[motive]	< utility.MAX_METER;
// }
