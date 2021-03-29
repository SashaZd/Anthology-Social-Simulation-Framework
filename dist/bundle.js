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
// const getKeyValue = <U extends keyof T, T extends object>(key: U) => (obj: T) =>
//   obj[key];
function isContent(agent) {
    for (var motiveType in motiveTypes) {
        // const getUserName = getKeyValue<keyof Motive, Motive>(motiveType)(agent.motive);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWN0aW9uX3NwZWNzLnRzIiwic3JjL2FnZW50LnRzIiwic3JjL2V4ZWN1dGlvbl9lbmdpbmUudHMiLCJzcmMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztBQ1dBLDZCQUE2QjtBQUM3QixpR0FBaUc7QUFDakcsb0ZBQW9GO0FBRXBGLDREQUE0RDtBQUNqRCxRQUFBLFdBQVcsR0FDdEI7SUFDRSxJQUFJLEVBQUUsYUFBYTtJQUNuQixZQUFZLEVBQUUsRUFBRTtJQUNoQixPQUFPLEVBQUUsRUFBRTtJQUNYLFFBQVEsRUFBRSxDQUFDO0NBQ1osQ0FBQTtBQUVELHVFQUF1RTtBQUN2RSwrQ0FBK0M7QUFDcEMsUUFBQSxhQUFhLEdBQ3hCO0lBQ0UsSUFBSSxFQUFFLGVBQWU7SUFDckIsWUFBWSxFQUFFLEVBQUU7SUFDaEIsT0FBTyxFQUFFLEVBQUU7SUFDWCxRQUFRLEVBQUUsQ0FBQztDQUNaLENBQUE7QUFDRCxNQUFNO0FBRU4saURBQWlEO0FBQ2pELHNEQUFzRDtBQUN0RCwwREFBMEQ7QUFDL0MsUUFBQSxVQUFVLEdBQ3JCO0lBQ0UsSUFBSSxFQUFFLFlBQVk7SUFDbEIsWUFBWSxFQUFFLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLFlBQVksQ0FBQyxFQUFFLGNBQWMsRUFBQyxFQUFFLEVBQUUsU0FBUyxFQUFDLEVBQUUsRUFBQyxFQUFDLENBQUM7SUFDeEYsT0FBTyxFQUFPLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxDQUFDLEVBQUMsQ0FBQztJQUNuQyxRQUFRLEVBQU0sRUFBRTtDQUNqQixDQUFDO0FBRUYscURBQXFEO0FBQzFDLFFBQUEsWUFBWSxHQUN2QjtJQUNFLElBQUksRUFBRSxjQUFjO0lBQ3BCLFlBQVksRUFBRSxDQUFDLEVBQUMsSUFBSSxFQUFD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QUFDO0FBQ3hDLENBQUM7QUFFRCxhQUFhLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IHsgTW90aXZlIH0gZnJvbSBcIi4vYWdlbnRcIjtcbmltcG9ydCB7IEJpbk9wIH0gZnJvbSBcIi4vYWdlbnRcIjtcbmltcG9ydCB7IFJlcVR5cGUgfSBmcm9tIFwiLi9hZ2VudFwiO1xuaW1wb3J0IHsgTW90aXZlUmVxIH0gZnJvbSBcIi4vYWdlbnRcIjtcbmltcG9ydCB7IFBlb3BsZVJlcSB9IGZyb20gXCIuL2FnZW50XCI7XG5pbXBvcnQgeyBMb2NhdGlvblJlcSB9IGZyb20gXCIuL2FnZW50XCI7XG5pbXBvcnQgeyBSZXF1aXJlbWVudCB9IGZyb20gXCIuL2FnZW50XCI7XG5pbXBvcnQgeyBFZmZlY3QgfSBmcm9tIFwiLi9hZ2VudFwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4vYWdlbnRcIjtcbmltcG9ydCB7IEFnZW50IH0gZnJvbSBcIi4vYWdlbnRcIjtcblxuLy8gREVGQVVMVCBBQ1RJT05TIC0gUkVRVUlSRURcbi8vIFRoZSBmb2xsb3dpbmcgYWN0aW9ucyBhcmUgcmVxdWlyZWQgZm9yIHRoZSBjdXJyZW50IHN0cnVjdHVyZSBvZiB0aGUgZXhlY3V0aW9uIGV4ZWN1dGlvbl9lbmdpbmVcbi8vV2hlbiBtb2RpZnlpbmcgdGhpcyBmaWxlIGZvciBtb3JlIHRlc3Qgc2NlbmFyaW9zLCBETyBOT1QgQ0hBTkdFIFRIRVNFIGFjdGlvbl9zcGVjc1xuXG4vLyBUaGUgd2FpdCBhY3Rpb24gaXMgdXNlZCB3aGVuIGFuIGFnZW50IGhhcyBtYXhpbWFsIG1vdGl2ZXNcbmV4cG9ydCB2YXIgd2FpdF9hY3Rpb24gOiBBY3Rpb24gPVxue1xuICBuYW1lOiBcIndhaXRfYWN0aW9uXCIsXG4gIHJlcXVpcmVtZW50czogW10sXG4gIGVmZmVjdHM6IFtdLFxuICB0aW1lX21pbjogMFxufVxuXG4vLyBUaGUgdHJhdmVsIGFjdGlvbiBpcyB1c2VkIHdoZW4gYW4gYWdlbnQgaXMgdHJhdmVsbGluZyB0byBhIGxvY2F0aW9uLlxuLy8gVGhlIHRpbWUgaXMgaGFuZGRsZXMgYnkgdGhlIGV4ZWN1dGlvbiBlbmdpbmVcbmV4cG9ydCB2YXIgdHJhdmVsX2FjdGlvbiA6IEFjdGlvbiA9XG57XG4gIG5hbWU6IFwidHJhdmVsX2FjdGlvblwiLFxuICByZXF1aXJlbWVudHM6IFtdLFxuICBlZmZlY3RzOiBbXSxcbiAgdGltZV9taW46IDBcbn1cbi8vIEVORFxuXG4vLyBGaWxscyBwaHlzaWNhbCwgcmVxdWlyZXMgYSByZXN0YXVyYW50IGxvY2F0aW9uXG4vLyBEaXNjdXNzOiByZXBsYWNlIHR5cGU6MCB3aXRoIHR5cGU6UmVxVHlwZS5sb2NhdGlvbiBcbi8vIERpc2N1c3M6IHJlcGxhY2UgZWZmZWN0J3MgbW90aXZlOjAgd2l0aCBNb3RpdmUucGh5c2ljYWxcbmV4cG9ydCB2YXIgZWF0X2FjdGlvbiA6IEFjdGlvbiA9XG57XG4gIG5hbWU6IFwiZWF0X2FjdGlvblwiLFxuICByZXF1aXJlbWVudHM6IFt7dHlwZTowLCByZXE6e2hhc0FsbE9mOltcInJlc3RhdXJhbnRcIl0sIGhhc09uZU9yTW9yZU9mOltdLCBoYXNOb25lT2Y6W119fV0sXG4gIGVmZmVjdHM6ICAgICAgW3ttb3RpdmU6MCwgZGVsdGE6Mn1dLFxuICB0aW1lX21pbjogICAgIDYwXG59O1xuXG4vLyBGaWxscyBlbW90aW9uYWwsIHJlcXVpcmVzIGEgbW92aWUgdGhlYXRyZSBsb2NhdGlvblxuZXhwb3J0IHZhciBtb3ZpZV9hY3Rpb24gOiBBY3Rpb24gPVxue1xuICBuYW1lOiBcIm1vdmllX2FjdGlvblwiLFxuICByZXF1aXJlbWVudHM6IFt7dHlwZTowLCByZXE6e2hhc0FsbE9mOltcIm1vdmllIHRoZWF0cmVcIl0sIGhhc09uZU9yTW9yZU9mOltdLCBoYXNOb25lT2Y6W119fV0sXG4gIGVmZmVjdHM6ICAgICAgW3ttb3RpdmU6MSwgZGVsdGE6M31dLFxuICB0aW1lX21pbjogICAgIDEyMFxufTtcblxuLy8gRmlsbHMgcGh5c2ljYWwgYW5kIHNvY2lhbCwgcmVxdWlyZXMgYSByZXN0YXVyYW50IGxvY2F0aW9uIGFuZCBhbiBhZGRpdGlvbmFsIHBlcnNvblxuZXhwb3J0IHZhciBlYXRfZnJpZW5kX2FjdGlvbiA6IEFjdGlvbiA9XG57XG4gIG5hbWU6IFwiZWF0X2ZyaWVuZF9hY3Rpb25cIixcbiAgcmVxdWlyZW1lbnRzOiBbe3R5cGU6MCwgcmVxOntoYXNBbGxPZjpbXCJyZXN0YXVyYW50XCJdLCBoYXNPbmVPck1vcmVPZjpbXSwgaGFzTm9uZU9mOltdfX0sXG4gICAgICAgICAgICAgICAge3R5cGU6MSwgcmVxOnttaW5OdW1QZW9wbGU6MiwgbWF4TnVtUGVvcGxlOi0xLCBzcGVjaWZpY1Blb3BsZVByZXNlbnQ6W10sIHNwZWNpZmljUGVvcGxlQWJzZW50OltdLCByZWxhdGlvbnNoaXBzUHJlc2VudDpbXSwgcmVsYXRpb25zaGlwc0Fic2VudDpbXX19XSxcbiAgZWZmZWN0czogICAgICBbe21vdGl2ZTowLCBkZWx0YToyfSwge21vdGl2ZToyLCBkZWx0YToyfV0sXG4gIHRpbWVfbWluOiAgICAgNzBcbn07XG5cbi8vIEZpbGxzIGVtb3Rpb25hbCBhbmQgc29jaWFsLCByZXF1aXJlcyBhIG1vdmllIHRoZWF0cmUgbG9jYXRpb24gYW5kIGFuIGFkZGl0aW9uYWwgcGVyc29uXG5leHBvcnQgdmFyIG1vdmllX2ZyaWVuZF9hY3Rpb24gOiBBY3Rpb24gPVxue1xuICBuYW1lOiBcIm1vdmllX2ZyaWVuZF9hY3Rpb25cIixcbiAgcmVxdWlyZW1lbnRzOiBbe3R5cGU6MCwgcmVxOntoYXNBbGxPZjpbXCJtb3ZpZSB0aGVhdHJlXCJdLCBoYXNPbmVPck1vcmVPZjpbXSwgaGFzTm9uZU9mOltdfX0sXG4gICAgICAgICAgICAgICAge3R5cGU6MSwgcmVxOnttaW5OdW1QZW9wbGU6MiwgbWF4TnVtUGVvcGxlOi0xLCBzcGVjaWZpY1Blb3BsZVByZXNlbnQ6W10sIHNwZWNpZmljUGVvcGxlQWJzZW50OltdLCByZWxhdGlvbnNoaXBzUHJlc2VudDpbXSwgcmVsYXRpb25zaGlwc0Fic2VudDpbXX19XSxcbiAgZWZmZWN0czogICAgICBbe21vdGl2ZToxLCBkZWx0YTozfSwge21vdGl2ZToyLCBkZWx0YToyfV0sXG4gIHRpbWVfbWluOiAgICAgMTMwXG59O1xuXG4vLyBGaWxscyBmaW5hbmNpYWwsIHJlcXVpcmVzIGEgbW92aWUgdGhlYXRyZSBsb2NhdGlvblxuZXhwb3J0IHZhciB3b3JrX2FjdGlvbiA6IEFjdGlvbiA9XG57XG4gIG5hbWU6IFwid29ya19hY3Rpb25cIixcbiAgcmVxdWlyZW1lbnRzOiBbe3R5cGU6MCwgcmVxOntoYXNBbGxPZjpbXCJlbXBsb3ltZW50XCJdLCBoYXNPbmVPck1vcmVPZjpbXSwgaGFzTm9uZU9mOltdfX1dLFxuICBlZmZlY3RzOiAgICAgIFt7bW90aXZlOjMsIGRlbHRhOjF9XSxcbiAgdGltZV9taW46ICAgICAyNDBcbn07XG5cbi8vIEZpbGxzIGFjY29tcGxpc2htZW50LCByZXF1aXJlcyBhIGhvbWUgbG9jYXRpb25cbmV4cG9ydCB2YXIgaG9iYnlfYWN0aW9uIDogQWN0aW9uID1cbntcbiAgbmFtZTogXCJob2JieV9hY3Rpb25cIixcbiAgcmVxdWlyZW1lbnRzOiBbe3R5cGU6MCwgcmVxOntoYXNBbGxPZjpbXCJob21lXCJdLCBoYXNPbmVPck1vcmVPZjpbXSwgaGFzTm9uZU9mOltdfX1dLFxuICBlZmZlY3RzOiAgICAgIFt7bW90aXZlOjQsIGRlbHRhOjJ9XSxcbiAgdGltZV9taW46ICAgICA2MFxufTtcbiIsImltcG9ydCAqIGFzIGV4ZWMgZnJvbSBcIi4vZXhlY3V0aW9uX2VuZ2luZVwiO1xuaW1wb3J0IHt3YWl0X2FjdGlvbn0gZnJvbSBcIi4vYWN0aW9uX3NwZWNzXCI7XG5pbXBvcnQge3RyYXZlbF9hY3Rpb259IGZyb20gXCIuL2FjdGlvbl9zcGVjc1wiO1xuLy8gRml2ZSBtb3RpdmUgdHlwZXNcbi8vIERpc2N1c3M6IFRoaXMgaXMgYW4gZW51bSwgYnV0IHdlIGRvbid0IHVzZSBpdC4gV2UgcGFzcyAwLDEsMiBpbnRvIHRoZSBhY3Rpb24gc3BlY3MgZmlsZS4gXG4vLyBEaXNjdXNzOiBXaGlsZSB0aGlzIGNhbiBiZSBhbiBlbnVtIC0tIHJlbmFtZWQgdG8gTW90aXZlVHlwZSB8IENoYW5nZTogZGVjbGFyZSBhIHVuaW9uIHR5cGUgZm9yIE1vdGl2ZSBcbmV4cG9ydCBlbnVtIE1vdGl2ZVR5cGUge1xuXHRwaHlzaWNhbCxcblx0ZW1vdGlvbmFsLFxuXHRzb2NpYWwsXG5cdGZpbmFuY2lhbCxcblx0YWNjb21wbGlzaG1lbnRcbn1cblxuLy8gVGhpcyBpcyBtb3JlIG9mIGEgbmVlZCBhbmQgbGVzcyBvZiBhIG1vdGl2ZSBzaW5jZSBpdCdzIGEgc2V0IG9mIHRoZW0gYWxsXG5leHBvcnQgaW50ZXJmYWNlIE1vdGl2ZSB7XG5cdHBoeXNpY2FsOiBudW1iZXI7XG5cdGVtb3Rpb25hbDogbnVtYmVyO1xuXHRzb2NpYWw6IG51bWJlcjtcblx0ZmluYW5jaWFsOiBudW1iZXI7XG5cdGFjY29tcGxpc2htZW50OiBudW1iZXI7XG5cdFtrZXk6IHN0cmluZ106IG51bWJlcjtcdFx0Ly8gbGV0cyB1cyBsb29rdXAgYSB2YWx1ZSBieSBhIHN0cmluZyBrZXlcbn1cblxuLy8gY29udmVuaWVudCBsaXN0IG9mIGtleXMgb2YgdGhlIG1vdGl2ZSB0eXBlcyB3ZSBoYXZlIHdoaWNoIHdlIGNhbiBpdGVyYXRlIHRocm91Z2hcbmNvbnN0IG1vdGl2ZVR5cGVzOiBzdHJpbmdbXSA9IE9iamVjdC5rZXlzKE1vdGl2ZVR5cGUpLmZpbHRlcihrID0+IHR5cGVvZiBNb3RpdmVUeXBlW2sgYXMgYW55XSA9PT0gXCJudW1iZXJcIik7XG5cbi8vIEJpbmFyeSBPcGVyYXRpb25zIHVzZWQgcHJpbWFyaWx5IGluIHJlcXVpcmVtZW50c1xuZXhwb3J0IGVudW0gQmluT3Age1xuXHRlcXVhbHMsXG5cdGdyZWF0ZXJfdGhhbixcblx0bGVzc190aGFuLFxuXHRnZXEsXG5cdGxlcVxufVxuXG4vLyBUaHJlZSB0eXBlcyBvZiByZXF1aXJlbWVudHNcbi8vIERpc2N1c3M6IFRoaXMgaXMgYW4gZW51bSwgYnV0IHdlIGRvbid0IHVzZSBpdC4gV2UgcGFzcyAwLDEsMiBpbnRvIHRoZSBhY3Rpb24gc3BlY3MgZmlsZS4gXG5leHBvcnQgZW51bSBSZXFUeXBlIHtcblx0bG9jYXRpb24sXG5cdHBlb3BsZSxcblx0bW90aXZlXG59XG5cbi8vIFJlcXVpcmVtZW50cyBvbiB0aGUgdHlwZSBvZiBsb2NhdGlvbiB0aGUgYWN0aW9uIHRha2VzIHBsYWNlIGluLlxuLy8gQmFzZWQgb24gYSB0YWdzIHN5c3RlbSBmb3IgbG9jYXRpb25zLlxuLy8gZWc6IG11c3QgYmUgYXQgYSByZXN0YXVyYW50XG5leHBvcnQgaW50ZXJmYWNlIExvY2F0aW9uUmVxIHtcblx0aGFzQWxsT2Y6IHN0cmluZ1tdLFxuXHRoYXNPbmVPck1vcmVPZjogc3RyaW5nW10sXG5cdGhhc05vbmVPZjogc3RyaW5nW11cbn1cblxuLy8gUmVxdWlyZW1lbnRzIG9uIHdobyBpcyBwcmVzZW50IGZvciBhbiBhY3Rpb24uXG4vLyBlZzogbXVzdCBiZSB3aXRoIGEgc2VwY2lmaWMgcGVyc29uXG5leHBvcnQgaW50ZXJmYWNlIFBlb3BsZVJlcSB7XG5cdG1pbk51bVBlb3BsZTogbnVtYmVyLFxuXHRtYXhOdW1QZW9wbGU6IG51bWJlcixcblx0c3BlY2lmaWNQZW9wbGVQcmVzZW50OiBzdHJpbmdbXSxcblx0c3BlY2lmaWNQZW9wbGVBYnNlbnQ6IHN0cmluZ1tdLFxuXHRyZWxhdGlvbnNoaXBzUHJlc2VudDogc3RyaW5nW10sXG5cdHJlbGF0aW9uc2hpcHNBYnNlbnQ6IHN0cmluZ1tdXG59XG5cbi8vIFJlcXVpcmVtZW50cyBvbiB0aGUgZXhlY3V0aW5nIGFnZW4ndCBjdXJyZW50IG1vdGl2ZSBzY29yZXMuXG4vLyBlZzogZWcgbXVzdCBoYXZlIG1vbmV5IChmaW5hbmNpYWwgbW90aXZlID4gMCkgdG8gZG8gdGhpc1xuLy8gRGlzY3VzczogVGhpcyBzaG91bGQgYmUgdXNpbmcgdGhlIGludGVyZmFjZSBhbmQgbm90IGFuIGVudW1cbmV4cG9ydCBpbnRlcmZhY2UgTW90aXZlUmVxIHtcblx0bW90aXZlOiBNb3RpdmVUeXBlLFxuXHRvcDogICAgIEJpbk9wLFxuXHR0aHJlc2g6IG51bWJlclxufVxuXG4vLyBHZW5lcmFsIHJlcXVpcmVtZW50IHR5cGUuXG4vLyBlZzogYW55IG9mIHRoZSBhYm92ZSB0aHJlZVxuZXhwb3J0IGludGVyZmFjZSBSZXF1aXJlbWVudCB7XG5cdHR5cGU6IFJlcVR5cGUsXG5cdHJlcTogTG9jYXRpb25SZXEgfCBQZW9wbGVSZXEgfCBNb3RpdmVSZXFcbn1cblxuLy8gQWN0aW9uIGVmZmVjdCB0eXBlLlxuLy8gZWc6IHNsZWVwIGluY3JlYXNlcyB0aGUgcGh5c2ljYWwgbW90aXZlXG5leHBvcnQgaW50ZXJmYWNlIEVmZmVjdCB7XG5cdG1vdGl2ZTogTW90aXZlVHlwZSxcblx0ZGVsdGE6IG51bWJlclxufVxuXG4vLyBHZW5lcmFsIGFjdGlvbiB0eXBlLlxuLy8gTmFtZSwgcmVxdWlyZW1udHMsIGVmZmVjdHMsIGFuZCBtaW5pbXVtIHRpbWUgdGFrZW4uXG4vLyBlZzogc2xlZXBcbmV4cG9ydCBpbnRlcmZhY2UgQWN0aW9uIHtcblx0bmFtZTogc3RyaW5nLFxuXHRyZXF1aXJlbWVudHM6IFJlcXVpcmVtZW50W10sXG5cdGVmZmVjdHM6ICAgICAgRWZmZWN0W10sXG5cdHRpbWVfbWluOiAgICAgbnVtYmVyXG59XG5cblxuXG4vL0dlbmVyYWwgYWdlbnQgdHlwZS5cbi8vIE5hbWUgYW5kIEN1cnJlbnQgTW90aXZlIFNjb3Jlcy5cbi8vIGVnOiBhbnkgbnBjIGNoYXJhY3RlclxuZXhwb3J0IGludGVyZmFjZSBBZ2VudCB7XG5cdC8vIEFnZW50IFByb3BlcnRpZXNcblx0bmFtZTogc3RyaW5nLFxuXHRtb3RpdmU6IE1vdGl2ZSxcblx0eFBvczogbnVtYmVyLFxuXHR5UG9zOiBudW1iZXIsXG5cdG9jY3VwaWVkQ291bnRlcjogbnVtYmVyLFxuXHRjdXJyZW50QWN0aW9uOiBBY3Rpb24sXG5cdGRlc3RpbmF0aW9uOiBMb2NhdGlvblxufVxuXG4vLyBMb2NhdGlvbnMgYXJlIGEgcG9zaXRpb24sIGEgbmFtZSwgYW5kIGEgbGlzdCBvZiB0YWdzXG4vLyBlZzogYSBzcGVjaWZpYyByZXN0YXVyYW50XG4vLyBEaXNjdXNzOiBUaGVyZSBzaG91bGQgYmUgYSBwb2ludCBJbnRlcmZhY2Ugc2luY2Ugc29tZSBsb2NhdGlvbnMgYXJlIG5vdCBuYW1lZC4gXG5leHBvcnQgaW50ZXJmYWNlIExvY2F0aW9uIHtcblx0bmFtZTogc3RyaW5nLFxuXHR4UG9zOiBudW1iZXIsXG5cdHlQb3M6IG51bWJlcixcblx0dGFnczogc3RyaW5nW11cbn1cblxuLyogIENoZWNrcyB0byBzZWUgaWYgYW4gYWdlbnQgaGFzIG1heGltdW0gbW90aXZlc1xuXHRcdGFnZW50OiB0aGUgYWdlbnQgYmVpbmcgdGVzdGVkXG5cdFx0cmV0dXJuOiBhIGJvb2xlYW4gYW5zd2VyaW5nIHRoZSBxdWVzdGlvbiAqL1xuXG5cbi8vIGNvbnN0IGdldEtleVZhbHVlID0gPFUgZXh0ZW5kcyBrZXlvZiBULCBUIGV4dGVuZHMgb2JqZWN0PihrZXk6IFUpID0+IChvYmo6IFQpID0+XG4vLyAgIG9ialtrZXldO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNDb250ZW50KGFnZW50OkFnZW50KTpib29sZWFuIHtcblx0Zm9yKGxldCBtb3RpdmVUeXBlIGluIG1vdGl2ZVR5cGVzKXtcblx0XHQvLyBjb25zdCBnZXRVc2VyTmFtZSA9IGdldEtleVZhbHVlPGtleW9mIE1vdGl2ZSwgTW90aXZlPihtb3RpdmVUeXBlKShhZ2VudC5tb3RpdmUpO1xuXHRcdGlmKGFnZW50Lm1vdGl2ZVttb3RpdmVUeXBlXSAhPSBleGVjLk1BWF9NRVRFUil7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0cnVlO1xufVxuXG5cbi8qICBTZWxlY3RzIGFuIGFjdGlvbiBmcm9tIGEgbGlzdCBvZiB2YWxpZCBhY3Rpb25zIHRvIGJlIHByZWZvcm1lZCBieSBhIHNwZWNpZmljIGFnZW50LlxuXHRcdENob3NlcyB0aGUgYWN0aW9uIHdpdGggdGhlIG1heGltYWwgdXRpbGl0eSBvZiB0aGUgYWdlbnQgKG1vdGl2ZSBpbmNyZWFzZS90aW1lKS5cblx0XHRhZ2VudDogdGhlIGFnZW50IGluIHF1ZXN0aW9uXG5cdFx0YWN0aW9uTGlzdDogdGhlIGxpc3Qgb2YgdmFsaWQgYWN0aW9uc1xuXHRcdGxvY2F0aW9uTGlzdDogYWxsIGxvY2F0aW9ucyBpbiB0aGUgd29ybGRcblx0XHRyZXR1cm46IFRoZSBzaW5nbGUgYWN0aW9uIGNob3NlbiBmcm9tIHRoZSBsaXN0ICovXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0X2FjdGlvbihhZ2VudDpBZ2VudCwgYWN0aW9uTGlzdDpBY3Rpb25bXSwgbG9jYXRpb25MaXN0OkxvY2F0aW9uW10pOkFjdGlvbiB7XG5cdC8vIGluaXRpYWxpemVkIHRvIDAgKG5vIHJlYXNvbiB0byBkbyBhbiBhY3Rpb24gaWYgaXQgd2lsbCBoYXJtIHlvdSlcblx0dmFyIG1heERlbHRhVXRpbGl0eTpudW1iZXIgPSAwO1xuXHQvLyBpbml0aWFsaXplZCB0byB0aGUgaW5hY3Rpb25cblx0dmFyIGN1cnJlbnRDaG9pY2U6QWN0aW9uID0gd2FpdF9hY3Rpb247XG5cdC8vIEZpbmRzIHRoZSB1dGlsaXR5IGZvciBlYWNoIGFjdGlvbiB0byB0aGUgZ2l2ZW4gYWdlbnRcblx0dmFyIGk6bnVtYmVyID0gMDtcblx0Zm9yIChpID0gMDsgaTxhY3Rpb25MaXN0Lmxlbmd0aDsgaSsrKXtcblx0XHR2YXIgZGVzdDpMb2NhdGlvbiA9IG51bGw7XG5cdFx0dmFyIHRyYXZlbFRpbWU6bnVtYmVyID0gMDtcblx0XHR2YXIgY2hlY2s6Ym9vbGVhbiA9IHRydWU7XG5cdFx0dmFyIGs6bnVtYmVyID0gMDtcblx0XHRmb3IgKGsgPSAwOyBrPGFjdGlvbkxpc3RbaV0ucmVxdWlyZW1lbnRzLmxlbmd0aDsgaysrKSB7XG5cdFx0XHRpZiAoYWN0aW9uTGlzdFtpXS5yZXF1aXJlbWVudHNba10udHlwZSA9PSAwKXtcblx0XHRcdFx0dmFyIHJlcXVpcmVtZW50OkxvY2F0aW9uUmVxID0gYWN0aW9uTGlzdFtpXS5yZXF1aXJlbWVudHNba10ucmVxIGFzIExvY2F0aW9uUmVxO1xuXHRcdFx0XHRkZXN0ID0gZXhlYy5nZXROZWFyZXN0TG9jYXRpb24ocmVxdWlyZW1lbnQsIGxvY2F0aW9uTGlzdCwgYWdlbnQueFBvcywgYWdlbnQueVBvcyk7XG5cdFx0XHRcdGlmIChkZXN0ID09IG51bGwpIHtcblx0XHRcdFx0XHRjaGVjayA9IGZhbHNlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRyYXZlbFRpbWUgPSBNYXRoLmFicyhkZXN0LnhQb3MgLSBhZ2VudC54UG9zKSArIE1hdGguYWJzKGRlc3QueVBvcyAtIGFnZW50LnlQb3MpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIGlmIGFuIGFjdGlvbiBoYXMgc2F0aXNmaWFibGUgcmVxdWlyZW1lbnRzXG5cdFx0aWYgKGNoZWNrKSB7XG5cdFx0XHR2YXIgZGVsdGFVdGlsaXR5Om51bWJlciA9IDA7XG5cdFx0XHR2YXIgajpudW1iZXIgPSAwO1xuXG5cdFx0XHRmb3IgKGo9MDsgajxhY3Rpb25MaXN0W2ldLmVmZmVjdHMubGVuZ3RoOyBqKyspe1xuXHRcdFx0XHR2YXIgX2RlbHRhID0gYWN0aW9uTGlzdFtpXS5lZmZlY3RzW2pdLmRlbHRhO1xuXHRcdFx0XHR2YXIgX21vdGl2ZXR5cGUgPSBNb3RpdmVUeXBlW2FjdGlvbkxpc3RbaV0uZWZmZWN0c1tqXS5tb3RpdmVdO1xuXHRcdFx0ICAgZGVsdGFVdGlsaXR5ICs9IGV4ZWMuY2xhbXAoX2RlbHRhICsgYWdlbnQubW90aXZlW19tb3RpdmV0eXBlXSwgZXhlYy5NQVhfTUVURVIsIGV4ZWMuTUlOX01FVEVSKSAtIGFnZW50Lm1vdGl2ZVtfbW90aXZldHlwZV07XG5cdFx0XHR9XG5cblx0XHRcdC8vIGFkanVzdCBmb3IgdGltZSAoaW5jbHVkaW5nIHRyYXZlbCB0aW1lKVxuXHRcdFx0ZGVsdGFVdGlsaXR5ID0gZGVsdGFVdGlsaXR5LyhhY3Rpb25MaXN0W2ldLnRpbWVfbWluICsgdHJhdmVsVGltZSk7XG5cdFx0XHQvLy8gdXBkYXRlIGNob2ljZSBpZiBuZXcgdXRpbGl0eSBpcyBtYXhpbXVtIHNlZW4gc28gZmFyXG5cdFx0XHRpZiAoZGVsdGFVdGlsaXR5ID4gbWF4RGVsdGFVdGlsaXR5KSB7XG5cdFx0XHRcdG1heERlbHRhVXRpbGl0eSA9IGRlbHRhVXRpbGl0eTtcblx0XHRcdFx0Y3VycmVudENob2ljZSA9IGFjdGlvbkxpc3RbaV07XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBjdXJyZW50Q2hvaWNlO1xufVxuXG4vKiAgYXBwbGllcyB0aGUgZWZmZWN0cyBvZiBhbiBhY3Rpb24gdG8gYW4gYWdlbnQuXG5cdFx0YWdlbnQ6IHRoZSBhZ2VudCBpbiBxdWVzdGlvblxuXHRcdGFjdGlvbjogdGhlIGFjdGlvbiBpbiBxdWVzdGlvbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4ZWN1dGVfYWN0aW9uKGFnZW50OkFnZW50LCBhY3Rpb246QWN0aW9uKTp2b2lkIHtcblx0dmFyIGk6bnVtYmVyID0gMDtcblx0Ly8gYXBwbHkgZWFjaCBlZmZlY3Qgb2YgdGhlIGFjdGlvbiBieSB1cGRhdGluZyB0aGUgYWdlbnQncyBtb3RpdmVzXG5cblx0Zm9yIChpPTA7IGk8YWN0aW9uLmVmZmVjdHMubGVuZ3RoOyBpKyspe1xuXHRcdHZhciBfZGVsdGEgPSBhY3Rpb24uZWZmZWN0c1tpXS5kZWx0YTtcblx0XHR2YXIgX21vdGl2ZXR5cGUgPSBNb3RpdmVUeXBlW2FjdGlvbi5lZmZlY3RzW2ldLm1vdGl2ZV07XG5cdCAgIGFnZW50Lm1vdGl2ZVtfbW90aXZldHlwZV0gPSBleGVjLmNsYW1wKGFnZW50Lm1vdGl2ZVtfbW90aXZldHlwZV0gKyBfZGVsdGEsIGV4ZWMuTUFYX01FVEVSLCBleGVjLk1JTl9NRVRFUik7XG5cdH1cbn1cblxuLyogIHVwZGF0ZXMgbW92ZW1lbnQgYW5kIG9jY3VwYXRpb24gY291bnRlcnMgZm9yIGFuIGFnZW50LiBjaG9vc2VzIGFuZCBleGVjdXRlcyBhIG5ldyBhY3Rpb24gaWYgbmVjZXNzYXJ5IFxuXHRcdGFnZW50OiBhZ2VudCBleGVjdXRpbmcgYSB0dXJuXG5cdFx0YWN0aW9uTGlzdDogdGhlIGxpc3Qgb2YgdmFsaWQgYWN0aW9uc1xuXHRcdGxvY2F0aW9uTGlzdDogYWxsIGxvY2F0aW9ucyBpbiB0aGUgd29ybGRcblx0XHR0aW1lOiBjdXJyZW50IHRpY2sgdGltZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHR1cm4oYWdlbnQ6QWdlbnQsIGFjdGlvbkxpc3Q6QWN0aW9uW10sIGxvY2F0aW9uTGlzdDpMb2NhdGlvbltdLCB0aW1lOm51bWJlcik6dm9pZCB7XG5cdGlmICh0aW1lJTYwMCA9PSAwKSB7XG5cdFx0aWYgKCFpc0NvbnRlbnQoYWdlbnQpKSB7XG5cdFx0XHRmb3IobGV0IG1vdGl2ZVR5cGUgaW4gbW90aXZlVHlwZXMpIHtcblx0XHRcdFx0YWdlbnQubW90aXZlW21vdGl2ZVR5cGVdID0gZXhlYy5jbGFtcChhZ2VudC5tb3RpdmVbbW90aXZlVHlwZV0gLSAxLCBleGVjLk1BWF9NRVRFUiwgZXhlYy5NSU5fTUVURVIpO1xuXHRcdFx0fVx0XG5cdFx0fVxuXHR9XG5cdGlmIChhZ2VudC5vY2N1cGllZENvdW50ZXIgPiAwKSB7XG5cdFx0YWdlbnQub2NjdXBpZWRDb3VudGVyLS07XG5cdH0gZWxzZSB7XG5cdFx0aWYgKCFpc0NvbnRlbnQoYWdlbnQpKSB7XG5cdFx0XHRhZ2VudC5kZXN0aW5hdGlvbiA9IG51bGw7XG5cdFx0XHRleGVjdXRlX2FjdGlvbihhZ2VudCwgYWdlbnQuY3VycmVudEFjdGlvbik7XG5cdFx0XHRjb25zb2xlLmxvZyhcInRpbWU6IFwiICsgdGltZS50b1N0cmluZygpICsgXCIgfCBcIiArIGFnZW50Lm5hbWUgKyBcIjogRmluaXNoZWQgXCIgKyBhZ2VudC5jdXJyZW50QWN0aW9uLm5hbWUpO1xuXHRcdFx0dmFyIGNob2ljZTpBY3Rpb24gPSBzZWxlY3RfYWN0aW9uKGFnZW50LCBhY3Rpb25MaXN0LCBsb2NhdGlvbkxpc3QpO1xuXHRcdFx0dmFyIGRlc3Q6TG9jYXRpb24gPSBudWxsO1xuXHRcdFx0dmFyIGs6bnVtYmVyID0gMDtcblx0XHRcdGZvciAoayA9IDA7IGs8Y2hvaWNlLnJlcXVpcmVtZW50cy5sZW5ndGg7IGsrKykge1xuXHRcdFx0XHRpZiAoY2hvaWNlLnJlcXVpcmVtZW50c1trXS50eXBlID09IDApIHtcblx0XHRcdFx0XHR2YXIgcmVxdWlyZW1lbnQ6TG9jYXRpb25SZXEgPSBjaG9pY2UucmVxdWlyZW1lbnRzW2tdLnJlcSBhcyBMb2NhdGlvblJlcTtcblx0XHRcdFx0XHRkZXN0ID0gZXhlYy5nZXROZWFyZXN0TG9jYXRpb24ocmVxdWlyZW1lbnQsIGxvY2F0aW9uTGlzdCwgYWdlbnQueFBvcywgYWdlbnQueVBvcyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vc2V0IGFjdGlvbiB0byBjaG9pY2Ugb3IgdG8gdHJhdmVsIGlmIGFnZW50IGlzIG5vdCBhdCBsb2NhdGlvbiBmb3IgY2hvaWNlXG5cdFx0XHRpZiAoZGVzdCA9PT0gbnVsbCB8fCAoZGVzdC54UG9zID09IGFnZW50LnhQb3MgJiYgZGVzdC55UG9zID09IGFnZW50LnlQb3MpKSB7XG5cdFx0XHRcdGFnZW50LmN1cnJlbnRBY3Rpb24gPSBjaG9pY2U7XG5cdFx0XHRcdGFnZW50Lm9jY3VwaWVkQ291bnRlciA9IGNob2ljZS50aW1lX21pbjtcblx0XHRcdFx0Ly8gY29uc29sZS5sb2coXCJ0aW1lOiBcIiArIHRpbWUudG9TdHJpbmcoKSArIFwiIHwgXCIgKyBhZ2VudC5uYW1lICsgXCI6IFN0YXJ0ZWQgXCIgKyBhZ2VudC5jdXJyZW50QWN0aW9uLm5hbWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIHRyYXZlbFRpbWU6bnVtYmVyID0gTWF0aC5hYnMoZGVzdC54UG9zIC0gYWdlbnQueFBvcykgKyBNYXRoLmFicyhkZXN0LnlQb3MgLSBhZ2VudC55UG9zKTtcblx0XHRcdFx0YWdlbnQuY3VycmVudEFjdGlvbiA9IHRyYXZlbF9hY3Rpb247XG5cdFx0XHRcdGFnZW50Lm9jY3VwaWVkQ291bnRlciA9IE1hdGguYWJzKGRlc3QueFBvcyAtIGFnZW50LnhQb3MpICsgTWF0aC5hYnMoZGVzdC55UG9zIC0gYWdlbnQueVBvcyk7XG5cdFx0XHRcdGRlc3QueFBvcyA9IGFnZW50LnhQb3M7XG5cdFx0XHRcdGRlc3QueVBvcyA9IGFnZW50LnlQb3M7XG5cdFx0XHRcdC8vIGNvbnNvbGUubG9nKFwidGltZTogXCIgKyB0aW1lLnRvU3RyaW5nKCkgKyBcIiB8IFwiICsgYWdlbnQubmFtZSArIFwiOiBTdGFydGVkIFwiICsgYWdlbnQuY3VycmVudEFjdGlvbi5uYW1lICsgXCI7IERlc3RpbmF0aW9uOiBcIiArIGRlc3QubmFtZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG4iLCJpbXBvcnQgKiBhcyBucGMgZnJvbSBcIi4vYWdlbnRcIjtcbmltcG9ydCB7d2FpdF9hY3Rpb259IGZyb20gXCIuL2FjdGlvbl9zcGVjc1wiO1xuaW1wb3J0IHt0cmF2ZWxfYWN0aW9ufSBmcm9tIFwiLi9hY3Rpb25fc3BlY3NcIjtcblxuZXhwb3J0IHZhciB0aW1lOm51bWJlciA9IDA7XG5leHBvcnQgY29uc3QgTUFYX01FVEVSID0gNTtcbmV4cG9ydCBjb25zdCBNSU5fTUVURVIgPSAxO1xuXG4vKiAgU2ltcGxlIG1hdGhlbWF0aWNhbCBjbGFtcCBmdW5jdGlvbi5cbiAgICBuOiBudW1iZXIgYmVpbmcgdGVzdGVkXG4gICAgbTogbWF4aW11bSB2YWx1ZSBvZiBudW1iZXJcbiAgICBvOiBtaW5pbXVtIHZhbHVlIG9mIG51bWJlclxuICAgIHJldHVybjogZWl0aGVyIHRoZSBudW1iZXIsIG9yIHRoZSBtYXgvbWluIGlmIGl0IHdhcyBvdXRzaWRlIG9mIHRoZSByYW5nZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsYW1wKG46bnVtYmVyLCBtOm51bWJlciwgbzpudW1iZXIpOm51bWJlciB7XG4gIGlmIChuID4gbSkge1xuICAgIHJldHVybiBtO1xuICB9IGVsc2UgaWYgKG4gPCBvKSB7XG4gICAgcmV0dXJuIG87XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG47XG4gIH1cblxufVxuXG4vKiAgUmFuZG9taXplIGFycmF5IGluLXBsYWNlIHVzaW5nIER1cnN0ZW5mZWxkIHNodWZmbGUgYWxnb3JpdGhtXG4gICAgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjQ1MDk1NC9ob3ctdG8tcmFuZG9taXplLXNodWZmbGUtYS1qYXZhc2NyaXB0LWFycmF5XG4gICAgKi9cbmZ1bmN0aW9uIHNodWZmbGVBcnJheShhcnJheTpucGMuQWdlbnRbXSk6dm9pZCB7XG4gICAgZm9yICh2YXIgaTpudW1iZXIgPSBhcnJheS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgICAgIHZhciBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XG4gICAgICAgIHZhciB0ZW1wOm5wYy5BZ2VudCA9IGFycmF5W2ldO1xuICAgICAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xuICAgICAgICBhcnJheVtqXSA9IHRlbXA7XG4gICAgfVxufVxuXG4vKiAgY2hlY2tzIG1lbWJlcnNoaXAgaW4gYSBsaXN0LiBTdHJpbmcgdHlwZVxuICAgIGl0ZW06IGEgc3RyaW5nIHRvIGJlIGNoZWNrZWRcbiAgICBsaXN0OiBhIGxpc3Qgb2Ygc3RyaW5ncyB0byBjaGVjayBhZ2FpbnN0XG4gICAgcmV0dXJuOiBhIGJvb2xlYW4gYW5zd2VyaW5nIHRoZSBxdWVzdGlvbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluTGlzdChpdGVtOnN0cmluZywgbGlzdDpzdHJpbmdbXSk6Ym9vbGVhbiB7XG4gIHZhciByZXQ6Ym9vbGVhbiA9IGZhbHNlO1xuICB2YXIgaTpudW1iZXIgPSAwO1xuICBmb3IgKGkgPSAwOyBpPGxpc3QubGVuZ3RoOyBpKyspe1xuICAgIGlmIChsaXN0W2ldID09IGl0ZW0pIHtcbiAgICAgIHJldCA9IHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbi8qICByZXR1cm5zIHRoZSBuZWFyZXN0IGxvY2F0aW9uIHRoYXQgc2F0aXNmaWVzIHRoZSBnaXZlbiByZXF1aXJlbWVudCwgb3IgbnVsbC5cbiAgICBkaXN0YW5jZSBtZWFzdXJlZCBieSBtYW5oYXR0YW4gZGlzdGFuY2VcbiAgICByZXE6IGEgbG9jYXRpb24gcmVxdWlyZW1lbnQgdG8gc2F0aXNmeVxuICAgIGxpc3Q6IGEgbGlzdCBvZiBsb2NhdGlvbnMgdG8gY2hlY2tcbiAgICB4ICYgeTogY29vcmRpbmF0ZSBwYWlyIHRvIGRldGVybWluZSBkaXN0YW5jZSBhZ2FpbnN0LlxuICAgIHJldHVybjogdGhlIGxvY2F0aW9uIGluIHF1ZXN0aW9uIG9yIG51bGwgKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXROZWFyZXN0TG9jYXRpb24ocmVxOm5wYy5Mb2NhdGlvblJlcSwgbGlzdDpucGMuTG9jYXRpb25bXSwgeDpudW1iZXIsIHk6bnVtYmVyKTpucGMuTG9jYXRpb24ge1xuICB2YXIgcmV0Om5wYy5Mb2NhdGlvbiA9IG51bGw7XG4gIHZhciBtaW5EaXN0Om51bWJlciA9IC0xO1xuICB2YXIgaTpudW1iZXIgPSAwO1xuICBmb3IgKGkgPSAwOyBpPGxpc3QubGVuZ3RoOyBpKyspe1xuICAgIHZhciB2YWxpZDpib29sZWFuID0gdHJ1ZTtcbiAgICB2YXIgY2hlY2sxOmJvb2xlYW4gPSB0cnVlO1xuICAgIHZhciBqOm51bWJlciA9IDA7XG4gICAgZm9yIChqID0gMDsgajxyZXEuaGFzQWxsT2YubGVuZ3RoOyBqKyspe1xuICAgICAgaWYgKCEoaW5MaXN0KHJlcS5oYXNBbGxPZltqXSxsaXN0W2ldLnRhZ3MpKSkge1xuICAgICAgICBjaGVjazEgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIGNoZWNrMjpib29sZWFuID0gZmFsc2U7XG4gICAgZm9yIChqID0gMDsgajxyZXEuaGFzT25lT3JNb3JlT2YubGVuZ3RoOyBqKyspe1xuICAgICAgaWYgKGluTGlzdChyZXEuaGFzT25lT3JNb3JlT2Zbal0sbGlzdFtpXS50YWdzKSkge1xuICAgICAgICBjaGVjazIgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocmVxLmhhc09uZU9yTW9yZU9mLmxlbmd0aCA9PSAwKSB7XG4gICAgICBjaGVjazIgPSB0cnVlO1xuICAgIH1cbiAgICB2YXIgY2hlY2szOmJvb2xlYW4gPSB0cnVlO1xuICAgIGZvciAoaiA9IDA7IGo8cmVxLmhhc05vbmVPZi5sZW5ndGg7IGorKyl7XG4gICAgICBpZiAoaW5MaXN0KHJlcS5oYXNOb25lT2Zbal0sbGlzdFtpXS50YWdzKSkge1xuICAgICAgICBjaGVjazMgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHJlcS5oYXNOb25lT2YubGVuZ3RoID09IDApIHtcbiAgICAgIGNoZWNrMyA9IHRydWU7XG4gICAgfVxuICAgIGlmICghKGNoZWNrMSAmJiBjaGVjazIgJiYgY2hlY2szKSkge1xuICAgICAgdmFsaWQgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHZhbGlkKSB7XG4gICAgICB2YXIgdHJhdmVsRGlzdDogbnVtYmVyID0gTWF0aC5hYnMobGlzdFtpXS54UG9zIC0geCkgKyBNYXRoLmFicyhsaXN0W2ldLnlQb3MgLSB5KTtcbiAgICAgIGlmICgobWluRGlzdCA+IHRyYXZlbERpc3QpIHx8IChtaW5EaXN0ID0gLTEpKSB7XG4gICAgICAgIG1pbkRpc3QgPSB0cmF2ZWxEaXN0O1xuICAgICAgICByZXQgPSBsaXN0W2ldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG4vKiAgcmFuZG9taXplcyBvcmRlciBhbmQgZXhlY3V0ZXMgYSB0dXJuIGZvciBlYWNoIGFnZW50IGV2ZXJ5IHRpY2suXG4gICAgYWdlbnRMaXN0OiBsaXN0IG9mIGFnZW50cyBpbiB0aGUgc2ltXG4gICAgYWN0aW9uTGlzdDogdGhlIGxpc3Qgb2YgdmFsaWQgYWN0aW9uc1xuICAgIGxvY2F0aW9uTGlzdDogYWxsIGxvY2F0aW9ucyBpbiB0aGUgd29ybGRcbiAgICBjb250aW51ZUZ1bmN0aW9uOiBib29sZWFuIGZ1bmN0aW9uIHRoYXQgaXMgdXNlZCBhcyBhIGNoZWNrIGFzIHRvIHdoZXRoZXIgb3Igbm90IHRvIGtlZXAgcnVubmluZyB0aGUgc2ltICovXG5leHBvcnQgZnVuY3Rpb24gcnVuX3NpbShhZ2VudExpc3Q6bnBjLkFnZW50W10sIGFjdGlvbkxpc3Q6bnBjLkFjdGlvbltdLCBsb2NhdGlvbkxpc3Q6bnBjLkxvY2F0aW9uW10sIGNvbnRpbnVlRnVuY3Rpb246ICgpID0+IGJvb2xlYW4pOnZvaWQge1xuICB3aGlsZSAoY29udGludWVGdW5jdGlvbigpKSB7XG4gICAgc2h1ZmZsZUFycmF5KGFnZW50TGlzdCk7XG4gICAgdmFyIGk6bnVtYmVyID0gMDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgYWdlbnRMaXN0Lmxlbmd0aDsgaSsrICkge1xuICAgICAgbnBjLnR1cm4oYWdlbnRMaXN0W2ldLCBhY3Rpb25MaXN0LCBsb2NhdGlvbkxpc3QsIHRpbWUpO1xuICAgIH1cbiAgICB0aW1lICs9IDE7XG4gIH1cbiAgY29uc29sZS5sb2coXCJGaW5pc2hlZC5cIik7XG59XG5cblxuIiwiaW1wb3J0ICogYXMgZW5naW5lIGZyb20gXCIuL2V4ZWN1dGlvbl9lbmdpbmVcIjtcbmltcG9ydCAqIGFzIGFjdGlvbnMgZnJvbSBcIi4vYWN0aW9uX3NwZWNzXCI7XG5pbXBvcnQgKiBhcyBucGMgZnJvbSBcIi4vYWdlbnRcIjtcblxuLy8gTGlzdCBvZiBhdmFpbGFibGUgYWN0aW9ucyBpbiBzaW1cbnZhciBhY3Rpb25MaXN0Om5wYy5BY3Rpb25bXSA9IFthY3Rpb25zLmVhdF9hY3Rpb24sIGFjdGlvbnMubW92aWVfYWN0aW9uLCBhY3Rpb25zLmVhdF9mcmllbmRfYWN0aW9uLCBhY3Rpb25zLm1vdmllX2ZyaWVuZF9hY3Rpb24sIGFjdGlvbnMud29ya19hY3Rpb24sIGFjdGlvbnMuaG9iYnlfYWN0aW9uXTtcblxuLy8gYWdlbnRzXG5cbnZhciBhZ2VudDE6bnBjLkFnZW50ID1cbntcbiAgbmFtZTogXCJKb2huIERvZVwiLFxuICBtb3RpdmU6IHtcbiAgICBwaHlzaWNhbDogMSxcbiAgICBlbW90aW9uYWw6IDEsXG4gICAgc29jaWFsOiAxLFxuICAgIGZpbmFuY2lhbDogMSxcbiAgICBhY2NvbXBsaXNobWVudDogMSxcbiAgfSxcbiAgeFBvczogMCxcbiAgeVBvczogMCxcbiAgb2NjdXBpZWRDb3VudGVyOiAwLFxuICBjdXJyZW50QWN0aW9uOiBhY3Rpb25zLndhaXRfYWN0aW9uLFxuICBkZXN0aW5hdGlvbjogbnVsbFxufTtcblxuLy8gYWdlbnRzXG52YXIgYWdlbnQyOm5wYy5BZ2VudCA9XG57XG4gIG5hbWU6IFwiSmFuZSBEb2VcIixcbiAgbW90aXZlOiB7XG4gICAgcGh5c2ljYWw6IDQsXG4gICAgZW1vdGlvbmFsOiAxLFxuICAgIHNvY2lhbDogNCxcbiAgICBmaW5hbmNpYWw6IDEsXG4gICAgYWNjb21wbGlzaG1lbnQ6IDQsXG4gIH0sXG4gIHhQb3M6IDUsXG4gIHlQb3M6IDUsXG4gIG9jY3VwaWVkQ291bnRlcjogMCxcbiAgY3VycmVudEFjdGlvbjogYWN0aW9ucy53YWl0X2FjdGlvbixcbiAgZGVzdGluYXRpb246IG51bGxcbn07XG5cbi8vIExpc3Qgb2YgYWdlbnRzIGluIHNpbVxudmFyIGFnZW50TGlzdDpucGMuQWdlbnRbXSA9IFthZ2VudDEsIGFnZW50Ml07XG5cbi8vIExvY2F0aW9uc1xuLy8gTG9jYXRpb25zIGFyZSBhIHBvc2l0aW9uLCBhIG5hbWUsIGFuZCBhIGxpc3Qgb2YgdGFnc1xudmFyIHJlc3RhdXJhbnQ6bnBjLkxvY2F0aW9uID0ge25hbWU6IFwicmVzdGF1cmFudFwiLCB4UG9zOiA1LCB5UG9zOiA1LCB0YWdzOiBbXCJyZXN0YXVyYW50XCIsIFwiZW1wbG95bWVudFwiXX1cblxudmFyIG1vdmllX3RoZWF0cmU6bnBjLkxvY2F0aW9uID0ge25hbWU6IFwibW92aWUgdGhlYXRyZVwiLCB4UG9zOiAwLCB5UG9zOiA1LCB0YWdzOiBbXCJtb3ZpZSB0aGVhdHJlXCIsIFwiZW1wbG95bWVudFwiXX1cblxudmFyIGhvbWU6bnBjLkxvY2F0aW9uID0ge25hbWU6IFwiaG9tZVwiLCB4UG9zOiA1LCB5UG9zOiAwLCB0YWdzOiBbXCJob21lXCJdfVxuXG4vL2xvY2F0aW9uIExpc3RcbnZhciBsb2NhdGlvbkxpc3Q6bnBjLkxvY2F0aW9uW10gPSBbcmVzdGF1cmFudCwgbW92aWVfdGhlYXRyZSwgaG9tZV07XG5cbi8vIGNvbmRpdGlvbiBmdW5jdGlvbi5cbi8vIFN0b3BzIHRoZSBzaW0gd2hlbiBhbGwgYWdlbnRzIGFyZSBhdCBmdWxsIG1ldGVyc1xuZnVuY3Rpb24gY29uZGl0aW9uKCk6Ym9vbGVhbiB7XG4gIHZhciBjaGVjazpib29sZWFuID0gZmFsc2U7XG4gIHZhciBpOm51bWJlciA9IDA7XG4gIC8vIGNoZWNrIHRoZSBtZXRlciBsZXZlbHMgZm9yIGVhY2ggYWdlbnQgaW4gdGhlIHNpbVxuICBmb3IgKGkgPSAwOyBpPCBhZ2VudExpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYWdlbnRMaXN0W2ldLm1vdGl2ZS5waHlzaWNhbCA8IGVuZ2luZS5NQVhfTUVURVIpIHtcbiAgICAgIGNoZWNrID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAoYWdlbnRMaXN0W2ldLm1vdGl2ZS5lbW90aW9uYWwgPCBlbmdpbmUuTUFYX01FVEVSKSB7XG4gICAgICBjaGVjayA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKGFnZW50TGlzdFtpXS5tb3RpdmUuc29jaWFsIDwgZW5naW5lLk1BWF9NRVRFUikge1xuICAgICAgY2hlY2sgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmIChhZ2VudExpc3RbaV0ubW90aXZlLmZpbmFuY2lhbCA8IGVuZ2luZS5NQVhfTUVURVIpIHtcbiAgICAgIGNoZWNrID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAoYWdlbnRMaXN0W2ldLm1vdGl2ZS5hY2NvbXBsaXNobWVudCA8IGVuZ2luZS5NQVhfTUVURVIpIHtcbiAgICAgIGNoZWNrID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY2hlY2s7XG59XG5cbmVuZ2luZS5ydW5fc2ltKGFnZW50TGlzdCwgYWN0aW9uTGlzdCwgbG9jYXRpb25MaXN0LCBjb25kaXRpb24pO1xuXG4vLyBEaXNwbGF5cyB0ZXh0IG9uIHRoZSBicm93c2VyPyBJIGFzc3VtZVxuZnVuY3Rpb24gc2hvd09uQnJvd3NlcihkaXZOYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZykge1xuICBjb25zdCBlbHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkaXZOYW1lKTtcbiAgZWx0LmlubmVyVGV4dCA9IG5hbWUgKyBcIkhlbGxvIFdvcmxkIVwiO1xufVxuXG5zaG93T25Ccm93c2VyKFwiZ3JlZXRpbmdcIiwgXCJUeXBlU2NyaXB0XCIpO1xuIl19
