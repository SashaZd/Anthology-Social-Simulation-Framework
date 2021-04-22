////////////////////////////////////////////////////////
/////////////// MOTIVES ////////////////////////////////
////////////////////////////////////////////////////////


// Five motive types
/**
 * Motive Type Enum 
 * Current has a preset list of 5 motives: 
 * - physical - deals with the agent's physical needs - eg. eat or sleep 
 * - emotional - deals with the agent's emotional needs - eg. happiness from watching a movie
 * - social - deals with the agent's social needs - eg. spending time with other agents 
 * - Financial - deals with the agent's financial needs - eg. working for a living 
 * - accomplishment - deals with the agent's sense of accomplishement - eg. skill learnt by doing a hobby
 */
export enum MotiveType {
	physical = "physical",
	emotional = "emotional",
	social = "social",
	financial = "financial",
	accomplishment = "accomplishment"
}

// This is more of a need and less of a motive since it's a set of them all


/**
 * Motive Type Interface 
 * Current has a preset list of 5 motives: 
 * - physical - deals with the agent's physical needs - eg. eat or sleep 
 * - emotional - deals with the agent's emotional needs - eg. happiness from watching a movie
 * - social - deals with the agent's social needs - eg. spending time with other agents 
 * - Financial - deals with the agent's financial needs - eg. working for a living 
 * - accomplishment - deals with the agent's sense of accomplishement - eg. skill learnt by doing a hobby
 */
export interface Motive {
	physical: number;
	emotional: number;
	social: number;
	financial: number;
	accomplishment: number;
	[key: string]: number;		// lets us lookup a value by a string key
}


// convenient list of keys of the motive types we have which we can iterate through
export const motiveTypes: string[] = Object.keys(MotiveType).filter(k => typeof MotiveType[k as keyof typeof MotiveType] === "string");


////////////////////////////////////////////////////////
/////////////// REQUIREMENTS ///////////////////////////
////////////////////////////////////////////////////////


// 
/**
 * Binary Operations 
 * Used primarily in requirements
 */
export enum BinOp {
	equals,
	gt,
	lt,
	geq,
	leq
}

// Three types of requirements
export type ReqType = "location" | "people" | "motive"; 

// export enum ReqType {
// 	location = "location",
// 	people = "people",
// 	motive = "motive"
// }

/**
 * Location Requirement
 * Requirements on the type of location the action takes place in.
 * Based on a tags system for locations.
 * eg: hasAllOf:['restaurant'] implies to execute the action, one must be at a restaurant
 */
export interface LocationReq {
	reqType: "location",
	hasAllOf: string[],
	hasOneOrMoreOf: string[],		// Propose: Rename to hasSomeOf (to match Typescript array methods)
	hasNoneOf: string[]
}

// 
// eg: must be with a sepcific person

/**
 * People Requirement
 * Requirements on who is or must be present for an action.
 * eg: minNumPeople:2 implies that at least 2 people must be present for this action to occur
 */
export interface PeopleReq {
	reqType: "people",
	minNumPeople: number,
	maxNumPeople: number,
	specificPeoplePresent: Agent[],
	specificPeopleAbsent: Agent[],
	relationshipsPresent: string[],
	relationshipsAbsent: string[]
}

// 
// 
// Discuss: This should be using the interface and not an enum

/**
 * Motive Requirement
 * Requirements on the executing agen't current motive scores.
 * eg: motive:"financial" > 2 implies the agent must must have at least 2 money units to execute the action
 */
export interface MotiveReq {
	reqType: "motive",
	motive: MotiveType,
	op:     BinOp,
	thresh: number
}

// General requirement type.
// eg: any of the above three
// Meeting: type should be inside Location/People/Motive Req. Not a separate key 
// Right now everytime you create a new requirement, you're changing 3 different things. Will be less complex 
// export interface Requirement {
// 	type: ReqType,
// 	req: LocationReq | PeopleReq | MotiveReq
// }

/**
 * Requirement Type 
 * Union type of Location Requirements, People Requirements or Motive Requirements
 * @type {[type]}
 */
export type Requirement = LocationReq | PeopleReq | MotiveReq;

// Action effect type.
// eg: sleep increases the physical motive
export interface Effect {
	motive: MotiveType,
	delta: number
}

// General action type.
// Name, requiremnts, effects, and minimum time taken.
// eg: sleep
// Assumptions: 1 LocationReq, 1 People Req, MotiveReq[]
export interface Action {
	name: string,
	requirements: Requirement[],
	effects:      Effect[],
	time_min:     number
}


////////////////////////////////////////////////////////
/////////////// AGENTS /////////////////////////////////
////////////////////////////////////////////////////////



//General agent type.
// Name and Current Motive Scores.
// eg: any npc character
// destination = null ---> No location requirement for action, or agent already at location.
export interface Agent {
	// Agent Properties
	name: string,
	motive: Motive,
	currentLocation: SimLocation,
	occupiedCounter: number,
	currentAction: Action,
	destination: SimLocation | null
}

// JSON agent type: currentAction:string is converted to currentAction:Action by parser
export interface JSONAgent {
	name: string,
	motive: Motive,
	currentLocation: SimLocation,
	occupiedCounter: number,
	currentAction: string,
	destination: SimLocation | null
}


////////////////////////////////////////////////////////
/////////////// LOCATIONS ///////////////////////////
////////////////////////////////////////////////////////

// Locations can also be a named position, a name, and a list of tags
// eg: a specific restaurant
// There should be a point Interface since some locations are not named. 
// Locations can be an unnamed position, with just an associated x,y coordinate
export interface SimLocation{
	xPos: number
	yPos: number
	name?: string
	tags?: string[]
}

