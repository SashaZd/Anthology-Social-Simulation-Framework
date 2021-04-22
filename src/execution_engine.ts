import * as npc from "./agent";
import * as types from "./types";
// import {wait_action} from "./action_specs";
import * as utility from "./utilities";
import * as ui from "./ui";

// import {actionList} from "./main";

export var time:number = 0;
export const MAX_METER = 5;
export const MIN_METER = 1;


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
		movement = movement || npc.turn(agent, time);
	}
	time += 1;
	ui.updateUI(agentList, actionList, locationList, continueFunction, time, movement);
}
