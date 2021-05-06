import * as npc from "./agent";
import * as types from "./types";
import * as ui from "./ui";

export var TIME:number = 0;

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
		movement = movement || npc.turn(agent, TIME);
	}
	increment_time()
	ui.updateUI(agentList, actionList, locationList, continueFunction, TIME, movement);
}

/**
 * Get the current simulation time
 * @returns {number} TIME - simulation time 
 */
export function get_time():number {
	return TIME;
}

/**
 * Increment simulation time or ticks 
 */
export function increment_time():void {
	TIME += 1;
}
