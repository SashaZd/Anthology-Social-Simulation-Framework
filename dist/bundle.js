(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hobby_action = exports.work_action = exports.movie_friend_action = exports.eat_friend_action = exports.movie_action = exports.eat_action = exports.travel_action = exports.wait_action = void 0;
// DEFAULT ACTIONS - REQUIRED
// The following actions are required for the current structure of the execution execution_engine
//When modifying this file for more test scenarios, DO NOT CHANGE THESE action_specs
// The wait action is used when an agent has maximal motives
exports.wait_action = {
    name: "wait_action",
    requirements: [],
    effects: [],
    time_min: 0
};
// The travel action is used when an agent is travelling to a location.
// The time is handdles by the execution engine
exports.travel_action = {
    name: "travel_action",
    requirements: [],
    effects: [],
    time_min: 0
};
// END
// Fills physical, requires a restaurant location
exports.eat_action = {
    name: "eat_action",
    requirements: [{ type: 0, req: { hasAllOf: ["restaurant"], hasOneOrMoreOf: [], hasNoneOf: [] } }],
    effects: [{ motive: 0, delta: 2 }],
    time_min: 60
};
// Fills emotional, requires a movie theatre location
exports.movie_action = {
    name: "movie_action",
    requirements: [{ type: 0, req: { hasAllOf: ["movie theatre"], hasOneOrMoreOf: [], hasNoneOf: [] } }],
    effects: [{ motive: 1, delta: 3 }],
    time_min: 120
};
// Fills physical and social, requires a restaurant location and an additional person
exports.eat_friend_action = {
    name: "eat_friend_action",
    requirements: [{ type: 0, req: { hasAllOf: ["restaurant"], hasOneOrMoreOf: [], hasNoneOf: [] } },
        { type: 1, req: { minNumPeople: 2, maxNumPeople: -1, specificPeoplePresent: [], specificPeopleAbsent: [], relationshipsPresent: [], relationshipsAbsent: [] } }],
    effects: [{ motive: 0, delta: 2 }, { motive: 2, delta: 2 }],
    time_min: 70
};
// Fills emotional and social, requires a movie theatre location and an additional person
exports.movie_friend_action = {
    name: "movie_friend_action",
    requirements: [{ type: 0, req: { hasAllOf: ["movie theatre"], hasOneOrMoreOf: [], hasNoneOf: [] } },
        { type: 1, req: { minNumPeople: 2, maxNumPeople: -1, specificPeoplePresent: [], specificPeopleAbsent: [], relationshipsPresent: [], relationshipsAbsent: [] } }],
    effects: [{ motive: 1, delta: 3 }, { motive: 2, delta: 2 }],
    time_min: 130
};
// Fills financial, requires a movie theatre location
exports.work_action = {
    name: "work_action",
    requirements: [{ type: 0, req: { hasAllOf: ["employment"], hasOneOrMoreOf: [], hasNoneOf: [] } }],
    effects: [{ motive: 3, delta: 1 }],
    time_min: 240
};
// Fills accomplishment, requires a home location
exports.hobby_action = {
    name: "hobby_action",
    requirements: [{ type: 0, req: { hasAllOf: ["home"], hasOneOrMoreOf: [], hasNoneOf: [] } }],
    effects: [{ motive: 4, delta: 2 }],
    time_min: 60
};
},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.turn = exports.execute_action = exports.select_action = exports.isContent = exports.ReqType = exports.BinOp = exports.Motive = void 0;
var exec = require("./execution_engine");
var action_specs_1 = require("./action_specs");
var action_specs_2 = require("./action_specs");
// Five motive types
var Motive;
(function (Motive) {
    Motive[Motive["physical"] = 0] = "physical";
    Motive[Motive["emotional"] = 1] = "emotional";
    Motive[Motive["social"] = 2] = "social";
    Motive[Motive["financial"] = 3] = "financial";
    Motive[Motive["accomplishment"] = 4] = "accomplishment";
})(Motive = exports.Motive || (exports.Motive = {}));
// Binary Operations used primarily in requirements
var BinOp;
(function (BinOp) {
    BinOp[BinOp["equals"] = 0] = "equals";
    BinOp[BinOp["greater_than"] = 1] = "greater_than";
    BinOp[BinOp["less_than"] = 2] = "less_than";
    BinOp[BinOp["geq"] = 3] = "geq";
    BinOp[BinOp["leq"] = 4] = "leq";
})(BinOp = exports.BinOp || (exports.BinOp = {}));
// Three types of requirements
var ReqType;
(function (ReqType) {
    ReqType[ReqType["location"] = 0] = "location";
    ReqType[ReqType["people"] = 1] = "people";
    ReqType[ReqType["motive"] = 2] = "motive";
})(ReqType = exports.ReqType || (exports.ReqType = {}));
/*  Checks to see if an agent has maximum motives
    agent: the agent being tested
    return: a boolean answering the question */
function isContent(agent) {
    var ret = true;
    var i = 0;
    for (i = 0; i < 5; i++) {
        switch (i) {
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
exports.isContent = isContent;
/*  Selects an action from a list of valid actions to be preformed by a specific agent.
    Choses the action with the maximal utility of the agent (motive increase/time).
    agent: the agent in question
    actionList: the list of valid actions
    locationList: all locations in the world
    return: The single action chosen from the list */
function select_action(agent, actionList, locationList) {
    // initialized to 0 (no reason to do an action if it will harm you)
    var maxDeltaUtility = 0;
    // initialized to the inaction
    var currentChoice = action_specs_1.wait_action;
    // Finds the utility for each action to the given agent
    var i = 0;
    for (i = 0; i < actionList.length; i++) {
        var dest = null;
        var travelTime = 0;
        var check = true;
        var k = 0;
        for (k = 0; k < actionList[i].requirements.length; k++) {
            if (actionList[i].requirements[k].type == 0) {
                var requirement = actionList[i].requirements[k].req;
                dest = exec.getNearestLocation(requirement, locationList, agent.xPos, agent.yPos);
                if (dest == null) {
                    check = false;
                }
                else {
                    travelTime = Math.abs(dest.xPos - agent.xPos) + Math.abs(dest.yPos - agent.yPos);
                }
            }
        }
        // if an action has satisfiable requirements
        if (check) {
            var deltaUtility = 0;
            var j = 0;
            for (j = 0; j < actionList[i].effects.length; j++) {
                switch (actionList[i].effects[j].motive) {
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
            deltaUtility = deltaUtility / (actionList[i].time_min + travelTime);
            /// update choice if new utility is maximum seen so far
            if (deltaUtility > maxDeltaUtility) {
                maxDeltaUtility = deltaUtility;
                currentChoice = actionList[i];
            }
        }
    }
    return currentChoice;
}
exports.select_action = select_action;
/*  Selects an action from a list of valid actions to be preformed by a specific agent.
    Choses the action with the maximal utility of the agent (motive increase/time).
    agent: the agent in question
    action: the action in question */
function execute_action(agent, action) {
    var i = 0;
    // apply each effect of the action by updating the agent's motives
    for (i = 0; i < action.effects.length; i++) {
        switch (action.effects[i].motive) {
            case 0: {
                agent.physical = exec.clamp(agent.physical + action.effects[i].delta, exec.MAX_METER, exec.MIN_METER);
                break;
            }
            case 1: {
                agent.emotional = exec.clamp(agent.emotional + action.effects[i].delta, exec.MAX_METER, exec.MIN_METER);
                break;
            }
            case 2: {
                agent.social = exec.clamp(agent.social + action.effects[i].delta, exec.MAX_METER, exec.MIN_METER);
                break;
            }
            case 3: {
                agent.accomplishment = exec.clamp(agent.accomplishment + action.effects[i].delta, exec.MAX_METER, exec.MIN_METER);
                break;
            }
            case 4: {
                agent.financial = exec.clamp(agent.financial + action.effects[i].delta, exec.MAX_METER, exec.MIN_METER);
                break;
            }
            default: {
                break;
            }
        }
    }
}
exports.execute_action = execute_action;
/*  Selects an action from a list of valid actions to be preformed by a specific agent.
    Choses the action with the maximal utility of the agent (motive increase/time).
    agentList: list of agents in the sim
    actionList: the list of valid actions
    locationList: all locations in the world
    continueFunction: boolean function that is used as a check as to whether or not to keep running the sim */
function turn(agent, actionList, locationList, time) {
    if (time % 600 == 0) {
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
    }
    else {
        if (!isContent(agent)) {
            agent.destination = null;
            execute_action(agent, agent.currentAction);
            console.log("time: " + time.toString() + " | " + agent.name + ": Finished " + agent.currentAction.name);
            var choice = select_action(agent, actionList, locationList);
            var dest = null;
            var k = 0;
            for (k = 0; k < choice.requirements.length; k++) {
                if (choice.requirements[k].type == 0) {
                    var requirement = choice.requirements[k].req;
                    dest = exec.getNearestLocation(requirement, locationList, agent.xPos, agent.yPos);
                }
            }
            //set action to choice or to travel if agent is not at location for choice
            if (dest === null || (dest.xPos == agent.xPos && dest.yPos == agent.yPos)) {
                agent.currentAction = choice;
                agent.occupiedCounter = choice.time_min;
                console.log("time: " + time.toString() + " | " + agent.name + ": Started " + agent.currentAction.name);
            }
            else {
                var travelTime = Math.abs(dest.xPos - agent.xPos) + Math.abs(dest.yPos - agent.yPos);
                agent.currentAction = action_specs_2.travel_action;
                agent.occupiedCounter = Math.abs(dest.xPos - agent.xPos) + Math.abs(dest.yPos - agent.yPos);
                dest.xPos = agent.xPos;
                dest.yPos = agent.yPos;
                console.log("time: " + time.toString() + " | " + agent.name + ": Started " + agent.currentAction.name + "; Destination: " + dest.name);
            }
        }
    }
}
exports.turn = turn;
},{"./action_specs":1,"./execution_engine":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run_sim = exports.getNearestLocation = exports.inList = exports.clamp = exports.MIN_METER = exports.MAX_METER = exports.time = void 0;
var npc = require("./agent");
exports.time = 0;
exports.MAX_METER = 5;
exports.MIN_METER = 1;
/*  Simple mathematical clamp function.
    n: number being tested
    m: maximum value of number
    o: minimum value of number
    return: either the number, or the max/min if it was outside of the range */
function clamp(n, m, o) {
    if (n > m) {
        return m;
    }
    else if (n < o) {
        return o;
    }
    else {
        return n;
    }
}
exports.clamp = clamp;
/*  Randomize array in-place using Durstenfeld shuffle algorithm
    https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
/*  checks membership in a list. String type
    item: a string to be checked
    list: a list of strings to check against
    return: a boolean answering the question */
function inList(item, list) {
    var ret = false;
    var i = 0;
    for (i = 0; i < list.length; i++) {
        if (list[i] == item) {
            ret = true;
        }
    }
    return ret;
}
exports.inList = inList;
/*  returns the nearest location that satisfies the given requirement, or null.
    distance measured by manhattan distance
    req: a location requirement to satisfy
    list: a list of locations to check
    x & y: coordinate pair to determine distance against.
    return: the location in question or null */
function getNearestLocation(req, list, x, y) {
    var ret = null;
    var minDist = -1;
    var i = 0;
    for (i = 0; i < list.length; i++) {
        var valid = true;
        var check1 = true;
        var j = 0;
        for (j = 0; j < req.hasAllOf.length; j++) {
            if (!(inList(req.hasAllOf[j], list[i].tags))) {
                check1 = false;
            }
        }
        var check2 = false;
        for (j = 0; j < req.hasOneOrMoreOf.length; j++) {
            if (inList(req.hasOneOrMoreOf[j], list[i].tags)) {
                check2 = true;
            }
        }
        if (req.hasOneOrMoreOf.length == 0) {
            check2 = true;
        }
        var check3 = true;
        for (j = 0; j < req.hasNoneOf.length; j++) {
            if (inList(req.hasNoneOf[j], list[i].tags)) {
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
            var travelDist = Math.abs(list[i].xPos - x) + Math.abs(list[i].yPos - y);
            if ((minDist > travelDist) || (minDist = -1)) {
                minDist = travelDist;
                ret = list[i];
            }
        }
    }
    return ret;
}
exports.getNearestLocation = getNearestLocation;
/*  Selects an action from a list of valid actions to be preformed by a specific agent.
    Choses the action with the maximal utility of the agent (motive increase/time).
    agentList: list of agents in the sim
    actionList: the list of valid actions
    locationList: all locations in the world
    continueFunction: boolean function that is used as a check as to whether or not to keep running the sim */
function run_sim(agentList, actionList, locationList, continueFunction) {
    while (continueFunction()) {
        shuffleArray(agentList);
        var i = 0;
        for (i = 0; i < agentList.length; i++) {
            npc.turn(agentList[i], actionList, locationList, exports.time);
        }
        exports.time += 1;
    }
    console.log("Finished.");
}
exports.run_sim = run_sim;
},{"./agent":2}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var engine = require("./execution_engine");
var actions = require("./action_specs");
// List of available actions in sim
var actionList = [actions.eat_action, actions.movie_action, actions.eat_friend_action, actions.movie_friend_action, actions.work_action, actions.hobby_action];
// agents
var agent1 = {
    name: "John Doe",
    physical: 1,
    emotional: 1,
    social: 1,
    financial: 1,
    accomplishment: 1,
    xPos: 0,
    yPos: 0,
    occupiedCounter: 0,
    currentAction: actions.wait_action,
    destination: null
};
// agents
var agent2 = {
    name: "Jane Doe",
    physical: 4,
    emotional: 1,
    social: 4,
    financial: 1,
    accomplishment: 4,
    xPos: 5,
    yPos: 5,
    occupiedCounter: 0,
    currentAction: actions.wait_action,
    destination: null
};
// List of agents in sim
var agentList = [agent1, agent2];
// Locations
// Locations are a position, a name, and a list of tags
var restaurant = { name: "restaurant", xPos: 5, yPos: 5, tags: ["restaurant", "employment"] };
var movie_theatre = { name: "movie theatre", xPos: 0, yPos: 5, tags: ["movie theatre", "employment"] };
var home = { name: "home", xPos: 5, yPos: 0, tags: ["home"] };
//location List
var locationList = [restaurant, movie_theatre, home];
// condition function.
// Stops the sim when all agents are at full meters
function condition() {
    var check = false;
    var i = 0;
    // check the meter levels for each agent in the sim
    for (i = 0; i < agentList.length; i++) {
        if (agentList[i].physical < engine.MAX_METER) {
            check = true;
            break;
        }
        if (agentList[i].emotional < engine.MAX_METER) {
            check = true;
            break;
        }
        if (agentList[i].social < engine.MAX_METER) {
            check = true;
            break;
        }
        if (agentList[i].financial < engine.MAX_METER) {
            check = true;
            break;
        }
        if (agentList[i].accomplishment < engine.MAX_METER) {
            check = true;
            break;
        }
    }
    return check;
}
engine.run_sim(agentList, actionList, locationList, condition);
// Displays text on the browser? I assume
function showOnBrowser(divName, name) {
    var elt = document.getElementById(divName);
    elt.innerText = name + "Hello World!";
}
showOnBrowser("greeting", "TypeScript");
},{"./action_specs":1,"./execution_engine":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWN0aW9uX3NwZWNzLnRzIiwic3JjL2FnZW50LnRzIiwic3JjL2V4ZWN1dGlvbl9lbmdpbmUudHMiLCJzcmMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztBQ1dBLDZCQUE2QjtBQUM3QixpR0FBaUc7QUFDakcsb0ZBQW9GO0FBRXBGLDREQUE0RDtBQUNqRCxRQUFBLFdBQVcsR0FDdEI7SUFDRSxJQUFJLEVBQUUsYUFBYTtJQUNuQixZQUFZLEVBQUUsRUFBRTtJQUNoQixPQUFPLEVBQUUsRUFBRTtJQUNYLFFBQVEsRUFBRSxDQUFDO0NBQ1osQ0FBQTtBQUVELHVFQUF1RTtBQUN2RSwrQ0FBK0M7QUFDcEMsUUFBQSxhQUFhLEdBQ3hCO0lBQ0UsSUFBSSxFQUFFLGVBQWU7SUFDckIsWUFBWSxFQUFFLEVBQUU7SUFDaEIsT0FBTyxFQUFFLEVBQUU7SUFDWCxRQUFRLEVBQUUsQ0FBQztDQUNaLENBQUE7QUFDRCxNQUFNO0FBRU4saURBQWlEO0FBQ3RDLFFBQUEsVUFBVSxHQUNyQjtJQUNFLElBQUksRUFBRSxZQUFZO0lBQ2xCLFlBQVksRUFBRSxDQUFDLEVBQUMsSUFBSSxFQUFDLENBQUMsRUFBRSxHQUFHLEVBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxZQUFZLENBQUMsRUFBRSxjQUFjLEVBQUMsRUFBRSxFQUFFLFNBQVMsRUFBQyxFQUFFLEVBQUMsRUFBQyxDQUFDO0lBQ3hGLE9BQU8sRUFBTyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsQ0FBQyxFQUFDLENBQUM7SUFDbkMsUUFBUSxFQUFNLEVBQUU7Q0FDakIsQ0FBQztBQUVGLHFEQUFxRDtBQUMxQyxRQUFBLFlBQVksR0FDdkI7SUFDRSxJQUFJLEVBQUUsY0FBYztJQUNwQixZQUFZLEVBQUUsQ0FBQyxFQUFDLElBQUksRUFBQyxDQUFDLEVBQUUsR0FBRyxFQUFDLEVBQUMs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Q0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUM7b0JBQ3JDLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ04sWUFBWSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO3dCQUM3SCxNQUFNO3FCQUNQO29CQUNELEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ04sWUFBWSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO3dCQUMvSCxNQUFNO3FCQUNQO29CQUNELEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ04sWUFBWSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO3dCQUN6SCxNQUFNO3FCQUNQO29CQUNELEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ04sWUFBWSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDO3dCQUN6SSxNQUFNO3FCQUNQO29CQUNELEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ04sWUFBWSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO3dCQUMvSCxNQUFNO3FCQUNQO29CQUNELE9BQU8sQ0FBQyxDQUFDO3dCQUNQLE1BQU07cUJBQ1A7aUJBQ0Y7YUFDRjtZQUNELDBDQUEwQztZQUMxQyxZQUFZLEdBQUcsWUFBWSxHQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsQ0FBQztZQUNsRSx1REFBdUQ7WUFDdkQsSUFBSSxZQUFZLEdBQUcsZUFBZSxFQUFFO2dCQUNsQyxlQUFlLEdBQUcsWUFBWSxDQUFDO2dCQUMvQixhQUFhLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQy9CO1NBQ0Y7S0FDRjtJQUNELE9BQU8sYUFBYSxDQUFDO0FBQ3ZCLENBQUM7QUFoRUQsc0NBZ0VDO0FBRUQ7OztxQ0FHcUM7QUFDckMsU0FBZ0IsY0FBYyxDQUFDLEtBQVcsRUFBRSxNQUFhO0lBQ3ZELElBQUksQ0FBQyxHQUFVLENBQUMsQ0FBQztJQUNqQixrRUFBa0U7SUFDbEUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBQztRQUN2QyxRQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFDO1lBQzlCLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ04sS0FBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7Z0JBQ3JHLE1BQU07YUFDUDtZQUNELEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ04sS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7Z0JBQ3ZHLE1BQU07YUFDUDtZQUNELEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ04sS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7Z0JBQ2pHLE1BQU07YUFDUDtZQUNELEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ04sS0FBSyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7Z0JBQ2pILE1BQU07YUFDUDtZQUNELEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ04sS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7Z0JB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R0FBRyxJQUFJLEdBQUcsY0FBYyxDQUFDO0FBQ3hDLENBQUM7QUFFRCxhQUFhLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IHsgTW90aXZlIH0gZnJvbSBcIi4vYWdlbnRcIjtcclxuaW1wb3J0IHsgQmluT3AgfSBmcm9tIFwiLi9hZ2VudFwiO1xyXG5pbXBvcnQgeyBSZXFUeXBlIH0gZnJvbSBcIi4vYWdlbnRcIjtcclxuaW1wb3J0IHsgTW90aXZlUmVxIH0gZnJvbSBcIi4vYWdlbnRcIjtcclxuaW1wb3J0IHsgUGVvcGxlUmVxIH0gZnJvbSBcIi4vYWdlbnRcIjtcclxuaW1wb3J0IHsgTG9jYXRpb25SZXEgfSBmcm9tIFwiLi9hZ2VudFwiO1xyXG5pbXBvcnQgeyBSZXF1aXJlbWVudCB9IGZyb20gXCIuL2FnZW50XCI7XHJcbmltcG9ydCB7IEVmZmVjdCB9IGZyb20gXCIuL2FnZW50XCI7XHJcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuL2FnZW50XCI7XHJcbmltcG9ydCB7IEFnZW50IH0gZnJvbSBcIi4vYWdlbnRcIjtcclxuXHJcbi8vIERFRkFVTFQgQUNUSU9OUyAtIFJFUVVJUkVEXHJcbi8vIFRoZSBmb2xsb3dpbmcgYWN0aW9ucyBhcmUgcmVxdWlyZWQgZm9yIHRoZSBjdXJyZW50IHN0cnVjdHVyZSBvZiB0aGUgZXhlY3V0aW9uIGV4ZWN1dGlvbl9lbmdpbmVcclxuLy9XaGVuIG1vZGlmeWluZyB0aGlzIGZpbGUgZm9yIG1vcmUgdGVzdCBzY2VuYXJpb3MsIERPIE5PVCBDSEFOR0UgVEhFU0UgYWN0aW9uX3NwZWNzXHJcblxyXG4vLyBUaGUgd2FpdCBhY3Rpb24gaXMgdXNlZCB3aGVuIGFuIGFnZW50IGhhcyBtYXhpbWFsIG1vdGl2ZXNcclxuZXhwb3J0IHZhciB3YWl0X2FjdGlvbiA6IEFjdGlvbiA9XHJcbntcclxuICBuYW1lOiBcIndhaXRfYWN0aW9uXCIsXHJcbiAgcmVxdWlyZW1lbnRzOiBbXSxcclxuICBlZmZlY3RzOiBbXSxcclxuICB0aW1lX21pbjogMFxyXG59XHJcblxyXG4vLyBUaGUgdHJhdmVsIGFjdGlvbiBpcyB1c2VkIHdoZW4gYW4gYWdlbnQgaXMgdHJhdmVsbGluZyB0byBhIGxvY2F0aW9uLlxyXG4vLyBUaGUgdGltZSBpcyBoYW5kZGxlcyBieSB0aGUgZXhlY3V0aW9uIGVuZ2luZVxyXG5leHBvcnQgdmFyIHRyYXZlbF9hY3Rpb24gOiBBY3Rpb24gPVxyXG57XHJcbiAgbmFtZTogXCJ0cmF2ZWxfYWN0aW9uXCIsXHJcbiAgcmVxdWlyZW1lbnRzOiBbXSxcclxuICBlZmZlY3RzOiBbXSxcclxuICB0aW1lX21pbjogMFxyXG59XHJcbi8vIEVORFxyXG5cclxuLy8gRmlsbHMgcGh5c2ljYWwsIHJlcXVpcmVzIGEgcmVzdGF1cmFudCBsb2NhdGlvblxyXG5leHBvcnQgdmFyIGVhdF9hY3Rpb24gOiBBY3Rpb24gPVxyXG57XHJcbiAgbmFtZTogXCJlYXRfYWN0aW9uXCIsXHJcbiAgcmVxdWlyZW1lbnRzOiBbe3R5cGU6MCwgcmVxOntoYXNBbGxPZjpbXCJyZXN0YXVyYW50XCJdLCBoYXNPbmVPck1vcmVPZjpbXSwgaGFzTm9uZU9mOltdfX1dLFxyXG4gIGVmZmVjdHM6ICAgICAgW3ttb3RpdmU6MCwgZGVsdGE6Mn1dLFxyXG4gIHRpbWVfbWluOiAgICAgNjBcclxufTtcclxuXHJcbi8vIEZpbGxzIGVtb3Rpb25hbCwgcmVxdWlyZXMgYSBtb3ZpZSB0aGVhdHJlIGxvY2F0aW9uXHJcbmV4cG9ydCB2YXIgbW92aWVfYWN0aW9uIDogQWN0aW9uID1cclxue1xyXG4gIG5hbWU6IFwibW92aWVfYWN0aW9uXCIsXHJcbiAgcmVxdWlyZW1lbnRzOiBbe3R5cGU6MCwgcmVxOntoYXNBbGxPZjpbXCJtb3ZpZSB0aGVhdHJlXCJdLCBoYXNPbmVPck1vcmVPZjpbXSwgaGFzTm9uZU9mOltdfX1dLFxyXG4gIGVmZmVjdHM6ICAgICAgW3ttb3RpdmU6MSwgZGVsdGE6M31dLFxyXG4gIHRpbWVfbWluOiAgICAgMTIwXHJcbn07XHJcblxyXG4vLyBGaWxscyBwaHlzaWNhbCBhbmQgc29jaWFsLCByZXF1aXJlcyBhIHJlc3RhdXJhbnQgbG9jYXRpb24gYW5kIGFuIGFkZGl0aW9uYWwgcGVyc29uXHJcbmV4cG9ydCB2YXIgZWF0X2ZyaWVuZF9hY3Rpb24gOiBBY3Rpb24gPVxyXG57XHJcbiAgbmFtZTogXCJlYXRfZnJpZW5kX2FjdGlvblwiLFxyXG4gIHJlcXVpcmVtZW50czogW3t0eXBlOjAsIHJlcTp7aGFzQWxsT2Y6W1wicmVzdGF1cmFudFwiXSwgaGFzT25lT3JNb3JlT2Y6W10sIGhhc05vbmVPZjpbXX19LFxyXG4gICAgICAgICAgICAgICAge3R5cGU6MSwgcmVxOnttaW5OdW1QZW9wbGU6MiwgbWF4TnVtUGVvcGxlOi0xLCBzcGVjaWZpY1Blb3BsZVByZXNlbnQ6W10sIHNwZWNpZmljUGVvcGxlQWJzZW50OltdLCByZWxhdGlvbnNoaXBzUHJlc2VudDpbXSwgcmVsYXRpb25zaGlwc0Fic2VudDpbXX19XSxcclxuICBlZmZlY3RzOiAgICAgIFt7bW90aXZlOjAsIGRlbHRhOjJ9LCB7bW90aXZlOjIsIGRlbHRhOjJ9XSxcclxuICB0aW1lX21pbjogICAgIDcwXHJcbn07XHJcblxyXG4vLyBGaWxscyBlbW90aW9uYWwgYW5kIHNvY2lhbCwgcmVxdWlyZXMgYSBtb3ZpZSB0aGVhdHJlIGxvY2F0aW9uIGFuZCBhbiBhZGRpdGlvbmFsIHBlcnNvblxyXG5leHBvcnQgdmFyIG1vdmllX2ZyaWVuZF9hY3Rpb24gOiBBY3Rpb24gPVxyXG57XHJcbiAgbmFtZTogXCJtb3ZpZV9mcmllbmRfYWN0aW9uXCIsXHJcbiAgcmVxdWlyZW1lbnRzOiBbe3R5cGU6MCwgcmVxOntoYXNBbGxPZjpbXCJtb3ZpZSB0aGVhdHJlXCJdLCBoYXNPbmVPck1vcmVPZjpbXSwgaGFzTm9uZU9mOltdfX0sXHJcbiAgICAgICAgICAgICAgICB7dHlwZToxLCByZXE6e21pbk51bVBlb3BsZToyLCBtYXhOdW1QZW9wbGU6LTEsIHNwZWNpZmljUGVvcGxlUHJlc2VudDpbXSwgc3BlY2lmaWNQZW9wbGVBYnNlbnQ6W10sIHJlbGF0aW9uc2hpcHNQcmVzZW50OltdLCByZWxhdGlvbnNoaXBzQWJzZW50OltdfX1dLFxyXG4gIGVmZmVjdHM6ICAgICAgW3ttb3RpdmU6MSwgZGVsdGE6M30sIHttb3RpdmU6MiwgZGVsdGE6Mn1dLFxyXG4gIHRpbWVfbWluOiAgICAgMTMwXHJcbn07XHJcblxyXG4vLyBGaWxscyBmaW5hbmNpYWwsIHJlcXVpcmVzIGEgbW92aWUgdGhlYXRyZSBsb2NhdGlvblxyXG5leHBvcnQgdmFyIHdvcmtfYWN0aW9uIDogQWN0aW9uID1cclxue1xyXG4gIG5hbWU6IFwid29ya19hY3Rpb25cIixcclxuICByZXF1aXJlbWVudHM6IFt7dHlwZTowLCByZXE6e2hhc0FsbE9mOltcImVtcGxveW1lbnRcIl0sIGhhc09uZU9yTW9yZU9mOltdLCBoYXNOb25lT2Y6W119fV0sXHJcbiAgZWZmZWN0czogICAgICBbe21vdGl2ZTozLCBkZWx0YToxfV0sXHJcbiAgdGltZV9taW46ICAgICAyNDBcclxufTtcclxuXHJcbi8vIEZpbGxzIGFjY29tcGxpc2htZW50LCByZXF1aXJlcyBhIGhvbWUgbG9jYXRpb25cclxuZXhwb3J0IHZhciBob2JieV9hY3Rpb24gOiBBY3Rpb24gPVxyXG57XHJcbiAgbmFtZTogXCJob2JieV9hY3Rpb25cIixcclxuICByZXF1aXJlbWVudHM6IFt7dHlwZTowLCByZXE6e2hhc0FsbE9mOltcImhvbWVcIl0sIGhhc09uZU9yTW9yZU9mOltdLCBoYXNOb25lT2Y6W119fV0sXHJcbiAgZWZmZWN0czogICAgICBbe21vdGl2ZTo0LCBkZWx0YToyfV0sXHJcbiAgdGltZV9taW46ICAgICA2MFxyXG59O1xyXG4iLCJpbXBvcnQgKiBhcyBleGVjIGZyb20gXCIuL2V4ZWN1dGlvbl9lbmdpbmVcIjtcclxuaW1wb3J0IHt3YWl0X2FjdGlvbn0gZnJvbSBcIi4vYWN0aW9uX3NwZWNzXCI7XHJcbmltcG9ydCB7dHJhdmVsX2FjdGlvbn0gZnJvbSBcIi4vYWN0aW9uX3NwZWNzXCI7XHJcblxyXG4vLyBGaXZlIG1vdGl2ZSB0eXBlc1xyXG5leHBvcnQgZW51bSBNb3RpdmUge1xyXG4gIHBoeXNpY2FsLFxyXG4gIGVtb3Rpb25hbCxcclxuICBzb2NpYWwsXHJcbiAgZmluYW5jaWFsLFxyXG4gIGFjY29tcGxpc2htZW50XHJcbn1cclxuXHJcbi8vIEJpbmFyeSBPcGVyYXRpb25zIHVzZWQgcHJpbWFyaWx5IGluIHJlcXVpcmVtZW50c1xyXG5leHBvcnQgZW51bSBCaW5PcCB7XHJcbiAgZXF1YWxzLFxyXG4gIGdyZWF0ZXJfdGhhbixcclxuICBsZXNzX3RoYW4sXHJcbiAgZ2VxLFxyXG4gIGxlcVxyXG59XHJcblxyXG4vLyBUaHJlZSB0eXBlcyBvZiByZXF1aXJlbWVudHNcclxuZXhwb3J0IGVudW0gUmVxVHlwZSB7XHJcbiAgbG9jYXRpb24sXHJcbiAgcGVvcGxlLFxyXG4gIG1vdGl2ZVxyXG59XHJcblxyXG4vLyBSZXF1aXJlbWVudHMgb24gdGhlIHR5cGUgb2YgbG9jYXRpb24gdGhlIGFjdGlvbiB0YWtlcyBwbGFjZSBpbi5cclxuLy8gQmFzZWQgb24gYSB0YWdzIHN5c3RlbSBmb3IgbG9jYXRpb25zLlxyXG4vLyBlZzogbXVzdCBiZSBhdCBhIHJlc3RhdXJhbnRcclxuZXhwb3J0IGludGVyZmFjZSBMb2NhdGlvblJlcSB7XHJcbiAgaGFzQWxsT2Y6IHN0cmluZ1tdLFxyXG4gIGhhc09uZU9yTW9yZU9mOiBzdHJpbmdbXSxcclxuICBoYXNOb25lT2Y6IHN0cmluZ1tdXHJcbn1cclxuXHJcbi8vIFJlcXVpcmVtZW50cyBvbiB3aG8gaXMgcHJlc2VudCBmb3IgYW4gYWN0aW9uLlxyXG4vLyBlZzogbXVzdCBiZSB3aXRoIGEgc2VwY2lmaWMgcGVyc29uXHJcbmV4cG9ydCBpbnRlcmZhY2UgUGVvcGxlUmVxIHtcclxuICBtaW5OdW1QZW9wbGU6IG51bWJlcixcclxuICBtYXhOdW1QZW9wbGU6IG51bWJlcixcclxuICBzcGVjaWZpY1Blb3BsZVByZXNlbnQ6IHN0cmluZ1tdLFxyXG4gIHNwZWNpZmljUGVvcGxlQWJzZW50OiBzdHJpbmdbXSxcclxuICByZWxhdGlvbnNoaXBzUHJlc2VudDogc3RyaW5nW10sXHJcbiAgcmVsYXRpb25zaGlwc0Fic2VudDogc3RyaW5nW11cclxufVxyXG5cclxuLy8gUmVxdWlyZW1lbnRzIG9uIHRoZSBleGVjdXRpbmcgYWdlbid0IGN1cnJlbnQgbW90aXZlIHNjb3Jlcy5cclxuLy8gZWc6IGVnIG11c3QgaGF2ZSBtb25leSAoZmluYW5jaWFsIG1vdGl2ZSA+IDApIHRvIGRvIHRoaXNcclxuZXhwb3J0IGludGVyZmFjZSBNb3RpdmVSZXEge1xyXG4gIG1vdGl2ZTogTW90aXZlLFxyXG4gIG9wOiAgICAgQmluT3AsXHJcbiAgdGhyZXNoOiBudW1iZXJcclxufVxyXG5cclxuLy8gR2VuZXJhbCByZXF1aXJlbWVudCB0eXBlLlxyXG4vLyBlZzogYW55IG9mIHRoZSBhYm92ZSB0aHJlZVxyXG5leHBvcnQgaW50ZXJmYWNlIFJlcXVpcmVtZW50IHtcclxuICB0eXBlOiBSZXFUeXBlLFxyXG4gIHJlcTogTG9jYXRpb25SZXEgfCBQZW9wbGVSZXEgfCBNb3RpdmVSZXFcclxufVxyXG5cclxuLy8gQWN0aW9uIGVmZmVjdCB0eXBlLlxyXG4vLyBlZzogc2xlZXAgaW5jcmVhc2VzIHRoZSBwaHlzaWNhbCBtb3RpdmVcclxuZXhwb3J0IGludGVyZmFjZSBFZmZlY3Qge1xyXG4gIG1vdGl2ZTogTW90aXZlLFxyXG4gIGRlbHRhOiBudW1iZXJcclxufVxyXG5cclxuLy8gR2VuZXJhbCBhY3Rpb24gdHlwZS5cclxuLy8gTmFtZSwgcmVxdWlyZW1udHMsIGVmZmVjdHMsIGFuZCBtaW5pbXVtIHRpbWUgdGFrZW4uXHJcbi8vIGVnOiBzbGVlcFxyXG5leHBvcnQgaW50ZXJmYWNlIEFjdGlvbiB7XHJcbiAgbmFtZTogc3RyaW5nLFxyXG4gIHJlcXVpcmVtZW50czogUmVxdWlyZW1lbnRbXSxcclxuICBlZmZlY3RzOiAgICAgIEVmZmVjdFtdLFxyXG4gIHRpbWVfbWluOiAgICAgbnVtYmVyXHJcbn1cclxuXHJcbi8vR2VuZXJhbCBhZ2VudCB0eXBlLlxyXG4vLyBOYW1lIGFuZCBDdXJyZW50IE1vdGl2ZSBTY29yZXMuXHJcbi8vIGVnOiBhbnkgbnBjIGNoYXJhY3RlclxyXG5leHBvcnQgaW50ZXJmYWNlIEFnZW50IHtcclxuICBuYW1lOiBzdHJpbmcsXHJcbiAgcGh5c2ljYWw6IG51bWJlcixcclxuICBlbW90aW9uYWw6IG51bWJlcixcclxuICBzb2NpYWw6IG51bWJlcixcclxuICBmaW5hbmNpYWw6IG51bWJlcixcclxuICBhY2NvbXBsaXNobWVudDogbnVtYmVyLFxyXG4gIHhQb3M6IG51bWJlcixcclxuICB5UG9zOiBudW1iZXIsXHJcbiAgb2NjdXBpZWRDb3VudGVyOiBudW1iZXIsXHJcbiAgY3VycmVudEFjdGlvbjogQWN0aW9uLFxyXG4gIGRlc3RpbmF0aW9uOiBMb2NhdGlvblxyXG59XHJcblxyXG4vLyBMb2NhdGlvbnMgYXJlIGEgcG9zaXRpb24sIGEgbmFtZSwgYW5kIGEgbGlzdCBvZiB0YWdzXHJcbi8vIGVnOiBhIHNwZWNpZmljIHJlc3RhdXJhbnRcclxuZXhwb3J0IGludGVyZmFjZSBMb2NhdGlvbiB7XHJcbiAgbmFtZTogc3RyaW5nLFxyXG4gIHhQb3M6IG51bWJlcixcclxuICB5UG9zOiBudW1iZXIsXHJcbiAgdGFnczogc3RyaW5nW11cclxufVxyXG5cclxuLyogIENoZWNrcyB0byBzZWUgaWYgYW4gYWdlbnQgaGFzIG1heGltdW0gbW90aXZlc1xyXG4gICAgYWdlbnQ6IHRoZSBhZ2VudCBiZWluZyB0ZXN0ZWRcclxuICAgIHJldHVybjogYSBib29sZWFuIGFuc3dlcmluZyB0aGUgcXVlc3Rpb24gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29udGVudChhZ2VudDpBZ2VudCk6Ym9vbGVhbiB7XHJcbiAgdmFyIHJldDpib29sZWFuID0gdHJ1ZTtcclxuICB2YXIgaTpudW1iZXIgPSAwO1xyXG4gIGZvciAoaSA9IDA7IGk8NTsgaSsrKXtcclxuICAgIHN3aXRjaChpKXtcclxuICAgICAgY2FzZSAwOiB7XHJcbiAgICAgICAgaWYgKGFnZW50LnBoeXNpY2FsICE9IGV4ZWMuTUFYX01FVEVSKSB7XHJcbiAgICAgICAgICByZXQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAxOiB7XHJcbiAgICAgICAgaWYgKGFnZW50LmVtb3Rpb25hbCAhPSBleGVjLk1BWF9NRVRFUikge1xyXG4gICAgICAgICAgcmV0ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgMjoge1xyXG4gICAgICAgIGlmIChhZ2VudC5zb2NpYWwgIT0gZXhlYy5NQVhfTUVURVIpIHtcclxuICAgICAgICAgIHJldCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlIDM6IHtcclxuICAgICAgICBpZiAoYWdlbnQuYWNjb21wbGlzaG1lbnQgIT0gZXhlYy5NQVhfTUVURVIpIHtcclxuICAgICAgICAgIHJldCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlIDQ6IHtcclxuICAgICAgICBpZiAoYWdlbnQuZmluYW5jaWFsICE9IGV4ZWMuTUFYX01FVEVSKSB7XHJcbiAgICAgICAgICByZXQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiByZXQ7XHJcbn1cclxuXHJcbi8qICBTZWxlY3RzIGFuIGFjdGlvbiBmcm9tIGEgbGlzdCBvZiB2YWxpZCBhY3Rpb25zIHRvIGJlIHByZWZvcm1lZCBieSBhIHNwZWNpZmljIGFnZW50LlxyXG4gICAgQ2hvc2VzIHRoZSBhY3Rpb24gd2l0aCB0aGUgbWF4aW1hbCB1dGlsaXR5IG9mIHRoZSBhZ2VudCAobW90aXZlIGluY3JlYXNlL3RpbWUpLlxyXG4gICAgYWdlbnQ6IHRoZSBhZ2VudCBpbiBxdWVzdGlvblxyXG4gICAgYWN0aW9uTGlzdDogdGhlIGxpc3Qgb2YgdmFsaWQgYWN0aW9uc1xyXG4gICAgbG9jYXRpb25MaXN0OiBhbGwgbG9jYXRpb25zIGluIHRoZSB3b3JsZFxyXG4gICAgcmV0dXJuOiBUaGUgc2luZ2xlIGFjdGlvbiBjaG9zZW4gZnJvbSB0aGUgbGlzdCAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0X2FjdGlvbihhZ2VudDpBZ2VudCwgYWN0aW9uTGlzdDpBY3Rpb25bXSwgbG9jYXRpb25MaXN0OkxvY2F0aW9uW10pOkFjdGlvbiB7XHJcbiAgLy8gaW5pdGlhbGl6ZWQgdG8gMCAobm8gcmVhc29uIHRvIGRvIGFuIGFjdGlvbiBpZiBpdCB3aWxsIGhhcm0geW91KVxyXG4gIHZhciBtYXhEZWx0YVV0aWxpdHk6bnVtYmVyID0gMDtcclxuICAvLyBpbml0aWFsaXplZCB0byB0aGUgaW5hY3Rpb25cclxuICB2YXIgY3VycmVudENob2ljZTpBY3Rpb24gPSB3YWl0X2FjdGlvbjtcclxuICAvLyBGaW5kcyB0aGUgdXRpbGl0eSBmb3IgZWFjaCBhY3Rpb24gdG8gdGhlIGdpdmVuIGFnZW50XHJcbiAgdmFyIGk6bnVtYmVyID0gMDtcclxuICBmb3IgKGkgPSAwOyBpPGFjdGlvbkxpc3QubGVuZ3RoOyBpKyspe1xyXG4gICAgdmFyIGRlc3Q6TG9jYXRpb24gPSBudWxsO1xyXG4gICAgdmFyIHRyYXZlbFRpbWU6bnVtYmVyID0gMDtcclxuICAgIHZhciBjaGVjazpib29sZWFuID0gdHJ1ZTtcclxuICAgIHZhciBrOm51bWJlciA9IDA7XHJcbiAgICBmb3IgKGsgPSAwOyBrPGFjdGlvbkxpc3RbaV0ucmVxdWlyZW1lbnRzLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgIGlmIChhY3Rpb25MaXN0W2ldLnJlcXVpcmVtZW50c1trXS50eXBlID09IDApe1xyXG4gICAgICAgIHZhciByZXF1aXJlbWVudDpMb2NhdGlvblJlcSA9IGFjdGlvbkxpc3RbaV0ucmVxdWlyZW1lbnRzW2tdLnJlcSBhcyBMb2NhdGlvblJlcTtcclxuICAgICAgICBkZXN0ID0gZXhlYy5nZXROZWFyZXN0TG9jYXRpb24ocmVxdWlyZW1lbnQsIGxvY2F0aW9uTGlzdCwgYWdlbnQueFBvcywgYWdlbnQueVBvcyk7XHJcbiAgICAgICAgaWYgKGRlc3QgPT0gbnVsbCkge1xyXG4gICAgICAgICAgY2hlY2sgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdHJhdmVsVGltZSA9IE1hdGguYWJzKGRlc3QueFBvcyAtIGFnZW50LnhQb3MpICsgTWF0aC5hYnMoZGVzdC55UG9zIC0gYWdlbnQueVBvcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBpZiBhbiBhY3Rpb24gaGFzIHNhdGlzZmlhYmxlIHJlcXVpcmVtZW50c1xyXG4gICAgaWYgKGNoZWNrKSB7XHJcbiAgICAgIHZhciBkZWx0YVV0aWxpdHk6bnVtYmVyID0gMDtcclxuICAgICAgdmFyIGo6bnVtYmVyID0gMDtcclxuICAgICAgZm9yIChqID0gMDsgajxhY3Rpb25MaXN0W2ldLmVmZmVjdHMubGVuZ3RoOyBqKyspe1xyXG4gICAgICAgIHN3aXRjaChhY3Rpb25MaXN0W2ldLmVmZmVjdHNbal0ubW90aXZlKXtcclxuICAgICAgICAgIGNhc2UgMDoge1xyXG4gICAgICAgICAgICBkZWx0YVV0aWxpdHkgKz0gZXhlYy5jbGFtcChhY3Rpb25MaXN0W2ldLmVmZmVjdHNbal0uZGVsdGEgKyBhZ2VudC5waHlzaWNhbCwgZXhlYy5NQVhfTUVURVIsIGV4ZWMuTUlOX01FVEVSKSAtIGFnZW50LnBoeXNpY2FsO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNhc2UgMToge1xyXG4gICAgICAgICAgICBkZWx0YVV0aWxpdHkgKz0gZXhlYy5jbGFtcChhY3Rpb25MaXN0W2ldLmVmZmVjdHNbal0uZGVsdGEgKyBhZ2VudC5lbW90aW9uYWwsIGV4ZWMuTUFYX01FVEVSLCBleGVjLk1JTl9NRVRFUikgLSBhZ2VudC5lbW90aW9uYWw7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY2FzZSAyOiB7XHJcbiAgICAgICAgICAgIGRlbHRhVXRpbGl0eSArPSBleGVjLmNsYW1wKGFjdGlvbkxpc3RbaV0uZWZmZWN0c1tqXS5kZWx0YSArIGFnZW50LnNvY2lhbCwgZXhlYy5NQVhfTUVURVIsIGV4ZWMuTUlOX01FVEVSKSAtIGFnZW50LnNvY2lhbDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYXNlIDM6IHtcclxuICAgICAgICAgICAgZGVsdGFVdGlsaXR5ICs9IGV4ZWMuY2xhbXAoYWN0aW9uTGlzdFtpXS5lZmZlY3RzW2pdLmRlbHRhICsgYWdlbnQuYWNjb21wbGlzaG1lbnQsIGV4ZWMuTUFYX01FVEVSLCBleGVjLk1JTl9NRVRFUikgLSBhZ2VudC5hY2NvbXBsaXNobWVudDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYXNlIDQ6IHtcclxuICAgICAgICAgICAgZGVsdGFVdGlsaXR5ICs9IGV4ZWMuY2xhbXAoYWN0aW9uTGlzdFtpXS5lZmZlY3RzW2pdLmRlbHRhICsgYWdlbnQuZmluYW5jaWFsLCBleGVjLk1BWF9NRVRFUiwgZXhlYy5NSU5fTUVURVIpIC0gYWdlbnQuZmluYW5jaWFsO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIC8vIGFkanVzdCBmb3IgdGltZSAoaW5jbHVkaW5nIHRyYXZlbCB0aW1lKVxyXG4gICAgICBkZWx0YVV0aWxpdHkgPSBkZWx0YVV0aWxpdHkvKGFjdGlvbkxpc3RbaV0udGltZV9taW4gKyB0cmF2ZWxUaW1lKTtcclxuICAgICAgLy8vIHVwZGF0ZSBjaG9pY2UgaWYgbmV3IHV0aWxpdHkgaXMgbWF4aW11bSBzZWVuIHNvIGZhclxyXG4gICAgICBpZiAoZGVsdGFVdGlsaXR5ID4gbWF4RGVsdGFVdGlsaXR5KSB7XHJcbiAgICAgICAgbWF4RGVsdGFVdGlsaXR5ID0gZGVsdGFVdGlsaXR5O1xyXG4gICAgICAgIGN1cnJlbnRDaG9pY2UgPSBhY3Rpb25MaXN0W2ldO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBjdXJyZW50Q2hvaWNlO1xyXG59XHJcblxyXG4vKiAgU2VsZWN0cyBhbiBhY3Rpb24gZnJvbSBhIGxpc3Qgb2YgdmFsaWQgYWN0aW9ucyB0byBiZSBwcmVmb3JtZWQgYnkgYSBzcGVjaWZpYyBhZ2VudC5cclxuICAgIENob3NlcyB0aGUgYWN0aW9uIHdpdGggdGhlIG1heGltYWwgdXRpbGl0eSBvZiB0aGUgYWdlbnQgKG1vdGl2ZSBpbmNyZWFzZS90aW1lKS5cclxuICAgIGFnZW50OiB0aGUgYWdlbnQgaW4gcXVlc3Rpb25cclxuICAgIGFjdGlvbjogdGhlIGFjdGlvbiBpbiBxdWVzdGlvbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXhlY3V0ZV9hY3Rpb24oYWdlbnQ6QWdlbnQsIGFjdGlvbjpBY3Rpb24pOnZvaWQge1xyXG4gIHZhciBpOm51bWJlciA9IDA7XHJcbiAgLy8gYXBwbHkgZWFjaCBlZmZlY3Qgb2YgdGhlIGFjdGlvbiBieSB1cGRhdGluZyB0aGUgYWdlbnQncyBtb3RpdmVzXHJcbiAgZm9yIChpID0gMDsgaTxhY3Rpb24uZWZmZWN0cy5sZW5ndGg7IGkrKyl7XHJcbiAgICBzd2l0Y2goYWN0aW9uLmVmZmVjdHNbaV0ubW90aXZlKXtcclxuICAgICAgY2FzZSAwOiB7XHJcbiAgICAgICAgYWdlbnQucGh5c2ljYWwgPSBleGVjLmNsYW1wKGFnZW50LnBoeXNpY2FsICsgYWN0aW9uLmVmZmVjdHNbaV0uZGVsdGEsIGV4ZWMuTUFYX01FVEVSLCBleGVjLk1JTl9NRVRFUilcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlIDE6IHtcclxuICAgICAgICBhZ2VudC5lbW90aW9uYWwgPSBleGVjLmNsYW1wKGFnZW50LmVtb3Rpb25hbCArIGFjdGlvbi5lZmZlY3RzW2ldLmRlbHRhLCBleGVjLk1BWF9NRVRFUiwgZXhlYy5NSU5fTUVURVIpXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAyOiB7XHJcbiAgICAgICAgYWdlbnQuc29jaWFsID0gZXhlYy5jbGFtcChhZ2VudC5zb2NpYWwgKyBhY3Rpb24uZWZmZWN0c1tpXS5kZWx0YSwgZXhlYy5NQVhfTUVURVIsIGV4ZWMuTUlOX01FVEVSKVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgMzoge1xyXG4gICAgICAgIGFnZW50LmFjY29tcGxpc2htZW50ID0gZXhlYy5jbGFtcChhZ2VudC5hY2NvbXBsaXNobWVudCArIGFjdGlvbi5lZmZlY3RzW2ldLmRlbHRhLCBleGVjLk1BWF9NRVRFUiwgZXhlYy5NSU5fTUVURVIpXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSA0OiB7XHJcbiAgICAgICAgYWdlbnQuZmluYW5jaWFsID0gZXhlYy5jbGFtcChhZ2VudC5maW5hbmNpYWwgKyBhY3Rpb24uZWZmZWN0c1tpXS5kZWx0YSwgZXhlYy5NQVhfTUVURVIsIGV4ZWMuTUlOX01FVEVSKVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyogIFNlbGVjdHMgYW4gYWN0aW9uIGZyb20gYSBsaXN0IG9mIHZhbGlkIGFjdGlvbnMgdG8gYmUgcHJlZm9ybWVkIGJ5IGEgc3BlY2lmaWMgYWdlbnQuXHJcbiAgICBDaG9zZXMgdGhlIGFjdGlvbiB3aXRoIHRoZSBtYXhpbWFsIHV0aWxpdHkgb2YgdGhlIGFnZW50IChtb3RpdmUgaW5jcmVhc2UvdGltZSkuXHJcbiAgICBhZ2VudExpc3Q6IGxpc3Qgb2YgYWdlbnRzIGluIHRoZSBzaW1cclxuICAgIGFjdGlvbkxpc3Q6IHRoZSBsaXN0IG9mIHZhbGlkIGFjdGlvbnNcclxuICAgIGxvY2F0aW9uTGlzdDogYWxsIGxvY2F0aW9ucyBpbiB0aGUgd29ybGRcclxuICAgIGNvbnRpbnVlRnVuY3Rpb246IGJvb2xlYW4gZnVuY3Rpb24gdGhhdCBpcyB1c2VkIGFzIGEgY2hlY2sgYXMgdG8gd2hldGhlciBvciBub3QgdG8ga2VlcCBydW5uaW5nIHRoZSBzaW0gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHR1cm4oYWdlbnQ6QWdlbnQsIGFjdGlvbkxpc3Q6QWN0aW9uW10sIGxvY2F0aW9uTGlzdDpMb2NhdGlvbltdLCB0aW1lOm51bWJlcik6dm9pZCB7XHJcbiAgaWYgKHRpbWUlNjAwID09IDApIHtcclxuICAgIGlmICghaXNDb250ZW50KGFnZW50KSkge1xyXG4gICAgICBhZ2VudC5waHlzaWNhbCA9IGV4ZWMuY2xhbXAoYWdlbnQucGh5c2ljYWwgLSAxLCBleGVjLk1BWF9NRVRFUiwgZXhlYy5NSU5fTUVURVIpO1xyXG4gICAgICBhZ2VudC5lbW90aW9uYWwgPSBleGVjLmNsYW1wKGFnZW50LmVtb3Rpb25hbCAtIDEsIGV4ZWMuTUFYX01FVEVSLCBleGVjLk1JTl9NRVRFUik7XHJcbiAgICAgIGFnZW50LnNvY2lhbCA9IGV4ZWMuY2xhbXAoYWdlbnQuc29jaWFsIC0gMSwgZXhlYy5NQVhfTUVURVIsIGV4ZWMuTUlOX01FVEVSKTtcclxuICAgICAgYWdlbnQuYWNjb21wbGlzaG1lbnQgPSBleGVjLmNsYW1wKGFnZW50LmFjY29tcGxpc2htZW50IC0gMSwgZXhlYy5NQVhfTUVURVIsIGV4ZWMuTUlOX01FVEVSKTtcclxuICAgICAgYWdlbnQuZmluYW5jaWFsID0gZXhlYy5jbGFtcChhZ2VudC5maW5hbmNpYWwgLSAxLCBleGVjLk1BWF9NRVRFUiwgZXhlYy5NSU5fTUVURVIpO1xyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoYWdlbnQub2NjdXBpZWRDb3VudGVyID4gMCkge1xyXG4gICAgYWdlbnQub2NjdXBpZWRDb3VudGVyLS07XHJcbiAgfSBlbHNlIHtcclxuICAgIGlmICghaXNDb250ZW50KGFnZW50KSkge1xyXG4gICAgICBhZ2VudC5kZXN0aW5hdGlvbiA9IG51bGw7XHJcbiAgICAgIGV4ZWN1dGVfYWN0aW9uKGFnZW50LCBhZ2VudC5jdXJyZW50QWN0aW9uKTtcclxuICAgICAgY29uc29sZS5sb2coXCJ0aW1lOiBcIiArIHRpbWUudG9TdHJpbmcoKSArIFwiIHwgXCIgKyBhZ2VudC5uYW1lICsgXCI6IEZpbmlzaGVkIFwiICsgYWdlbnQuY3VycmVudEFjdGlvbi5uYW1lKTtcclxuICAgICAgdmFyIGNob2ljZTpBY3Rpb24gPSBzZWxlY3RfYWN0aW9uKGFnZW50LCBhY3Rpb25MaXN0LCBsb2NhdGlvbkxpc3QpO1xyXG4gICAgICB2YXIgZGVzdDpMb2NhdGlvbiA9IG51bGw7XHJcbiAgICAgIHZhciBrOm51bWJlciA9IDA7XHJcbiAgICAgIGZvciAoayA9IDA7IGs8Y2hvaWNlLnJlcXVpcmVtZW50cy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgIGlmIChjaG9pY2UucmVxdWlyZW1lbnRzW2tdLnR5cGUgPT0gMCkge1xyXG4gICAgICAgICAgdmFyIHJlcXVpcmVtZW50OkxvY2F0aW9uUmVxID0gY2hvaWNlLnJlcXVpcmVtZW50c1trXS5yZXEgYXMgTG9jYXRpb25SZXE7XHJcbiAgICAgICAgICBkZXN0ID0gZXhlYy5nZXROZWFyZXN0TG9jYXRpb24ocmVxdWlyZW1lbnQsIGxvY2F0aW9uTGlzdCwgYWdlbnQueFBvcywgYWdlbnQueVBvcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIC8vc2V0IGFjdGlvbiB0byBjaG9pY2Ugb3IgdG8gdHJhdmVsIGlmIGFnZW50IGlzIG5vdCBhdCBsb2NhdGlvbiBmb3IgY2hvaWNlXHJcbiAgICAgIGlmIChkZXN0ID09PSBudWxsIHx8IChkZXN0LnhQb3MgPT0gYWdlbnQueFBvcyAmJiBkZXN0LnlQb3MgPT0gYWdlbnQueVBvcykpIHtcclxuICAgICAgICBhZ2VudC5jdXJyZW50QWN0aW9uID0gY2hvaWNlO1xyXG4gICAgICAgIGFnZW50Lm9jY3VwaWVkQ291bnRlciA9IGNob2ljZS50aW1lX21pbjtcclxuICAgICAgICBjb25zb2xlLmxvZyhcInRpbWU6IFwiICsgdGltZS50b1N0cmluZygpICsgXCIgfCBcIiArIGFnZW50Lm5hbWUgKyBcIjogU3RhcnRlZCBcIiArIGFnZW50LmN1cnJlbnRBY3Rpb24ubmFtZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIHRyYXZlbFRpbWU6bnVtYmVyID0gTWF0aC5hYnMoZGVzdC54UG9zIC0gYWdlbnQueFBvcykgKyBNYXRoLmFicyhkZXN0LnlQb3MgLSBhZ2VudC55UG9zKTtcclxuICAgICAgICBhZ2VudC5jdXJyZW50QWN0aW9uID0gdHJhdmVsX2FjdGlvbjtcclxuICAgICAgICBhZ2VudC5vY2N1cGllZENvdW50ZXIgPSBNYXRoLmFicyhkZXN0LnhQb3MgLSBhZ2VudC54UG9zKSArIE1hdGguYWJzKGRlc3QueVBvcyAtIGFnZW50LnlQb3MpO1xyXG4gICAgICAgIGRlc3QueFBvcyA9IGFnZW50LnhQb3M7XHJcbiAgICAgICAgZGVzdC55UG9zID0gYWdlbnQueVBvcztcclxuICAgICAgICBjb25zb2xlLmxvZyhcInRpbWU6IFwiICsgdGltZS50b1N0cmluZygpICsgXCIgfCBcIiArIGFnZW50Lm5hbWUgKyBcIjogU3RhcnRlZCBcIiArIGFnZW50LmN1cnJlbnRBY3Rpb24ubmFtZSArIFwiOyBEZXN0aW5hdGlvbjogXCIgKyBkZXN0Lm5hbWUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCAqIGFzIG5wYyBmcm9tIFwiLi9hZ2VudFwiO1xyXG5pbXBvcnQge3dhaXRfYWN0aW9ufSBmcm9tIFwiLi9hY3Rpb25fc3BlY3NcIjtcclxuaW1wb3J0IHt0cmF2ZWxfYWN0aW9ufSBmcm9tIFwiLi9hY3Rpb25fc3BlY3NcIjtcclxuXHJcbmV4cG9ydCB2YXIgdGltZTpudW1iZXIgPSAwO1xyXG5leHBvcnQgY29uc3QgTUFYX01FVEVSID0gNTtcclxuZXhwb3J0IGNvbnN0IE1JTl9NRVRFUiA9IDE7XHJcblxyXG4vKiAgU2ltcGxlIG1hdGhlbWF0aWNhbCBjbGFtcCBmdW5jdGlvbi5cclxuICAgIG46IG51bWJlciBiZWluZyB0ZXN0ZWRcclxuICAgIG06IG1heGltdW0gdmFsdWUgb2YgbnVtYmVyXHJcbiAgICBvOiBtaW5pbXVtIHZhbHVlIG9mIG51bWJlclxyXG4gICAgcmV0dXJuOiBlaXRoZXIgdGhlIG51bWJlciwgb3IgdGhlIG1heC9taW4gaWYgaXQgd2FzIG91dHNpZGUgb2YgdGhlIHJhbmdlICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjbGFtcChuOm51bWJlciwgbTpudW1iZXIsIG86bnVtYmVyKTpudW1iZXIge1xyXG4gIGlmIChuID4gbSkge1xyXG4gICAgcmV0dXJuIG07XHJcbiAgfSBlbHNlIGlmIChuIDwgbykge1xyXG4gICAgcmV0dXJuIG87XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiBuO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbi8qICBSYW5kb21pemUgYXJyYXkgaW4tcGxhY2UgdXNpbmcgRHVyc3RlbmZlbGQgc2h1ZmZsZSBhbGdvcml0aG1cclxuICAgIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI0NTA5NTQvaG93LXRvLXJhbmRvbWl6ZS1zaHVmZmxlLWEtamF2YXNjcmlwdC1hcnJheVxyXG4gICAgKi9cclxuZnVuY3Rpb24gc2h1ZmZsZUFycmF5KGFycmF5Om5wYy5BZ2VudFtdKTp2b2lkIHtcclxuICAgIGZvciAodmFyIGk6bnVtYmVyID0gYXJyYXkubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSkge1xyXG4gICAgICAgIHZhciBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XHJcbiAgICAgICAgdmFyIHRlbXA6bnBjLkFnZW50ID0gYXJyYXlbaV07XHJcbiAgICAgICAgYXJyYXlbaV0gPSBhcnJheVtqXTtcclxuICAgICAgICBhcnJheVtqXSA9IHRlbXA7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qICBjaGVja3MgbWVtYmVyc2hpcCBpbiBhIGxpc3QuIFN0cmluZyB0eXBlXHJcbiAgICBpdGVtOiBhIHN0cmluZyB0byBiZSBjaGVja2VkXHJcbiAgICBsaXN0OiBhIGxpc3Qgb2Ygc3RyaW5ncyB0byBjaGVjayBhZ2FpbnN0XHJcbiAgICByZXR1cm46IGEgYm9vbGVhbiBhbnN3ZXJpbmcgdGhlIHF1ZXN0aW9uICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpbkxpc3QoaXRlbTpzdHJpbmcsIGxpc3Q6c3RyaW5nW10pOmJvb2xlYW4ge1xyXG4gIHZhciByZXQ6Ym9vbGVhbiA9IGZhbHNlO1xyXG4gIHZhciBpOm51bWJlciA9IDA7XHJcbiAgZm9yIChpID0gMDsgaTxsaXN0Lmxlbmd0aDsgaSsrKXtcclxuICAgIGlmIChsaXN0W2ldID09IGl0ZW0pIHtcclxuICAgICAgcmV0ID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHJldDtcclxufVxyXG5cclxuLyogIHJldHVybnMgdGhlIG5lYXJlc3QgbG9jYXRpb24gdGhhdCBzYXRpc2ZpZXMgdGhlIGdpdmVuIHJlcXVpcmVtZW50LCBvciBudWxsLlxyXG4gICAgZGlzdGFuY2UgbWVhc3VyZWQgYnkgbWFuaGF0dGFuIGRpc3RhbmNlXHJcbiAgICByZXE6IGEgbG9jYXRpb24gcmVxdWlyZW1lbnQgdG8gc2F0aXNmeVxyXG4gICAgbGlzdDogYSBsaXN0IG9mIGxvY2F0aW9ucyB0byBjaGVja1xyXG4gICAgeCAmIHk6IGNvb3JkaW5hdGUgcGFpciB0byBkZXRlcm1pbmUgZGlzdGFuY2UgYWdhaW5zdC5cclxuICAgIHJldHVybjogdGhlIGxvY2F0aW9uIGluIHF1ZXN0aW9uIG9yIG51bGwgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldE5lYXJlc3RMb2NhdGlvbihyZXE6bnBjLkxvY2F0aW9uUmVxLCBsaXN0Om5wYy5Mb2NhdGlvbltdLCB4Om51bWJlciwgeTpudW1iZXIpOm5wYy5Mb2NhdGlvbiB7XHJcbiAgdmFyIHJldDpucGMuTG9jYXRpb24gPSBudWxsO1xyXG4gIHZhciBtaW5EaXN0Om51bWJlciA9IC0xO1xyXG4gIHZhciBpOm51bWJlciA9IDA7XHJcbiAgZm9yIChpID0gMDsgaTxsaXN0Lmxlbmd0aDsgaSsrKXtcclxuICAgIHZhciB2YWxpZDpib29sZWFuID0gdHJ1ZTtcclxuICAgIHZhciBjaGVjazE6Ym9vbGVhbiA9IHRydWU7XHJcbiAgICB2YXIgajpudW1iZXIgPSAwO1xyXG4gICAgZm9yIChqID0gMDsgajxyZXEuaGFzQWxsT2YubGVuZ3RoOyBqKyspe1xyXG4gICAgICBpZiAoIShpbkxpc3QocmVxLmhhc0FsbE9mW2pdLGxpc3RbaV0udGFncykpKSB7XHJcbiAgICAgICAgY2hlY2sxID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHZhciBjaGVjazI6Ym9vbGVhbiA9IGZhbHNlO1xyXG4gICAgZm9yIChqID0gMDsgajxyZXEuaGFzT25lT3JNb3JlT2YubGVuZ3RoOyBqKyspe1xyXG4gICAgICBpZiAoaW5MaXN0KHJlcS5oYXNPbmVPck1vcmVPZltqXSxsaXN0W2ldLnRhZ3MpKSB7XHJcbiAgICAgICAgY2hlY2syID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHJlcS5oYXNPbmVPck1vcmVPZi5sZW5ndGggPT0gMCkge1xyXG4gICAgICBjaGVjazIgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgdmFyIGNoZWNrMzpib29sZWFuID0gdHJ1ZTtcclxuICAgIGZvciAoaiA9IDA7IGo8cmVxLmhhc05vbmVPZi5sZW5ndGg7IGorKyl7XHJcbiAgICAgIGlmIChpbkxpc3QocmVxLmhhc05vbmVPZltqXSxsaXN0W2ldLnRhZ3MpKSB7XHJcbiAgICAgICAgY2hlY2szID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChyZXEuaGFzTm9uZU9mLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgIGNoZWNrMyA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBpZiAoIShjaGVjazEgJiYgY2hlY2syICYmIGNoZWNrMykpIHtcclxuICAgICAgdmFsaWQgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmICh2YWxpZCkge1xyXG4gICAgICB2YXIgdHJhdmVsRGlzdDogbnVtYmVyID0gTWF0aC5hYnMobGlzdFtpXS54UG9zIC0geCkgKyBNYXRoLmFicyhsaXN0W2ldLnlQb3MgLSB5KTtcclxuICAgICAgaWYgKChtaW5EaXN0ID4gdHJhdmVsRGlzdCkgfHwgKG1pbkRpc3QgPSAtMSkpIHtcclxuICAgICAgICBtaW5EaXN0ID0gdHJhdmVsRGlzdDtcclxuICAgICAgICByZXQgPSBsaXN0W2ldO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiByZXQ7XHJcbn1cclxuXHJcbi8qICBTZWxlY3RzIGFuIGFjdGlvbiBmcm9tIGEgbGlzdCBvZiB2YWxpZCBhY3Rpb25zIHRvIGJlIHByZWZvcm1lZCBieSBhIHNwZWNpZmljIGFnZW50LlxyXG4gICAgQ2hvc2VzIHRoZSBhY3Rpb24gd2l0aCB0aGUgbWF4aW1hbCB1dGlsaXR5IG9mIHRoZSBhZ2VudCAobW90aXZlIGluY3JlYXNlL3RpbWUpLlxyXG4gICAgYWdlbnRMaXN0OiBsaXN0IG9mIGFnZW50cyBpbiB0aGUgc2ltXHJcbiAgICBhY3Rpb25MaXN0OiB0aGUgbGlzdCBvZiB2YWxpZCBhY3Rpb25zXHJcbiAgICBsb2NhdGlvbkxpc3Q6IGFsbCBsb2NhdGlvbnMgaW4gdGhlIHdvcmxkXHJcbiAgICBjb250aW51ZUZ1bmN0aW9uOiBib29sZWFuIGZ1bmN0aW9uIHRoYXQgaXMgdXNlZCBhcyBhIGNoZWNrIGFzIHRvIHdoZXRoZXIgb3Igbm90IHRvIGtlZXAgcnVubmluZyB0aGUgc2ltICovXHJcbmV4cG9ydCBmdW5jdGlvbiBydW5fc2ltKGFnZW50TGlzdDpucGMuQWdlbnRbXSwgYWN0aW9uTGlzdDpucGMuQWN0aW9uW10sIGxvY2F0aW9uTGlzdDpucGMuTG9jYXRpb25bXSwgY29udGludWVGdW5jdGlvbjogKCkgPT4gYm9vbGVhbik6dm9pZCB7XHJcbiAgd2hpbGUgKGNvbnRpbnVlRnVuY3Rpb24oKSkge1xyXG4gICAgc2h1ZmZsZUFycmF5KGFnZW50TGlzdCk7XHJcbiAgICB2YXIgaTpudW1iZXIgPSAwO1xyXG4gICAgZm9yIChpID0gMDsgaSA8IGFnZW50TGlzdC5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgbnBjLnR1cm4oYWdlbnRMaXN0W2ldLCBhY3Rpb25MaXN0LCBsb2NhdGlvbkxpc3QsIHRpbWUpO1xyXG4gICAgfVxyXG4gICAgdGltZSArPSAxO1xyXG4gIH1cclxuICBjb25zb2xlLmxvZyhcIkZpbmlzaGVkLlwiKTtcclxufVxyXG4iLCJpbXBvcnQgKiBhcyBlbmdpbmUgZnJvbSBcIi4vZXhlY3V0aW9uX2VuZ2luZVwiO1xyXG5pbXBvcnQgKiBhcyBhY3Rpb25zIGZyb20gXCIuL2FjdGlvbl9zcGVjc1wiO1xyXG5pbXBvcnQgKiBhcyBucGMgZnJvbSBcIi4vYWdlbnRcIjtcclxuXHJcbi8vIExpc3Qgb2YgYXZhaWxhYmxlIGFjdGlvbnMgaW4gc2ltXHJcbnZhciBhY3Rpb25MaXN0Om5wYy5BY3Rpb25bXSA9IFthY3Rpb25zLmVhdF9hY3Rpb24sIGFjdGlvbnMubW92aWVfYWN0aW9uLCBhY3Rpb25zLmVhdF9mcmllbmRfYWN0aW9uLCBhY3Rpb25zLm1vdmllX2ZyaWVuZF9hY3Rpb24sIGFjdGlvbnMud29ya19hY3Rpb24sIGFjdGlvbnMuaG9iYnlfYWN0aW9uXTtcclxuXHJcbi8vIGFnZW50c1xyXG52YXIgYWdlbnQxOm5wYy5BZ2VudCA9XHJcbntcclxuICBuYW1lOiBcIkpvaG4gRG9lXCIsXHJcbiAgcGh5c2ljYWw6IDEsXHJcbiAgZW1vdGlvbmFsOiAxLFxyXG4gIHNvY2lhbDogMSxcclxuICBmaW5hbmNpYWw6IDEsXHJcbiAgYWNjb21wbGlzaG1lbnQ6IDEsXHJcbiAgeFBvczogMCxcclxuICB5UG9zOiAwLFxyXG4gIG9jY3VwaWVkQ291bnRlcjogMCxcclxuICBjdXJyZW50QWN0aW9uOiBhY3Rpb25zLndhaXRfYWN0aW9uLFxyXG4gIGRlc3RpbmF0aW9uOiBudWxsXHJcbn07XHJcblxyXG4vLyBhZ2VudHNcclxudmFyIGFnZW50MjpucGMuQWdlbnQgPVxyXG57XHJcbiAgbmFtZTogXCJKYW5lIERvZVwiLFxyXG4gIHBoeXNpY2FsOiA0LFxyXG4gIGVtb3Rpb25hbDogMSxcclxuICBzb2NpYWw6IDQsXHJcbiAgZmluYW5jaWFsOiAxLFxyXG4gIGFjY29tcGxpc2htZW50OiA0LFxyXG4gIHhQb3M6IDUsXHJcbiAgeVBvczogNSxcclxuICBvY2N1cGllZENvdW50ZXI6IDAsXHJcbiAgY3VycmVudEFjdGlvbjogYWN0aW9ucy53YWl0X2FjdGlvbixcclxuICBkZXN0aW5hdGlvbjogbnVsbFxyXG59O1xyXG5cclxuLy8gTGlzdCBvZiBhZ2VudHMgaW4gc2ltXHJcbnZhciBhZ2VudExpc3Q6bnBjLkFnZW50W10gPSBbYWdlbnQxLCBhZ2VudDJdO1xyXG5cclxuLy8gTG9jYXRpb25zXHJcbi8vIExvY2F0aW9ucyBhcmUgYSBwb3NpdGlvbiwgYSBuYW1lLCBhbmQgYSBsaXN0IG9mIHRhZ3NcclxudmFyIHJlc3RhdXJhbnQ6bnBjLkxvY2F0aW9uID0ge25hbWU6IFwicmVzdGF1cmFudFwiLCB4UG9zOiA1LCB5UG9zOiA1LCB0YWdzOiBbXCJyZXN0YXVyYW50XCIsIFwiZW1wbG95bWVudFwiXX1cclxuXHJcbnZhciBtb3ZpZV90aGVhdHJlOm5wYy5Mb2NhdGlvbiA9IHtuYW1lOiBcIm1vdmllIHRoZWF0cmVcIiwgeFBvczogMCwgeVBvczogNSwgdGFnczogW1wibW92aWUgdGhlYXRyZVwiLCBcImVtcGxveW1lbnRcIl19XHJcblxyXG52YXIgaG9tZTpucGMuTG9jYXRpb24gPSB7bmFtZTogXCJob21lXCIsIHhQb3M6IDUsIHlQb3M6IDAsIHRhZ3M6IFtcImhvbWVcIl19XHJcblxyXG4vL2xvY2F0aW9uIExpc3RcclxudmFyIGxvY2F0aW9uTGlzdDpucGMuTG9jYXRpb25bXSA9IFtyZXN0YXVyYW50LCBtb3ZpZV90aGVhdHJlLCBob21lXTtcclxuXHJcbi8vIGNvbmRpdGlvbiBmdW5jdGlvbi5cclxuLy8gU3RvcHMgdGhlIHNpbSB3aGVuIGFsbCBhZ2VudHMgYXJlIGF0IGZ1bGwgbWV0ZXJzXHJcbmZ1bmN0aW9uIGNvbmRpdGlvbigpOmJvb2xlYW4ge1xyXG4gIHZhciBjaGVjazpib29sZWFuID0gZmFsc2U7XHJcbiAgdmFyIGk6bnVtYmVyID0gMDtcclxuICAvLyBjaGVjayB0aGUgbWV0ZXIgbGV2ZWxzIGZvciBlYWNoIGFnZW50IGluIHRoZSBzaW1cclxuICBmb3IgKGkgPSAwOyBpPCBhZ2VudExpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmIChhZ2VudExpc3RbaV0ucGh5c2ljYWwgPCBlbmdpbmUuTUFYX01FVEVSKSB7XHJcbiAgICAgIGNoZWNrID0gdHJ1ZTtcclxuICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBpZiAoYWdlbnRMaXN0W2ldLmVtb3Rpb25hbCA8IGVuZ2luZS5NQVhfTUVURVIpIHtcclxuICAgICAgY2hlY2sgPSB0cnVlO1xyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICAgIGlmIChhZ2VudExpc3RbaV0uc29jaWFsIDwgZW5naW5lLk1BWF9NRVRFUikge1xyXG4gICAgICBjaGVjayA9IHRydWU7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgaWYgKGFnZW50TGlzdFtpXS5maW5hbmNpYWwgPCBlbmdpbmUuTUFYX01FVEVSKSB7XHJcbiAgICAgIGNoZWNrID0gdHJ1ZTtcclxuICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBpZiAoYWdlbnRMaXN0W2ldLmFjY29tcGxpc2htZW50IDwgZW5naW5lLk1BWF9NRVRFUikge1xyXG4gICAgICBjaGVjayA9IHRydWU7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gY2hlY2s7XHJcbn1cclxuXHJcbmVuZ2luZS5ydW5fc2ltKGFnZW50TGlzdCwgYWN0aW9uTGlzdCwgbG9jYXRpb25MaXN0LCBjb25kaXRpb24pO1xyXG5cclxuLy8gRGlzcGxheXMgdGV4dCBvbiB0aGUgYnJvd3Nlcj8gSSBhc3N1bWVcclxuZnVuY3Rpb24gc2hvd09uQnJvd3NlcihkaXZOYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZykge1xyXG4gIGNvbnN0IGVsdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpdk5hbWUpO1xyXG4gIGVsdC5pbm5lclRleHQgPSBuYW1lICsgXCJIZWxsbyBXb3JsZCFcIjtcclxufVxyXG5cclxuc2hvd09uQnJvd3NlcihcImdyZWV0aW5nXCIsIFwiVHlwZVNjcmlwdFwiKTtcclxuIl19
