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
exports.run_sim = exports.execute_action = exports.select_action = exports.getNearestLocation = exports.inList = exports.isContent = exports.clamp = exports.MIN_METER = exports.MAX_METER = exports.time = void 0;
var action_specs_1 = require("./action_specs");
var action_specs_2 = require("./action_specs");
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
/*  Checks to see if an agent has maximum motives
    agent: the agent being tested
    return: a boolean answering the question */
function isContent(agent) {
    var ret = true;
    var i = 0;
    for (i = 0; i < 5; i++) {
        switch (i) {
            case 0: {
                if (agent.physical != exports.MAX_METER) {
                    ret = false;
                }
                break;
            }
            case 1: {
                if (agent.emotional != exports.MAX_METER) {
                    ret = false;
                }
                break;
            }
            case 2: {
                if (agent.social != exports.MAX_METER) {
                    ret = false;
                }
                break;
            }
            case 3: {
                if (agent.accomplishment != exports.MAX_METER) {
                    ret = false;
                }
                break;
            }
            case 4: {
                if (agent.financial != exports.MAX_METER) {
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
                dest = getNearestLocation(requirement, locationList, agent.xPos, agent.yPos);
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
                        deltaUtility += clamp(actionList[i].effects[j].delta + agent.physical, exports.MAX_METER, exports.MIN_METER) - agent.physical;
                        break;
                    }
                    case 1: {
                        deltaUtility += clamp(actionList[i].effects[j].delta + agent.emotional, exports.MAX_METER, exports.MIN_METER) - agent.emotional;
                        break;
                    }
                    case 2: {
                        deltaUtility += clamp(actionList[i].effects[j].delta + agent.social, exports.MAX_METER, exports.MIN_METER) - agent.social;
                        break;
                    }
                    case 3: {
                        deltaUtility += clamp(actionList[i].effects[j].delta + agent.accomplishment, exports.MAX_METER, exports.MIN_METER) - agent.accomplishment;
                        break;
                    }
                    case 4: {
                        deltaUtility += clamp(actionList[i].effects[j].delta + agent.financial, exports.MAX_METER, exports.MIN_METER) - agent.financial;
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
                agent.physical = clamp(agent.physical + action.effects[i].delta, exports.MAX_METER, exports.MIN_METER);
                break;
            }
            case 1: {
                agent.emotional = clamp(agent.emotional + action.effects[i].delta, exports.MAX_METER, exports.MIN_METER);
                break;
            }
            case 2: {
                agent.social = clamp(agent.social + action.effects[i].delta, exports.MAX_METER, exports.MIN_METER);
                break;
            }
            case 3: {
                agent.accomplishment = clamp(agent.accomplishment + action.effects[i].delta, exports.MAX_METER, exports.MIN_METER);
                break;
            }
            case 4: {
                agent.financial = clamp(agent.financial + action.effects[i].delta, exports.MAX_METER, exports.MIN_METER);
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
function run_sim(agentList, actionList, locationList, continueFunction) {
    while (continueFunction()) {
        shuffleArray(agentList);
        var i = 0;
        for (i = 0; i < agentList.length; i++) {
            if (exports.time % 600 == 0) {
                if (!isContent(agentList[i])) {
                    agentList[i].physical = clamp(agentList[i].physical - 1, exports.MAX_METER, exports.MIN_METER);
                    agentList[i].emotional = clamp(agentList[i].emotional - 1, exports.MAX_METER, exports.MIN_METER);
                    agentList[i].social = clamp(agentList[i].social - 1, exports.MAX_METER, exports.MIN_METER);
                    agentList[i].accomplishment = clamp(agentList[i].accomplishment - 1, exports.MAX_METER, exports.MIN_METER);
                    agentList[i].financial = clamp(agentList[i].financial - 1, exports.MAX_METER, exports.MIN_METER);
                }
            }
            if (agentList[i].occupiedCounter > 0) {
                agentList[i].occupiedCounter--;
            }
            else {
                if (!isContent(agentList[i])) {
                    agentList[i].destination = null;
                    execute_action(agentList[i], agentList[i].currentAction);
                    console.log("time: " + exports.time.toString() + " | " + agentList[i].name + ": Finished " + agentList[i].currentAction.name);
                    var choice = select_action(agentList[i], actionList, locationList);
                    var dest = null;
                    var k = 0;
                    for (k = 0; k < choice.requirements.length; k++) {
                        if (choice.requirements[k].type == 0) {
                            var requirement = choice.requirements[k].req;
                            dest = getNearestLocation(requirement, locationList, agentList[i].xPos, agentList[i].yPos);
                        }
                    }
                    //set action to choice or to travel if agent is not at location for choice
                    if (dest === null || (dest.xPos == agentList[i].xPos && dest.yPos == agentList[i].yPos)) {
                        agentList[i].currentAction = choice;
                        agentList[i].occupiedCounter = choice.time_min;
                        console.log("time: " + exports.time.toString() + " | " + agentList[i].name + ": Started " + agentList[i].currentAction.name);
                    }
                    else {
                        var travelTime = Math.abs(dest.xPos - agentList[i].xPos) + Math.abs(dest.yPos - agentList[i].yPos);
                        agentList[i].currentAction = action_specs_2.travel_action;
                        agentList[i].occupiedCounter = Math.abs(dest.xPos - agentList[i].xPos) + Math.abs(dest.yPos - agentList[i].yPos);
                        dest.xPos = agentList[i].xPos;
                        dest.yPos = agentList[i].yPos;
                        console.log("time: " + exports.time.toString() + " | " + agentList[i].name + ": Started " + agentList[i].currentAction.name + "; Destination: " + dest.name);
                    }
                }
            }
        }
        exports.time += 1;
    }
    console.log("Finished.");
}
exports.run_sim = run_sim;
},{"./action_specs":1}],3:[function(require,module,exports){
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
},{"./action_specs":1,"./execution_engine":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWN0aW9uX3NwZWNzLnRzIiwic3JjL2V4ZWN1dGlvbl9lbmdpbmUudHMiLCJzcmMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztBQ1dBLDZCQUE2QjtBQUM3QixpR0FBaUc7QUFDakcsb0ZBQW9GO0FBRXBGLDREQUE0RDtBQUNqRCxRQUFBLFdBQVcsR0FDdEI7SUFDRSxJQUFJLEVBQUUsYUFBYTtJQUNuQixZQUFZLEVBQUUsRUFBRTtJQUNoQixPQUFPLEVBQUUsRUFBRTtJQUNYLFFBQVEsRUFBRSxDQUFDO0NBQ1osQ0FBQTtBQUVELHVFQUF1RTtBQUN2RSwrQ0FBK0M7QUFDcEMsUUFBQSxhQUFhLEdBQ3hCO0lBQ0UsSUFBSSxFQUFFLGVBQWU7SUFDckIsWUFBWSxFQUFFLEVBQUU7SUFDaEIsT0FBTyxFQUFFLEVBQUU7SUFDWCxRQUFRLEVBQUUsQ0FBQztDQUNaLENBQUE7QUFDRCxNQUFNO0FBRU4saURBQWlEO0FBQ3RDLFFBQUEsVUFBVSxHQUNyQjtJQUNFLElBQUksRUFBRSxZQUFZO0lBQ2xCLFlBQVksRUFBRSxDQUFDLEVBQUMsSUFBSSxFQUFDLENBQUMsRUFBRSxHQUFHLEVBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxZQUFZLENBQUMsRUFBRSxjQUFjLEVBQUMsRUFBRSxFQUFFLFNBQVMsRUFBQyxFQUFFLEVBQUMsRUFBQyxDQUFDO0lBQ3hGLE9BQU8sRUFBTyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsQ0FBQyxFQUFDLENBQUM7SUFDbkMsUUFBUSxFQUFNLEVBQUU7Q0FDakIsQ0FBQztBQUVGLHFEQUFxRDtBQUMxQyxRQUFBLFlBQVksR0FDdkI7SUFDRSxJQUFJLEVBQUUsY0FBYztJQUNwQixZQUFZLEVBQUUsQ0FBQyxFQUFDLElBQUksRUFBQyxDQUFDLEVBQUUsR0FBRyxFQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMs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QUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUU7WUFDbEQsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNiLE1BQU07U0FDUDtLQUNGO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztBQUUvRCx5Q0FBeUM7QUFDekMsU0FBUyxhQUFhLENBQUMsT0FBZSxFQUFFLElBQVk7SUFDbEQsSUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM3QyxHQUFHLENBQUMsU0FBUyxHQUFHLElBQUksR0FBRyxjQUFjLENBQUM7QUFDeEMsQ0FBQztBQUVELGFBQWEsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgeyBNb3RpdmUgfSBmcm9tIFwiLi9hZ2VudFwiO1xyXG5pbXBvcnQgeyBCaW5PcCB9IGZyb20gXCIuL2FnZW50XCI7XHJcbmltcG9ydCB7IFJlcVR5cGUgfSBmcm9tIFwiLi9hZ2VudFwiO1xyXG5pbXBvcnQgeyBNb3RpdmVSZXEgfSBmcm9tIFwiLi9hZ2VudFwiO1xyXG5pbXBvcnQgeyBQZW9wbGVSZXEgfSBmcm9tIFwiLi9hZ2VudFwiO1xyXG5pbXBvcnQgeyBMb2NhdGlvblJlcSB9IGZyb20gXCIuL2FnZW50XCI7XHJcbmltcG9ydCB7IFJlcXVpcmVtZW50IH0gZnJvbSBcIi4vYWdlbnRcIjtcclxuaW1wb3J0IHsgRWZmZWN0IH0gZnJvbSBcIi4vYWdlbnRcIjtcclxuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4vYWdlbnRcIjtcclxuaW1wb3J0IHsgQWdlbnQgfSBmcm9tIFwiLi9hZ2VudFwiO1xyXG5cclxuLy8gREVGQVVMVCBBQ1RJT05TIC0gUkVRVUlSRURcclxuLy8gVGhlIGZvbGxvd2luZyBhY3Rpb25zIGFyZSByZXF1aXJlZCBmb3IgdGhlIGN1cnJlbnQgc3RydWN0dXJlIG9mIHRoZSBleGVjdXRpb24gZXhlY3V0aW9uX2VuZ2luZVxyXG4vL1doZW4gbW9kaWZ5aW5nIHRoaXMgZmlsZSBmb3IgbW9yZSB0ZXN0IHNjZW5hcmlvcywgRE8gTk9UIENIQU5HRSBUSEVTRSBhY3Rpb25fc3BlY3NcclxuXHJcbi8vIFRoZSB3YWl0IGFjdGlvbiBpcyB1c2VkIHdoZW4gYW4gYWdlbnQgaGFzIG1heGltYWwgbW90aXZlc1xyXG5leHBvcnQgdmFyIHdhaXRfYWN0aW9uIDogQWN0aW9uID1cclxue1xyXG4gIG5hbWU6IFwid2FpdF9hY3Rpb25cIixcclxuICByZXF1aXJlbWVudHM6IFtdLFxyXG4gIGVmZmVjdHM6IFtdLFxyXG4gIHRpbWVfbWluOiAwXHJcbn1cclxuXHJcbi8vIFRoZSB0cmF2ZWwgYWN0aW9uIGlzIHVzZWQgd2hlbiBhbiBhZ2VudCBpcyB0cmF2ZWxsaW5nIHRvIGEgbG9jYXRpb24uXHJcbi8vIFRoZSB0aW1lIGlzIGhhbmRkbGVzIGJ5IHRoZSBleGVjdXRpb24gZW5naW5lXHJcbmV4cG9ydCB2YXIgdHJhdmVsX2FjdGlvbiA6IEFjdGlvbiA9XHJcbntcclxuICBuYW1lOiBcInRyYXZlbF9hY3Rpb25cIixcclxuICByZXF1aXJlbWVudHM6IFtdLFxyXG4gIGVmZmVjdHM6IFtdLFxyXG4gIHRpbWVfbWluOiAwXHJcbn1cclxuLy8gRU5EXHJcblxyXG4vLyBGaWxscyBwaHlzaWNhbCwgcmVxdWlyZXMgYSByZXN0YXVyYW50IGxvY2F0aW9uXHJcbmV4cG9ydCB2YXIgZWF0X2FjdGlvbiA6IEFjdGlvbiA9XHJcbntcclxuICBuYW1lOiBcImVhdF9hY3Rpb25cIixcclxuICByZXF1aXJlbWVudHM6IFt7dHlwZTowLCByZXE6e2hhc0FsbE9mOltcInJlc3RhdXJhbnRcIl0sIGhhc09uZU9yTW9yZU9mOltdLCBoYXNOb25lT2Y6W119fV0sXHJcbiAgZWZmZWN0czogICAgICBbe21vdGl2ZTowLCBkZWx0YToyfV0sXHJcbiAgdGltZV9taW46ICAgICA2MFxyXG59O1xyXG5cclxuLy8gRmlsbHMgZW1vdGlvbmFsLCByZXF1aXJlcyBhIG1vdmllIHRoZWF0cmUgbG9jYXRpb25cclxuZXhwb3J0IHZhciBtb3ZpZV9hY3Rpb24gOiBBY3Rpb24gPVxyXG57XHJcbiAgbmFtZTogXCJtb3ZpZV9hY3Rpb25cIixcclxuICByZXF1aXJlbWVudHM6IFt7dHlwZTowLCByZXE6e2hhc0FsbE9mOltcIm1vdmllIHRoZWF0cmVcIl0sIGhhc09uZU9yTW9yZU9mOltdLCBoYXNOb25lT2Y6W119fV0sXHJcbiAgZWZmZWN0czogICAgICBbe21vdGl2ZToxLCBkZWx0YTozfV0sXHJcbiAgdGltZV9taW46ICAgICAxMjBcclxufTtcclxuXHJcbi8vIEZpbGxzIHBoeXNpY2FsIGFuZCBzb2NpYWwsIHJlcXVpcmVzIGEgcmVzdGF1cmFudCBsb2NhdGlvbiBhbmQgYW4gYWRkaXRpb25hbCBwZXJzb25cclxuZXhwb3J0IHZhciBlYXRfZnJpZW5kX2FjdGlvbiA6IEFjdGlvbiA9XHJcbntcclxuICBuYW1lOiBcImVhdF9mcmllbmRfYWN0aW9uXCIsXHJcbiAgcmVxdWlyZW1lbnRzOiBbe3R5cGU6MCwgcmVxOntoYXNBbGxPZjpbXCJyZXN0YXVyYW50XCJdLCBoYXNPbmVPck1vcmVPZjpbXSwgaGFzTm9uZU9mOltdfX0sXHJcbiAgICAgICAgICAgICAgICB7dHlwZToxLCByZXE6e21pbk51bVBlb3BsZToyLCBtYXhOdW1QZW9wbGU6LTEsIHNwZWNpZmljUGVvcGxlUHJlc2VudDpbXSwgc3BlY2lmaWNQZW9wbGVBYnNlbnQ6W10sIHJlbGF0aW9uc2hpcHNQcmVzZW50OltdLCByZWxhdGlvbnNoaXBzQWJzZW50OltdfX1dLFxyXG4gIGVmZmVjdHM6ICAgICAgW3ttb3RpdmU6MCwgZGVsdGE6Mn0sIHttb3RpdmU6MiwgZGVsdGE6Mn1dLFxyXG4gIHRpbWVfbWluOiAgICAgNzBcclxufTtcclxuXHJcbi8vIEZpbGxzIGVtb3Rpb25hbCBhbmQgc29jaWFsLCByZXF1aXJlcyBhIG1vdmllIHRoZWF0cmUgbG9jYXRpb24gYW5kIGFuIGFkZGl0aW9uYWwgcGVyc29uXHJcbmV4cG9ydCB2YXIgbW92aWVfZnJpZW5kX2FjdGlvbiA6IEFjdGlvbiA9XHJcbntcclxuICBuYW1lOiBcIm1vdmllX2ZyaWVuZF9hY3Rpb25cIixcclxuICByZXF1aXJlbWVudHM6IFt7dHlwZTowLCByZXE6e2hhc0FsbE9mOltcIm1vdmllIHRoZWF0cmVcIl0sIGhhc09uZU9yTW9yZU9mOltdLCBoYXNOb25lT2Y6W119fSxcclxuICAgICAgICAgICAgICAgIHt0eXBlOjEsIHJlcTp7bWluTnVtUGVvcGxlOjIsIG1heE51bVBlb3BsZTotMSwgc3BlY2lmaWNQZW9wbGVQcmVzZW50OltdLCBzcGVjaWZpY1Blb3BsZUFic2VudDpbXSwgcmVsYXRpb25zaGlwc1ByZXNlbnQ6W10sIHJlbGF0aW9uc2hpcHNBYnNlbnQ6W119fV0sXHJcbiAgZWZmZWN0czogICAgICBbe21vdGl2ZToxLCBkZWx0YTozfSwge21vdGl2ZToyLCBkZWx0YToyfV0sXHJcbiAgdGltZV9taW46ICAgICAxMzBcclxufTtcclxuXHJcbi8vIEZpbGxzIGZpbmFuY2lhbCwgcmVxdWlyZXMgYSBtb3ZpZSB0aGVhdHJlIGxvY2F0aW9uXHJcbmV4cG9ydCB2YXIgd29ya19hY3Rpb24gOiBBY3Rpb24gPVxyXG57XHJcbiAgbmFtZTogXCJ3b3JrX2FjdGlvblwiLFxyXG4gIHJlcXVpcmVtZW50czogW3t0eXBlOjAsIHJlcTp7aGFzQWxsT2Y6W1wiZW1wbG95bWVudFwiXSwgaGFzT25lT3JNb3JlT2Y6W10sIGhhc05vbmVPZjpbXX19XSxcclxuICBlZmZlY3RzOiAgICAgIFt7bW90aXZlOjMsIGRlbHRhOjF9XSxcclxuICB0aW1lX21pbjogICAgIDI0MFxyXG59O1xyXG5cclxuLy8gRmlsbHMgYWNjb21wbGlzaG1lbnQsIHJlcXVpcmVzIGEgaG9tZSBsb2NhdGlvblxyXG5leHBvcnQgdmFyIGhvYmJ5X2FjdGlvbiA6IEFjdGlvbiA9XHJcbntcclxuICBuYW1lOiBcImhvYmJ5X2FjdGlvblwiLFxyXG4gIHJlcXVpcmVtZW50czogW3t0eXBlOjAsIHJlcTp7aGFzQWxsT2Y6W1wiaG9tZVwiXSwgaGFzT25lT3JNb3JlT2Y6W10sIGhhc05vbmVPZjpbXX19XSxcclxuICBlZmZlY3RzOiAgICAgIFt7bW90aXZlOjQsIGRlbHRhOjJ9XSxcclxuICB0aW1lX21pbjogICAgIDYwXHJcbn07XHJcbiIsImltcG9ydCAqIGFzIG5wYyBmcm9tIFwiLi9hZ2VudFwiO1xyXG5pbXBvcnQge3dhaXRfYWN0aW9ufSBmcm9tIFwiLi9hY3Rpb25fc3BlY3NcIjtcclxuaW1wb3J0IHt0cmF2ZWxfYWN0aW9ufSBmcm9tIFwiLi9hY3Rpb25fc3BlY3NcIjtcclxuXHJcbmV4cG9ydCB2YXIgdGltZTpudW1iZXIgPSAwO1xyXG5leHBvcnQgY29uc3QgTUFYX01FVEVSID0gNTtcclxuZXhwb3J0IGNvbnN0IE1JTl9NRVRFUiA9IDE7XHJcblxyXG4vKiAgU2ltcGxlIG1hdGhlbWF0aWNhbCBjbGFtcCBmdW5jdGlvbi5cclxuICAgIG46IG51bWJlciBiZWluZyB0ZXN0ZWRcclxuICAgIG06IG1heGltdW0gdmFsdWUgb2YgbnVtYmVyXHJcbiAgICBvOiBtaW5pbXVtIHZhbHVlIG9mIG51bWJlclxyXG4gICAgcmV0dXJuOiBlaXRoZXIgdGhlIG51bWJlciwgb3IgdGhlIG1heC9taW4gaWYgaXQgd2FzIG91dHNpZGUgb2YgdGhlIHJhbmdlICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjbGFtcChuOm51bWJlciwgbTpudW1iZXIsIG86bnVtYmVyKTpudW1iZXIge1xyXG4gIGlmIChuID4gbSkge1xyXG4gICAgcmV0dXJuIG07XHJcbiAgfSBlbHNlIGlmIChuIDwgbykge1xyXG4gICAgcmV0dXJuIG87XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiBuO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbi8qICBSYW5kb21pemUgYXJyYXkgaW4tcGxhY2UgdXNpbmcgRHVyc3RlbmZlbGQgc2h1ZmZsZSBhbGdvcml0aG1cclxuICAgIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI0NTA5NTQvaG93LXRvLXJhbmRvbWl6ZS1zaHVmZmxlLWEtamF2YXNjcmlwdC1hcnJheVxyXG4gICAgKi9cclxuZnVuY3Rpb24gc2h1ZmZsZUFycmF5KGFycmF5Om5wYy5BZ2VudFtdKTp2b2lkIHtcclxuICAgIGZvciAodmFyIGk6bnVtYmVyID0gYXJyYXkubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSkge1xyXG4gICAgICAgIHZhciBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XHJcbiAgICAgICAgdmFyIHRlbXA6bnBjLkFnZW50ID0gYXJyYXlbaV07XHJcbiAgICAgICAgYXJyYXlbaV0gPSBhcnJheVtqXTtcclxuICAgICAgICBhcnJheVtqXSA9IHRlbXA7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qICBDaGVja3MgdG8gc2VlIGlmIGFuIGFnZW50IGhhcyBtYXhpbXVtIG1vdGl2ZXNcclxuICAgIGFnZW50OiB0aGUgYWdlbnQgYmVpbmcgdGVzdGVkXHJcbiAgICByZXR1cm46IGEgYm9vbGVhbiBhbnN3ZXJpbmcgdGhlIHF1ZXN0aW9uICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0NvbnRlbnQoYWdlbnQ6bnBjLkFnZW50KTpib29sZWFuIHtcclxuICB2YXIgcmV0OmJvb2xlYW4gPSB0cnVlO1xyXG4gIHZhciBpOm51bWJlciA9IDA7XHJcbiAgZm9yIChpID0gMDsgaTw1OyBpKyspe1xyXG4gICAgc3dpdGNoKGkpe1xyXG4gICAgICBjYXNlIDA6IHtcclxuICAgICAgICBpZiAoYWdlbnQucGh5c2ljYWwgIT0gTUFYX01FVEVSKSB7XHJcbiAgICAgICAgICByZXQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAxOiB7XHJcbiAgICAgICAgaWYgKGFnZW50LmVtb3Rpb25hbCAhPSBNQVhfTUVURVIpIHtcclxuICAgICAgICAgIHJldCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlIDI6IHtcclxuICAgICAgICBpZiAoYWdlbnQuc29jaWFsICE9IE1BWF9NRVRFUikge1xyXG4gICAgICAgICAgcmV0ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgMzoge1xyXG4gICAgICAgIGlmIChhZ2VudC5hY2NvbXBsaXNobWVudCAhPSBNQVhfTUVURVIpIHtcclxuICAgICAgICAgIHJldCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlIDQ6IHtcclxuICAgICAgICBpZiAoYWdlbnQuZmluYW5jaWFsICE9IE1BWF9NRVRFUikge1xyXG4gICAgICAgICAgcmV0ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gcmV0O1xyXG59XHJcblxyXG4vKiAgY2hlY2tzIG1lbWJlcnNoaXAgaW4gYSBsaXN0LiBTdHJpbmcgdHlwZVxyXG4gICAgaXRlbTogYSBzdHJpbmcgdG8gYmUgY2hlY2tlZFxyXG4gICAgbGlzdDogYSBsaXN0IG9mIHN0cmluZ3MgdG8gY2hlY2sgYWdhaW5zdFxyXG4gICAgcmV0dXJuOiBhIGJvb2xlYW4gYW5zd2VyaW5nIHRoZSBxdWVzdGlvbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaW5MaXN0KGl0ZW06c3RyaW5nLCBsaXN0OnN0cmluZ1tdKTpib29sZWFuIHtcclxuICB2YXIgcmV0OmJvb2xlYW4gPSBmYWxzZTtcclxuICB2YXIgaTpudW1iZXIgPSAwO1xyXG4gIGZvciAoaSA9IDA7IGk8bGlzdC5sZW5ndGg7IGkrKyl7XHJcbiAgICBpZiAobGlzdFtpXSA9PSBpdGVtKSB7XHJcbiAgICAgIHJldCA9IHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiByZXQ7XHJcbn1cclxuXHJcbi8qICByZXR1cm5zIHRoZSBuZWFyZXN0IGxvY2F0aW9uIHRoYXQgc2F0aXNmaWVzIHRoZSBnaXZlbiByZXF1aXJlbWVudCwgb3IgbnVsbC5cclxuICAgIGRpc3RhbmNlIG1lYXN1cmVkIGJ5IG1hbmhhdHRhbiBkaXN0YW5jZVxyXG4gICAgcmVxOiBhIGxvY2F0aW9uIHJlcXVpcmVtZW50IHRvIHNhdGlzZnlcclxuICAgIGxpc3Q6IGEgbGlzdCBvZiBsb2NhdGlvbnMgdG8gY2hlY2tcclxuICAgIHggJiB5OiBjb29yZGluYXRlIHBhaXIgdG8gZGV0ZXJtaW5lIGRpc3RhbmNlIGFnYWluc3QuXHJcbiAgICByZXR1cm46IHRoZSBsb2NhdGlvbiBpbiBxdWVzdGlvbiBvciBudWxsICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXROZWFyZXN0TG9jYXRpb24ocmVxOm5wYy5Mb2NhdGlvblJlcSwgbGlzdDpucGMuTG9jYXRpb25bXSwgeDpudW1iZXIsIHk6bnVtYmVyKTpucGMuTG9jYXRpb24ge1xyXG4gIHZhciByZXQ6bnBjLkxvY2F0aW9uID0gbnVsbDtcclxuICB2YXIgbWluRGlzdDpudW1iZXIgPSAtMTtcclxuICB2YXIgaTpudW1iZXIgPSAwO1xyXG4gIGZvciAoaSA9IDA7IGk8bGlzdC5sZW5ndGg7IGkrKyl7XHJcbiAgICB2YXIgdmFsaWQ6Ym9vbGVhbiA9IHRydWU7XHJcbiAgICB2YXIgY2hlY2sxOmJvb2xlYW4gPSB0cnVlO1xyXG4gICAgdmFyIGo6bnVtYmVyID0gMDtcclxuICAgIGZvciAoaiA9IDA7IGo8cmVxLmhhc0FsbE9mLmxlbmd0aDsgaisrKXtcclxuICAgICAgaWYgKCEoaW5MaXN0KHJlcS5oYXNBbGxPZltqXSxsaXN0W2ldLnRhZ3MpKSkge1xyXG4gICAgICAgIGNoZWNrMSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB2YXIgY2hlY2syOmJvb2xlYW4gPSBmYWxzZTtcclxuICAgIGZvciAoaiA9IDA7IGo8cmVxLmhhc09uZU9yTW9yZU9mLmxlbmd0aDsgaisrKXtcclxuICAgICAgaWYgKGluTGlzdChyZXEuaGFzT25lT3JNb3JlT2Zbal0sbGlzdFtpXS50YWdzKSkge1xyXG4gICAgICAgIGNoZWNrMiA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChyZXEuaGFzT25lT3JNb3JlT2YubGVuZ3RoID09IDApIHtcclxuICAgICAgY2hlY2syID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIHZhciBjaGVjazM6Ym9vbGVhbiA9IHRydWU7XHJcbiAgICBmb3IgKGogPSAwOyBqPHJlcS5oYXNOb25lT2YubGVuZ3RoOyBqKyspe1xyXG4gICAgICBpZiAoaW5MaXN0KHJlcS5oYXNOb25lT2Zbal0sbGlzdFtpXS50YWdzKSkge1xyXG4gICAgICAgIGNoZWNrMyA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAocmVxLmhhc05vbmVPZi5sZW5ndGggPT0gMCkge1xyXG4gICAgICBjaGVjazMgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgaWYgKCEoY2hlY2sxICYmIGNoZWNrMiAmJiBjaGVjazMpKSB7XHJcbiAgICAgIHZhbGlkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZiAodmFsaWQpIHtcclxuICAgICAgdmFyIHRyYXZlbERpc3Q6IG51bWJlciA9IE1hdGguYWJzKGxpc3RbaV0ueFBvcyAtIHgpICsgTWF0aC5hYnMobGlzdFtpXS55UG9zIC0geSk7XHJcbiAgICAgIGlmICgobWluRGlzdCA+IHRyYXZlbERpc3QpIHx8IChtaW5EaXN0ID0gLTEpKSB7XHJcbiAgICAgICAgbWluRGlzdCA9IHRyYXZlbERpc3Q7XHJcbiAgICAgICAgcmV0ID0gbGlzdFtpXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gcmV0O1xyXG59XHJcblxyXG4vKiAgU2VsZWN0cyBhbiBhY3Rpb24gZnJvbSBhIGxpc3Qgb2YgdmFsaWQgYWN0aW9ucyB0byBiZSBwcmVmb3JtZWQgYnkgYSBzcGVjaWZpYyBhZ2VudC5cclxuICAgIENob3NlcyB0aGUgYWN0aW9uIHdpdGggdGhlIG1heGltYWwgdXRpbGl0eSBvZiB0aGUgYWdlbnQgKG1vdGl2ZSBpbmNyZWFzZS90aW1lKS5cclxuICAgIGFnZW50OiB0aGUgYWdlbnQgaW4gcXVlc3Rpb25cclxuICAgIGFjdGlvbkxpc3Q6IHRoZSBsaXN0IG9mIHZhbGlkIGFjdGlvbnNcclxuICAgIGxvY2F0aW9uTGlzdDogYWxsIGxvY2F0aW9ucyBpbiB0aGUgd29ybGRcclxuICAgIHJldHVybjogVGhlIHNpbmdsZSBhY3Rpb24gY2hvc2VuIGZyb20gdGhlIGxpc3QgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdF9hY3Rpb24oYWdlbnQ6bnBjLkFnZW50LCBhY3Rpb25MaXN0Om5wYy5BY3Rpb25bXSwgbG9jYXRpb25MaXN0Om5wYy5Mb2NhdGlvbltdKTpucGMuQWN0aW9uIHtcclxuICAvLyBpbml0aWFsaXplZCB0byAwIChubyByZWFzb24gdG8gZG8gYW4gYWN0aW9uIGlmIGl0IHdpbGwgaGFybSB5b3UpXHJcbiAgdmFyIG1heERlbHRhVXRpbGl0eTpudW1iZXIgPSAwO1xyXG4gIC8vIGluaXRpYWxpemVkIHRvIHRoZSBpbmFjdGlvblxyXG4gIHZhciBjdXJyZW50Q2hvaWNlOm5wYy5BY3Rpb24gPSB3YWl0X2FjdGlvbjtcclxuICAvLyBGaW5kcyB0aGUgdXRpbGl0eSBmb3IgZWFjaCBhY3Rpb24gdG8gdGhlIGdpdmVuIGFnZW50XHJcbiAgdmFyIGk6bnVtYmVyID0gMDtcclxuICBmb3IgKGkgPSAwOyBpPGFjdGlvbkxpc3QubGVuZ3RoOyBpKyspe1xyXG4gICAgdmFyIGRlc3Q6bnBjLkxvY2F0aW9uID0gbnVsbDtcclxuICAgIHZhciB0cmF2ZWxUaW1lOm51bWJlciA9IDA7XHJcbiAgICB2YXIgY2hlY2s6Ym9vbGVhbiA9IHRydWU7XHJcbiAgICB2YXIgazpudW1iZXIgPSAwO1xyXG4gICAgZm9yIChrID0gMDsgazxhY3Rpb25MaXN0W2ldLnJlcXVpcmVtZW50cy5sZW5ndGg7IGsrKykge1xyXG4gICAgICBpZiAoYWN0aW9uTGlzdFtpXS5yZXF1aXJlbWVudHNba10udHlwZSA9PSAwKXtcclxuICAgICAgICB2YXIgcmVxdWlyZW1lbnQ6bnBjLkxvY2F0aW9uUmVxID0gYWN0aW9uTGlzdFtpXS5yZXF1aXJlbWVudHNba10ucmVxIGFzIG5wYy5Mb2NhdGlvblJlcTtcclxuICAgICAgICBkZXN0ID0gZ2V0TmVhcmVzdExvY2F0aW9uKHJlcXVpcmVtZW50LCBsb2NhdGlvbkxpc3QsIGFnZW50LnhQb3MsIGFnZW50LnlQb3MpO1xyXG4gICAgICAgIGlmIChkZXN0ID09IG51bGwpIHtcclxuICAgICAgICAgIGNoZWNrID0gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRyYXZlbFRpbWUgPSBNYXRoLmFicyhkZXN0LnhQb3MgLSBhZ2VudC54UG9zKSArIE1hdGguYWJzKGRlc3QueVBvcyAtIGFnZW50LnlQb3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gaWYgYW4gYWN0aW9uIGhhcyBzYXRpc2ZpYWJsZSByZXF1aXJlbWVudHNcclxuICAgIGlmIChjaGVjaykge1xyXG4gICAgICB2YXIgZGVsdGFVdGlsaXR5Om51bWJlciA9IDA7XHJcbiAgICAgIHZhciBqOm51bWJlciA9IDA7XHJcbiAgICAgIGZvciAoaiA9IDA7IGo8YWN0aW9uTGlzdFtpXS5lZmZlY3RzLmxlbmd0aDsgaisrKXtcclxuICAgICAgICBzd2l0Y2goYWN0aW9uTGlzdFtpXS5lZmZlY3RzW2pdLm1vdGl2ZSl7XHJcbiAgICAgICAgICBjYXNlIDA6IHtcclxuICAgICAgICAgICAgZGVsdGFVdGlsaXR5ICs9IGNsYW1wKGFjdGlvbkxpc3RbaV0uZWZmZWN0c1tqXS5kZWx0YSArIGFnZW50LnBoeXNpY2FsLCBNQVhfTUVURVIsIE1JTl9NRVRFUikgLSBhZ2VudC5waHlzaWNhbDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYXNlIDE6IHtcclxuICAgICAgICAgICAgZGVsdGFVdGlsaXR5ICs9IGNsYW1wKGFjdGlvbkxpc3RbaV0uZWZmZWN0c1tqXS5kZWx0YSArIGFnZW50LmVtb3Rpb25hbCwgTUFYX01FVEVSLCBNSU5fTUVURVIpIC0gYWdlbnQuZW1vdGlvbmFsO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNhc2UgMjoge1xyXG4gICAgICAgICAgICBkZWx0YVV0aWxpdHkgKz0gY2xhbXAoYWN0aW9uTGlzdFtpXS5lZmZlY3RzW2pdLmRlbHRhICsgYWdlbnQuc29jaWFsLCBNQVhfTUVURVIsIE1JTl9NRVRFUikgLSBhZ2VudC5zb2NpYWw7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY2FzZSAzOiB7XHJcbiAgICAgICAgICAgIGRlbHRhVXRpbGl0eSArPSBjbGFtcChhY3Rpb25MaXN0W2ldLmVmZmVjdHNbal0uZGVsdGEgKyBhZ2VudC5hY2NvbXBsaXNobWVudCwgTUFYX01FVEVSLCBNSU5fTUVURVIpIC0gYWdlbnQuYWNjb21wbGlzaG1lbnQ7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY2FzZSA0OiB7XHJcbiAgICAgICAgICAgIGRlbHRhVXRpbGl0eSArPSBjbGFtcChhY3Rpb25MaXN0W2ldLmVmZmVjdHNbal0uZGVsdGEgKyBhZ2VudC5maW5hbmNpYWwsIE1BWF9NRVRFUiwgTUlOX01FVEVSKSAtIGFnZW50LmZpbmFuY2lhbDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvLyBhZGp1c3QgZm9yIHRpbWUgKGluY2x1ZGluZyB0cmF2ZWwgdGltZSlcclxuICAgICAgZGVsdGFVdGlsaXR5ID0gZGVsdGFVdGlsaXR5LyhhY3Rpb25MaXN0W2ldLnRpbWVfbWluICsgdHJhdmVsVGltZSk7XHJcbiAgICAgIC8vLyB1cGRhdGUgY2hvaWNlIGlmIG5ldyB1dGlsaXR5IGlzIG1heGltdW0gc2VlbiBzbyBmYXJcclxuICAgICAgaWYgKGRlbHRhVXRpbGl0eSA+IG1heERlbHRhVXRpbGl0eSkge1xyXG4gICAgICAgIG1heERlbHRhVXRpbGl0eSA9IGRlbHRhVXRpbGl0eTtcclxuICAgICAgICBjdXJyZW50Q2hvaWNlID0gYWN0aW9uTGlzdFtpXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gY3VycmVudENob2ljZTtcclxufVxyXG5cclxuLyogIFNlbGVjdHMgYW4gYWN0aW9uIGZyb20gYSBsaXN0IG9mIHZhbGlkIGFjdGlvbnMgdG8gYmUgcHJlZm9ybWVkIGJ5IGEgc3BlY2lmaWMgYWdlbnQuXHJcbiAgICBDaG9zZXMgdGhlIGFjdGlvbiB3aXRoIHRoZSBtYXhpbWFsIHV0aWxpdHkgb2YgdGhlIGFnZW50IChtb3RpdmUgaW5jcmVhc2UvdGltZSkuXHJcbiAgICBhZ2VudDogdGhlIGFnZW50IGluIHF1ZXN0aW9uXHJcbiAgICBhY3Rpb246IHRoZSBhY3Rpb24gaW4gcXVlc3Rpb24gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGV4ZWN1dGVfYWN0aW9uKGFnZW50Om5wYy5BZ2VudCwgYWN0aW9uOm5wYy5BY3Rpb24pOnZvaWQge1xyXG4gIHZhciBpOm51bWJlciA9IDA7XHJcbiAgLy8gYXBwbHkgZWFjaCBlZmZlY3Qgb2YgdGhlIGFjdGlvbiBieSB1cGRhdGluZyB0aGUgYWdlbnQncyBtb3RpdmVzXHJcbiAgZm9yIChpID0gMDsgaTxhY3Rpb24uZWZmZWN0cy5sZW5ndGg7IGkrKyl7XHJcbiAgICBzd2l0Y2goYWN0aW9uLmVmZmVjdHNbaV0ubW90aXZlKXtcclxuICAgICAgY2FzZSAwOiB7XHJcbiAgICAgICAgYWdlbnQucGh5c2ljYWwgPSBjbGFtcChhZ2VudC5waHlzaWNhbCArIGFjdGlvbi5lZmZlY3RzW2ldLmRlbHRhLCBNQVhfTUVURVIsIE1JTl9NRVRFUilcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlIDE6IHtcclxuICAgICAgICBhZ2VudC5lbW90aW9uYWwgPSBjbGFtcChhZ2VudC5lbW90aW9uYWwgKyBhY3Rpb24uZWZmZWN0c1tpXS5kZWx0YSwgTUFYX01FVEVSLCBNSU5fTUVURVIpXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAyOiB7XHJcbiAgICAgICAgYWdlbnQuc29jaWFsID0gY2xhbXAoYWdlbnQuc29jaWFsICsgYWN0aW9uLmVmZmVjdHNbaV0uZGVsdGEsIE1BWF9NRVRFUiwgTUlOX01FVEVSKVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgMzoge1xyXG4gICAgICAgIGFnZW50LmFjY29tcGxpc2htZW50ID0gY2xhbXAoYWdlbnQuYWNjb21wbGlzaG1lbnQgKyBhY3Rpb24uZWZmZWN0c1tpXS5kZWx0YSwgTUFYX01FVEVSLCBNSU5fTUVURVIpXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSA0OiB7XHJcbiAgICAgICAgYWdlbnQuZmluYW5jaWFsID0gY2xhbXAoYWdlbnQuZmluYW5jaWFsICsgYWN0aW9uLmVmZmVjdHNbaV0uZGVsdGEsIE1BWF9NRVRFUiwgTUlOX01FVEVSKVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyogIFNlbGVjdHMgYW4gYWN0aW9uIGZyb20gYSBsaXN0IG9mIHZhbGlkIGFjdGlvbnMgdG8gYmUgcHJlZm9ybWVkIGJ5IGEgc3BlY2lmaWMgYWdlbnQuXHJcbiAgICBDaG9zZXMgdGhlIGFjdGlvbiB3aXRoIHRoZSBtYXhpbWFsIHV0aWxpdHkgb2YgdGhlIGFnZW50IChtb3RpdmUgaW5jcmVhc2UvdGltZSkuXHJcbiAgICBhZ2VudExpc3Q6IGxpc3Qgb2YgYWdlbnRzIGluIHRoZSBzaW1cclxuICAgIGFjdGlvbkxpc3Q6IHRoZSBsaXN0IG9mIHZhbGlkIGFjdGlvbnNcclxuICAgIGxvY2F0aW9uTGlzdDogYWxsIGxvY2F0aW9ucyBpbiB0aGUgd29ybGRcclxuICAgIGNvbnRpbnVlRnVuY3Rpb246IGJvb2xlYW4gZnVuY3Rpb24gdGhhdCBpcyB1c2VkIGFzIGEgY2hlY2sgYXMgdG8gd2hldGhlciBvciBub3QgdG8ga2VlcCBydW5uaW5nIHRoZSBzaW0gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJ1bl9zaW0oYWdlbnRMaXN0Om5wYy5BZ2VudFtdLCBhY3Rpb25MaXN0Om5wYy5BY3Rpb25bXSwgbG9jYXRpb25MaXN0Om5wYy5Mb2NhdGlvbltdLCBjb250aW51ZUZ1bmN0aW9uOiAoKSA9PiBib29sZWFuKTp2b2lkIHtcclxuICB3aGlsZSAoY29udGludWVGdW5jdGlvbigpKSB7XHJcbiAgICBzaHVmZmxlQXJyYXkoYWdlbnRMaXN0KTtcclxuICAgIHZhciBpOm51bWJlciA9IDA7XHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgYWdlbnRMaXN0Lmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAodGltZSU2MDAgPT0gMCkge1xyXG4gICAgICAgIGlmICghaXNDb250ZW50KGFnZW50TGlzdFtpXSkpIHtcclxuICAgICAgICAgIGFnZW50TGlzdFtpXS5waHlzaWNhbCA9IGNsYW1wKGFnZW50TGlzdFtpXS5waHlzaWNhbCAtIDEsIE1BWF9NRVRFUiwgTUlOX01FVEVSKTtcclxuICAgICAgICAgIGFnZW50TGlzdFtpXS5lbW90aW9uYWwgPSBjbGFtcChhZ2VudExpc3RbaV0uZW1vdGlvbmFsIC0gMSwgTUFYX01FVEVSLCBNSU5fTUVURVIpO1xyXG4gICAgICAgICAgYWdlbnRMaXN0W2ldLnNvY2lhbCA9IGNsYW1wKGFnZW50TGlzdFtpXS5zb2NpYWwgLSAxLCBNQVhfTUVURVIsIE1JTl9NRVRFUik7XHJcbiAgICAgICAgICBhZ2VudExpc3RbaV0uYWNjb21wbGlzaG1lbnQgPSBjbGFtcChhZ2VudExpc3RbaV0uYWNjb21wbGlzaG1lbnQgLSAxLCBNQVhfTUVURVIsIE1JTl9NRVRFUik7XHJcbiAgICAgICAgICBhZ2VudExpc3RbaV0uZmluYW5jaWFsID0gY2xhbXAoYWdlbnRMaXN0W2ldLmZpbmFuY2lhbCAtIDEsIE1BWF9NRVRFUiwgTUlOX01FVEVSKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGFnZW50TGlzdFtpXS5vY2N1cGllZENvdW50ZXIgPiAwKSB7XHJcbiAgICAgICAgYWdlbnRMaXN0W2ldLm9jY3VwaWVkQ291bnRlci0tO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmICghaXNDb250ZW50KGFnZW50TGlzdFtpXSkpIHtcclxuICAgICAgICAgIGFnZW50TGlzdFtpXS5kZXN0aW5hdGlvbiA9IG51bGw7XHJcbiAgICAgICAgICBleGVjdXRlX2FjdGlvbihhZ2VudExpc3RbaV0sIGFnZW50TGlzdFtpXS5jdXJyZW50QWN0aW9uKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwidGltZTogXCIgKyB0aW1lLnRvU3RyaW5nKCkgKyBcIiB8IFwiICsgYWdlbnRMaXN0W2ldLm5hbWUgKyBcIjogRmluaXNoZWQgXCIgKyBhZ2VudExpc3RbaV0uY3VycmVudEFjdGlvbi5uYW1lKTtcclxuICAgICAgICAgIHZhciBjaG9pY2U6bnBjLkFjdGlvbiA9IHNlbGVjdF9hY3Rpb24oYWdlbnRMaXN0W2ldLCBhY3Rpb25MaXN0LCBsb2NhdGlvbkxpc3QpO1xyXG4gICAgICAgICAgdmFyIGRlc3Q6bnBjLkxvY2F0aW9uID0gbnVsbDtcclxuICAgICAgICAgIHZhciBrOm51bWJlciA9IDA7XHJcbiAgICAgICAgICBmb3IgKGsgPSAwOyBrPGNob2ljZS5yZXF1aXJlbWVudHMubGVuZ3RoOyBrKyspIHtcclxuICAgICAgICAgICAgaWYgKGNob2ljZS5yZXF1aXJlbWVudHNba10udHlwZSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgdmFyIHJlcXVpcmVtZW50Om5wYy5Mb2NhdGlvblJlcSA9IGNob2ljZS5yZXF1aXJlbWVudHNba10ucmVxIGFzIG5wYy5Mb2NhdGlvblJlcTtcclxuICAgICAgICAgICAgICBkZXN0ID0gZ2V0TmVhcmVzdExvY2F0aW9uKHJlcXVpcmVtZW50LCBsb2NhdGlvbkxpc3QsIGFnZW50TGlzdFtpXS54UG9zLCBhZ2VudExpc3RbaV0ueVBvcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vc2V0IGFjdGlvbiB0byBjaG9pY2Ugb3IgdG8gdHJhdmVsIGlmIGFnZW50IGlzIG5vdCBhdCBsb2NhdGlvbiBmb3IgY2hvaWNlXHJcbiAgICAgICAgICBpZiAoZGVzdCA9PT0gbnVsbCB8fCAoZGVzdC54UG9zID09IGFnZW50TGlzdFtpXS54UG9zICYmIGRlc3QueVBvcyA9PSBhZ2VudExpc3RbaV0ueVBvcykpIHtcclxuICAgICAgICAgICAgYWdlbnRMaXN0W2ldLmN1cnJlbnRBY3Rpb24gPSBjaG9pY2U7XHJcbiAgICAgICAgICAgIGFnZW50TGlzdFtpXS5vY2N1cGllZENvdW50ZXIgPSBjaG9pY2UudGltZV9taW47XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidGltZTogXCIgKyB0aW1lLnRvU3RyaW5nKCkgKyBcIiB8IFwiICsgYWdlbnRMaXN0W2ldLm5hbWUgKyBcIjogU3RhcnRlZCBcIiArIGFnZW50TGlzdFtpXS5jdXJyZW50QWN0aW9uLm5hbWUpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIHRyYXZlbFRpbWU6bnVtYmVyID0gTWF0aC5hYnMoZGVzdC54UG9zIC0gYWdlbnRMaXN0W2ldLnhQb3MpICsgTWF0aC5hYnMoZGVzdC55UG9zIC0gYWdlbnRMaXN0W2ldLnlQb3MpO1xyXG4gICAgICAgICAgICBhZ2VudExpc3RbaV0uY3VycmVudEFjdGlvbiA9IHRyYXZlbF9hY3Rpb247XHJcbiAgICAgICAgICAgIGFnZW50TGlzdFtpXS5vY2N1cGllZENvdW50ZXIgPSBNYXRoLmFicyhkZXN0LnhQb3MgLSBhZ2VudExpc3RbaV0ueFBvcykgKyBNYXRoLmFicyhkZXN0LnlQb3MgLSBhZ2VudExpc3RbaV0ueVBvcyk7XHJcbiAgICAgICAgICAgIGRlc3QueFBvcyA9IGFnZW50TGlzdFtpXS54UG9zO1xyXG4gICAgICAgICAgICBkZXN0LnlQb3MgPSBhZ2VudExpc3RbaV0ueVBvcztcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0aW1lOiBcIiArIHRpbWUudG9TdHJpbmcoKSArIFwiIHwgXCIgKyBhZ2VudExpc3RbaV0ubmFtZSArIFwiOiBTdGFydGVkIFwiICsgYWdlbnRMaXN0W2ldLmN1cnJlbnRBY3Rpb24ubmFtZSArIFwiOyBEZXN0aW5hdGlvbjogXCIgKyBkZXN0Lm5hbWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGltZSArPSAxO1xyXG4gIH1cclxuICBjb25zb2xlLmxvZyhcIkZpbmlzaGVkLlwiKTtcclxufVxyXG4iLCJpbXBvcnQgKiBhcyBlbmdpbmUgZnJvbSBcIi4vZXhlY3V0aW9uX2VuZ2luZVwiO1xyXG5pbXBvcnQgKiBhcyBhY3Rpb25zIGZyb20gXCIuL2FjdGlvbl9zcGVjc1wiO1xyXG5pbXBvcnQgKiBhcyBucGMgZnJvbSBcIi4vYWdlbnRcIjtcclxuXHJcbi8vIExpc3Qgb2YgYXZhaWxhYmxlIGFjdGlvbnMgaW4gc2ltXHJcbnZhciBhY3Rpb25MaXN0Om5wYy5BY3Rpb25bXSA9IFthY3Rpb25zLmVhdF9hY3Rpb24sIGFjdGlvbnMubW92aWVfYWN0aW9uLCBhY3Rpb25zLmVhdF9mcmllbmRfYWN0aW9uLCBhY3Rpb25zLm1vdmllX2ZyaWVuZF9hY3Rpb24sIGFjdGlvbnMud29ya19hY3Rpb24sIGFjdGlvbnMuaG9iYnlfYWN0aW9uXTtcclxuXHJcbi8vIGFnZW50c1xyXG52YXIgYWdlbnQxOm5wYy5BZ2VudCA9XHJcbntcclxuICBuYW1lOiBcIkpvaG4gRG9lXCIsXHJcbiAgcGh5c2ljYWw6IDEsXHJcbiAgZW1vdGlvbmFsOiAxLFxyXG4gIHNvY2lhbDogMSxcclxuICBmaW5hbmNpYWw6IDEsXHJcbiAgYWNjb21wbGlzaG1lbnQ6IDEsXHJcbiAgeFBvczogMCxcclxuICB5UG9zOiAwLFxyXG4gIG9jY3VwaWVkQ291bnRlcjogMCxcclxuICBjdXJyZW50QWN0aW9uOiBhY3Rpb25zLndhaXRfYWN0aW9uLFxyXG4gIGRlc3RpbmF0aW9uOiBudWxsXHJcbn07XHJcblxyXG4vLyBhZ2VudHNcclxudmFyIGFnZW50MjpucGMuQWdlbnQgPVxyXG57XHJcbiAgbmFtZTogXCJKYW5lIERvZVwiLFxyXG4gIHBoeXNpY2FsOiA0LFxyXG4gIGVtb3Rpb25hbDogMSxcclxuICBzb2NpYWw6IDQsXHJcbiAgZmluYW5jaWFsOiAxLFxyXG4gIGFjY29tcGxpc2htZW50OiA0LFxyXG4gIHhQb3M6IDUsXHJcbiAgeVBvczogNSxcclxuICBvY2N1cGllZENvdW50ZXI6IDAsXHJcbiAgY3VycmVudEFjdGlvbjogYWN0aW9ucy53YWl0X2FjdGlvbixcclxuICBkZXN0aW5hdGlvbjogbnVsbFxyXG59O1xyXG5cclxuLy8gTGlzdCBvZiBhZ2VudHMgaW4gc2ltXHJcbnZhciBhZ2VudExpc3Q6bnBjLkFnZW50W10gPSBbYWdlbnQxLCBhZ2VudDJdO1xyXG5cclxuLy8gTG9jYXRpb25zXHJcbi8vIExvY2F0aW9ucyBhcmUgYSBwb3NpdGlvbiwgYSBuYW1lLCBhbmQgYSBsaXN0IG9mIHRhZ3NcclxudmFyIHJlc3RhdXJhbnQ6bnBjLkxvY2F0aW9uID0ge25hbWU6IFwicmVzdGF1cmFudFwiLCB4UG9zOiA1LCB5UG9zOiA1LCB0YWdzOiBbXCJyZXN0YXVyYW50XCIsIFwiZW1wbG95bWVudFwiXX1cclxuXHJcbnZhciBtb3ZpZV90aGVhdHJlOm5wYy5Mb2NhdGlvbiA9IHtuYW1lOiBcIm1vdmllIHRoZWF0cmVcIiwgeFBvczogMCwgeVBvczogNSwgdGFnczogW1wibW92aWUgdGhlYXRyZVwiLCBcImVtcGxveW1lbnRcIl19XHJcblxyXG52YXIgaG9tZTpucGMuTG9jYXRpb24gPSB7bmFtZTogXCJob21lXCIsIHhQb3M6IDUsIHlQb3M6IDAsIHRhZ3M6IFtcImhvbWVcIl19XHJcblxyXG4vL2xvY2F0aW9uIExpc3RcclxudmFyIGxvY2F0aW9uTGlzdDpucGMuTG9jYXRpb25bXSA9IFtyZXN0YXVyYW50LCBtb3ZpZV90aGVhdHJlLCBob21lXTtcclxuXHJcbi8vIGNvbmRpdGlvbiBmdW5jdGlvbi5cclxuLy8gU3RvcHMgdGhlIHNpbSB3aGVuIGFsbCBhZ2VudHMgYXJlIGF0IGZ1bGwgbWV0ZXJzXHJcbmZ1bmN0aW9uIGNvbmRpdGlvbigpOmJvb2xlYW4ge1xyXG4gIHZhciBjaGVjazpib29sZWFuID0gZmFsc2U7XHJcbiAgdmFyIGk6bnVtYmVyID0gMDtcclxuICAvLyBjaGVjayB0aGUgbWV0ZXIgbGV2ZWxzIGZvciBlYWNoIGFnZW50IGluIHRoZSBzaW1cclxuICBmb3IgKGkgPSAwOyBpPCBhZ2VudExpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmIChhZ2VudExpc3RbaV0ucGh5c2ljYWwgPCBlbmdpbmUuTUFYX01FVEVSKSB7XHJcbiAgICAgIGNoZWNrID0gdHJ1ZTtcclxuICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBpZiAoYWdlbnRMaXN0W2ldLmVtb3Rpb25hbCA8IGVuZ2luZS5NQVhfTUVURVIpIHtcclxuICAgICAgY2hlY2sgPSB0cnVlO1xyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICAgIGlmIChhZ2VudExpc3RbaV0uc29jaWFsIDwgZW5naW5lLk1BWF9NRVRFUikge1xyXG4gICAgICBjaGVjayA9IHRydWU7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgaWYgKGFnZW50TGlzdFtpXS5maW5hbmNpYWwgPCBlbmdpbmUuTUFYX01FVEVSKSB7XHJcbiAgICAgIGNoZWNrID0gdHJ1ZTtcclxuICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBpZiAoYWdlbnRMaXN0W2ldLmFjY29tcGxpc2htZW50IDwgZW5naW5lLk1BWF9NRVRFUikge1xyXG4gICAgICBjaGVjayA9IHRydWU7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gY2hlY2s7XHJcbn1cclxuXHJcbmVuZ2luZS5ydW5fc2ltKGFnZW50TGlzdCwgYWN0aW9uTGlzdCwgbG9jYXRpb25MaXN0LCBjb25kaXRpb24pO1xyXG5cclxuLy8gRGlzcGxheXMgdGV4dCBvbiB0aGUgYnJvd3Nlcj8gSSBhc3N1bWVcclxuZnVuY3Rpb24gc2hvd09uQnJvd3NlcihkaXZOYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZykge1xyXG4gIGNvbnN0IGVsdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpdk5hbWUpO1xyXG4gIGVsdC5pbm5lclRleHQgPSBuYW1lICsgXCJIZWxsbyBXb3JsZCFcIjtcclxufVxyXG5cclxuc2hvd09uQnJvd3NlcihcImdyZWV0aW5nXCIsIFwiVHlwZVNjcmlwdFwiKTtcclxuIl19
