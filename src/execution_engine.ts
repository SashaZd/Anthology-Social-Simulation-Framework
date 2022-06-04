import * as agent_manager from "./agent";
import * as action_manager from "./action_manager";
import * as types from "./types";
import * as ui from "./ui";
import * as world from "./world";
import * as utility from "./utilities";

const json_data = require("./data.json");
//require("../examples/college-roommates.json");

world.loadActionsFromJSON(json_data['primary-actions'],json_data['schedule-actions']);
world.loadLocationsFromJSON(json_data['locations']);
world.loadAgentsFromJSON(json_data["agents"]);

// world.createRandomLocations(json_data['rand_locations'], json_data['grid_size']);
// world.createRandomAgents(json_data["rand_agents"]);

/**
 * Executes a turn for each agent every tick.
 * Executes a single turn and then is called from ui for the next, no more loop
 *
 * @param {types.Agent[]} agentList - list of agents in the simulation
 * @param {types.Action[]} actionList - list of valid actions in the simulation
 * @param {types.SimLocation[]} locationList - list of locations in the simulation
 * @param {() => boolean} continueFunction - boolean function that is used as a check as to whether or not to keep running the sim
 */
export function run_sim(
		agentList:types.Agent[], actionList:types.Action[]
		, locationList:types.SimLocation[]
		, continueFunction: () => boolean):void 
{
	let movement:boolean = false;
	if(continueFunction()) {
		for (var agent of agentList) {
			let turnMove:boolean = turn(agent);
			movement = movement || turnMove;
		}
		world.increment_time()
	} /* else {
		utility.log("Finished.");
		utility.print();
	} */
	
	// June 2, 2022 CRM: refactored round_wait() not to depend on all the params, instead just pass it the
	// continuation function.
	round_wait(() => {run_sim(agentList, actionList, locationList, continueFunction)}, movement);
	ui.updateUI(agentList, locationList);
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

	// if (world.TIME%1200 == 0) {
	// 	if (!agent_manager.isContent(agent)) {
	// 		agent_manager.decrement_motives(agent);
	// 	}
	// }
// >>>>>>> 506a6e0522e5a75b5f5711de1dd88afbcc32dbea

	if (agent.occupiedCounter > 0) {
		agent.occupiedCounter--;


		if (agent.currentAction[0].name == "travel_action" && agent.destination != null){
			movement = true;
			action_manager.moveAgentCloserToDestination(agent);
		}
	}
	// If not traveling (i.e. arrived at destination), and end of occupied, execute planned action effects, select/start next.
	else {
		action_manager.execute_action(agent);
		if (!agent_manager.isContent(agent)) {

			if(agent.currentAction.length == 0){
				action_manager.selectNextActionForAgent(agent);
			}
			else{
				action_manager.start_action(agent);
			}

		}
	}
	return movement;
}



export var INTERRUPT:string[] = [];


/**
 * Interrupts the agent from the current action they are performing. 
 * Potential future implementation: Optionally add the interrupted action (with the remaining occupied_counter) to the end of the action queue. 
 * 
 * @param {string} 		name 	the agent being interrupted 
 */
export function interrupt(name:string): void{
	var agentToInterrupt:types.Agent = agent_manager.getAgentByName(name);
	agentToInterrupt.occupiedCounter = 0;
	agentToInterrupt.destination = null
	let actionInterrupted:types.Action = agentToInterrupt.currentAction.shift();
	utility.log("Agent:" + name + " was interrupted from action:" + actionInterrupted.name)
}

/**
 * [round_wait description]
 * @param  {types.Agent[]}        agentList        list of agents in the simulation
 * @param  {types.Action[]}       actionList       list of action available to the agents
 * @param  {types.SimLocation[]}  locationList     list of locations in the simulation world
 * @param  {() => boolean}        continueFunction function which returns true if the simulation should continue
 * @param  {boolean}              movement         Whether or not any agents moved this turn
 */
export function round_wait(f : () => void, movement:boolean) {
	if (movement) {
		setTimeout(f, ui.sleepMove);
	} else {
		setTimeout(f, ui.sleepStill);
	}
}



// /**
// * Get the current simulation time
// * @returns {number} TIME - simulation time
// */
// export function get_time():number {
// 	return TIME;
// }
