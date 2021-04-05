import * as exec from "./execution_engine";
// import {wait_action} from "./action_specs";
// import {travel_action} from "./action_specs";
import * as utility from "./utilities";


// Five motive types
// Discuss: This is an enum, but we don't use it. We pass 0,1,2 into the action specs file.
// Discuss: While this can be an enum -- renamed to MotiveType | Change: declare a union type for Motive
export enum MotiveType {
	physical = "physical",
	emotional = "emotional",
	social = "social",
	financial = "financial",
	accomplishment = "accomplishment"
}

// This is more of a need and less of a motive since it's a set of them all

export interface Motive {
	physical: number;
	emotional: number;
	social: number;
	financial: number;
	accomplishment: number;
	[key: string]: number;		// lets us lookup a value by a string key
}


// convenient list of keys of the motive types we have which we can iterate through
const motiveTypes: string[] = Object.keys(MotiveType).filter(k => typeof MotiveType[k as keyof typeof MotiveType] === "string");

// const StringIsNumber = value => isNaN(Number(value)) === false;
// function ToArray(enumme) {
//     return Object.keys(enumme)
//         .filter(StringIsNumber)
//         .map(key => enumme[key]);
// }

// const motiveTypes = ToArray(MotiveType);


// Binary Operations used primarily in requirements
export enum BinOp {
	equals,
	greater_than,
	less_than,
	geq,
	leq
}

// Three types of requirements
// Discuss: This is an enum, but we don't use it. We pass 0,1,2 into the action specs file.
export enum ReqType {
	location = "location",
	people = "people",
	motive = "motive"
}

// Requirements on the type of location the action takes place in.
// Based on a tags system for locations.
// eg: must be at a restaurant
export interface LocationReq {
	hasAllOf: string[],
	hasOneOrMoreOf: string[],
	hasNoneOf: string[]
}

// Requirements on who is present for an action.
// eg: must be with a sepcific person
export interface PeopleReq {
	minNumPeople: number,
	maxNumPeople: number,
	specificPeoplePresent: string[],
	specificPeopleAbsent: string[],
	relationshipsPresent: string[],
	relationshipsAbsent: string[]
}

// Requirements on the executing agen't current motive scores.
// eg: eg must have money (financial motive > 0) to do this
// Discuss: This should be using the interface and not an enum

// export interface SingleMotive {
// 	motive: MotiveType,
// 	valence: number
// }

export interface MotiveReq {
	motive: MotiveType,
	op:     BinOp,
	thresh: number
}

// General requirement type.
// eg: any of the above three
export interface Requirement {
	type: ReqType,
	req: LocationReq | PeopleReq | MotiveReq
}

// Action effect type.
// eg: sleep increases the physical motive
export interface Effect {
	motive: MotiveType,
	delta: number
}

// General action type.
// Name, requiremnts, effects, and minimum time taken.
// eg: sleep
export interface Action {
	name: string,
	requirements: Requirement[],
	effects:      Effect[],
	time_min:     number
}



//General agent type.
// Name and Current Motive Scores.
// eg: any npc character
export interface Agent {
	// Agent Properties
	name: string,
	motive: Motive,
	currentLocation: SimpleLocation | Location,
	occupiedCounter: number,
	currentAction: Action,
	destination: SimpleLocation | Location | null
}

// Locations can be an unnamed position, with just an associated x,y coordinate
export interface SimpleLocation {
	xPos: number,
	yPos: number
}

// Locations can also be a named position, a name, and a list of tags
// eg: a specific restaurant
// Discuss: There should be a point Interface since some locations are not named.
export interface Location extends SimpleLocation {
	name: string
	tags: string[]
}


/*  Checks to see if an agent has maximum motives
		agent: the agent being tested
		return: a boolean answering the question */

// To do: this way.
// const getKeyValue = <U extends keyof T, T extends object>(key: U) => (obj: T) => obj[key];

export function isContent(agent:Agent):boolean {
	for(var motiveType of motiveTypes){
		// const getmotive = getKeyValue<keyof Motive, Motive>(motiveType)(agent.motive);
		if(agent.motive[motiveType] < exec.MAX_METER){
			return false;
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
export function select_action(agent:Agent, actionList:Action[], locationList:Location[]):Action {
	// initialized to 0 (no reason to do an action if it will harm you)
	var maxDeltaUtility:number = 0;

	// initialized to the inaction
	var currentChoice:Action = utility.getActionByName("wait_action");


	// Talk to Jen about this method
	// Finds the utility for each action to the given agent
	for (var eachAction of actionList){
		var dest:Location = null;
		var travelTime:number = 0;
		var check:boolean = true;

		for (var eachRequirement of eachAction.requirements){
		// for (var k:number = 0; k<eachAction.requirements.length; k++) {
			if (eachRequirement.type == ReqType.location){
				var requirement:LocationReq = eachRequirement.req as LocationReq;
				dest = exec.getNearestLocation(requirement, locationList, agent.currentLocation.xPos, agent.currentLocation.yPos);
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
				var _motivetype = MotiveType[eachEffect.motive];
				deltaUtility += exec.clamp(_delta + agent.motive[_motivetype], exec.MAX_METER, exec.MIN_METER) - agent.motive[_motivetype];
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
export function execute_action(agent:Agent, action:Action):void {
	var i:number = 0;
	// apply each effect of the action by updating the agent's motives

	for (i=0; i<action.effects.length; i++){
		var _delta = action.effects[i].delta;
		var _motivetype = MotiveType[action.effects[i].motive];
	   agent.motive[_motivetype] = exec.clamp(agent.motive[_motivetype] + _delta, exec.MAX_METER, exec.MIN_METER);
	}
}

/*  updates movement and occupation counters for an agent. chooses and executes a new action if necessary
		agent: agent executing a turn
		actionList: the list of valid actions
		locationList: all locations in the world
		time: current tick time */
export function turn(agent:Agent, actionList:Action[], locationList:Location[], time:number):void {
	if (time%600 == 0) {
		if (!isContent(agent)) {
			for(var motiveType of motiveTypes) {
				agent.motive[motiveType] = exec.clamp(agent.motive[motiveType] - 1, exec.MAX_METER, exec.MIN_METER);
			}
		}
	}
  if (agent.occupiedCounter > 0) {
    agent.occupiedCounter--;
    if (agent.destination != null) {
      var dest:SimpleLocation = agent.destination;
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
			var choice:Action = select_action(agent, actionList, locationList);
			var dest2:Location = null;
			var k:number = 0;
			for (k = 0; k<choice.requirements.length; k++) {
				if (choice.requirements[k].type == ReqType.location) {
					var requirement:LocationReq = choice.requirements[k].req as LocationReq;
					dest2 = exec.getNearestLocation(requirement, locationList, agent.currentLocation.xPos, agent.currentLocation.yPos);
				}
			}
			//set action to choice or to travel if agent is not at location for choice
			if (dest2 === null || (dest2.xPos == agent.currentLocation.xPos && dest2.yPos == agent.currentLocation.yPos)) {
				agent.currentAction = choice;
				agent.occupiedCounter = choice.time_min;
				// console.log("time: " + time.toString() + " | " + agent.name + ": Started " + agent.currentAction.name);
			} else {
        var travelTime:number = Math.abs(dest2.xPos - agent.currentLocation.xPos) + Math.abs(dest2.yPos - agent.currentLocation.yPos);
        agent.currentAction = utility.getActionByName("travel_action");
        agent.occupiedCounter = travelTime;
        agent.destination = dest2;
        console.log("time: " + time.toString() + " | " + agent.name + ": Started " + agent.currentAction.name + "; Destination: " + dest2.name);
      }
    }
  }
}
