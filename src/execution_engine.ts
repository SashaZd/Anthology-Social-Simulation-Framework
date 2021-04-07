import * as npc from "./agent";
import * as types from "./types";
// import {wait_action} from "./action_specs";
import * as utility from "./utilities";
import * as ui from "./ui";

// import {actionList} from "./main";

export var time:number = 0;
export const MAX_METER = 5;
export const MIN_METER = 1;


/*  randomizes order and executes a turn for each agent every tick.
		agentList: list of agents in the sim
		actionList: the list of valid actions
		locationList: all locations in the world
		continueFunction: boolean function that is used as a check as to whether or not to keep running the sim
		executes a single turn and then is called from ui for the next, no more loop */
export function run_sim(agentList:types.Agent[], actionList:types.Action[], locationList:types.SimLocation[], continueFunction: () => boolean):void {
	utility.shuffleArray(agentList);
	var i:number = 0;
	for (i = 0; i < agentList.length; i++ ) {
		npc.turn(agentList[i], actionList, locationList, time);
	}
	time += 1;
	ui.updateUI(agentList, actionList, locationList, continueFunction, time);
}


