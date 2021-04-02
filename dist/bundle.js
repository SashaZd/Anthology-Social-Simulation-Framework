(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionList = exports.hobby_action = exports.work_action = exports.movie_friend_action = exports.eat_friend_action = exports.movie_action = exports.eat_action = exports.travel_action = exports.wait_action = void 0;
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
// List of available actions in sim
exports.actionList = [exports.wait_action, exports.travel_action, exports.eat_action, exports.movie_action, exports.eat_friend_action, exports.movie_friend_action, exports.work_action, exports.hobby_action];

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
                dest = exec.getNearestLocation(requirement, locationList, agent.currentLocation.xPos, agent.currentLocation.yPos);
                if (dest == null) {
                    check = false;
                }
                else {
                    travelTime = Math.abs(dest.xPos - agent.currentLocation.xPos) + Math.abs(dest.yPos - agent.currentLocation.yPos);
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
                    dest = exec.getNearestLocation(requirement, locationList, agent.currentLocation.xPos, agent.currentLocation.yPos);
                }
            }
            //set action to choice or to travel if agent is not at location for choice
            if (dest === null || (dest.xPos == agent.currentLocation.xPos && dest.yPos == agent.currentLocation.yPos)) {
                agent.currentAction = choice;
                agent.occupiedCounter = choice.time_min;
                // console.log("time: " + time.toString() + " | " + agent.name + ": Started " + agent.currentAction.name);
            }
            else {
                var travelTime = Math.abs(dest.xPos - agent.currentLocation.xPos) + Math.abs(dest.yPos - agent.currentLocation.yPos);
                agent.currentAction = action_specs_2.travel_action;
                agent.occupiedCounter = Math.abs(dest.xPos - agent.currentLocation.xPos) + Math.abs(dest.yPos - agent.currentLocation.yPos);
                dest.xPos = agent.currentLocation.xPos;
                dest.yPos = agent.currentLocation.yPos;
            }
        }
    }
}
exports.turn = turn;

},{"./action_specs":1,"./execution_engine":4}],3:[function(require,module,exports){
module.exports={
	"agents": [
		{
			"name": "John Doe",
			"motive": {
				"physical": 1,
				"emotional": 1,
				"social": 1,
				"financial": 1,
				"accomplishment": 1
			},
			"currentLocation": {
				"xPos": 0,
				"yPos": 0
			},
			"occupiedCounter": 0,
			"currentAction": "wait_action",
			"destination": {
				"xPos": 0,
				"yPos": 0
			}
		},
		{
			"name": "Jane Doe",
			"motive": {
				"physical": 4,
				"emotional": 1,
				"social": 4,
				"financial": 1,
				"accomplishment": 4
			},
			"currentLocation": {
				"xPos": 5,
				"yPos": 5
			},
			"occupiedCounter": 0,
			"currentAction": "wait_action",
			"destination": {
				"xPos": 0,
				"yPos": 0
			}
		}
	]
}
},{}],4:[function(require,module,exports){
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

},{"./agent":2}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var engine = require("./execution_engine");
var actions = require("./action_specs");
var utility = require("./utilities");
// import * as json_data from "./data.json";
var json_data = require("./data.json");
// import 'reflect-metadata';
// import 'es6-shim';
var agentList = utility.loadAgentsFromJSON(json_data["agents"]);
// Uncomment post this
// List of agents in sim
// var agentList:npc.Agent[] = [agent1, agent2];
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
engine.run_sim(agentList, actions.actionList, locationList, condition);
// Displays text on the browser? I assume
function showOnBrowser(divName, name) {
    var elt = document.getElementById(divName);
    elt.innerText = name + "Hello World!";
}
showOnBrowser("greeting", "TypeScript");

},{"./action_specs":1,"./data.json":3,"./execution_engine":4,"./utilities":6}],6:[function(require,module,exports){
"use strict";
// Utilties File
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAgentsFromJSON = exports.getActionByName = void 0;
var action_specs_1 = require("./action_specs");
// importing File System module of node
// const fs = require('fs');
// // File logging 
// export class Logger {
// 	private stream: any = fs.createWriteStream('file.txt');
// 	file(log_message: string) {
// 		// this.stream.write('Hello ', log_message);
// 		// this.fs.createWriteStream('log.txt', { flags: 'a' });
// 		// this.fs.write('new entry\n');
// 		console.log("Logging file: ", log_message);
// 	}
// 	readFile(){
// 	}
// 	closeLogFile(){
// 		var stream = fs.createWriteStream('./file.txt');
// 		stream.on('finish', () => {
// 			console.log('All the data is transmitted');
// 		});
// 	}
// }
// Currently using global actionList, but can also pass param to function: actionList:simTypes.Action[]
function getActionByName(name) {
    console.log("In getActionByName");
    console.log(name);
    var possible_actions = action_specs_1.actionList.filter(function (action) { return action.name === name; });
    if (possible_actions.length > 0) {
        return possible_actions[0];
    }
    else {
        // returns false if there is no listed action with this name
        console.log("getActionByName => Couldn't find action with name: ", name);
    }
}
exports.getActionByName = getActionByName;
// Returns a Agent[] using data from the data.json file 
// matches the string:action_name against existing actions and returns the same
function loadAgentsFromJSON(agent_json) {
    var agentList = [];
    for (var _i = 0, agent_json_1 = agent_json; _i < agent_json_1.length; _i++) {
        var parseAgent = agent_json_1[_i];
        var possible_action = getActionByName(parseAgent.currentAction);
        if (possible_action) {
            var agent = {
                name: parseAgent.name,
                motive: parseAgent.motive,
                occupiedCounter: parseAgent.occupiedCounter,
                currentAction: possible_action,
                destination: parseAgent.destination,
                currentLocation: parseAgent.currentLocation
            };
            agentList.push(agent);
        }
    }
    return agentList;
}
exports.loadAgentsFromJSON = loadAgentsFromJSON;

},{"./action_specs":1}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWN0aW9uX3NwZWNzLnRzIiwic3JjL2FnZW50LnRzIiwic3JjL2RhdGEuanNvbiIsInNyYy9leGVjdXRpb25fZW5naW5lLnRzIiwic3JjL21haW4udHMiLCJzcmMvdXRpbGl0aWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0FDV0EsNkJBQTZCO0FBQzdCLGlHQUFpRztBQUNqRyxvRkFBb0Y7QUFFcEYsNERBQTREO0FBQ2pELFFBQUEsV0FBVyxHQUN0QjtJQUNFLElBQUksRUFBRSxhQUFhO0lBQ25CLFlBQVksRUFBRSxFQUFFO0lBQ2hCLE9BQU8sRUFBRSxFQUFFO0lBQ1gsUUFBUSxFQUFFLENBQUM7Q0FDWixDQUFBO0FBRUQsdUVBQXVFO0FBQ3ZFLCtDQUErQztBQUNwQyxRQUFBLGFBQWEsR0FDeEI7SUFDRSxJQUFJLEVBQUUsZUFBZTtJQUNyQixZQUFZLEVBQUUsRUFBRTtJQUNoQixPQUFPLEVBQUUsRUFBRTtJQUNYLFFBQVEsRUFBRSxDQUFDO0NBQ1osQ0FBQTtBQUNELE1BQU07QUFFTixpREFBaUQ7QUFDakQsc0RBQXNEO0FBQ3RELDBEQUEwRDtBQUMvQyxRQUFBLFVBQVUsR0FDckI7SUFDRSxJQUFJLEVBQUUsWUFBWTtJQUNsQixZQUFZLEVBQUUsQ0FBQyxFQUFDLElBQUksRUFBQyxDQUFDLEVBQUUsR0FBRyxFQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsWUFBWSxDQUFDLEVBQUUsY0FBYyxFQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUMsRUFBRSxFQUFDLEVBQUMsQ0FBQztJQUN4RixPQUFPLEVBQU8sQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLENBQUMsRUFBQyxDQUFDO0lBQ25DLFFBQVEsRUFBTSxFQUFFO0NBQ2pCLENBQUM7QUFFRixxREFBcUQ7QUFDMUMsUUFBQSxZQUFZLEdBQ3ZCO0lBQ0UsSUFBSSxFQUFFLGNBQWM7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LEVBQUM7WUFDbkIsSUFBSSxLQUFLLEdBQW9CO2dCQUM1QixJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUk7Z0JBQ3JCLE1BQU0sRUFBRSxVQUFVLENBQUMsTUFBTTtnQkFDekIsZUFBZSxFQUFFLFVBQVUsQ0FBQyxlQUFlO2dCQUMzQyxhQUFhLEVBQUUsZUFBZTtnQkFDOUIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxXQUFXO2dCQUNuQyxlQUFlLEVBQUUsVUFBVSxDQUFDLGVBQWU7YUFDM0MsQ0FBQTtZQUNELFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdEI7S0FFRDtJQUNELE9BQU8sU0FBUyxDQUFDO0FBQ2xCLENBQUM7QUFsQkQsZ0RBa0JDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IHsgTW90aXZlIH0gZnJvbSBcIi4vYWdlbnRcIjtcbmltcG9ydCB7IEJpbk9wIH0gZnJvbSBcIi4vYWdlbnRcIjtcbmltcG9ydCB7IFJlcVR5cGUgfSBmcm9tIFwiLi9hZ2VudFwiO1xuaW1wb3J0IHsgTW90aXZlUmVxIH0gZnJvbSBcIi4vYWdlbnRcIjtcbmltcG9ydCB7IFBlb3BsZVJlcSB9IGZyb20gXCIuL2FnZW50XCI7XG5pbXBvcnQgeyBMb2NhdGlvblJlcSB9IGZyb20gXCIuL2FnZW50XCI7XG5pbXBvcnQgeyBSZXF1aXJlbWVudCB9IGZyb20gXCIuL2FnZW50XCI7XG5pbXBvcnQgeyBFZmZlY3QgfSBmcm9tIFwiLi9hZ2VudFwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4vYWdlbnRcIjtcbmltcG9ydCB7IEFnZW50IH0gZnJvbSBcIi4vYWdlbnRcIjtcblxuLy8gREVGQVVMVCBBQ1RJT05TIC0gUkVRVUlSRURcbi8vIFRoZSBmb2xsb3dpbmcgYWN0aW9ucyBhcmUgcmVxdWlyZWQgZm9yIHRoZSBjdXJyZW50IHN0cnVjdHVyZSBvZiB0aGUgZXhlY3V0aW9uIGV4ZWN1dGlvbl9lbmdpbmVcbi8vV2hlbiBtb2RpZnlpbmcgdGhpcyBmaWxlIGZvciBtb3JlIHRlc3Qgc2NlbmFyaW9zLCBETyBOT1QgQ0hBTkdFIFRIRVNFIGFjdGlvbl9zcGVjc1xuXG4vLyBUaGUgd2FpdCBhY3Rpb24gaXMgdXNlZCB3aGVuIGFuIGFnZW50IGhhcyBtYXhpbWFsIG1vdGl2ZXNcbmV4cG9ydCB2YXIgd2FpdF9hY3Rpb24gOiBBY3Rpb24gPVxue1xuICBuYW1lOiBcIndhaXRfYWN0aW9uXCIsXG4gIHJlcXVpcmVtZW50czogW10sXG4gIGVmZmVjdHM6IFtdLFxuICB0aW1lX21pbjogMFxufVxuXG4vLyBUaGUgdHJhdmVsIGFjdGlvbiBpcyB1c2VkIHdoZW4gYW4gYWdlbnQgaXMgdHJhdmVsbGluZyB0byBhIGxvY2F0aW9uLlxuLy8gVGhlIHRpbWUgaXMgaGFuZGRsZXMgYnkgdGhlIGV4ZWN1dGlvbiBlbmdpbmVcbmV4cG9ydCB2YXIgdHJhdmVsX2FjdGlvbiA6IEFjdGlvbiA9XG57XG4gIG5hbWU6IFwidHJhdmVsX2FjdGlvblwiLFxuICByZXF1aXJlbWVudHM6IFtdLFxuICBlZmZlY3RzOiBbXSxcbiAgdGltZV9taW46IDBcbn1cbi8vIEVORFxuXG4vLyBGaWxscyBwaHlzaWNhbCwgcmVxdWlyZXMgYSByZXN0YXVyYW50IGxvY2F0aW9uXG4vLyBEaXNjdXNzOiByZXBsYWNlIHR5cGU6MCB3aXRoIHR5cGU6UmVxVHlwZS5sb2NhdGlvbiBcbi8vIERpc2N1c3M6IHJlcGxhY2UgZWZmZWN0J3MgbW90aXZlOjAgd2l0aCBNb3RpdmUucGh5c2ljYWxcbmV4cG9ydCB2YXIgZWF0X2FjdGlvbiA6IEFjdGlvbiA9XG57XG4gIG5hbWU6IFwiZWF0X2FjdGlvblwiLFxuICByZXF1aXJlbWVudHM6IFt7dHlwZTowLCByZXE6e2hhc0FsbE9mOltcInJlc3RhdXJhbnRcIl0sIGhhc09uZU9yTW9yZU9mOltdLCBoYXNOb25lT2Y6W119fV0sXG4gIGVmZmVjdHM6ICAgICAgW3ttb3RpdmU6MCwgZGVsdGE6Mn1dLFxuICB0aW1lX21pbjogICAgIDYwXG59O1xuXG4vLyBGaWxscyBlbW90aW9uYWwsIHJlcXVpcmVzIGEgbW92aWUgdGhlYXRyZSBsb2NhdGlvblxuZXhwb3J0IHZhciBtb3ZpZV9hY3Rpb24gOiBBY3Rpb24gPVxue1xuICBuYW1lOiBcIm1vdmllX2FjdGlvblwiLFxuICByZXF1aXJlbWVudHM6IFt7dHlwZTowLCByZXE6e2hhc0FsbE9mOltcIm1vdmllIHRoZWF0cmVcIl0sIGhhc09uZU9yTW9yZU9mOltdLCBoYXNOb25lT2Y6W119fV0sXG4gIGVmZmVjdHM6ICAgICAgW3ttb3RpdmU6MSwgZGVsdGE6M31dLFxuICB0aW1lX21pbjogICAgIDEyMFxufTtcblxuLy8gRmlsbHMgcGh5c2ljYWwgYW5kIHNvY2lhbCwgcmVxdWlyZXMgYSByZXN0YXVyYW50IGxvY2F0aW9uIGFuZCBhbiBhZGRpdGlvbmFsIHBlcnNvblxuZXhwb3J0IHZhciBlYXRfZnJpZW5kX2FjdGlvbiA6IEFjdGlvbiA9XG57XG4gIG5hbWU6IFwiZWF0X2ZyaWVuZF9hY3Rpb25cIixcbiAgcmVxdWlyZW1lbnRzOiBbe3R5cGU6MCwgcmVxOntoYXNBbGxPZjpbXCJyZXN0YXVyYW50XCJdLCBoYXNPbmVPck1vcmVPZjpbXSwgaGFzTm9uZU9mOltdfX0sXG4gICAgICAgICAgICAgICAge3R5cGU6MSwgcmVxOnttaW5OdW1QZW9wbGU6MiwgbWF4TnVtUGVvcGxlOi0xLCBzcGVjaWZpY1Blb3BsZVByZXNlbnQ6W10sIHNwZWNpZmljUGVvcGxlQWJzZW50OltdLCByZWxhdGlvbnNoaXBzUHJlc2VudDpbXSwgcmVsYXRpb25zaGlwc0Fic2VudDpbXX19XSxcbiAgZWZmZWN0czogICAgICBbe21vdGl2ZTowLCBkZWx0YToyfSwge21vdGl2ZToyLCBkZWx0YToyfV0sXG4gIHRpbWVfbWluOiAgICAgNzBcbn07XG5cbi8vIEZpbGxzIGVtb3Rpb25hbCBhbmQgc29jaWFsLCByZXF1aXJlcyBhIG1vdmllIHRoZWF0cmUgbG9jYXRpb24gYW5kIGFuIGFkZGl0aW9uYWwgcGVyc29uXG5leHBvcnQgdmFyIG1vdmllX2ZyaWVuZF9hY3Rpb24gOiBBY3Rpb24gPVxue1xuICBuYW1lOiBcIm1vdmllX2ZyaWVuZF9hY3Rpb25cIixcbiAgcmVxdWlyZW1lbnRzOiBbe3R5cGU6MCwgcmVxOntoYXNBbGxPZjpbXCJtb3ZpZSB0aGVhdHJlXCJdLCBoYXNPbmVPck1vcmVPZjpbXSwgaGFzTm9uZU9mOltdfX0sXG4gICAgICAgICAgICAgICAge3R5cGU6MSwgcmVxOnttaW5OdW1QZW9wbGU6MiwgbWF4TnVtUGVvcGxlOi0xLCBzcGVjaWZpY1Blb3BsZVByZXNlbnQ6W10sIHNwZWNpZmljUGVvcGxlQWJzZW50OltdLCByZWxhdGlvbnNoaXBzUHJlc2VudDpbXSwgcmVsYXRpb25zaGlwc0Fic2VudDpbXX19XSxcbiAgZWZmZWN0czogICAgICBbe21vdGl2ZToxLCBkZWx0YTozfSwge21vdGl2ZToyLCBkZWx0YToyfV0sXG4gIHRpbWVfbWluOiAgICAgMTMwXG59O1xuXG4vLyBGaWxscyBmaW5hbmNpYWwsIHJlcXVpcmVzIGEgbW92aWUgdGhlYXRyZSBsb2NhdGlvblxuZXhwb3J0IHZhciB3b3JrX2FjdGlvbiA6IEFjdGlvbiA9XG57XG4gIG5hbWU6IFwid29ya19hY3Rpb25cIixcbiAgcmVxdWlyZW1lbnRzOiBbe3R5cGU6MCwgcmVxOntoYXNBbGxPZjpbXCJlbXBsb3ltZW50XCJdLCBoYXNPbmVPck1vcmVPZjpbXSwgaGFzTm9uZU9mOltdfX1dLFxuICBlZmZlY3RzOiAgICAgIFt7bW90aXZlOjMsIGRlbHRhOjF9XSxcbiAgdGltZV9taW46ICAgICAyNDBcbn07XG5cbi8vIEZpbGxzIGFjY29tcGxpc2htZW50LCByZXF1aXJlcyBhIGhvbWUgbG9jYXRpb25cbmV4cG9ydCB2YXIgaG9iYnlfYWN0aW9uIDogQWN0aW9uID1cbntcbiAgbmFtZTogXCJob2JieV9hY3Rpb25cIixcbiAgcmVxdWlyZW1lbnRzOiBbe3R5cGU6MCwgcmVxOntoYXNBbGxPZjpbXCJob21lXCJdLCBoYXNPbmVPck1vcmVPZjpbXSwgaGFzTm9uZU9mOltdfX1dLFxuICBlZmZlY3RzOiAgICAgIFt7bW90aXZlOjQsIGRlbHRhOjJ9XSxcbiAgdGltZV9taW46ICAgICA2MFxufTtcblxuLy8gTGlzdCBvZiBhdmFpbGFibGUgYWN0aW9ucyBpbiBzaW1cbmV4cG9ydCB2YXIgYWN0aW9uTGlzdDogQWN0aW9uW10gPSBbd2FpdF9hY3Rpb24sIHRyYXZlbF9hY3Rpb24sIGVhdF9hY3Rpb24sIG1vdmllX2FjdGlvbiwgZWF0X2ZyaWVuZF9hY3Rpb24sIG1vdmllX2ZyaWVuZF9hY3Rpb24sIHdvcmtfYWN0aW9uLCBob2JieV9hY3Rpb25dO1xuXG5cbiIsImltcG9ydCAqIGFzIGV4ZWMgZnJvbSBcIi4vZXhlY3V0aW9uX2VuZ2luZVwiO1xuaW1wb3J0IHt3YWl0X2FjdGlvbn0gZnJvbSBcIi4vYWN0aW9uX3NwZWNzXCI7XG5pbXBvcnQge3RyYXZlbF9hY3Rpb259IGZyb20gXCIuL2FjdGlvbl9zcGVjc1wiO1xuLy8gRml2ZSBtb3RpdmUgdHlwZXNcbi8vIERpc2N1c3M6IFRoaXMgaXMgYW4gZW51bSwgYnV0IHdlIGRvbid0IHVzZSBpdC4gV2UgcGFzcyAwLDEsMiBpbnRvIHRoZSBhY3Rpb24gc3BlY3MgZmlsZS4gXG4vLyBEaXNjdXNzOiBXaGlsZSB0aGlzIGNhbiBiZSBhbiBlbnVtIC0tIHJlbmFtZWQgdG8gTW90aXZlVHlwZSB8IENoYW5nZTogZGVjbGFyZSBhIHVuaW9uIHR5cGUgZm9yIE1vdGl2ZSBcbmV4cG9ydCBlbnVtIE1vdGl2ZVR5cGUge1xuXHRwaHlzaWNhbCxcblx0ZW1vdGlvbmFsLFxuXHRzb2NpYWwsXG5cdGZpbmFuY2lhbCxcblx0YWNjb21wbGlzaG1lbnRcbn1cblxuLy8gVGhpcyBpcyBtb3JlIG9mIGEgbmVlZCBhbmQgbGVzcyBvZiBhIG1vdGl2ZSBzaW5jZSBpdCdzIGEgc2V0IG9mIHRoZW0gYWxsXG5leHBvcnQgaW50ZXJmYWNlIE1vdGl2ZSB7XG5cdHBoeXNpY2FsOiBudW1iZXI7XG5cdGVtb3Rpb25hbDogbnVtYmVyO1xuXHRzb2NpYWw6IG51bWJlcjtcblx0ZmluYW5jaWFsOiBudW1iZXI7XG5cdGFjY29tcGxpc2htZW50OiBudW1iZXI7XG5cdFtrZXk6IHN0cmluZ106IG51bWJlcjtcdFx0Ly8gbGV0cyB1cyBsb29rdXAgYSB2YWx1ZSBieSBhIHN0cmluZyBrZXlcbn1cblxuXG4vLyBjb252ZW5pZW50IGxpc3Qgb2Yga2V5cyBvZiB0aGUgbW90aXZlIHR5cGVzIHdlIGhhdmUgd2hpY2ggd2UgY2FuIGl0ZXJhdGUgdGhyb3VnaFxuY29uc3QgbW90aXZlVHlwZXM6IHN0cmluZ1tdID0gT2JqZWN0LmtleXMoTW90aXZlVHlwZSkuZmlsdGVyKGsgPT4gdHlwZW9mIE1vdGl2ZVR5cGVbayBhcyBhbnldID09PSBcIm51bWJlclwiKTtcblxuLy8gQmluYXJ5IE9wZXJhdGlvbnMgdXNlZCBwcmltYXJpbHkgaW4gcmVxdWlyZW1lbnRzXG5leHBvcnQgZW51bSBCaW5PcCB7XG5cdGVxdWFscyxcblx0Z3JlYXRlcl90aGFuLFxuXHRsZXNzX3RoYW4sXG5cdGdlcSxcblx0bGVxXG59XG5cbi8vIFRocmVlIHR5cGVzIG9mIHJlcXVpcmVtZW50c1xuLy8gRGlzY3VzczogVGhpcyBpcyBhbiBlbnVtLCBidXQgd2UgZG9uJ3QgdXNlIGl0LiBXZSBwYXNzIDAsMSwyIGludG8gdGhlIGFjdGlvbiBzcGVjcyBmaWxlLiBcbmV4cG9ydCBlbnVtIFJlcVR5cGUge1xuXHRsb2NhdGlvbixcblx0cGVvcGxlLFxuXHRtb3RpdmVcbn1cblxuLy8gUmVxdWlyZW1lbnRzIG9uIHRoZSB0eXBlIG9mIGxvY2F0aW9uIHRoZSBhY3Rpb24gdGFrZXMgcGxhY2UgaW4uXG4vLyBCYXNlZCBvbiBhIHRhZ3Mgc3lzdGVtIGZvciBsb2NhdGlvbnMuXG4vLyBlZzogbXVzdCBiZSBhdCBhIHJlc3RhdXJhbnRcbmV4cG9ydCBpbnRlcmZhY2UgTG9jYXRpb25SZXEge1xuXHRoYXNBbGxPZjogc3RyaW5nW10sXG5cdGhhc09uZU9yTW9yZU9mOiBzdHJpbmdbXSxcblx0aGFzTm9uZU9mOiBzdHJpbmdbXVxufVxuXG4vLyBSZXF1aXJlbWVudHMgb24gd2hvIGlzIHByZXNlbnQgZm9yIGFuIGFjdGlvbi5cbi8vIGVnOiBtdXN0IGJlIHdpdGggYSBzZXBjaWZpYyBwZXJzb25cbmV4cG9ydCBpbnRlcmZhY2UgUGVvcGxlUmVxIHtcblx0bWluTnVtUGVvcGxlOiBudW1iZXIsXG5cdG1heE51bVBlb3BsZTogbnVtYmVyLFxuXHRzcGVjaWZpY1Blb3BsZVByZXNlbnQ6IHN0cmluZ1tdLFxuXHRzcGVjaWZpY1Blb3BsZUFic2VudDogc3RyaW5nW10sXG5cdHJlbGF0aW9uc2hpcHNQcmVzZW50OiBzdHJpbmdbXSxcblx0cmVsYXRpb25zaGlwc0Fic2VudDogc3RyaW5nW11cbn1cblxuLy8gUmVxdWlyZW1lbnRzIG9uIHRoZSBleGVjdXRpbmcgYWdlbid0IGN1cnJlbnQgbW90aXZlIHNjb3Jlcy5cbi8vIGVnOiBlZyBtdXN0IGhhdmUgbW9uZXkgKGZpbmFuY2lhbCBtb3RpdmUgPiAwKSB0byBkbyB0aGlzXG4vLyBEaXNjdXNzOiBUaGlzIHNob3VsZCBiZSB1c2luZyB0aGUgaW50ZXJmYWNlIGFuZCBub3QgYW4gZW51bVxuXG4vLyBleHBvcnQgaW50ZXJmYWNlIFNpbmdsZU1vdGl2ZSB7XG4vLyBcdG1vdGl2ZTogTW90aXZlVHlwZSxcbi8vIFx0dmFsZW5jZTogbnVtYmVyIFxuLy8gfVxuXG5leHBvcnQgaW50ZXJmYWNlIE1vdGl2ZVJlcSB7XG5cdG1vdGl2ZTogTW90aXZlVHlwZSxcblx0b3A6ICAgICBCaW5PcCxcblx0dGhyZXNoOiBudW1iZXJcbn1cblxuLy8gR2VuZXJhbCByZXF1aXJlbWVudCB0eXBlLlxuLy8gZWc6IGFueSBvZiB0aGUgYWJvdmUgdGhyZWVcbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWlyZW1lbnQge1xuXHR0eXBlOiBSZXFUeXBlLFxuXHRyZXE6IExvY2F0aW9uUmVxIHwgUGVvcGxlUmVxIHwgTW90aXZlUmVxXG59XG5cbi8vIEFjdGlvbiBlZmZlY3QgdHlwZS5cbi8vIGVnOiBzbGVlcCBpbmNyZWFzZXMgdGhlIHBoeXNpY2FsIG1vdGl2ZVxuZXhwb3J0IGludGVyZmFjZSBFZmZlY3Qge1xuXHRtb3RpdmU6IE1vdGl2ZVR5cGUsXG5cdGRlbHRhOiBudW1iZXJcbn1cblxuLy8gR2VuZXJhbCBhY3Rpb24gdHlwZS5cbi8vIE5hbWUsIHJlcXVpcmVtbnRzLCBlZmZlY3RzLCBhbmQgbWluaW11bSB0aW1lIHRha2VuLlxuLy8gZWc6IHNsZWVwXG5leHBvcnQgaW50ZXJmYWNlIEFjdGlvbiB7XG5cdG5hbWU6IHN0cmluZyxcblx0cmVxdWlyZW1lbnRzOiBSZXF1aXJlbWVudFtdLFxuXHRlZmZlY3RzOiAgICAgIEVmZmVjdFtdLFxuXHR0aW1lX21pbjogICAgIG51bWJlclxufVxuXG5cblxuLy9HZW5lcmFsIGFnZW50IHR5cGUuXG4vLyBOYW1lIGFuZCBDdXJyZW50IE1vdGl2ZSBTY29yZXMuXG4vLyBlZzogYW55IG5wYyBjaGFyYWN0ZXJcbmV4cG9ydCBpbnRlcmZhY2UgQWdlbnQge1xuXHQvLyBBZ2VudCBQcm9wZXJ0aWVzXG5cdG5hbWU6IHN0cmluZyxcblx0bW90aXZlOiBNb3RpdmUsXG5cdGN1cnJlbnRMb2NhdGlvbjogU2ltcGxlTG9jYXRpb24gfCBMb2NhdGlvbixcblx0b2NjdXBpZWRDb3VudGVyOiBudW1iZXIsXG5cdGN1cnJlbnRBY3Rpb246IEFjdGlvbixcblx0ZGVzdGluYXRpb246IFNpbXBsZUxvY2F0aW9uIHwgTG9jYXRpb25cbn1cblxuLy8gTG9jYXRpb25zIGNhbiBiZSBhbiB1bm5hbWVkIHBvc2l0aW9uLCB3aXRoIGp1c3QgYW4gYXNzb2NpYXRlZCB4LHkgY29vcmRpbmF0ZVxuZXhwb3J0IGludGVyZmFjZSBTaW1wbGVMb2NhdGlvbiB7XG5cdHhQb3M6IG51bWJlcixcblx0eVBvczogbnVtYmVyXG59XG5cbi8vIExvY2F0aW9ucyBjYW4gYWxzbyBiZSBhIG5hbWVkIHBvc2l0aW9uLCBhIG5hbWUsIGFuZCBhIGxpc3Qgb2YgdGFnc1xuLy8gZWc6IGEgc3BlY2lmaWMgcmVzdGF1cmFudFxuLy8gRGlzY3VzczogVGhlcmUgc2hvdWxkIGJlIGEgcG9pbnQgSW50ZXJmYWNlIHNpbmNlIHNvbWUgbG9jYXRpb25zIGFyZSBub3QgbmFtZWQuIFxuZXhwb3J0IGludGVyZmFjZSBMb2NhdGlvbiBleHRlbmRzIFNpbXBsZUxvY2F0aW9uIHtcblx0bmFtZTogc3RyaW5nXG5cdHRhZ3M6IHN0cmluZ1tdXG59XG5cblxuLyogIENoZWNrcyB0byBzZWUgaWYgYW4gYWdlbnQgaGFzIG1heGltdW0gbW90aXZlc1xuXHRcdGFnZW50OiB0aGUgYWdlbnQgYmVpbmcgdGVzdGVkXG5cdFx0cmV0dXJuOiBhIGJvb2xlYW4gYW5zd2VyaW5nIHRoZSBxdWVzdGlvbiAqL1xuXG4vLyBUbyBkbzogdGhpcyB3YXkuIFxuLy8gY29uc3QgZ2V0S2V5VmFsdWUgPSA8VSBleHRlbmRzIGtleW9mIFQsIFQgZXh0ZW5kcyBvYmplY3Q+KGtleTogVSkgPT4gKG9iajogVCkgPT4gb2JqW2tleV07XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbnRlbnQoYWdlbnQ6QWdlbnQpOmJvb2xlYW4ge1xuXHRmb3IobGV0IG1vdGl2ZVR5cGUgaW4gbW90aXZlVHlwZXMpe1xuXHRcdC8vIGNvbnN0IGdldG1vdGl2ZSA9IGdldEtleVZhbHVlPGtleW9mIE1vdGl2ZSwgTW90aXZlPihtb3RpdmVUeXBlKShhZ2VudC5tb3RpdmUpO1xuXHRcdGlmKGFnZW50Lm1vdGl2ZVttb3RpdmVUeXBlXSAhPSBleGVjLk1BWF9NRVRFUil7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0cnVlO1xufVxuXG5cbi8qICBTZWxlY3RzIGFuIGFjdGlvbiBmcm9tIGEgbGlzdCBvZiB2YWxpZCBhY3Rpb25zIHRvIGJlIHByZWZvcm1lZCBieSBhIHNwZWNpZmljIGFnZW50LlxuXHRcdENob3NlcyB0aGUgYWN0aW9uIHdpdGggdGhlIG1heGltYWwgdXRpbGl0eSBvZiB0aGUgYWdlbnQgKG1vdGl2ZSBpbmNyZWFzZS90aW1lKS5cblx0XHRhZ2VudDogdGhlIGFnZW50IGluIHF1ZXN0aW9uXG5cdFx0YWN0aW9uTGlzdDogdGhlIGxpc3Qgb2YgdmFsaWQgYWN0aW9uc1xuXHRcdGxvY2F0aW9uTGlzdDogYWxsIGxvY2F0aW9ucyBpbiB0aGUgd29ybGRcblx0XHRyZXR1cm46IFRoZSBzaW5nbGUgYWN0aW9uIGNob3NlbiBmcm9tIHRoZSBsaXN0ICovXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0X2FjdGlvbihhZ2VudDpBZ2VudCwgYWN0aW9uTGlzdDpBY3Rpb25bXSwgbG9jYXRpb25MaXN0OkxvY2F0aW9uW10pOkFjdGlvbiB7XG5cdC8vIGluaXRpYWxpemVkIHRvIDAgKG5vIHJlYXNvbiB0byBkbyBhbiBhY3Rpb24gaWYgaXQgd2lsbCBoYXJtIHlvdSlcblx0dmFyIG1heERlbHRhVXRpbGl0eTpudW1iZXIgPSAwO1xuXHQvLyBpbml0aWFsaXplZCB0byB0aGUgaW5hY3Rpb25cblx0dmFyIGN1cnJlbnRDaG9pY2U6QWN0aW9uID0gd2FpdF9hY3Rpb247XG5cdC8vIEZpbmRzIHRoZSB1dGlsaXR5IGZvciBlYWNoIGFjdGlvbiB0byB0aGUgZ2l2ZW4gYWdlbnRcblx0dmFyIGk6bnVtYmVyID0gMDtcblx0Zm9yIChpID0gMDsgaTxhY3Rpb25MaXN0Lmxlbmd0aDsgaSsrKXtcblx0XHR2YXIgZGVzdDpMb2NhdGlvbiA9IG51bGw7XG5cdFx0dmFyIHRyYXZlbFRpbWU6bnVtYmVyID0gMDtcblx0XHR2YXIgY2hlY2s6Ym9vbGVhbiA9IHRydWU7XG5cdFx0dmFyIGs6bnVtYmVyID0gMDtcblx0XHRmb3IgKGsgPSAwOyBrPGFjdGlvbkxpc3RbaV0ucmVxdWlyZW1lbnRzLmxlbmd0aDsgaysrKSB7XG5cdFx0XHRpZiAoYWN0aW9uTGlzdFtpXS5yZXF1aXJlbWVudHNba10udHlwZSA9PSAwKXtcblx0XHRcdFx0dmFyIHJlcXVpcmVtZW50OkxvY2F0aW9uUmVxID0gYWN0aW9uTGlzdFtpXS5yZXF1aXJlbWVudHNba10ucmVxIGFzIExvY2F0aW9uUmVxO1xuXHRcdFx0XHRkZXN0ID0gZXhlYy5nZXROZWFyZXN0TG9jYXRpb24ocmVxdWlyZW1lbnQsIGxvY2F0aW9uTGlzdCwgYWdlbnQuY3VycmVudExvY2F0aW9uLnhQb3MsIGFnZW50LmN1cnJlbnRMb2NhdGlvbi55UG9zKTtcblx0XHRcdFx0aWYgKGRlc3QgPT0gbnVsbCkge1xuXHRcdFx0XHRcdGNoZWNrID0gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dHJhdmVsVGltZSA9IE1hdGguYWJzKGRlc3QueFBvcyAtIGFnZW50LmN1cnJlbnRMb2NhdGlvbi54UG9zKSArIE1hdGguYWJzKGRlc3QueVBvcyAtIGFnZW50LmN1cnJlbnRMb2NhdGlvbi55UG9zKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBpZiBhbiBhY3Rpb24gaGFzIHNhdGlzZmlhYmxlIHJlcXVpcmVtZW50c1xuXHRcdGlmIChjaGVjaykge1xuXHRcdFx0dmFyIGRlbHRhVXRpbGl0eTpudW1iZXIgPSAwO1xuXHRcdFx0dmFyIGo6bnVtYmVyID0gMDtcblxuXHRcdFx0Zm9yIChqPTA7IGo8YWN0aW9uTGlzdFtpXS5lZmZlY3RzLmxlbmd0aDsgaisrKXtcblx0XHRcdFx0dmFyIF9kZWx0YSA9IGFjdGlvbkxpc3RbaV0uZWZmZWN0c1tqXS5kZWx0YTtcblx0XHRcdFx0dmFyIF9tb3RpdmV0eXBlID0gTW90aXZlVHlwZVthY3Rpb25MaXN0W2ldLmVmZmVjdHNbal0ubW90aXZlXTtcblx0XHRcdCAgIGRlbHRhVXRpbGl0eSArPSBleGVjLmNsYW1wKF9kZWx0YSArIGFnZW50Lm1vdGl2ZVtfbW90aXZldHlwZV0sIGV4ZWMuTUFYX01FVEVSLCBleGVjLk1JTl9NRVRFUikgLSBhZ2VudC5tb3RpdmVbX21vdGl2ZXR5cGVdO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBhZGp1c3QgZm9yIHRpbWUgKGluY2x1ZGluZyB0cmF2ZWwgdGltZSlcblx0XHRcdGRlbHRhVXRpbGl0eSA9IGRlbHRhVXRpbGl0eS8oYWN0aW9uTGlzdFtpXS50aW1lX21pbiArIHRyYXZlbFRpbWUpO1xuXHRcdFx0Ly8vIHVwZGF0ZSBjaG9pY2UgaWYgbmV3IHV0aWxpdHkgaXMgbWF4aW11bSBzZWVuIHNvIGZhclxuXHRcdFx0aWYgKGRlbHRhVXRpbGl0eSA+IG1heERlbHRhVXRpbGl0eSkge1xuXHRcdFx0XHRtYXhEZWx0YVV0aWxpdHkgPSBkZWx0YVV0aWxpdHk7XG5cdFx0XHRcdGN1cnJlbnRDaG9pY2UgPSBhY3Rpb25MaXN0W2ldO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gY3VycmVudENob2ljZTtcbn1cblxuLyogIGFwcGxpZXMgdGhlIGVmZmVjdHMgb2YgYW4gYWN0aW9uIHRvIGFuIGFnZW50LlxuXHRcdGFnZW50OiB0aGUgYWdlbnQgaW4gcXVlc3Rpb25cblx0XHRhY3Rpb246IHRoZSBhY3Rpb24gaW4gcXVlc3Rpb24gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGVjdXRlX2FjdGlvbihhZ2VudDpBZ2VudCwgYWN0aW9uOkFjdGlvbik6dm9pZCB7XG5cdHZhciBpOm51bWJlciA9IDA7XG5cdC8vIGFwcGx5IGVhY2ggZWZmZWN0IG9mIHRoZSBhY3Rpb24gYnkgdXBkYXRpbmcgdGhlIGFnZW50J3MgbW90aXZlc1xuXG5cdGZvciAoaT0wOyBpPGFjdGlvbi5lZmZlY3RzLmxlbmd0aDsgaSsrKXtcblx0XHR2YXIgX2RlbHRhID0gYWN0aW9uLmVmZmVjdHNbaV0uZGVsdGE7XG5cdFx0dmFyIF9tb3RpdmV0eXBlID0gTW90aXZlVHlwZVthY3Rpb24uZWZmZWN0c1tpXS5tb3RpdmVdO1xuXHQgICBhZ2VudC5tb3RpdmVbX21vdGl2ZXR5cGVdID0gZXhlYy5jbGFtcChhZ2VudC5tb3RpdmVbX21vdGl2ZXR5cGVdICsgX2RlbHRhLCBleGVjLk1BWF9NRVRFUiwgZXhlYy5NSU5fTUVURVIpO1xuXHR9XG59XG5cbi8qICB1cGRhdGVzIG1vdmVtZW50IGFuZCBvY2N1cGF0aW9uIGNvdW50ZXJzIGZvciBhbiBhZ2VudC4gY2hvb3NlcyBhbmQgZXhlY3V0ZXMgYSBuZXcgYWN0aW9uIGlmIG5lY2Vzc2FyeSBcblx0XHRhZ2VudDogYWdlbnQgZXhlY3V0aW5nIGEgdHVyblxuXHRcdGFjdGlvbkxpc3Q6IHRoZSBsaXN0IG9mIHZhbGlkIGFjdGlvbnNcblx0XHRsb2NhdGlvbkxpc3Q6IGFsbCBsb2NhdGlvbnMgaW4gdGhlIHdvcmxkXG5cdFx0dGltZTogY3VycmVudCB0aWNrIHRpbWUgKi9cbmV4cG9ydCBmdW5jdGlvbiB0dXJuKGFnZW50OkFnZW50LCBhY3Rpb25MaXN0OkFjdGlvbltdLCBsb2NhdGlvbkxpc3Q6TG9jYXRpb25bXSwgdGltZTpudW1iZXIpOnZvaWQge1xuXHRpZiAodGltZSU2MDAgPT0gMCkge1xuXHRcdGlmICghaXNDb250ZW50KGFnZW50KSkge1xuXHRcdFx0Zm9yKGxldCBtb3RpdmVUeXBlIGluIG1vdGl2ZVR5cGVzKSB7XG5cdFx0XHRcdGFnZW50Lm1vdGl2ZVttb3RpdmVUeXBlXSA9IGV4ZWMuY2xhbXAoYWdlbnQubW90aXZlW21vdGl2ZVR5cGVdIC0gMSwgZXhlYy5NQVhfTUVURVIsIGV4ZWMuTUlOX01FVEVSKTtcblx0XHRcdH1cdFxuXHRcdH1cblx0fVxuXHRpZiAoYWdlbnQub2NjdXBpZWRDb3VudGVyID4gMCkge1xuXHRcdGFnZW50Lm9jY3VwaWVkQ291bnRlci0tO1xuXHR9IGVsc2Uge1xuXHRcdGlmICghaXNDb250ZW50KGFnZW50KSkge1xuXHRcdFx0YWdlbnQuZGVzdGluYXRpb24gPSBudWxsO1xuXHRcdFx0ZXhlY3V0ZV9hY3Rpb24oYWdlbnQsIGFnZW50LmN1cnJlbnRBY3Rpb24pO1xuXHRcdFx0Y29uc29sZS5sb2coXCJ0aW1lOiBcIiArIHRpbWUudG9TdHJpbmcoKSArIFwiIHwgXCIgKyBhZ2VudC5uYW1lICsgXCI6IEZpbmlzaGVkIFwiICsgYWdlbnQuY3VycmVudEFjdGlvbi5uYW1lKTtcblx0XHRcdHZhciBjaG9pY2U6QWN0aW9uID0gc2VsZWN0X2FjdGlvbihhZ2VudCwgYWN0aW9uTGlzdCwgbG9jYXRpb25MaXN0KTtcblx0XHRcdHZhciBkZXN0OkxvY2F0aW9uID0gbnVsbDtcblx0XHRcdHZhciBrOm51bWJlciA9IDA7XG5cdFx0XHRmb3IgKGsgPSAwOyBrPGNob2ljZS5yZXF1aXJlbWVudHMubGVuZ3RoOyBrKyspIHtcblx0XHRcdFx0aWYgKGNob2ljZS5yZXF1aXJlbWVudHNba10udHlwZSA9PSAwKSB7XG5cdFx0XHRcdFx0dmFyIHJlcXVpcmVtZW50OkxvY2F0aW9uUmVxID0gY2hvaWNlLnJlcXVpcmVtZW50c1trXS5yZXEgYXMgTG9jYXRpb25SZXE7XG5cdFx0XHRcdFx0ZGVzdCA9IGV4ZWMuZ2V0TmVhcmVzdExvY2F0aW9uKHJlcXVpcmVtZW50LCBsb2NhdGlvbkxpc3QsIGFnZW50LmN1cnJlbnRMb2NhdGlvbi54UG9zLCBhZ2VudC5jdXJyZW50TG9jYXRpb24ueVBvcyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vc2V0IGFjdGlvbiB0byBjaG9pY2Ugb3IgdG8gdHJhdmVsIGlmIGFnZW50IGlzIG5vdCBhdCBsb2NhdGlvbiBmb3IgY2hvaWNlXG5cdFx0XHRpZiAoZGVzdCA9PT0gbnVsbCB8fCAoZGVzdC54UG9zID09IGFnZW50LmN1cnJlbnRMb2NhdGlvbi54UG9zICYmIGRlc3QueVBvcyA9PSBhZ2VudC5jdXJyZW50TG9jYXRpb24ueVBvcykpIHtcblx0XHRcdFx0YWdlbnQuY3VycmVudEFjdGlvbiA9IGNob2ljZTtcblx0XHRcdFx0YWdlbnQub2NjdXBpZWRDb3VudGVyID0gY2hvaWNlLnRpbWVfbWluO1xuXHRcdFx0XHQvLyBjb25zb2xlLmxvZyhcInRpbWU6IFwiICsgdGltZS50b1N0cmluZygpICsgXCIgfCBcIiArIGFnZW50Lm5hbWUgKyBcIjogU3RhcnRlZCBcIiArIGFnZW50LmN1cnJlbnRBY3Rpb24ubmFtZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgdHJhdmVsVGltZTpudW1iZXIgPSBNYXRoLmFicyhkZXN0LnhQb3MgLSBhZ2VudC5jdXJyZW50TG9jYXRpb24ueFBvcykgKyBNYXRoLmFicyhkZXN0LnlQb3MgLSBhZ2VudC5jdXJyZW50TG9jYXRpb24ueVBvcyk7XG5cdFx0XHRcdGFnZW50LmN1cnJlbnRBY3Rpb24gPSB0cmF2ZWxfYWN0aW9uO1xuXHRcdFx0XHRhZ2VudC5vY2N1cGllZENvdW50ZXIgPSBNYXRoLmFicyhkZXN0LnhQb3MgLSBhZ2VudC5jdXJyZW50TG9jYXRpb24ueFBvcykgKyBNYXRoLmFicyhkZXN0LnlQb3MgLSBhZ2VudC5jdXJyZW50TG9jYXRpb24ueVBvcyk7XG5cdFx0XHRcdGRlc3QueFBvcyA9IGFnZW50LmN1cnJlbnRMb2NhdGlvbi54UG9zO1xuXHRcdFx0XHRkZXN0LnlQb3MgPSBhZ2VudC5jdXJyZW50TG9jYXRpb24ueVBvcztcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcblx0XCJhZ2VudHNcIjogW1xuXHRcdHtcblx0XHRcdFwibmFtZVwiOiBcIkpvaG4gRG9lXCIsXG5cdFx0XHRcIm1vdGl2ZVwiOiB7XG5cdFx0XHRcdFwicGh5c2ljYWxcIjogMSxcblx0XHRcdFx0XCJlbW90aW9uYWxcIjogMSxcblx0XHRcdFx0XCJzb2NpYWxcIjogMSxcblx0XHRcdFx0XCJmaW5hbmNpYWxcIjogMSxcblx0XHRcdFx0XCJhY2NvbXBsaXNobWVudFwiOiAxXG5cdFx0XHR9LFxuXHRcdFx0XCJjdXJyZW50TG9jYXRpb25cIjoge1xuXHRcdFx0XHRcInhQb3NcIjogMCxcblx0XHRcdFx0XCJ5UG9zXCI6IDBcblx0XHRcdH0sXG5cdFx0XHRcIm9jY3VwaWVkQ291bnRlclwiOiAwLFxuXHRcdFx0XCJjdXJyZW50QWN0aW9uXCI6IFwid2FpdF9hY3Rpb25cIixcblx0XHRcdFwiZGVzdGluYXRpb25cIjoge1xuXHRcdFx0XHRcInhQb3NcIjogMCxcblx0XHRcdFx0XCJ5UG9zXCI6IDBcblx0XHRcdH1cblx0XHR9LFxuXHRcdHtcblx0XHRcdFwibmFtZVwiOiBcIkphbmUgRG9lXCIsXG5cdFx0XHRcIm1vdGl2ZVwiOiB7XG5cdFx0XHRcdFwicGh5c2ljYWxcIjogNCxcblx0XHRcdFx0XCJlbW90aW9uYWxcIjogMSxcblx0XHRcdFx0XCJzb2NpYWxcIjogNCxcblx0XHRcdFx0XCJmaW5hbmNpYWxcIjogMSxcblx0XHRcdFx0XCJhY2NvbXBsaXNobWVudFwiOiA0XG5cdFx0XHR9LFxuXHRcdFx0XCJjdXJyZW50TG9jYXRpb25cIjoge1xuXHRcdFx0XHRcInhQb3NcIjogNSxcblx0XHRcdFx0XCJ5UG9zXCI6IDVcblx0XHRcdH0sXG5cdFx0XHRcIm9jY3VwaWVkQ291bnRlclwiOiAwLFxuXHRcdFx0XCJjdXJyZW50QWN0aW9uXCI6IFwid2FpdF9hY3Rpb25cIixcblx0XHRcdFwiZGVzdGluYXRpb25cIjoge1xuXHRcdFx0XHRcInhQb3NcIjogMCxcblx0XHRcdFx0XCJ5UG9zXCI6IDBcblx0XHRcdH1cblx0XHR9XG5cdF1cbn0iLCJpbXBvcnQgKiBhcyBucGMgZnJvbSBcIi4vYWdlbnRcIjtcbmltcG9ydCB7d2FpdF9hY3Rpb259IGZyb20gXCIuL2FjdGlvbl9zcGVjc1wiO1xuaW1wb3J0IHt0cmF2ZWxfYWN0aW9ufSBmcm9tIFwiLi9hY3Rpb25fc3BlY3NcIjtcblxuZXhwb3J0IHZhciB0aW1lOm51bWJlciA9IDA7XG5leHBvcnQgY29uc3QgTUFYX01FVEVSID0gNTtcbmV4cG9ydCBjb25zdCBNSU5fTUVURVIgPSAxO1xuXG4vKiAgU2ltcGxlIG1hdGhlbWF0aWNhbCBjbGFtcCBmdW5jdGlvbi5cbiAgICBuOiBudW1iZXIgYmVpbmcgdGVzdGVkXG4gICAgbTogbWF4aW11bSB2YWx1ZSBvZiBudW1iZXJcbiAgICBvOiBtaW5pbXVtIHZhbHVlIG9mIG51bWJlclxuICAgIHJldHVybjogZWl0aGVyIHRoZSBudW1iZXIsIG9yIHRoZSBtYXgvbWluIGlmIGl0IHdhcyBvdXRzaWRlIG9mIHRoZSByYW5nZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsYW1wKG46bnVtYmVyLCBtOm51bWJlciwgbzpudW1iZXIpOm51bWJlciB7XG4gIGlmIChuID4gbSkge1xuICAgIHJldHVybiBtO1xuICB9IGVsc2UgaWYgKG4gPCBvKSB7XG4gICAgcmV0dXJuIG87XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG47XG4gIH1cblxufVxuXG4vKiAgUmFuZG9taXplIGFycmF5IGluLXBsYWNlIHVzaW5nIER1cnN0ZW5mZWxkIHNodWZmbGUgYWxnb3JpdGhtXG4gICAgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjQ1MDk1NC9ob3ctdG8tcmFuZG9taXplLXNodWZmbGUtYS1qYXZhc2NyaXB0LWFycmF5XG4gICAgKi9cbmZ1bmN0aW9uIHNodWZmbGVBcnJheShhcnJheTpucGMuQWdlbnRbXSk6dm9pZCB7XG4gICAgZm9yICh2YXIgaTpudW1iZXIgPSBhcnJheS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgICAgIHZhciBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XG4gICAgICAgIHZhciB0ZW1wOm5wYy5BZ2VudCA9IGFycmF5W2ldO1xuICAgICAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xuICAgICAgICBhcnJheVtqXSA9IHRlbXA7XG4gICAgfVxufVxuXG4vKiAgY2hlY2tzIG1lbWJlcnNoaXAgaW4gYSBsaXN0LiBTdHJpbmcgdHlwZVxuICAgIGl0ZW06IGEgc3RyaW5nIHRvIGJlIGNoZWNrZWRcbiAgICBsaXN0OiBhIGxpc3Qgb2Ygc3RyaW5ncyB0byBjaGVjayBhZ2FpbnN0XG4gICAgcmV0dXJuOiBhIGJvb2xlYW4gYW5zd2VyaW5nIHRoZSBxdWVzdGlvbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluTGlzdChpdGVtOnN0cmluZywgbGlzdDpzdHJpbmdbXSk6Ym9vbGVhbiB7XG4gIHZhciByZXQ6Ym9vbGVhbiA9IGZhbHNlO1xuICB2YXIgaTpudW1iZXIgPSAwO1xuICBmb3IgKGkgPSAwOyBpPGxpc3QubGVuZ3RoOyBpKyspe1xuICAgIGlmIChsaXN0W2ldID09IGl0ZW0pIHtcbiAgICAgIHJldCA9IHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbi8qICByZXR1cm5zIHRoZSBuZWFyZXN0IGxvY2F0aW9uIHRoYXQgc2F0aXNmaWVzIHRoZSBnaXZlbiByZXF1aXJlbWVudCwgb3IgbnVsbC5cbiAgICBkaXN0YW5jZSBtZWFzdXJlZCBieSBtYW5oYXR0YW4gZGlzdGFuY2VcbiAgICByZXE6IGEgbG9jYXRpb24gcmVxdWlyZW1lbnQgdG8gc2F0aXNmeVxuICAgIGxpc3Q6IGEgbGlzdCBvZiBsb2NhdGlvbnMgdG8gY2hlY2tcbiAgICB4ICYgeTogY29vcmRpbmF0ZSBwYWlyIHRvIGRldGVybWluZSBkaXN0YW5jZSBhZ2FpbnN0LlxuICAgIHJldHVybjogdGhlIGxvY2F0aW9uIGluIHF1ZXN0aW9uIG9yIG51bGwgKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXROZWFyZXN0TG9jYXRpb24ocmVxOm5wYy5Mb2NhdGlvblJlcSwgbGlzdDpucGMuTG9jYXRpb25bXSwgeDpudW1iZXIsIHk6bnVtYmVyKTpucGMuTG9jYXRpb24ge1xuICB2YXIgcmV0Om5wYy5Mb2NhdGlvbiA9IG51bGw7XG4gIHZhciBtaW5EaXN0Om51bWJlciA9IC0xO1xuICB2YXIgaTpudW1iZXIgPSAwO1xuICBmb3IgKGkgPSAwOyBpPGxpc3QubGVuZ3RoOyBpKyspe1xuICAgIHZhciB2YWxpZDpib29sZWFuID0gdHJ1ZTtcbiAgICB2YXIgY2hlY2sxOmJvb2xlYW4gPSB0cnVlO1xuICAgIHZhciBqOm51bWJlciA9IDA7XG4gICAgZm9yIChqID0gMDsgajxyZXEuaGFzQWxsT2YubGVuZ3RoOyBqKyspe1xuICAgICAgaWYgKCEoaW5MaXN0KHJlcS5oYXNBbGxPZltqXSxsaXN0W2ldLnRhZ3MpKSkge1xuICAgICAgICBjaGVjazEgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIGNoZWNrMjpib29sZWFuID0gZmFsc2U7XG4gICAgZm9yIChqID0gMDsgajxyZXEuaGFzT25lT3JNb3JlT2YubGVuZ3RoOyBqKyspe1xuICAgICAgaWYgKGluTGlzdChyZXEuaGFzT25lT3JNb3JlT2Zbal0sbGlzdFtpXS50YWdzKSkge1xuICAgICAgICBjaGVjazIgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocmVxLmhhc09uZU9yTW9yZU9mLmxlbmd0aCA9PSAwKSB7XG4gICAgICBjaGVjazIgPSB0cnVlO1xuICAgIH1cbiAgICB2YXIgY2hlY2szOmJvb2xlYW4gPSB0cnVlO1xuICAgIGZvciAoaiA9IDA7IGo8cmVxLmhhc05vbmVPZi5sZW5ndGg7IGorKyl7XG4gICAgICBpZiAoaW5MaXN0KHJlcS5oYXNOb25lT2Zbal0sbGlzdFtpXS50YWdzKSkge1xuICAgICAgICBjaGVjazMgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHJlcS5oYXNOb25lT2YubGVuZ3RoID09IDApIHtcbiAgICAgIGNoZWNrMyA9IHRydWU7XG4gICAgfVxuICAgIGlmICghKGNoZWNrMSAmJiBjaGVjazIgJiYgY2hlY2szKSkge1xuICAgICAgdmFsaWQgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHZhbGlkKSB7XG4gICAgICB2YXIgdHJhdmVsRGlzdDogbnVtYmVyID0gTWF0aC5hYnMobGlzdFtpXS54UG9zIC0geCkgKyBNYXRoLmFicyhsaXN0W2ldLnlQb3MgLSB5KTtcbiAgICAgIGlmICgobWluRGlzdCA+IHRyYXZlbERpc3QpIHx8IChtaW5EaXN0ID0gLTEpKSB7XG4gICAgICAgIG1pbkRpc3QgPSB0cmF2ZWxEaXN0O1xuICAgICAgICByZXQgPSBsaXN0W2ldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG4vKiAgcmFuZG9taXplcyBvcmRlciBhbmQgZXhlY3V0ZXMgYSB0dXJuIGZvciBlYWNoIGFnZW50IGV2ZXJ5IHRpY2suXG4gICAgYWdlbnRMaXN0OiBsaXN0IG9mIGFnZW50cyBpbiB0aGUgc2ltXG4gICAgYWN0aW9uTGlzdDogdGhlIGxpc3Qgb2YgdmFsaWQgYWN0aW9uc1xuICAgIGxvY2F0aW9uTGlzdDogYWxsIGxvY2F0aW9ucyBpbiB0aGUgd29ybGRcbiAgICBjb250aW51ZUZ1bmN0aW9uOiBib29sZWFuIGZ1bmN0aW9uIHRoYXQgaXMgdXNlZCBhcyBhIGNoZWNrIGFzIHRvIHdoZXRoZXIgb3Igbm90IHRvIGtlZXAgcnVubmluZyB0aGUgc2ltICovXG5leHBvcnQgZnVuY3Rpb24gcnVuX3NpbShhZ2VudExpc3Q6bnBjLkFnZW50W10sIGFjdGlvbkxpc3Q6bnBjLkFjdGlvbltdLCBsb2NhdGlvbkxpc3Q6bnBjLkxvY2F0aW9uW10sIGNvbnRpbnVlRnVuY3Rpb246ICgpID0+IGJvb2xlYW4pOnZvaWQge1xuICB3aGlsZSAoY29udGludWVGdW5jdGlvbigpKSB7XG4gICAgc2h1ZmZsZUFycmF5KGFnZW50TGlzdCk7XG4gICAgdmFyIGk6bnVtYmVyID0gMDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgYWdlbnRMaXN0Lmxlbmd0aDsgaSsrICkge1xuICAgICAgbnBjLnR1cm4oYWdlbnRMaXN0W2ldLCBhY3Rpb25MaXN0LCBsb2NhdGlvbkxpc3QsIHRpbWUpO1xuICAgIH1cbiAgICB0aW1lICs9IDE7XG4gIH1cbiAgY29uc29sZS5sb2coXCJGaW5pc2hlZC5cIik7XG59XG5cblxuIiwiaW1wb3J0ICogYXMgZW5naW5lIGZyb20gXCIuL2V4ZWN1dGlvbl9lbmdpbmVcIjtcbmltcG9ydCAqIGFzIGFjdGlvbnMgZnJvbSBcIi4vYWN0aW9uX3NwZWNzXCI7XG5pbXBvcnQgKiBhcyBucGMgZnJvbSBcIi4vYWdlbnRcIjtcbmltcG9ydCAqIGFzIHV0aWxpdHkgZnJvbSBcIi4vdXRpbGl0aWVzXCI7XG5cbi8vIGltcG9ydCAqIGFzIGpzb25fZGF0YSBmcm9tIFwiLi9kYXRhLmpzb25cIjtcbmNvbnN0IGpzb25fZGF0YSA9IHJlcXVpcmUoXCIuL2RhdGEuanNvblwiKTtcblxuLy8gaW1wb3J0ICdyZWZsZWN0LW1ldGFkYXRhJztcbi8vIGltcG9ydCAnZXM2LXNoaW0nO1xuXG52YXIgYWdlbnRMaXN0OiBucGMuQWdlbnRbXSA9IHV0aWxpdHkubG9hZEFnZW50c0Zyb21KU09OKGpzb25fZGF0YVtcImFnZW50c1wiXSk7XG5cbi8vIFVuY29tbWVudCBwb3N0IHRoaXNcblxuXG4vLyBMaXN0IG9mIGFnZW50cyBpbiBzaW1cbi8vIHZhciBhZ2VudExpc3Q6bnBjLkFnZW50W10gPSBbYWdlbnQxLCBhZ2VudDJdO1xuXG4vLyBMb2NhdGlvbnNcbi8vIExvY2F0aW9ucyBhcmUgYSBwb3NpdGlvbiwgYSBuYW1lLCBhbmQgYSBsaXN0IG9mIHRhZ3NcbnZhciByZXN0YXVyYW50Om5wYy5Mb2NhdGlvbiA9IHtuYW1lOiBcInJlc3RhdXJhbnRcIiwgeFBvczogNSwgeVBvczogNSwgdGFnczogW1wicmVzdGF1cmFudFwiLCBcImVtcGxveW1lbnRcIl19XG5cbnZhciBtb3ZpZV90aGVhdHJlOm5wYy5Mb2NhdGlvbiA9IHtuYW1lOiBcIm1vdmllIHRoZWF0cmVcIiwgeFBvczogMCwgeVBvczogNSwgdGFnczogW1wibW92aWUgdGhlYXRyZVwiLCBcImVtcGxveW1lbnRcIl19XG5cbnZhciBob21lOm5wYy5Mb2NhdGlvbiA9IHtuYW1lOiBcImhvbWVcIiwgeFBvczogNSwgeVBvczogMCwgdGFnczogW1wiaG9tZVwiXX1cblxuLy9sb2NhdGlvbiBMaXN0XG52YXIgbG9jYXRpb25MaXN0Om5wYy5Mb2NhdGlvbltdID0gW3Jlc3RhdXJhbnQsIG1vdmllX3RoZWF0cmUsIGhvbWVdO1xuXG4vLyBjb25kaXRpb24gZnVuY3Rpb24uXG4vLyBTdG9wcyB0aGUgc2ltIHdoZW4gYWxsIGFnZW50cyBhcmUgYXQgZnVsbCBtZXRlcnNcbmZ1bmN0aW9uIGNvbmRpdGlvbigpOmJvb2xlYW4ge1xuXHR2YXIgY2hlY2s6Ym9vbGVhbiA9IGZhbHNlO1xuXHR2YXIgaTpudW1iZXIgPSAwO1xuXHQvLyBjaGVjayB0aGUgbWV0ZXIgbGV2ZWxzIGZvciBlYWNoIGFnZW50IGluIHRoZSBzaW1cblx0Zm9yIChpID0gMDsgaTwgYWdlbnRMaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKGFnZW50TGlzdFtpXS5tb3RpdmUucGh5c2ljYWwgPCBlbmdpbmUuTUFYX01FVEVSKSB7XG5cdFx0XHRjaGVjayA9IHRydWU7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdFx0aWYgKGFnZW50TGlzdFtpXS5tb3RpdmUuZW1vdGlvbmFsIDwgZW5naW5lLk1BWF9NRVRFUikge1xuXHRcdFx0Y2hlY2sgPSB0cnVlO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdGlmIChhZ2VudExpc3RbaV0ubW90aXZlLnNvY2lhbCA8IGVuZ2luZS5NQVhfTUVURVIpIHtcblx0XHRcdGNoZWNrID0gdHJ1ZTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRpZiAoYWdlbnRMaXN0W2ldLm1vdGl2ZS5maW5hbmNpYWwgPCBlbmdpbmUuTUFYX01FVEVSKSB7XG5cdFx0XHRjaGVjayA9IHRydWU7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdFx0aWYgKGFnZW50TGlzdFtpXS5tb3RpdmUuYWNjb21wbGlzaG1lbnQgPCBlbmdpbmUuTUFYX01FVEVSKSB7XG5cdFx0XHRjaGVjayA9IHRydWU7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblx0cmV0dXJuIGNoZWNrO1xufVxuXG5lbmdpbmUucnVuX3NpbShhZ2VudExpc3QsIGFjdGlvbnMuYWN0aW9uTGlzdCwgbG9jYXRpb25MaXN0LCBjb25kaXRpb24pO1xuXG4vLyBEaXNwbGF5cyB0ZXh0IG9uIHRoZSBicm93c2VyPyBJIGFzc3VtZVxuZnVuY3Rpb24gc2hvd09uQnJvd3NlcihkaXZOYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZykge1xuXHRjb25zdCBlbHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkaXZOYW1lKTtcblx0ZWx0LmlubmVyVGV4dCA9IG5hbWUgKyBcIkhlbGxvIFdvcmxkIVwiO1xufVxuXG5zaG93T25Ccm93c2VyKFwiZ3JlZXRpbmdcIiwgXCJUeXBlU2NyaXB0XCIpO1xuIiwiLy8gVXRpbHRpZXMgRmlsZVxuXG5pbXBvcnQgKiBhcyBzaW1UeXBlcyBmcm9tIFwiLi9hZ2VudFwiO1xuaW1wb3J0IHthY3Rpb25MaXN0fSBmcm9tIFwiLi9hY3Rpb25fc3BlY3NcIjtcblxuXG4vLyBpbXBvcnRpbmcgRmlsZSBTeXN0ZW0gbW9kdWxlIG9mIG5vZGVcbi8vIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcblxuLy8gLy8gRmlsZSBsb2dnaW5nIFxuLy8gZXhwb3J0IGNsYXNzIExvZ2dlciB7XG4vLyBcdHByaXZhdGUgc3RyZWFtOiBhbnkgPSBmcy5jcmVhdGVXcml0ZVN0cmVhbSgnZmlsZS50eHQnKTtcblxuLy8gXHRmaWxlKGxvZ19tZXNzYWdlOiBzdHJpbmcpIHtcbi8vIFx0XHQvLyB0aGlzLnN0cmVhbS53cml0ZSgnSGVsbG8gJywgbG9nX21lc3NhZ2UpO1xuLy8gXHRcdC8vIHRoaXMuZnMuY3JlYXRlV3JpdGVTdHJlYW0oJ2xvZy50eHQnLCB7IGZsYWdzOiAnYScgfSk7XG4vLyBcdFx0Ly8gdGhpcy5mcy53cml0ZSgnbmV3IGVudHJ5XFxuJyk7XG4vLyBcdFx0Y29uc29sZS5sb2coXCJMb2dnaW5nIGZpbGU6IFwiLCBsb2dfbWVzc2FnZSk7XG4vLyBcdH1cblxuLy8gXHRyZWFkRmlsZSgpe1xuXG4vLyBcdH1cblxuLy8gXHRjbG9zZUxvZ0ZpbGUoKXtcbi8vIFx0XHR2YXIgc3RyZWFtID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0oJy4vZmlsZS50eHQnKTtcbi8vIFx0XHRzdHJlYW0ub24oJ2ZpbmlzaCcsICgpID0+IHtcbi8vIFx0XHRcdGNvbnNvbGUubG9nKCdBbGwgdGhlIGRhdGEgaXMgdHJhbnNtaXR0ZWQnKTtcbi8vIFx0XHR9KTtcbi8vIFx0fVxuLy8gfVxuXG4vLyBDdXJyZW50bHkgdXNpbmcgZ2xvYmFsIGFjdGlvbkxpc3QsIGJ1dCBjYW4gYWxzbyBwYXNzIHBhcmFtIHRvIGZ1bmN0aW9uOiBhY3Rpb25MaXN0OnNpbVR5cGVzLkFjdGlvbltdXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWN0aW9uQnlOYW1lKG5hbWU6c3RyaW5nKTpzaW1UeXBlcy5BY3Rpb24ge1xuXHRjb25zb2xlLmxvZyhcIkluIGdldEFjdGlvbkJ5TmFtZVwiKVxuXHRjb25zb2xlLmxvZyhuYW1lKTtcblxuXHR2YXIgcG9zc2libGVfYWN0aW9ucyA9IGFjdGlvbkxpc3QuZmlsdGVyKChhY3Rpb246IHNpbVR5cGVzLkFjdGlvbikgPT4gYWN0aW9uLm5hbWUgPT09IG5hbWUpO1xuXHRpZiAocG9zc2libGVfYWN0aW9ucy5sZW5ndGggPiAwKXtcblx0XHRyZXR1cm4gcG9zc2libGVfYWN0aW9uc1swXVxuXHR9XG5cdGVsc2V7XG5cdFx0Ly8gcmV0dXJucyBmYWxzZSBpZiB0aGVyZSBpcyBubyBsaXN0ZWQgYWN0aW9uIHdpdGggdGhpcyBuYW1lXG5cdFx0Y29uc29sZS5sb2coXCJnZXRBY3Rpb25CeU5hbWUgPT4gQ291bGRuJ3QgZmluZCBhY3Rpb24gd2l0aCBuYW1lOiBcIiwgbmFtZSk7XG5cdH1cbn1cblxuXG4vLyBSZXR1cm5zIGEgQWdlbnRbXSB1c2luZyBkYXRhIGZyb20gdGhlIGRhdGEuanNvbiBmaWxlIFxuLy8gbWF0Y2hlcyB0aGUgc3RyaW5nOmFjdGlvbl9uYW1lIGFnYWluc3QgZXhpc3RpbmcgYWN0aW9ucyBhbmQgcmV0dXJucyB0aGUgc2FtZVxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRBZ2VudHNGcm9tSlNPTihhZ2VudF9qc29uOmFueSk6IHNpbVR5cGVzLkFnZW50W117XG5cdHZhciBhZ2VudExpc3Q6IHNpbVR5cGVzLkFnZW50W10gPSBbXTtcblx0Zm9yICh2YXIgcGFyc2VBZ2VudCBvZiBhZ2VudF9qc29uKXtcblx0XHR2YXIgcG9zc2libGVfYWN0aW9uID0gZ2V0QWN0aW9uQnlOYW1lKHBhcnNlQWdlbnQuY3VycmVudEFjdGlvbilcblx0XHRpZiAocG9zc2libGVfYWN0aW9uKXtcblx0XHRcdHZhciBhZ2VudCA6IHNpbVR5cGVzLkFnZW50ID0ge1xuXHRcdFx0XHRuYW1lOiBwYXJzZUFnZW50Lm5hbWUsXG5cdFx0XHRcdG1vdGl2ZTogcGFyc2VBZ2VudC5tb3RpdmUsXG5cdFx0XHRcdG9jY3VwaWVkQ291bnRlcjogcGFyc2VBZ2VudC5vY2N1cGllZENvdW50ZXIsXG5cdFx0XHRcdGN1cnJlbnRBY3Rpb246IHBvc3NpYmxlX2FjdGlvbixcblx0XHRcdFx0ZGVzdGluYXRpb246IHBhcnNlQWdlbnQuZGVzdGluYXRpb24sXG5cdFx0XHRcdGN1cnJlbnRMb2NhdGlvbjogcGFyc2VBZ2VudC5jdXJyZW50TG9jYXRpb25cblx0XHRcdH1cblx0XHRcdGFnZW50TGlzdC5wdXNoKGFnZW50KTtcblx0XHR9XG5cdFx0XG5cdH1cblx0cmV0dXJuIGFnZW50TGlzdDtcbn1cblxuXG5cblxuXG5cblxuXG4iXX0=
