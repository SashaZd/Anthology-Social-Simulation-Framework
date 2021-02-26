import * as npc from "./agent";
import {wait_action} from "./action_specs";
import {travel_action} from "./action_specs";

export var time:number = 0;
export const MAX_METER = 5;
export const MIN_METER = 1;

/*  Simple mathematical clamp function.
    n: number being tested
    m: maximum value of number
    o: minimum value of number
    return: either the number, or the max/min if it was outside of the range */
export function clamp(n:number, m:number, o:number):number {
  if (n > m) {
    return m;
  } else if (n < o) {
    return o;
  } else {
    return n;
  }

}

/*  Randomize array in-place using Durstenfeld shuffle algorithm
    https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    */
function shuffleArray(array:npc.Agent[]):void {
    for (var i:number = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp:npc.Agent = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

/*  Checks to see if an agent has maximum motives
    agent: the agent being tested
    return: a boolean answering the question */
export function isContent(agent:npc.Agent):boolean {
  var ret:boolean = true;
  var i:number = 0;
  for (i = 0; i<5; i++){
    switch(i){
      case 0: {
        if (agent.physical != MAX_METER) {
          ret = false;
        }
        break;
      }
      case 1: {
        if (agent.emotional != MAX_METER) {
          ret = false;
        }
        break;
      }
      case 2: {
        if (agent.social != MAX_METER) {
          ret = false;
        }
        break;
      }
      case 3: {
        if (agent.accomplishment != MAX_METER) {
          ret = false;
        }
        break;
      }
      case 4: {
        if (agent.financial != MAX_METER) {
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

/*  checks membership in a list. String type
    item: a string to be checked
    list: a list of strings to check against
    return: a boolean answering the question */
export function inList(item:string, list:string[]):boolean {
  var ret:boolean = false;
  var i:number = 0;
  for (i = 0; i<list.length; i++){
    if (list[i] == item) {
      ret = true;
    }
  }
  return ret;
}

/*  returns the nearest location that satisfies the given requirement, or null.
    distance measured by manhattan distance
    req: a location requirement to satisfy
    list: a list of locations to check
    x & y: coordinate pair to determine distance against.
    return: the location in question or null */
export function getNearestLocation(req:npc.LocationReq, list:npc.Location[], x:number, y:number):npc.Location {
  var ret:npc.Location = null;
  var minDist:number = -1;
  var i:number = 0;
  for (i = 0; i<list.length; i++){
    var valid:boolean = true;
    var check1:boolean = true;
    var j:number = 0;
    for (j = 0; j<req.hasAllOf.length; j++){
      if (!(inList(req.hasAllOf[j],list[i].tags))) {
        check1 = false;
      }
    }
    var check2:boolean = false;
    for (j = 0; j<req.hasOneOrMoreOf.length; j++){
      if (inList(req.hasOneOrMoreOf[j],list[i].tags)) {
        check2 = true;
      }
    }
    if (req.hasOneOrMoreOf.length == 0) {
      check2 = true;
    }
    var check3:boolean = true;
    for (j = 0; j<req.hasNoneOf.length; j++){
      if (inList(req.hasNoneOf[j],list[i].tags)) {
        check3 = false;
      }
    }
    if (req.hasNoneOf.length == 0) {
      check3 = true;
    }
    if (!(check1 && check2 && check3)) {
      valid = false;
    }
    if (valid) {
      var travelDist: number = Math.abs(list[i].xPos - x) + Math.abs(list[i].yPos - y);
      if ((minDist > travelDist) || (minDist = -1)) {
        minDist = travelDist;
        ret = list[i];
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
export function select_action(agent:npc.Agent, actionList:npc.Action[], locationList:npc.Location[]):npc.Action {
  // initialized to 0 (no reason to do an action if it will harm you)
  var maxDeltaUtility:number = 0;
  // initialized to the inaction
  var currentChoice:npc.Action = wait_action;
  // Finds the utility for each action to the given agent
  var i:number = 0;
  for (i = 0; i<actionList.length; i++){
    var dest:npc.Location = null;
    var travelTime:number = 0;
    var check:boolean = true;
    var k:number = 0;
    for (k = 0; k<actionList[i].requirements.length; k++) {
      if (actionList[i].requirements[k].type == 0){
        var requirement:npc.LocationReq = actionList[i].requirements[k].req as npc.LocationReq;
        dest = getNearestLocation(requirement, locationList, agent.xPos, agent.yPos);
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
            deltaUtility += clamp(actionList[i].effects[j].delta + agent.physical, MAX_METER, MIN_METER) - agent.physical;
            break;
          }
          case 1: {
            deltaUtility += clamp(actionList[i].effects[j].delta + agent.emotional, MAX_METER, MIN_METER) - agent.emotional;
            break;
          }
          case 2: {
            deltaUtility += clamp(actionList[i].effects[j].delta + agent.social, MAX_METER, MIN_METER) - agent.social;
            break;
          }
          case 3: {
            deltaUtility += clamp(actionList[i].effects[j].delta + agent.accomplishment, MAX_METER, MIN_METER) - agent.accomplishment;
            break;
          }
          case 4: {
            deltaUtility += clamp(actionList[i].effects[j].delta + agent.financial, MAX_METER, MIN_METER) - agent.financial;
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

/*  Selects an action from a list of valid actions to be preformed by a specific agent.
    Choses the action with the maximal utility of the agent (motive increase/time).
    agent: the agent in question
    action: the action in question */
export function execute_action(agent:npc.Agent, action:npc.Action):void {
  var i:number = 0;
  // apply each effect of the action by updating the agent's motives
  for (i = 0; i<action.effects.length; i++){
    switch(action.effects[i].motive){
      case 0: {
        agent.physical = clamp(agent.physical + action.effects[i].delta, MAX_METER, MIN_METER)
        break;
      }
      case 1: {
        agent.emotional = clamp(agent.emotional + action.effects[i].delta, MAX_METER, MIN_METER)
        break;
      }
      case 2: {
        agent.social = clamp(agent.social + action.effects[i].delta, MAX_METER, MIN_METER)
        break;
      }
      case 3: {
        agent.accomplishment = clamp(agent.accomplishment + action.effects[i].delta, MAX_METER, MIN_METER)
        break;
      }
      case 4: {
        agent.financial = clamp(agent.financial + action.effects[i].delta, MAX_METER, MIN_METER)
        break;
      }
      default: {
        break;
      }
    }
  }
}

/*  Selects an action from a list of valid actions to be preformed by a specific agent.
    Choses the action with the maximal utility of the agent (motive increase/time).
    agentList: list of agents in the sim
    actionList: the list of valid actions
    locationList: all locations in the world
    continueFunction: boolean function that is used as a check as to whether or not to keep running the sim */
export function run_sim(agentList:npc.Agent[], actionList:npc.Action[], locationList:npc.Location[], continueFunction: () => boolean):void {
  while (continueFunction()) {
    shuffleArray(agentList);
    var i:number = 0;
    for (i = 0; i < agentList.length; i++ ) {
      if (time%600 == 0) {
        if (!isContent(agentList[i])) {
          agentList[i].physical = clamp(agentList[i].physical - 1, MAX_METER, MIN_METER);
          agentList[i].emotional = clamp(agentList[i].emotional - 1, MAX_METER, MIN_METER);
          agentList[i].social = clamp(agentList[i].social - 1, MAX_METER, MIN_METER);
          agentList[i].accomplishment = clamp(agentList[i].accomplishment - 1, MAX_METER, MIN_METER);
          agentList[i].financial = clamp(agentList[i].financial - 1, MAX_METER, MIN_METER);
        }
      }
      if (agentList[i].occupiedCounter > 0) {
        agentList[i].occupiedCounter--;
      } else {
        if (!isContent(agentList[i])) {
          agentList[i].destination = null;
          execute_action(agentList[i], agentList[i].currentAction);
          console.log("time: " + time.toString() + " | " + agentList[i].name + ": Finished " + agentList[i].currentAction.name);
          var choice:npc.Action = select_action(agentList[i], actionList, locationList);
          var dest:npc.Location = null;
          var k:number = 0;
          for (k = 0; k<choice.requirements.length; k++) {
            if (choice.requirements[k].type == 0) {
              var requirement:npc.LocationReq = choice.requirements[k].req as npc.LocationReq;
              dest = getNearestLocation(requirement, locationList, agentList[i].xPos, agentList[i].yPos);
            }
          }
          //set action to choice or to travel if agent is not at location for choice
          if (dest === null || (dest.xPos == agentList[i].xPos && dest.yPos == agentList[i].yPos)) {
            agentList[i].currentAction = choice;
            agentList[i].occupiedCounter = choice.time_min;
            console.log("time: " + time.toString() + " | " + agentList[i].name + ": Started " + agentList[i].currentAction.name);
          } else {
            var travelTime:number = Math.abs(dest.xPos - agentList[i].xPos) + Math.abs(dest.yPos - agentList[i].yPos);
            agentList[i].currentAction = travel_action;
            agentList[i].occupiedCounter = Math.abs(dest.xPos - agentList[i].xPos) + Math.abs(dest.yPos - agentList[i].yPos);
            dest.xPos = agentList[i].xPos;
            dest.yPos = agentList[i].yPos;
            console.log("time: " + time.toString() + " | " + agentList[i].name + ": Started " + agentList[i].currentAction.name + "; Destination: " + dest.name);
          }
        }
      }
    }
    time += 1;
  }
  console.log("Finished.");
}
