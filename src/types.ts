////////////////////////////////////////////////////////
/////////////// MOTIVES ////////////////////////////////
////////////////////////////////////////////////////////


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
export const motiveTypes: string[] = Object.keys(MotiveType).filter(k => typeof MotiveType[k as keyof typeof MotiveType] === "string");


////////////////////////////////////////////////////////
/////////////// REQUIREMENTS ///////////////////////////
////////////////////////////////////////////////////////


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
	reqType: "location",
	hasAllOf: string[],
	hasOneOrMoreOf: string[],		// Propose: Rename to hasSomeOf (to match Typescript array methods)
	hasNoneOf: string[]
}

// Requirements on who is present for an action.
// eg: must be with a sepcific person
export interface PeopleReq {
	reqType: "people",
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

