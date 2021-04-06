import * as npc from "./agent";
import * as types from "./types";
// import {wait_action} from "./action_specs";
import * as utility from "./utilities";
import * as ui from "./ui";

// import {actionList} from "./main";

export var time:number = 0;
export const MAX_METER = 5;
export const MIN_METER = 1;


/*  checks membership in a list. String type
		item: a string to be checked
		list: a list of strings to check against
		return: a boolean answering the question */
export function inList(item:string, list:string[]):boolean {
	return list.includes(item)
	// var ret:boolean = false;
	// var i:number = 0;
	// for (i = 0; i<list.length; i++){
	// 	if (list[i] == item) {
	// 		ret = true;
	// 	}
	// }
	// return ret;
}

/*  returns the nearest location that satisfies the given requirement, or null.
		distance measured by manhattan distance
		locReq: a location requirement to satisfy
		locationList: a list of locations to check
		x & y: coordinate pair to determine distance against.
		return: the location in question or null */
export function getNearestLocation(locationReq:types.LocationReq, locationList:types.SimLocation[], x:number, y:number):types.SimLocation {
	var ret:types.SimLocation = null;
	var minDist:number = -1;
	var i:number = 0;
	for (i = 0; i<locationList.length; i++){
		var valid:boolean = true;
		var check1:boolean = true;
		var j:number = 0;

		for (j = 0; j<locationReq.hasAllOf.length; j++){
			if (!(inList(locationReq.hasAllOf[j],locationList[i].tags))) {
				check1 = false;
			}
		}
		var check2:boolean = false;
		for (j = 0; j<locationReq.hasOneOrMoreOf.length; j++){
			if (inList(locationReq.hasOneOrMoreOf[j],locationList[i].tags)) {
				check2 = true;
			}
		}
		if (locationReq.hasOneOrMoreOf.length == 0) {
			check2 = true;
		}
		var check3:boolean = true;
		for (j = 0; j<locationReq.hasNoneOf.length; j++){
			if (inList(locationReq.hasNoneOf[j],locationList[i].tags)) {
				check3 = false;
			}
		}
		if (locationReq.hasNoneOf.length == 0) {
			check3 = true;
		}
		if (!(check1 && check2 && check3)) {
			valid = false;
		}
		if (valid) {
			var travelDist: number = Math.abs(locationList[i].xPos - x) + Math.abs(locationList[i].yPos - y);
			if ((minDist > travelDist) || (minDist = -1)) {
				minDist = travelDist;
				ret = locationList[i];
			}
		}
	}
	return ret;
}

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


