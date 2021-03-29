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
// Discuss: replace type:0 with type:ReqType.location 
// Discuss: replace effect's motive:0 with Motive.physical
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
exports.turn = exports.execute_action = exports.select_action = exports.isContent = exports.ReqType = exports.BinOp = exports.MotiveType = void 0;
var exec = require("./execution_engine");
var action_specs_1 = require("./action_specs");
var action_specs_2 = require("./action_specs");
// Five motive types
// Discuss: This is an enum, but we don't use it. We pass 0,1,2 into the action specs file. 
// Discuss: While this can be an enum -- renamed to MotiveType | Change: declare a union type for Motive 
var MotiveType;
(function (MotiveType) {
    MotiveType[MotiveType["physical"] = 0] = "physical";
    MotiveType[MotiveType["emotional"] = 1] = "emotional";
    MotiveType[MotiveType["social"] = 2] = "social";
    MotiveType[MotiveType["financial"] = 3] = "financial";
    MotiveType[MotiveType["accomplishment"] = 4] = "accomplishment";
})(MotiveType = exports.MotiveType || (exports.MotiveType = {}));
// convenient list of keys of the motive types we have which we can iterate through
var motiveTypes = Object.keys(MotiveType).filter(function (k) { return typeof MotiveType[k] === "number"; });
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
// Discuss: This is an enum, but we don't use it. We pass 0,1,2 into the action specs file. 
var ReqType;
(function (ReqType) {
    ReqType[ReqType["location"] = 0] = "location";
    ReqType[ReqType["people"] = 1] = "people";
    ReqType[ReqType["motive"] = 2] = "motive";
})(ReqType = exports.ReqType || (exports.ReqType = {}));
/*  Checks to see if an agent has maximum motives
        agent: the agent being tested
        return: a boolean answering the question */
// To do: this way. 
// const getKeyValue = <U extends keyof T, T extends object>(key: U) => (obj: T) => obj[key];
function isContent(agent) {
    for (var motiveType in motiveTypes) {
        // const getmotive = getKeyValue<keyof Motive, Motive>(motiveType)(agent.motive);
        if (agent.motive[motiveType] != exec.MAX_METER) {
            return false;
        }
    }
    return true;
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
                var _delta = actionList[i].effects[j].delta;
                var _motivetype = MotiveType[actionList[i].effects[j].motive];
                deltaUtility += exec.clamp(_delta + agent.motive[_motivetype], exec.MAX_METER, exec.MIN_METER) - agent.motive[_motivetype];
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
/*  applies the effects of an action to an agent.
        agent: the agent in question
        action: the action in question */
function execute_action(agent, action) {
    var i = 0;
    // apply each effect of the action by updating the agent's motives
    for (i = 0; i < action.effects.length; i++) {
        var _delta = action.effects[i].delta;
        var _motivetype = MotiveType[action.effects[i].motive];
        agent.motive[_motivetype] = exec.clamp(agent.motive[_motivetype] + _delta, exec.MAX_METER, exec.MIN_METER);
    }
}
exports.execute_action = execute_action;
/*  updates movement and occupation counters for an agent. chooses and executes a new action if necessary
        agent: agent executing a turn
        actionList: the list of valid actions
        locationList: all locations in the world
        time: current tick time */
function turn(agent, actionList, locationList, time) {
    if (time % 600 == 0) {
        if (!isContent(agent)) {
            for (var motiveType in motiveTypes) {
                agent.motive[motiveType] = exec.clamp(agent.motive[motiveType] - 1, exec.MAX_METER, exec.MIN_METER);
            }
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
                // console.log("time: " + time.toString() + " | " + agent.name + ": Started " + agent.currentAction.name);
            }
            else {
                var travelTime = Math.abs(dest.xPos - agent.xPos) + Math.abs(dest.yPos - agent.yPos);
                agent.currentAction = action_specs_2.travel_action;
                agent.occupiedCounter = Math.abs(dest.xPos - agent.xPos) + Math.abs(dest.yPos - agent.yPos);
                dest.xPos = agent.xPos;
                dest.yPos = agent.yPos;
                // console.log("time: " + time.toString() + " | " + agent.name + ": Started " + agent.currentAction.name + "; Destination: " + dest.name);
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
/*  randomizes order and executes a turn for each agent every tick.
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
    motive: {
        physical: 1,
        emotional: 1,
        social: 1,
        financial: 1,
        accomplishment: 1,
    },
    xPos: 0,
    yPos: 0,
    occupiedCounter: 0,
    currentAction: actions.wait_action,
    destination: null
};
// agents
var agent2 = {
    name: "Jane Doe",
    motive: {
        physical: 4,
        emotional: 1,
        social: 4,
        financial: 1,
        accomplishment: 4,
    },
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
        if (agentList[i].motive.physical < engine.MAX_METER) {
            check = true;
            break;
        }
        if (agentList[i].motive.emotional < engine.MAX_METER) {
            check = true;
            break;
        }
        if (agentList[i].motive.social < engine.MAX_METER) {
            check = true;
            break;
        }
        if (agentList[i].motive.financial < engine.MAX_METER) {
            check = true;
            break;
        }
        if (agentList[i].motive.accomplishment < engine.MAX_METER) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWN0aW9uX3NwZWNzLnRzIiwic3JjL2FnZW50LnRzIiwic3JjL2V4ZWN1dGlvbl9lbmdpbmUudHMiLCJzcmMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztBQ1dBLDZCQUE2QjtBQUM3QixpR0FBaUc7QUFDakcsb0ZBQW9GO0FBRXBGLDREQUE0RDtBQUNqRCxRQUFBLFdBQVcsR0FDdEI7SUFDRSxJQUFJLEVBQUUsYUFBYTtJQUNuQixZQUFZLEVBQUUsRUFBRTtJQUNoQixPQUFPLEVBQUUsRUFBRTtJQUNYLFFBQVEsRUFBRSxDQUFDO0NBQ1osQ0FBQTtBQUVELHVFQUF1RTtBQUN2RSwrQ0FBK0M7QUFDcEMsUUFBQSxhQUFhLEdBQ3hCO0lBQ0UsSUFBSSxFQUFFLGVBQWU7SUFDckIsWUFBWSxFQUFFLEVBQUU7SUFDaEIsT0FBTyxFQUFFLEVBQUU7SUFDWCxRQUFRLEVBQUUsQ0FBQztDQUNaLENBQUE7QUFDRCxNQUFNO0FBRU4saURBQWlEO0FBQ2pELHNEQUFzRDtBQUN0RCwwREFBMEQ7QUFDL0MsUUFBQSxVQUFVLEdBQ3JCO0lBQ0UsSUFBSSxFQUFFLFlBQVk7SUFDbEIsWUFBWSxFQUFFLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLFlBQVksQ0FBQyxFQUFFLGNBQWMsRUFBQyxFQUFFLEVBQUUsU0FBUyxFQUFDLEVBQUUsRUFBQyxFQUFDLENBQUM7SUFDeEYsT0FBTyxFQUFPLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxDQUFDLEVBQUMsQ0FBQztJQUNuQyxRQUFRLEVBQU0sRUFBRTtDQUNqQixDQUFDO0FBRUYscURBQXFEO0FBQzFDLFFBQUEsWUFBWSxHQUN2QjtJQUNFLElBQUksRUFBRSxjQUFjO0lBQ3BCLFlBQVksRUFBRSxDQUFDLEVBQUMsSUFBSSxFQUFD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YyxDQUFDO0FBQ3hDLENBQUM7QUFFRCxhQUFhLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IHsgTW90aXZlIH0gZnJvbSBcIi4vYWdlbnRcIjtcbmltcG9ydCB7IEJpbk9wIH0gZnJvbSBcIi4vYWdlbnRcIjtcbmltcG9ydCB7IFJlcVR5cGUgfSBmcm9tIFwiLi9hZ2VudFwiO1xuaW1wb3J0IHsgTW90aXZlUmVxIH0gZnJvbSBcIi4vYWdlbnRcIjtcbmltcG9ydCB7IFBlb3BsZVJlcSB9IGZyb20gXCIuL2FnZW50XCI7XG5pbXBvcnQgeyBMb2NhdGlvblJlcSB9IGZyb20gXCIuL2FnZW50XCI7XG5pbXBvcnQgeyBSZXF1aXJlbWVudCB9IGZyb20gXCIuL2FnZW50XCI7XG5pbXBvcnQgeyBFZmZlY3QgfSBmcm9tIFwiLi9hZ2VudFwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4vYWdlbnRcIjtcbmltcG9ydCB7IEFnZW50IH0gZnJvbSBcIi4vYWdlbnRcIjtcblxuLy8gREVGQVVMVCBBQ1RJT05TIC0gUkVRVUlSRURcbi8vIFRoZSBmb2xsb3dpbmcgYWN0aW9ucyBhcmUgcmVxdWlyZWQgZm9yIHRoZSBjdXJyZW50IHN0cnVjdHVyZSBvZiB0aGUgZXhlY3V0aW9uIGV4ZWN1dGlvbl9lbmdpbmVcbi8vV2hlbiBtb2RpZnlpbmcgdGhpcyBmaWxlIGZvciBtb3JlIHRlc3Qgc2NlbmFyaW9zLCBETyBOT1QgQ0hBTkdFIFRIRVNFIGFjdGlvbl9zcGVjc1xuXG4vLyBUaGUgd2FpdCBhY3Rpb24gaXMgdXNlZCB3aGVuIGFuIGFnZW50IGhhcyBtYXhpbWFsIG1vdGl2ZXNcbmV4cG9ydCB2YXIgd2FpdF9hY3Rpb24gOiBBY3Rpb24gPVxue1xuICBuYW1lOiBcIndhaXRfYWN0aW9uXCIsXG4gIHJlcXVpcmVtZW50czogW10sXG4gIGVmZmVjdHM6IFtdLFxuICB0aW1lX21pbjogMFxufVxuXG4vLyBUaGUgdHJhdmVsIGFjdGlvbiBpcyB1c2VkIHdoZW4gYW4gYWdlbnQgaXMgdHJhdmVsbGluZyB0byBhIGxvY2F0aW9uLlxuLy8gVGhlIHRpbWUgaXMgaGFuZGRsZXMgYnkgdGhlIGV4ZWN1dGlvbiBlbmdpbmVcbmV4cG9ydCB2YXIgdHJhdmVsX2FjdGlvbiA6IEFjdGlvbiA9XG57XG4gIG5hbWU6IFwidHJhdmVsX2FjdGlvblwiLFxuICByZXF1aXJlbWVudHM6IFtdLFxuICBlZmZlY3RzOiBbXSxcbiAgdGltZV9taW46IDBcbn1cbi8vIEVORFxuXG4vLyBGaWxscyBwaHlzaWNhbCwgcmVxdWlyZXMgYSByZXN0YXVyYW50IGxvY2F0aW9uXG4vLyBEaXNjdXNzOiByZXBsYWNlIHR5cGU6MCB3aXRoIHR5cGU6UmVxVHlwZS5sb2NhdGlvbiBcbi8vIERpc2N1c3M6IHJlcGxhY2UgZWZmZWN0J3MgbW90aXZlOjAgd2l0aCBNb3RpdmUucGh5c2ljYWxcbmV4cG9ydCB2YXIgZWF0X2FjdGlvbiA6IEFjdGlvbiA9XG57XG4gIG5hbWU6IFwiZWF0X2FjdGlvblwiLFxuICByZXF1aXJlbWVudHM6IFt7dHlwZTowLCByZXE6e2hhc0FsbE9mOltcInJlc3RhdXJhbnRcIl0sIGhhc09uZU9yTW9yZU9mOltdLCBoYXNOb25lT2Y6W119fV0sXG4gIGVmZmVjdHM6ICAgICAgW3ttb3RpdmU6MCwgZGVsdGE6Mn1dLFxuICB0aW1lX21pbjogICAgIDYwXG59O1xuXG4vLyBGaWxscyBlbW90aW9uYWwsIHJlcXVpcmVzIGEgbW92aWUgdGhlYXRyZSBsb2NhdGlvblxuZXhwb3J0IHZhciBtb3ZpZV9hY3Rpb24gOiBBY3Rpb24gPVxue1xuICBuYW1lOiBcIm1vdmllX2FjdGlvblwiLFxuICByZXF1aXJlbWVudHM6IFt7dHlwZTowLCByZXE6e2hhc0FsbE9mOltcIm1vdmllIHRoZWF0cmVcIl0sIGhhc09uZU9yTW9yZU9mOltdLCBoYXNOb25lT2Y6W119fV0sXG4gIGVmZmVjdHM6ICAgICAgW3ttb3RpdmU6MSwgZGVsdGE6M31dLFxuICB0aW1lX21pbjogICAgIDEyMFxufTtcblxuLy8gRmlsbHMgcGh5c2ljYWwgYW5kIHNvY2lhbCwgcmVxdWlyZXMgYSByZXN0YXVyYW50IGxvY2F0aW9uIGFuZCBhbiBhZGRpdGlvbmFsIHBlcnNvblxuZXhwb3J0IHZhciBlYXRfZnJpZW5kX2FjdGlvbiA6IEFjdGlvbiA9XG57XG4gIG5hbWU6IFwiZWF0X2ZyaWVuZF9hY3Rpb25cIixcbiAgcmVxdWlyZW1lbnRzOiBbe3R5cGU6MCwgcmVxOntoYXNBbGxPZjpbXCJyZXN0YXVyYW50XCJdLCBoYXNPbmVPck1vcmVPZjpbXSwgaGFzTm9uZU9mOltdfX0sXG4gICAgICAgICAgICAgICAge3R5cGU6MSwgcmVxOnttaW5OdW1QZW9wbGU6MiwgbWF4TnVtUGVvcGxlOi0xLCBzcGVjaWZpY1Blb3BsZVByZXNlbnQ6W10sIHNwZWNpZmljUGVvcGxlQWJzZW50OltdLCByZWxhdGlvbnNoaXBzUHJlc2VudDpbXSwgcmVsYXRpb25zaGlwc0Fic2VudDpbXX19XSxcbiAgZWZmZWN0czogICAgICBbe21vdGl2ZTowLCBkZWx0YToyfSwge21vdGl2ZToyLCBkZWx0YToyfV0sXG4gIHRpbWVfbWluOiAgICAgNzBcbn07XG5cbi8vIEZpbGxzIGVtb3Rpb25hbCBhbmQgc29jaWFsLCByZXF1aXJlcyBhIG1vdmllIHRoZWF0cmUgbG9jYXRpb24gYW5kIGFuIGFkZGl0aW9uYWwgcGVyc29uXG5leHBvcnQgdmFyIG1vdmllX2ZyaWVuZF9hY3Rpb24gOiBBY3Rpb24gPVxue1xuICBuYW1lOiBcIm1vdmllX2ZyaWVuZF9hY3Rpb25cIixcbiAgcmVxdWlyZW1lbnRzOiBbe3R5cGU6MCwgcmVxOntoYXNBbGxPZjpbXCJtb3ZpZSB0aGVhdHJlXCJdLCBoYXNPbmVPck1vcmVPZjpbXSwgaGFzTm9uZU9mOltdfX0sXG4gICAgICAgICAgICAgICAge3R5cGU6MSwgcmVxOnttaW5OdW1QZW9wbGU6MiwgbWF4TnVtUGVvcGxlOi0xLCBzcGVjaWZpY1Blb3BsZVByZXNlbnQ6W10sIHNwZWNpZmljUGVvcGxlQWJzZW50OltdLCByZWxhdGlvbnNoaXBzUHJlc2VudDpbXSwgcmVsYXRpb25zaGlwc0Fic2VudDpbXX19XSxcbiAgZWZmZWN0czogICAgICBbe21vdGl2ZToxLCBkZWx0YTozfSwge21vdGl2ZToyLCBkZWx0YToyfV0sXG4gIHRpbWVfbWluOiAgICAgMTMwXG59O1xuXG4vLyBGaWxscyBmaW5hbmNpYWwsIHJlcXVpcmVzIGEgbW92aWUgdGhlYXRyZSBsb2NhdGlvblxuZXhwb3J0IHZhciB3b3JrX2FjdGlvbiA6IEFjdGlvbiA9XG57XG4gIG5hbWU6IFwid29ya19hY3Rpb25cIixcbiAgcmVxdWlyZW1lbnRzOiBbe3R5cGU6MCwgcmVxOntoYXNBbGxPZjpbXCJlbXBsb3ltZW50XCJdLCBoYXNPbmVPck1vcmVPZjpbXSwgaGFzTm9uZU9mOltdfX1dLFxuICBlZmZlY3RzOiAgICAgIFt7bW90aXZlOjMsIGRlbHRhOjF9XSxcbiAgdGltZV9taW46ICAgICAyNDBcbn07XG5cbi8vIEZpbGxzIGFjY29tcGxpc2htZW50LCByZXF1aXJlcyBhIGhvbWUgbG9jYXRpb25cbmV4cG9ydCB2YXIgaG9iYnlfYWN0aW9uIDogQWN0aW9uID1cbntcbiAgbmFtZTogXCJob2JieV9hY3Rpb25cIixcbiAgcmVxdWlyZW1lbnRzOiBbe3R5cGU6MCwgcmVxOntoYXNBbGxPZjpbXCJob21lXCJdLCBoYXNPbmVPck1vcmVPZjpbXSwgaGFzTm9uZU9mOltdfX1dLFxuICBlZmZlY3RzOiAgICAgIFt7bW90aXZlOjQsIGRlbHRhOjJ9XSxcbiAgdGltZV9taW46ICAgICA2MFxufTtcbiIsImltcG9ydCAqIGFzIGV4ZWMgZnJvbSBcIi4vZXhlY3V0aW9uX2VuZ2luZVwiO1xuaW1wb3J0IHt3YWl0X2FjdGlvbn0gZnJvbSBcIi4vYWN0aW9uX3NwZWNzXCI7XG5pbXBvcnQge3RyYXZlbF9hY3Rpb259IGZyb20gXCIuL2FjdGlvbl9zcGVjc1wiO1xuLy8gRml2ZSBtb3RpdmUgdHlwZXNcbi8vIERpc2N1c3M6IFRoaXMgaXMgYW4gZW51bSwgYnV0IHdlIGRvbid0IHVzZSBpdC4gV2UgcGFzcyAwLDEsMiBpbnRvIHRoZSBhY3Rpb24gc3BlY3MgZmlsZS4gXG4vLyBEaXNjdXNzOiBXaGlsZSB0aGlzIGNhbiBiZSBhbiBlbnVtIC0tIHJlbmFtZWQgdG8gTW90aXZlVHlwZSB8IENoYW5nZTogZGVjbGFyZSBhIHVuaW9uIHR5cGUgZm9yIE1vdGl2ZSBcbmV4cG9ydCBlbnVtIE1vdGl2ZVR5cGUge1xuXHRwaHlzaWNhbCxcblx0ZW1vdGlvbmFsLFxuXHRzb2NpYWwsXG5cdGZpbmFuY2lhbCxcblx0YWNjb21wbGlzaG1lbnRcbn1cblxuLy8gVGhpcyBpcyBtb3JlIG9mIGEgbmVlZCBhbmQgbGVzcyBvZiBhIG1vdGl2ZSBzaW5jZSBpdCdzIGEgc2V0IG9mIHRoZW0gYWxsXG5leHBvcnQgaW50ZXJmYWNlIE1vdGl2ZSB7XG5cdHBoeXNpY2FsOiBudW1iZXI7XG5cdGVtb3Rpb25hbDogbnVtYmVyO1xuXHRzb2NpYWw6IG51bWJlcjtcblx0ZmluYW5jaWFsOiBudW1iZXI7XG5cdGFjY29tcGxpc2htZW50OiBudW1iZXI7XG5cdFtrZXk6IHN0cmluZ106IG51bWJlcjtcdFx0Ly8gbGV0cyB1cyBsb29rdXAgYSB2YWx1ZSBieSBhIHN0cmluZyBrZXlcbn1cblxuXG4vLyBjb252ZW5pZW50IGxpc3Qgb2Yga2V5cyBvZiB0aGUgbW90aXZlIHR5cGVzIHdlIGhhdmUgd2hpY2ggd2UgY2FuIGl0ZXJhdGUgdGhyb3VnaFxuY29uc3QgbW90aXZlVHlwZXM6IHN0cmluZ1tdID0gT2JqZWN0LmtleXMoTW90aXZlVHlwZSkuZmlsdGVyKGsgPT4gdHlwZW9mIE1vdGl2ZVR5cGVbayBhcyBhbnldID09PSBcIm51bWJlclwiKTtcblxuLy8gQmluYXJ5IE9wZXJhdGlvbnMgdXNlZCBwcmltYXJpbHkgaW4gcmVxdWlyZW1lbnRzXG5leHBvcnQgZW51bSBCaW5PcCB7XG5cdGVxdWFscyxcblx0Z3JlYXRlcl90aGFuLFxuXHRsZXNzX3RoYW4sXG5cdGdlcSxcblx0bGVxXG59XG5cbi8vIFRocmVlIHR5cGVzIG9mIHJlcXVpcmVtZW50c1xuLy8gRGlzY3VzczogVGhpcyBpcyBhbiBlbnVtLCBidXQgd2UgZG9uJ3QgdXNlIGl0LiBXZSBwYXNzIDAsMSwyIGludG8gdGhlIGFjdGlvbiBzcGVjcyBmaWxlLiBcbmV4cG9ydCBlbnVtIFJlcVR5cGUge1xuXHRsb2NhdGlvbixcblx0cGVvcGxlLFxuXHRtb3RpdmVcbn1cblxuLy8gUmVxdWlyZW1lbnRzIG9uIHRoZSB0eXBlIG9mIGxvY2F0aW9uIHRoZSBhY3Rpb24gdGFrZXMgcGxhY2UgaW4uXG4vLyBCYXNlZCBvbiBhIHRhZ3Mgc3lzdGVtIGZvciBsb2NhdGlvbnMuXG4vLyBlZzogbXVzdCBiZSBhdCBhIHJlc3RhdXJhbnRcbmV4cG9ydCBpbnRlcmZhY2UgTG9jYXRpb25SZXEge1xuXHRoYXNBbGxPZjogc3RyaW5nW10sXG5cdGhhc09uZU9yTW9yZU9mOiBzdHJpbmdbXSxcblx0aGFzTm9uZU9mOiBzdHJpbmdbXVxufVxuXG4vLyBSZXF1aXJlbWVudHMgb24gd2hvIGlzIHByZXNlbnQgZm9yIGFuIGFjdGlvbi5cbi8vIGVnOiBtdXN0IGJlIHdpdGggYSBzZXBjaWZpYyBwZXJzb25cbmV4cG9ydCBpbnRlcmZhY2UgUGVvcGxlUmVxIHtcblx0bWluTnVtUGVvcGxlOiBudW1iZXIsXG5cdG1heE51bVBlb3BsZTogbnVtYmVyLFxuXHRzcGVjaWZpY1Blb3BsZVByZXNlbnQ6IHN0cmluZ1tdLFxuXHRzcGVjaWZpY1Blb3BsZUFic2VudDogc3RyaW5nW10sXG5cdHJlbGF0aW9uc2hpcHNQcmVzZW50OiBzdHJpbmdbXSxcblx0cmVsYXRpb25zaGlwc0Fic2VudDogc3RyaW5nW11cbn1cblxuLy8gUmVxdWlyZW1lbnRzIG9uIHRoZSBleGVjdXRpbmcgYWdlbid0IGN1cnJlbnQgbW90aXZlIHNjb3Jlcy5cbi8vIGVnOiBlZyBtdXN0IGhhdmUgbW9uZXkgKGZpbmFuY2lhbCBtb3RpdmUgPiAwKSB0byBkbyB0aGlzXG4vLyBEaXNjdXNzOiBUaGlzIHNob3VsZCBiZSB1c2luZyB0aGUgaW50ZXJmYWNlIGFuZCBub3QgYW4gZW51bVxuXG4vLyBleHBvcnQgaW50ZXJmYWNlIFNpbmdsZU1vdGl2ZSB7XG4vLyBcdG1vdGl2ZTogTW90aXZlVHlwZSxcbi8vIFx0dmFsZW5jZTogbnVtYmVyIFxuLy8gfVxuXG5leHBvcnQgaW50ZXJmYWNlIE1vdGl2ZVJlcSB7XG5cdG1vdGl2ZTogTW90aXZlVHlwZSxcblx0b3A6ICAgICBCaW5PcCxcblx0dGhyZXNoOiBudW1iZXJcbn1cblxuLy8gR2VuZXJhbCByZXF1aXJlbWVudCB0eXBlLlxuLy8gZWc6IGFueSBvZiB0aGUgYWJvdmUgdGhyZWVcbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWlyZW1lbnQge1xuXHR0eXBlOiBSZXFUeXBlLFxuXHRyZXE6IExvY2F0aW9uUmVxIHwgUGVvcGxlUmVxIHwgTW90aXZlUmVxXG59XG5cbi8vIEFjdGlvbiBlZmZlY3QgdHlwZS5cbi8vIGVnOiBzbGVlcCBpbmNyZWFzZXMgdGhlIHBoeXNpY2FsIG1vdGl2ZVxuZXhwb3J0IGludGVyZmFjZSBFZmZlY3Qge1xuXHRtb3RpdmU6IE1vdGl2ZVR5cGUsXG5cdGRlbHRhOiBudW1iZXJcbn1cblxuLy8gR2VuZXJhbCBhY3Rpb24gdHlwZS5cbi8vIE5hbWUsIHJlcXVpcmVtbnRzLCBlZmZlY3RzLCBhbmQgbWluaW11bSB0aW1lIHRha2VuLlxuLy8gZWc6IHNsZWVwXG5leHBvcnQgaW50ZXJmYWNlIEFjdGlvbiB7XG5cdG5hbWU6IHN0cmluZyxcblx0cmVxdWlyZW1lbnRzOiBSZXF1aXJlbWVudFtdLFxuXHRlZmZlY3RzOiAgICAgIEVmZmVjdFtdLFxuXHR0aW1lX21pbjogICAgIG51bWJlclxufVxuXG5cblxuLy9HZW5lcmFsIGFnZW50IHR5cGUuXG4vLyBOYW1lIGFuZCBDdXJyZW50IE1vdGl2ZSBTY29yZXMuXG4vLyBlZzogYW55IG5wYyBjaGFyYWN0ZXJcbmV4cG9ydCBpbnRlcmZhY2UgQWdlbnQge1xuXHQvLyBBZ2VudCBQcm9wZXJ0aWVzXG5cdG5hbWU6IHN0cmluZyxcblx0bW90aXZlOiBNb3RpdmUsXG5cdHhQb3M6IG51bWJlcixcblx0eVBvczogbnVtYmVyLFxuXHRvY2N1cGllZENvdW50ZXI6IG51bWJlcixcblx0Y3VycmVudEFjdGlvbjogQWN0aW9uLFxuXHRkZXN0aW5hdGlvbjogTG9jYXRpb25cbn1cblxuLy8gTG9jYXRpb25zIGFyZSBhIHBvc2l0aW9uLCBhIG5hbWUsIGFuZCBhIGxpc3Qgb2YgdGFnc1xuLy8gZWc6IGEgc3BlY2lmaWMgcmVzdGF1cmFudFxuLy8gRGlzY3VzczogVGhlcmUgc2hvdWxkIGJlIGEgcG9pbnQgSW50ZXJmYWNlIHNpbmNlIHNvbWUgbG9jYXRpb25zIGFyZSBub3QgbmFtZWQuIFxuZXhwb3J0IGludGVyZmFjZSBMb2NhdGlvbiB7XG5cdG5hbWU6IHN0cmluZyxcblx0eFBvczogbnVtYmVyLFxuXHR5UG9zOiBudW1iZXIsXG5cdHRhZ3M6IHN0cmluZ1tdXG59XG5cbi8qICBDaGVja3MgdG8gc2VlIGlmIGFuIGFnZW50IGhhcyBtYXhpbXVtIG1vdGl2ZXNcblx0XHRhZ2VudDogdGhlIGFnZW50IGJlaW5nIHRlc3RlZFxuXHRcdHJldHVybjogYSBib29sZWFuIGFuc3dlcmluZyB0aGUgcXVlc3Rpb24gKi9cblxuLy8gVG8gZG86IHRoaXMgd2F5LiBcbi8vIGNvbnN0IGdldEtleVZhbHVlID0gPFUgZXh0ZW5kcyBrZXlvZiBULCBUIGV4dGVuZHMgb2JqZWN0PihrZXk6IFUpID0+IChvYmo6IFQpID0+IG9ialtrZXldO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNDb250ZW50KGFnZW50OkFnZW50KTpib29sZWFuIHtcblx0Zm9yKGxldCBtb3RpdmVUeXBlIGluIG1vdGl2ZVR5cGVzKXtcblx0XHQvLyBjb25zdCBnZXRtb3RpdmUgPSBnZXRLZXlWYWx1ZTxrZXlvZiBNb3RpdmUsIE1vdGl2ZT4obW90aXZlVHlwZSkoYWdlbnQubW90aXZlKTtcblx0XHRpZihhZ2VudC5tb3RpdmVbbW90aXZlVHlwZV0gIT0gZXhlYy5NQVhfTUVURVIpe1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuXG4vKiAgU2VsZWN0cyBhbiBhY3Rpb24gZnJvbSBhIGxpc3Qgb2YgdmFsaWQgYWN0aW9ucyB0byBiZSBwcmVmb3JtZWQgYnkgYSBzcGVjaWZpYyBhZ2VudC5cblx0XHRDaG9zZXMgdGhlIGFjdGlvbiB3aXRoIHRoZSBtYXhpbWFsIHV0aWxpdHkgb2YgdGhlIGFnZW50IChtb3RpdmUgaW5jcmVhc2UvdGltZSkuXG5cdFx0YWdlbnQ6IHRoZSBhZ2VudCBpbiBxdWVzdGlvblxuXHRcdGFjdGlvbkxpc3Q6IHRoZSBsaXN0IG9mIHZhbGlkIGFjdGlvbnNcblx0XHRsb2NhdGlvbkxpc3Q6IGFsbCBsb2NhdGlvbnMgaW4gdGhlIHdvcmxkXG5cdFx0cmV0dXJuOiBUaGUgc2luZ2xlIGFjdGlvbiBjaG9zZW4gZnJvbSB0aGUgbGlzdCAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdF9hY3Rpb24oYWdlbnQ6QWdlbnQsIGFjdGlvbkxpc3Q6QWN0aW9uW10sIGxvY2F0aW9uTGlzdDpMb2NhdGlvbltdKTpBY3Rpb24ge1xuXHQvLyBpbml0aWFsaXplZCB0byAwIChubyByZWFzb24gdG8gZG8gYW4gYWN0aW9uIGlmIGl0IHdpbGwgaGFybSB5b3UpXG5cdHZhciBtYXhEZWx0YVV0aWxpdHk6bnVtYmVyID0gMDtcblx0Ly8gaW5pdGlhbGl6ZWQgdG8gdGhlIGluYWN0aW9uXG5cdHZhciBjdXJyZW50Q2hvaWNlOkFjdGlvbiA9IHdhaXRfYWN0aW9uO1xuXHQvLyBGaW5kcyB0aGUgdXRpbGl0eSBmb3IgZWFjaCBhY3Rpb24gdG8gdGhlIGdpdmVuIGFnZW50XG5cdHZhciBpOm51bWJlciA9IDA7XG5cdGZvciAoaSA9IDA7IGk8YWN0aW9uTGlzdC5sZW5ndGg7IGkrKyl7XG5cdFx0dmFyIGRlc3Q6TG9jYXRpb24gPSBudWxsO1xuXHRcdHZhciB0cmF2ZWxUaW1lOm51bWJlciA9IDA7XG5cdFx0dmFyIGNoZWNrOmJvb2xlYW4gPSB0cnVlO1xuXHRcdHZhciBrOm51bWJlciA9IDA7XG5cdFx0Zm9yIChrID0gMDsgazxhY3Rpb25MaXN0W2ldLnJlcXVpcmVtZW50cy5sZW5ndGg7IGsrKykge1xuXHRcdFx0aWYgKGFjdGlvbkxpc3RbaV0ucmVxdWlyZW1lbnRzW2tdLnR5cGUgPT0gMCl7XG5cdFx0XHRcdHZhciByZXF1aXJlbWVudDpMb2NhdGlvblJlcSA9IGFjdGlvbkxpc3RbaV0ucmVxdWlyZW1lbnRzW2tdLnJlcSBhcyBMb2NhdGlvblJlcTtcblx0XHRcdFx0ZGVzdCA9IGV4ZWMuZ2V0TmVhcmVzdExvY2F0aW9uKHJlcXVpcmVtZW50LCBsb2NhdGlvbkxpc3QsIGFnZW50LnhQb3MsIGFnZW50LnlQb3MpO1xuXHRcdFx0XHRpZiAoZGVzdCA9PSBudWxsKSB7XG5cdFx0XHRcdFx0Y2hlY2sgPSBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0cmF2ZWxUaW1lID0gTWF0aC5hYnMoZGVzdC54UG9zIC0gYWdlbnQueFBvcykgKyBNYXRoLmFicyhkZXN0LnlQb3MgLSBhZ2VudC55UG9zKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBpZiBhbiBhY3Rpb24gaGFzIHNhdGlzZmlhYmxlIHJlcXVpcmVtZW50c1xuXHRcdGlmIChjaGVjaykge1xuXHRcdFx0dmFyIGRlbHRhVXRpbGl0eTpudW1iZXIgPSAwO1xuXHRcdFx0dmFyIGo6bnVtYmVyID0gMDtcblxuXHRcdFx0Zm9yIChqPTA7IGo8YWN0aW9uTGlzdFtpXS5lZmZlY3RzLmxlbmd0aDsgaisrKXtcblx0XHRcdFx0dmFyIF9kZWx0YSA9IGFjdGlvbkxpc3RbaV0uZWZmZWN0c1tqXS5kZWx0YTtcblx0XHRcdFx0dmFyIF9tb3RpdmV0eXBlID0gTW90aXZlVHlwZVthY3Rpb25MaXN0W2ldLmVmZmVjdHNbal0ubW90aXZlXTtcblx0XHRcdCAgIGRlbHRhVXRpbGl0eSArPSBleGVjLmNsYW1wKF9kZWx0YSArIGFnZW50Lm1vdGl2ZVtfbW90aXZldHlwZV0sIGV4ZWMuTUFYX01FVEVSLCBleGVjLk1JTl9NRVRFUikgLSBhZ2VudC5tb3RpdmVbX21vdGl2ZXR5cGVdO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBhZGp1c3QgZm9yIHRpbWUgKGluY2x1ZGluZyB0cmF2ZWwgdGltZSlcblx0XHRcdGRlbHRhVXRpbGl0eSA9IGRlbHRhVXRpbGl0eS8oYWN0aW9uTGlzdFtpXS50aW1lX21pbiArIHRyYXZlbFRpbWUpO1xuXHRcdFx0Ly8vIHVwZGF0ZSBjaG9pY2UgaWYgbmV3IHV0aWxpdHkgaXMgbWF4aW11bSBzZWVuIHNvIGZhclxuXHRcdFx0aWYgKGRlbHRhVXRpbGl0eSA+IG1heERlbHRhVXRpbGl0eSkge1xuXHRcdFx0XHRtYXhEZWx0YVV0aWxpdHkgPSBkZWx0YVV0aWxpdHk7XG5cdFx0XHRcdGN1cnJlbnRDaG9pY2UgPSBhY3Rpb25MaXN0W2ldO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gY3VycmVudENob2ljZTtcbn1cblxuLyogIGFwcGxpZXMgdGhlIGVmZmVjdHMgb2YgYW4gYWN0aW9uIHRvIGFuIGFnZW50LlxuXHRcdGFnZW50OiB0aGUgYWdlbnQgaW4gcXVlc3Rpb25cblx0XHRhY3Rpb246IHRoZSBhY3Rpb24gaW4gcXVlc3Rpb24gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGVjdXRlX2FjdGlvbihhZ2VudDpBZ2VudCwgYWN0aW9uOkFjdGlvbik6dm9pZCB7XG5cdHZhciBpOm51bWJlciA9IDA7XG5cdC8vIGFwcGx5IGVhY2ggZWZmZWN0IG9mIHRoZSBhY3Rpb24gYnkgdXBkYXRpbmcgdGhlIGFnZW50J3MgbW90aXZlc1xuXG5cdGZvciAoaT0wOyBpPGFjdGlvbi5lZmZlY3RzLmxlbmd0aDsgaSsrKXtcblx0XHR2YXIgX2RlbHRhID0gYWN0aW9uLmVmZmVjdHNbaV0uZGVsdGE7XG5cdFx0dmFyIF9tb3RpdmV0eXBlID0gTW90aXZlVHlwZVthY3Rpb24uZWZmZWN0c1tpXS5tb3RpdmVdO1xuXHQgICBhZ2VudC5tb3RpdmVbX21vdGl2ZXR5cGVdID0gZXhlYy5jbGFtcChhZ2VudC5tb3RpdmVbX21vdGl2ZXR5cGVdICsgX2RlbHRhLCBleGVjLk1BWF9NRVRFUiwgZXhlYy5NSU5fTUVURVIpO1xuXHR9XG59XG5cbi8qICB1cGRhdGVzIG1vdmVtZW50IGFuZCBvY2N1cGF0aW9uIGNvdW50ZXJzIGZvciBhbiBhZ2VudC4gY2hvb3NlcyBhbmQgZXhlY3V0ZXMgYSBuZXcgYWN0aW9uIGlmIG5lY2Vzc2FyeSBcblx0XHRhZ2VudDogYWdlbnQgZXhlY3V0aW5nIGEgdHVyblxuXHRcdGFjdGlvbkxpc3Q6IHRoZSBsaXN0IG9mIHZhbGlkIGFjdGlvbnNcblx0XHRsb2NhdGlvbkxpc3Q6IGFsbCBsb2NhdGlvbnMgaW4gdGhlIHdvcmxkXG5cdFx0dGltZTogY3VycmVudCB0aWNrIHRpbWUgKi9cbmV4cG9ydCBmdW5jdGlvbiB0dXJuKGFnZW50OkFnZW50LCBhY3Rpb25MaXN0OkFjdGlvbltdLCBsb2NhdGlvbkxpc3Q6TG9jYXRpb25bXSwgdGltZTpudW1iZXIpOnZvaWQge1xuXHRpZiAodGltZSU2MDAgPT0gMCkge1xuXHRcdGlmICghaXNDb250ZW50KGFnZW50KSkge1xuXHRcdFx0Zm9yKGxldCBtb3RpdmVUeXBlIGluIG1vdGl2ZVR5cGVzKSB7XG5cdFx0XHRcdGFnZW50Lm1vdGl2ZVttb3RpdmVUeXBlXSA9IGV4ZWMuY2xhbXAoYWdlbnQubW90aXZlW21vdGl2ZVR5cGVdIC0gMSwgZXhlYy5NQVhfTUVURVIsIGV4ZWMuTUlOX01FVEVSKTtcblx0XHRcdH1cdFxuXHRcdH1cblx0fVxuXHRpZiAoYWdlbnQub2NjdXBpZWRDb3VudGVyID4gMCkge1xuXHRcdGFnZW50Lm9jY3VwaWVkQ291bnRlci0tO1xuXHR9IGVsc2Uge1xuXHRcdGlmICghaXNDb250ZW50KGFnZW50KSkge1xuXHRcdFx0YWdlbnQuZGVzdGluYXRpb24gPSBudWxsO1xuXHRcdFx0ZXhlY3V0ZV9hY3Rpb24oYWdlbnQsIGFnZW50LmN1cnJlbnRBY3Rpb24pO1xuXHRcdFx0Y29uc29sZS5sb2coXCJ0aW1lOiBcIiArIHRpbWUudG9TdHJpbmcoKSArIFwiIHwgXCIgKyBhZ2VudC5uYW1lICsgXCI6IEZpbmlzaGVkIFwiICsgYWdlbnQuY3VycmVudEFjdGlvbi5uYW1lKTtcblx0XHRcdHZhciBjaG9pY2U6QWN0aW9uID0gc2VsZWN0X2FjdGlvbihhZ2VudCwgYWN0aW9uTGlzdCwgbG9jYXRpb25MaXN0KTtcblx0XHRcdHZhciBkZXN0OkxvY2F0aW9uID0gbnVsbDtcblx0XHRcdHZhciBrOm51bWJlciA9IDA7XG5cdFx0XHRmb3IgKGsgPSAwOyBrPGNob2ljZS5yZXF1aXJlbWVudHMubGVuZ3RoOyBrKyspIHtcblx0XHRcdFx0aWYgKGNob2ljZS5yZXF1aXJlbWVudHNba10udHlwZSA9PSAwKSB7XG5cdFx0XHRcdFx0dmFyIHJlcXVpcmVtZW50OkxvY2F0aW9uUmVxID0gY2hvaWNlLnJlcXVpcmVtZW50c1trXS5yZXEgYXMgTG9jYXRpb25SZXE7XG5cdFx0XHRcdFx0ZGVzdCA9IGV4ZWMuZ2V0TmVhcmVzdExvY2F0aW9uKHJlcXVpcmVtZW50LCBsb2NhdGlvbkxpc3QsIGFnZW50LnhQb3MsIGFnZW50LnlQb3MpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvL3NldCBhY3Rpb24gdG8gY2hvaWNlIG9yIHRvIHRyYXZlbCBpZiBhZ2VudCBpcyBub3QgYXQgbG9jYXRpb24gZm9yIGNob2ljZVxuXHRcdFx0aWYgKGRlc3QgPT09IG51bGwgfHwgKGRlc3QueFBvcyA9PSBhZ2VudC54UG9zICYmIGRlc3QueVBvcyA9PSBhZ2VudC55UG9zKSkge1xuXHRcdFx0XHRhZ2VudC5jdXJyZW50QWN0aW9uID0gY2hvaWNlO1xuXHRcdFx0XHRhZ2VudC5vY2N1cGllZENvdW50ZXIgPSBjaG9pY2UudGltZV9taW47XG5cdFx0XHRcdC8vIGNvbnNvbGUubG9nKFwidGltZTogXCIgKyB0aW1lLnRvU3RyaW5nKCkgKyBcIiB8IFwiICsgYWdlbnQubmFtZSArIFwiOiBTdGFydGVkIFwiICsgYWdlbnQuY3VycmVudEFjdGlvbi5uYW1lKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciB0cmF2ZWxUaW1lOm51bWJlciA9IE1hdGguYWJzKGRlc3QueFBvcyAtIGFnZW50LnhQb3MpICsgTWF0aC5hYnMoZGVzdC55UG9zIC0gYWdlbnQueVBvcyk7XG5cdFx0XHRcdGFnZW50LmN1cnJlbnRBY3Rpb24gPSB0cmF2ZWxfYWN0aW9uO1xuXHRcdFx0XHRhZ2VudC5vY2N1cGllZENvdW50ZXIgPSBNYXRoLmFicyhkZXN0LnhQb3MgLSBhZ2VudC54UG9zKSArIE1hdGguYWJzKGRlc3QueVBvcyAtIGFnZW50LnlQb3MpO1xuXHRcdFx0XHRkZXN0LnhQb3MgPSBhZ2VudC54UG9zO1xuXHRcdFx0XHRkZXN0LnlQb3MgPSBhZ2VudC55UG9zO1xuXHRcdFx0XHQvLyBjb25zb2xlLmxvZyhcInRpbWU6IFwiICsgdGltZS50b1N0cmluZygpICsgXCIgfCBcIiArIGFnZW50Lm5hbWUgKyBcIjogU3RhcnRlZCBcIiArIGFnZW50LmN1cnJlbnRBY3Rpb24ubmFtZSArIFwiOyBEZXN0aW5hdGlvbjogXCIgKyBkZXN0Lm5hbWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuIiwiaW1wb3J0ICogYXMgbnBjIGZyb20gXCIuL2FnZW50XCI7XG5pbXBvcnQge3dhaXRfYWN0aW9ufSBmcm9tIFwiLi9hY3Rpb25fc3BlY3NcIjtcbmltcG9ydCB7dHJhdmVsX2FjdGlvbn0gZnJvbSBcIi4vYWN0aW9uX3NwZWNzXCI7XG5cbmV4cG9ydCB2YXIgdGltZTpudW1iZXIgPSAwO1xuZXhwb3J0IGNvbnN0IE1BWF9NRVRFUiA9IDU7XG5leHBvcnQgY29uc3QgTUlOX01FVEVSID0gMTtcblxuLyogIFNpbXBsZSBtYXRoZW1hdGljYWwgY2xhbXAgZnVuY3Rpb24uXG4gICAgbjogbnVtYmVyIGJlaW5nIHRlc3RlZFxuICAgIG06IG1heGltdW0gdmFsdWUgb2YgbnVtYmVyXG4gICAgbzogbWluaW11bSB2YWx1ZSBvZiBudW1iZXJcbiAgICByZXR1cm46IGVpdGhlciB0aGUgbnVtYmVyLCBvciB0aGUgbWF4L21pbiBpZiBpdCB3YXMgb3V0c2lkZSBvZiB0aGUgcmFuZ2UgKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFtcChuOm51bWJlciwgbTpudW1iZXIsIG86bnVtYmVyKTpudW1iZXIge1xuICBpZiAobiA+IG0pIHtcbiAgICByZXR1cm4gbTtcbiAgfSBlbHNlIGlmIChuIDwgbykge1xuICAgIHJldHVybiBvO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuO1xuICB9XG5cbn1cblxuLyogIFJhbmRvbWl6ZSBhcnJheSBpbi1wbGFjZSB1c2luZyBEdXJzdGVuZmVsZCBzaHVmZmxlIGFsZ29yaXRobVxuICAgIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI0NTA5NTQvaG93LXRvLXJhbmRvbWl6ZS1zaHVmZmxlLWEtamF2YXNjcmlwdC1hcnJheVxuICAgICovXG5mdW5jdGlvbiBzaHVmZmxlQXJyYXkoYXJyYXk6bnBjLkFnZW50W10pOnZvaWQge1xuICAgIGZvciAodmFyIGk6bnVtYmVyID0gYXJyYXkubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSkge1xuICAgICAgICB2YXIgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpO1xuICAgICAgICB2YXIgdGVtcDpucGMuQWdlbnQgPSBhcnJheVtpXTtcbiAgICAgICAgYXJyYXlbaV0gPSBhcnJheVtqXTtcbiAgICAgICAgYXJyYXlbal0gPSB0ZW1wO1xuICAgIH1cbn1cblxuLyogIGNoZWNrcyBtZW1iZXJzaGlwIGluIGEgbGlzdC4gU3RyaW5nIHR5cGVcbiAgICBpdGVtOiBhIHN0cmluZyB0byBiZSBjaGVja2VkXG4gICAgbGlzdDogYSBsaXN0IG9mIHN0cmluZ3MgdG8gY2hlY2sgYWdhaW5zdFxuICAgIHJldHVybjogYSBib29sZWFuIGFuc3dlcmluZyB0aGUgcXVlc3Rpb24gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbkxpc3QoaXRlbTpzdHJpbmcsIGxpc3Q6c3RyaW5nW10pOmJvb2xlYW4ge1xuICB2YXIgcmV0OmJvb2xlYW4gPSBmYWxzZTtcbiAgdmFyIGk6bnVtYmVyID0gMDtcbiAgZm9yIChpID0gMDsgaTxsaXN0Lmxlbmd0aDsgaSsrKXtcbiAgICBpZiAobGlzdFtpXSA9PSBpdGVtKSB7XG4gICAgICByZXQgPSB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG4vKiAgcmV0dXJucyB0aGUgbmVhcmVzdCBsb2NhdGlvbiB0aGF0IHNhdGlzZmllcyB0aGUgZ2l2ZW4gcmVxdWlyZW1lbnQsIG9yIG51bGwuXG4gICAgZGlzdGFuY2UgbWVhc3VyZWQgYnkgbWFuaGF0dGFuIGRpc3RhbmNlXG4gICAgcmVxOiBhIGxvY2F0aW9uIHJlcXVpcmVtZW50IHRvIHNhdGlzZnlcbiAgICBsaXN0OiBhIGxpc3Qgb2YgbG9jYXRpb25zIHRvIGNoZWNrXG4gICAgeCAmIHk6IGNvb3JkaW5hdGUgcGFpciB0byBkZXRlcm1pbmUgZGlzdGFuY2UgYWdhaW5zdC5cbiAgICByZXR1cm46IHRoZSBsb2NhdGlvbiBpbiBxdWVzdGlvbiBvciBudWxsICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TmVhcmVzdExvY2F0aW9uKHJlcTpucGMuTG9jYXRpb25SZXEsIGxpc3Q6bnBjLkxvY2F0aW9uW10sIHg6bnVtYmVyLCB5Om51bWJlcik6bnBjLkxvY2F0aW9uIHtcbiAgdmFyIHJldDpucGMuTG9jYXRpb24gPSBudWxsO1xuICB2YXIgbWluRGlzdDpudW1iZXIgPSAtMTtcbiAgdmFyIGk6bnVtYmVyID0gMDtcbiAgZm9yIChpID0gMDsgaTxsaXN0Lmxlbmd0aDsgaSsrKXtcbiAgICB2YXIgdmFsaWQ6Ym9vbGVhbiA9IHRydWU7XG4gICAgdmFyIGNoZWNrMTpib29sZWFuID0gdHJ1ZTtcbiAgICB2YXIgajpudW1iZXIgPSAwO1xuICAgIGZvciAoaiA9IDA7IGo8cmVxLmhhc0FsbE9mLmxlbmd0aDsgaisrKXtcbiAgICAgIGlmICghKGluTGlzdChyZXEuaGFzQWxsT2Zbal0sbGlzdFtpXS50YWdzKSkpIHtcbiAgICAgICAgY2hlY2sxID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBjaGVjazI6Ym9vbGVhbiA9IGZhbHNlO1xuICAgIGZvciAoaiA9IDA7IGo8cmVxLmhhc09uZU9yTW9yZU9mLmxlbmd0aDsgaisrKXtcbiAgICAgIGlmIChpbkxpc3QocmVxLmhhc09uZU9yTW9yZU9mW2pdLGxpc3RbaV0udGFncykpIHtcbiAgICAgICAgY2hlY2syID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHJlcS5oYXNPbmVPck1vcmVPZi5sZW5ndGggPT0gMCkge1xuICAgICAgY2hlY2syID0gdHJ1ZTtcbiAgICB9XG4gICAgdmFyIGNoZWNrMzpib29sZWFuID0gdHJ1ZTtcbiAgICBmb3IgKGogPSAwOyBqPHJlcS5oYXNOb25lT2YubGVuZ3RoOyBqKyspe1xuICAgICAgaWYgKGluTGlzdChyZXEuaGFzTm9uZU9mW2pdLGxpc3RbaV0udGFncykpIHtcbiAgICAgICAgY2hlY2szID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChyZXEuaGFzTm9uZU9mLmxlbmd0aCA9PSAwKSB7XG4gICAgICBjaGVjazMgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoIShjaGVjazEgJiYgY2hlY2syICYmIGNoZWNrMykpIHtcbiAgICAgIHZhbGlkID0gZmFsc2U7XG4gICAgfVxuICAgIGlmICh2YWxpZCkge1xuICAgICAgdmFyIHRyYXZlbERpc3Q6IG51bWJlciA9IE1hdGguYWJzKGxpc3RbaV0ueFBvcyAtIHgpICsgTWF0aC5hYnMobGlzdFtpXS55UG9zIC0geSk7XG4gICAgICBpZiAoKG1pbkRpc3QgPiB0cmF2ZWxEaXN0KSB8fCAobWluRGlzdCA9IC0xKSkge1xuICAgICAgICBtaW5EaXN0ID0gdHJhdmVsRGlzdDtcbiAgICAgICAgcmV0ID0gbGlzdFtpXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuLyogIHJhbmRvbWl6ZXMgb3JkZXIgYW5kIGV4ZWN1dGVzIGEgdHVybiBmb3IgZWFjaCBhZ2VudCBldmVyeSB0aWNrLlxuICAgIGFnZW50TGlzdDogbGlzdCBvZiBhZ2VudHMgaW4gdGhlIHNpbVxuICAgIGFjdGlvbkxpc3Q6IHRoZSBsaXN0IG9mIHZhbGlkIGFjdGlvbnNcbiAgICBsb2NhdGlvbkxpc3Q6IGFsbCBsb2NhdGlvbnMgaW4gdGhlIHdvcmxkXG4gICAgY29udGludWVGdW5jdGlvbjogYm9vbGVhbiBmdW5jdGlvbiB0aGF0IGlzIHVzZWQgYXMgYSBjaGVjayBhcyB0byB3aGV0aGVyIG9yIG5vdCB0byBrZWVwIHJ1bm5pbmcgdGhlIHNpbSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJ1bl9zaW0oYWdlbnRMaXN0Om5wYy5BZ2VudFtdLCBhY3Rpb25MaXN0Om5wYy5BY3Rpb25bXSwgbG9jYXRpb25MaXN0Om5wYy5Mb2NhdGlvbltdLCBjb250aW51ZUZ1bmN0aW9uOiAoKSA9PiBib29sZWFuKTp2b2lkIHtcbiAgd2hpbGUgKGNvbnRpbnVlRnVuY3Rpb24oKSkge1xuICAgIHNodWZmbGVBcnJheShhZ2VudExpc3QpO1xuICAgIHZhciBpOm51bWJlciA9IDA7XG4gICAgZm9yIChpID0gMDsgaSA8IGFnZW50TGlzdC5sZW5ndGg7IGkrKyApIHtcbiAgICAgIG5wYy50dXJuKGFnZW50TGlzdFtpXSwgYWN0aW9uTGlzdCwgbG9jYXRpb25MaXN0LCB0aW1lKTtcbiAgICB9XG4gICAgdGltZSArPSAxO1xuICB9XG4gIGNvbnNvbGUubG9nKFwiRmluaXNoZWQuXCIpO1xufVxuXG5cbiIsImltcG9ydCAqIGFzIGVuZ2luZSBmcm9tIFwiLi9leGVjdXRpb25fZW5naW5lXCI7XG5pbXBvcnQgKiBhcyBhY3Rpb25zIGZyb20gXCIuL2FjdGlvbl9zcGVjc1wiO1xuaW1wb3J0ICogYXMgbnBjIGZyb20gXCIuL2FnZW50XCI7XG5cbi8vIExpc3Qgb2YgYXZhaWxhYmxlIGFjdGlvbnMgaW4gc2ltXG52YXIgYWN0aW9uTGlzdDpucGMuQWN0aW9uW10gPSBbYWN0aW9ucy5lYXRfYWN0aW9uLCBhY3Rpb25zLm1vdmllX2FjdGlvbiwgYWN0aW9ucy5lYXRfZnJpZW5kX2FjdGlvbiwgYWN0aW9ucy5tb3ZpZV9mcmllbmRfYWN0aW9uLCBhY3Rpb25zLndvcmtfYWN0aW9uLCBhY3Rpb25zLmhvYmJ5X2FjdGlvbl07XG5cbi8vIGFnZW50c1xuXG52YXIgYWdlbnQxOm5wYy5BZ2VudCA9XG57XG4gIG5hbWU6IFwiSm9obiBEb2VcIixcbiAgbW90aXZlOiB7XG4gICAgcGh5c2ljYWw6IDEsXG4gICAgZW1vdGlvbmFsOiAxLFxuICAgIHNvY2lhbDogMSxcbiAgICBmaW5hbmNpYWw6IDEsXG4gICAgYWNjb21wbGlzaG1lbnQ6IDEsXG4gIH0sXG4gIHhQb3M6IDAsXG4gIHlQb3M6IDAsXG4gIG9jY3VwaWVkQ291bnRlcjogMCxcbiAgY3VycmVudEFjdGlvbjogYWN0aW9ucy53YWl0X2FjdGlvbixcbiAgZGVzdGluYXRpb246IG51bGxcbn07XG5cbi8vIGFnZW50c1xudmFyIGFnZW50MjpucGMuQWdlbnQgPVxue1xuICBuYW1lOiBcIkphbmUgRG9lXCIsXG4gIG1vdGl2ZToge1xuICAgIHBoeXNpY2FsOiA0LFxuICAgIGVtb3Rpb25hbDogMSxcbiAgICBzb2NpYWw6IDQsXG4gICAgZmluYW5jaWFsOiAxLFxuICAgIGFjY29tcGxpc2htZW50OiA0LFxuICB9LFxuICB4UG9zOiA1LFxuICB5UG9zOiA1LFxuICBvY2N1cGllZENvdW50ZXI6IDAsXG4gIGN1cnJlbnRBY3Rpb246IGFjdGlvbnMud2FpdF9hY3Rpb24sXG4gIGRlc3RpbmF0aW9uOiBudWxsXG59O1xuXG4vLyBMaXN0IG9mIGFnZW50cyBpbiBzaW1cbnZhciBhZ2VudExpc3Q6bnBjLkFnZW50W10gPSBbYWdlbnQxLCBhZ2VudDJdO1xuXG4vLyBMb2NhdGlvbnNcbi8vIExvY2F0aW9ucyBhcmUgYSBwb3NpdGlvbiwgYSBuYW1lLCBhbmQgYSBsaXN0IG9mIHRhZ3NcbnZhciByZXN0YXVyYW50Om5wYy5Mb2NhdGlvbiA9IHtuYW1lOiBcInJlc3RhdXJhbnRcIiwgeFBvczogNSwgeVBvczogNSwgdGFnczogW1wicmVzdGF1cmFudFwiLCBcImVtcGxveW1lbnRcIl19XG5cbnZhciBtb3ZpZV90aGVhdHJlOm5wYy5Mb2NhdGlvbiA9IHtuYW1lOiBcIm1vdmllIHRoZWF0cmVcIiwgeFBvczogMCwgeVBvczogNSwgdGFnczogW1wibW92aWUgdGhlYXRyZVwiLCBcImVtcGxveW1lbnRcIl19XG5cbnZhciBob21lOm5wYy5Mb2NhdGlvbiA9IHtuYW1lOiBcImhvbWVcIiwgeFBvczogNSwgeVBvczogMCwgdGFnczogW1wiaG9tZVwiXX1cblxuLy9sb2NhdGlvbiBMaXN0XG52YXIgbG9jYXRpb25MaXN0Om5wYy5Mb2NhdGlvbltdID0gW3Jlc3RhdXJhbnQsIG1vdmllX3RoZWF0cmUsIGhvbWVdO1xuXG4vLyBjb25kaXRpb24gZnVuY3Rpb24uXG4vLyBTdG9wcyB0aGUgc2ltIHdoZW4gYWxsIGFnZW50cyBhcmUgYXQgZnVsbCBtZXRlcnNcbmZ1bmN0aW9uIGNvbmRpdGlvbigpOmJvb2xlYW4ge1xuICB2YXIgY2hlY2s6Ym9vbGVhbiA9IGZhbHNlO1xuICB2YXIgaTpudW1iZXIgPSAwO1xuICAvLyBjaGVjayB0aGUgbWV0ZXIgbGV2ZWxzIGZvciBlYWNoIGFnZW50IGluIHRoZSBzaW1cbiAgZm9yIChpID0gMDsgaTwgYWdlbnRMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGFnZW50TGlzdFtpXS5tb3RpdmUucGh5c2ljYWwgPCBlbmdpbmUuTUFYX01FVEVSKSB7XG4gICAgICBjaGVjayA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKGFnZW50TGlzdFtpXS5tb3RpdmUuZW1vdGlvbmFsIDwgZW5naW5lLk1BWF9NRVRFUikge1xuICAgICAgY2hlY2sgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmIChhZ2VudExpc3RbaV0ubW90aXZlLnNvY2lhbCA8IGVuZ2luZS5NQVhfTUVURVIpIHtcbiAgICAgIGNoZWNrID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAoYWdlbnRMaXN0W2ldLm1vdGl2ZS5maW5hbmNpYWwgPCBlbmdpbmUuTUFYX01FVEVSKSB7XG4gICAgICBjaGVjayA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKGFnZW50TGlzdFtpXS5tb3RpdmUuYWNjb21wbGlzaG1lbnQgPCBlbmdpbmUuTUFYX01FVEVSKSB7XG4gICAgICBjaGVjayA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNoZWNrO1xufVxuXG5lbmdpbmUucnVuX3NpbShhZ2VudExpc3QsIGFjdGlvbkxpc3QsIGxvY2F0aW9uTGlzdCwgY29uZGl0aW9uKTtcblxuLy8gRGlzcGxheXMgdGV4dCBvbiB0aGUgYnJvd3Nlcj8gSSBhc3N1bWVcbmZ1bmN0aW9uIHNob3dPbkJyb3dzZXIoZGl2TmFtZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcbiAgY29uc3QgZWx0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGl2TmFtZSk7XG4gIGVsdC5pbm5lclRleHQgPSBuYW1lICsgXCJIZWxsbyBXb3JsZCFcIjtcbn1cblxuc2hvd09uQnJvd3NlcihcImdyZWV0aW5nXCIsIFwiVHlwZVNjcmlwdFwiKTtcbiJdfQ==
