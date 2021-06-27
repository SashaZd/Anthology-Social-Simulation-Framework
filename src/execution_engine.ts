import * as agent_manager from "./agent";
import * as action_manager from "./action_manager";
import * as types from "./types";
import * as ui from "./ui";
import * as world from "./world";
import * as utility from "./utilities";

// import * as json_data from "./data.json";
const json_data = require("./data.json");

world.loadActionsFromJSON(json_data['actions']);
world.loadLocationsFromJSON(json_data['locations']);
world.createRandomLocations(json_data['rand_locations'], json_data['grid_size']);
world.loadAgentsFromJSON(json_data["agents"]);
world.createRandomAgents(json_data["rand_agents"]);

/**
 * Executes a turn for each agent every tick.
 * Executes a single turn and then is called from ui for the next, no more loop
 *
 * @param {types.Agent[]} agentList - list of agents in the simulation
 * @param {types.Action[]} actionList - list of valid actions in the simulation
 * @param {types.SimLocation[]} locationList - list of locations in the simulation
 * @param {() => boolean} continueFunction - boolean function that is used as a check as to whether or not to keep running the sim
 */
export function run_sim(agentList:types.Agent[], actionList:types.Action[], locationList:types.SimLocation[], continueFunction: () => boolean):void {
	var movement:boolean = false;
	for (var agent of agentList){
    var turnMove:boolean = turn(agent);
		movement = movement || turnMove;
	}
	world.increment_time()
	round_wait(agentList, actionList, locationList, continueFunction, movement);
}

/**
 * Updates movement and occupation counters for an agent.
 * May decrement the motives of an agent once every 10 hours. Chooses or executes an action when necessary.
 *
 * @param  {types.Agent} agent - agent whose turn is being executed
 *
 * @returns {boolean} true if the agent is traveling; false if not. Used to determine the speed of the simulation
 */
export function turn(agent:types.Agent):boolean {
	var movement:boolean = false;
	if (world.TIME%1200 == 0) {
		if (!agent_manager.isContent(agent)) {
			agent_manager.decrement_motives(agent);
		}
	}

	if (agent.occupiedCounter > 0) {
		agent.occupiedCounter--;

		// If the agent is traveling
		if(agent.destination != null){
			movement = true;
			action_manager.moveAgentCloserToDestination(agent);
		}
	}

	// If not traveling (i.e. arrived at destination), and end of occupied, execute planned action effects, select/start next.
	else {
		if (!agent_manager.isContent(agent)) {
			action_manager.execute_action(agent);
			action_manager.selectNextActionForAgent(agent);
		}
	}
	return movement;
}

export function round_wait(agentList:types.Agent[], actionList:types.Action[], locationList:types.SimLocation[], continueFunction: () => boolean, movement:boolean) {
  ui.updateUI(agentList, locationList);
  if (continueFunction()) {
		if (movement) {
			setTimeout(() => {run_sim(agentList, actionList, locationList, continueFunction)}, ui.sleepMove);
		} else {
			setTimeout(() => {run_sim(agentList, actionList, locationList, continueFunction)}, ui.sleepStill);
		}
	} else {
		utility.log("Finished.");
		utility.print();
	}
}


// /**
// * Get the current simulation time
// * @returns {number} TIME - simulation time
// */
// export function get_time():number {
// 	return TIME;
// }
