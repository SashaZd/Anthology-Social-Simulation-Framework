import * as exec from "./execution_engine";
import {wait_action} from "./action_specs";
import {travel_action} from "./action_specs";

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

/*  Checks to see if an agent has maximum motives
    agent: the agent being tested
    return: a boolean answering the question */
export function isContent(agent:Agent):boolean {
  var ret:boolean = true;
  var i:number = 0;
  for (i = 0; i<5; i++){
    switch(i){
      case 0: {
        if (agent.physical != exec.MAX_METER) {
          ret = false;
        }
        break;
      }
      case 1: {
        if (agent.emotional != exec.MAX_METER) {
          ret = false;
        }
        break;
      }
      case 2: {
        if (agent.social != exec.MAX_METER) {
          ret = false;
        }
        break;
      }
      case 3: {
        if (agent.accomplishment != exec.MAX_METER) {
          ret = false;
        }
        break;
      }
      case 4: {
        if (agent.financial != exec.MAX_METER) {
          ret = false;
        }
        break;
      }
      default: {
        break;
      }
    }
  }
  return ret;
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
  var currentChoice:Action = wait_action;
  // Finds the utility for each action to the given agent
  var i:number = 0;
  for (i = 0; i<actionList.length; i++){
    var dest:Location = null;
    var travelTime:number = 0;
    var check:boolean = true;
    var k:number = 0;
    for (k = 0; k<actionList[i].requirements.length; k++) {
      if (actionList[i].requirements[k].type == 0){
        var requirement:LocationReq = actionList[i].requirements[k].req as LocationReq;
        dest = exec.getNearestLocation(requirement, locationList, agent.xPos, agent.yPos);
        if (dest == null) {
          check = false;
        } else {
          travelTime = Math.abs(dest.xPos - agent.xPos) + Math.abs(dest.yPos - agent.yPos);
        }
      }
    }
    // if an action has satisfiable requirements
    if (check) {
      var deltaUtility:number = 0;
      var j:number = 0;
      for (j = 0; j<actionList[i].effects.length; j++){
        switch(actionList[i].effects[j].motive){
          case 0: {
            deltaUtility += exec.clamp(actionList[i].effects[j].delta + agent.physical, exec.MAX_METER, exec.MIN_METER) - agent.physical;
            break;
          }
          case 1: {
            deltaUtility += exec.clamp(actionList[i].effects[j].delta + agent.emotional, exec.MAX_METER, exec.MIN_METER) - agent.emotional;
            break;
          }
          case 2: {
            deltaUtility += exec.clamp(actionList[i].effects[j].delta + agent.social, exec.MAX_METER, exec.MIN_METER) - agent.social;
            break;
          }
          case 3: {
            deltaUtility += exec.clamp(actionList[i].effects[j].delta + agent.accomplishment, exec.MAX_METER, exec.MIN_METER) - agent.accomplishment;
            break;
          }
          case 4: {
            deltaUtility += exec.clamp(actionList[i].effects[j].delta + agent.financial, exec.MAX_METER, exec.MIN_METER) - agent.financial;
            break;
          }
          default: {
            break;
          }
        }
      }
      // adjust for time (including travel time)
      deltaUtility = deltaUtility/(actionList[i].time_min + travelTime);
      /// update choice if new utility is maximum seen so far
      if (deltaUtility > maxDeltaUtility) {
        maxDeltaUtility = deltaUtility;
        currentChoice = actionList[i];
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
  for (i = 0; i<action.effects.length; i++){
    switch(action.effects[i].motive){
      case 0: {
        agent.physical = exec.clamp(agent.physical + action.effects[i].delta, exec.MAX_METER, exec.MIN_METER)
        break;
      }
      case 1: {
        agent.emotional = exec.clamp(agent.emotional + action.effects[i].delta, exec.MAX_METER, exec.MIN_METER)
        break;
      }
      case 2: {
        agent.social = exec.clamp(agent.social + action.effects[i].delta, exec.MAX_METER, exec.MIN_METER)
        break;
      }
      case 3: {
        agent.accomplishment = exec.clamp(agent.accomplishment + action.effects[i].delta, exec.MAX_METER, exec.MIN_METER)
        break;
      }
      case 4: {
        agent.financial = exec.clamp(agent.financial + action.effects[i].delta, exec.MAX_METER, exec.MIN_METER)
        break;
      }
      default: {
        break;
      }
    }
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
      agent.physical = exec.clamp(agent.physical - 1, exec.MAX_METER, exec.MIN_METER);
      agent.emotional = exec.clamp(agent.emotional - 1, exec.MAX_METER, exec.MIN_METER);
      agent.social = exec.clamp(agent.social - 1, exec.MAX_METER, exec.MIN_METER);
      agent.accomplishment = exec.clamp(agent.accomplishment - 1, exec.MAX_METER, exec.MIN_METER);
      agent.financial = exec.clamp(agent.financial - 1, exec.MAX_METER, exec.MIN_METER);
    }
  }
  if (agent.occupiedCounter > 0) {
    agent.occupiedCounter--;
  } else {
    if (!isContent(agent)) {
      agent.destination = null;
      execute_action(agent, agent.currentAction);
      console.log("time: " + time.toString() + " | " + agent.name + ": Finished " + agent.currentAction.name);
      var choice:Action = select_action(agent, actionList, locationList);
      var dest:Location = null;
      var k:number = 0;
      for (k = 0; k<choice.requirements.length; k++) {
        if (choice.requirements[k].type == 0) {
          var requirement:LocationReq = choice.requirements[k].req as LocationReq;
          dest = exec.getNearestLocation(requirement, locationList, agent.xPos, agent.yPos);
        }
      }
      //set action to choice or to travel if agent is not at location for choice
      if (dest === null || (dest.xPos == agent.xPos && dest.yPos == agent.yPos)) {
        agent.currentAction = choice;
        agent.occupiedCounter = choice.time_min;
        console.log("time: " + time.toString() + " | " + agent.name + ": Started " + agent.currentAction.name);
      } else {
        var travelTime:number = Math.abs(dest.xPos - agent.xPos) + Math.abs(dest.yPos - agent.yPos);
        agent.currentAction = travel_action;
        agent.occupiedCounter = Math.abs(dest.xPos - agent.xPos) + Math.abs(dest.yPos - agent.yPos);
        dest.xPos = agent.xPos;
        dest.yPos = agent.yPos;
        console.log("time: " + time.toString() + " | " + agent.name + ": Started " + agent.currentAction.name + "; Destination: " + dest.name);
      }
    }
  }
}
