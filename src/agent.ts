// import * as action_manager from "./action_manager";
import * as utility from "./utilities";
import * as types from "./types";
import * as world from "./world";


// To do: this way.
// const getKeyValue = <U extends keyof T, T extends object>(key: U) => (obj: T) => obj[key];

/**
 * Gets the name of all the agents that have a specific relationship with this agent
 * @param  {types.Agent} agent   the agent whose relationships has to be checked
 * @param  {string}      relType the type of relationship to check for. Eg. sibling, romantic, etc
 * @return {string[]}            list of all the agent names that match this criteria
 */
export function getAgentsWithRelationship(agent:types.Agent, relType: string): string[]{
    let rels: types.Relationship[] = agent.relationships.filter((r:types.Relationship) => r.type === relType)
    let people: string[] = rels.map((rel) => rel.with)

    console.log(agent.name, "is ", relType, " with ", people);

    return people;
}



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
export function getAgentByName(name: string):types.Agent {
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
 * Get the names of all the agents in the list, and return it as a string[]
 * @param  {types.Agent[]} agents List of agents 
 * @return {string[]}             String[] list of all agent names
 */
export function getAgentNames(agents: types.Agent[]): string[]{
	return agents.map(a => a.name);
}


// export function getAgentsByNames(names: string[]):types.Agent[] {
// 	if(!names || names.length==0){
// 		return []
// 	}

// 	let possible_agents = world.agentList.filter((a: types.Agent) => names.includes(a.name));
	
// 	return possible_agents
// }



/**
 * Stopping condition for the simulation
 * Stops the sim when all agents are content
 *
 * @returns {boolean} true if the simulation cna continue; false if the simulation can stop
 */
export function allAgentsContent():boolean {
	for (var agent of world.agentList){
		// If any agent is not content, continue running sim
		// if(isContent(agent)){
		// 	utility.log(agent.name + " IS content.")
		// }

		if(!isContent(agent)){
			// utility.log(agent.name, " IS NOT content.")
			return true;
		}
	}
	// If all agents are content, stop running
	return false;
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
