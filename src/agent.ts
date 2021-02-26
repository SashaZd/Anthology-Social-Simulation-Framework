// Five motive types
export enum Motive {
  physical,
  emotional,
  social,
  financial,
  accomplishment
}

// Binary Operations used primarily in requirements
export enum BinOp {
  equals,
  greater_than,
  less_than,
  geq,
  leq
}

// Three types of requirements
export enum ReqType {
  location,
  people,
  motive
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
export interface MotiveReq {
  motive: Motive,
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
  motive: Motive,
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
  name: string,
  physical: number,
  emotional: number,
  social: number,
  financial: number,
  accomplishment: number,
  xPos: number,
  yPos: number,
  occupiedCounter: number,
  currentAction: Action,
  destination: Location
}

// Locations are a position, a name, and a list of tags
// eg: a specific restaurant
export interface Location {
  name: string,
  xPos: number,
  yPos: number,
  tags: string[]
}
