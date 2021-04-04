(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.turn = exports.execute_action = exports.select_action = exports.isContent = exports.ReqType = exports.BinOp = exports.MotiveType = void 0;
var exec = require("./execution_engine");
// import {wait_action} from "./action_specs";
// import {travel_action} from "./action_specs";
var utility = require("./utilities");
// Five motive types
// Discuss: This is an enum, but we don't use it. We pass 0,1,2 into the action specs file. 
// Discuss: While this can be an enum -- renamed to MotiveType | Change: declare a union type for Motive 
var MotiveType;
(function (MotiveType) {
    MotiveType["physical"] = "physical";
    MotiveType["emotional"] = "emotional";
    MotiveType["social"] = "social";
    MotiveType["financial"] = "financial";
    MotiveType["accomplishment"] = "accomplishment";
})(MotiveType = exports.MotiveType || (exports.MotiveType = {}));
// convenient list of keys of the motive types we have which we can iterate through
var motiveTypes = Object.keys(MotiveType).filter(function (k) { return typeof MotiveType[k] === "string"; });
// const StringIsNumber = value => isNaN(Number(value)) === false;
// function ToArray(enumme) {
//     return Object.keys(enumme)
//         .filter(StringIsNumber)
//         .map(key => enumme[key]);
// }
// const motiveTypes = ToArray(MotiveType);
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
    ReqType["location"] = "location";
    ReqType["people"] = "people";
    ReqType["motive"] = "motive";
})(ReqType = exports.ReqType || (exports.ReqType = {}));
/*  Checks to see if an agent has maximum motives
        agent: the agent being tested
        return: a boolean answering the question */
// To do: this way. 
// const getKeyValue = <U extends keyof T, T extends object>(key: U) => (obj: T) => obj[key];
function isContent(agent) {
    for (var _i = 0, motiveTypes_1 = motiveTypes; _i < motiveTypes_1.length; _i++) {
        var motiveType = motiveTypes_1[_i];
        // const getmotive = getKeyValue<keyof Motive, Motive>(motiveType)(agent.motive);
        if (agent.motive[motiveType] < exec.MAX_METER) {
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
    var currentChoice = utility.getActionByName("wait_action");
    // Talk to Jen about this method 
    // Finds the utility for each action to the given agent
    for (var i = 0; i < actionList.length; i++) {
        var dest = null;
        var travelTime = 0;
        var check = true;
        for (var k = 0; k < actionList[i].requirements.length; k++) {
            if (actionList[i].requirements[k].type == ReqType.location) {
                var requirement = actionList[i].requirements[k].req;
                dest = exec.getNearestLocation(requirement, locationList, agent.currentLocation.xPos, agent.currentLocation.yPos);
                if (dest == null) {
                    // Don't have to travel, already there???
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
            for (var j = 0; j < actionList[i].effects.length; j++) {
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
            for (var _i = 0, motiveTypes_2 = motiveTypes; _i < motiveTypes_2.length; _i++) {
                var motiveType = motiveTypes_2[_i];
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
                if (choice.requirements[k].type == ReqType.location) {
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
                agent.currentAction = utility.getActionByName("travel_action");
                agent.occupiedCounter = Math.abs(dest.xPos - agent.currentLocation.xPos) + Math.abs(dest.yPos - agent.currentLocation.yPos);
                dest.xPos = agent.currentLocation.xPos;
                dest.yPos = agent.currentLocation.yPos;
            }
        }
    }
}
exports.turn = turn;

},{"./execution_engine":3,"./utilities":5}],2:[function(require,module,exports){
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
				"xPos": 5,
				"yPos": 5
			}
		},
		{
			"name": "Jane Doe",
			"motive": {
				"physical": 5,
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
	],
	"actions": [
	  {
		"name": "wait_action",
		"requirements": [],
		"effects": [],
		"time_min": 0
	  },
	  {
		"name": "travel_action",
		"requirements": [],
		"effects": [],
		"time_min": 0
	  },
	  {
		"name": "eat_action",
		"requirements": [{"type":"location", "req":{"hasAllOf":["restaurant"], "hasOneOrMoreOf":[], "hasNoneOf":[]}}],
		"effects":      [{"motive":"physical", "delta":2}],
		"time_min":     60
	  },
	  {
	    "name": "movie_action",
	    "requirements": [
	    	{ "type":"location", "req":{"hasAllOf":["movie theatre"], "hasOneOrMoreOf":[], "hasNoneOf":[]}}
    	],
	    "effects":      [{"motive":"emotional", "delta":3}],
	    "time_min":     120
	  },
	  {
	    "name": "eat_friend_action",
	    "requirements": [
	    	{"type":"location", "req":{"hasAllOf":["restaurant"], "hasOneOrMoreOf":[], "hasNoneOf":[]}},
			{"type":"people", "req":{"minNumPeople":2, "maxNumPeople":-1, "specificPeoplePresent":[], "specificPeopleAbsent":[], "relationshipsPresent":[], "relationshipsAbsent":[]}}
		],
	    "effects":      [{"motive":"physical", "delta":2}, {"motive":"social", "delta":2}],
	    "time_min":     70
	  },
	  {
	    "name": "movie_friend_action",
	    "requirements": [
	    	{"type":"location", "req":{"hasAllOf":["movie theatre"], "hasOneOrMoreOf":[], "hasNoneOf":[]}},
			{"type":"people", "req":{"minNumPeople":2, "maxNumPeople":-1, "specificPeoplePresent":[], "specificPeopleAbsent":[], "relationshipsPresent":[], "relationshipsAbsent":[]}}
		],
	    "effects":      [{"motive":"emotional", "delta":3}, {"motive":"social", "delta":2}],
	    "time_min":     130
	  },
	  {
	    "name": "work_action",
	    "requirements": [
	    	{"type":"location", "req":{"hasAllOf":["employment"], "hasOneOrMoreOf":[], "hasNoneOf":[]}}
    	],
	    "effects":      [{"motive":"financial", "delta":1}],
	    "time_min":     240
	  },
	  {
	    "name": "hobby_action",
	    "requirements": [
	    	{"type":"location", "req":{"hasAllOf":["home"], "hasOneOrMoreOf":[], "hasNoneOf":[]}}
    	],
	    "effects":      [{"motive":"accomplishment", "delta":2}],
	    "time_min":     60
	  }
	],
	"locations": [
		{
			"name": "restaurant", 
			"xPos": 5, "yPos": 5, 
			"tags": ["restaurant", "employment"]
		},
		{
			"name": "movie theatre", 
			"xPos": 0, "yPos": 5, 
			"tags": ["movie theatre", "employment"]
		},
		{
			"name": "home", 
			"xPos": 5, "yPos": 0, 
			"tags": ["home"]
		}
	]
}
},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run_sim = exports.getNearestLocation = exports.inList = exports.clamp = exports.MIN_METER = exports.MAX_METER = exports.time = void 0;
var npc = require("./agent");
// import {wait_action} from "./action_specs";
// import {travel_action} from "./action_specs";
// import {actionList} from "./main";
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
        for (var _i = 0, agentList_1 = agentList; _i < agentList_1.length; _i++) {
            var agent = agentList_1[_i];
            npc.turn(agent, actionList, locationList, exports.time);
        }
        exports.time += 1;
    }
    console.log("Finished.");
}
exports.run_sim = run_sim;

},{"./agent":1}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentList = exports.actionList = exports.locationList = void 0;
var engine = require("./execution_engine");
var npc = require("./agent");
var utility = require("./utilities");
// import * as json_data from "./data.json";
var json_data = require("./data.json");
exports.locationList = utility.loadLocationsFromJSON(json_data['locations']);
exports.actionList = utility.loadActionsFromJSON(json_data['actions']);
exports.agentList = utility.loadAgentsFromJSON(json_data["agents"]);
// condition function.
// Stops the sim when all agents are at full meters
function condition() {
    for (var _i = 0, agentList_1 = exports.agentList; _i < agentList_1.length; _i++) {
        var agent = agentList_1[_i];
        // If any agent is not content, continue running sim
        if (!npc.isContent(agent)) {
            return true;
        }
    }
    // If all agents are content, stop running
    return false;
}
engine.run_sim(exports.agentList, exports.actionList, exports.locationList, condition);
// Displays text on the browser? I assume
function showOnBrowser(divName, name) {
    var elt = document.getElementById(divName);
    elt.innerText = name + "Hello World!";
}
showOnBrowser("greeting", "TypeScript");

},{"./agent":1,"./data.json":2,"./execution_engine":3,"./utilities":5}],5:[function(require,module,exports){
"use strict";
// Utilties File
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadLocationsFromJSON = exports.loadActionsFromJSON = exports.loadAgentsFromJSON = exports.getActionByName = void 0;
var simTypes = require("./agent");
var main_1 = require("./main");
// Currently using global actionList, but can also pass param to function: actionList:simTypes.Action[]
function getActionByName(name) {
    var possible_actions = main_1.actionList.filter(function (action) { return action.name === name; });
    // if theres an action with this name, return the first one
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
    var agents = [];
    for (var _i = 0, agent_json_1 = agent_json; _i < agent_json_1.length; _i++) {
        var parseAgent = agent_json_1[_i];
        var possible_action = getActionByName(parseAgent.currentAction);
        if (possible_action) {
            var agent = {
                name: parseAgent['name'],
                motive: parseAgent['motive'],
                occupiedCounter: parseAgent['occupiedCounter'],
                currentAction: possible_action,
                destination: parseAgent['destination'],
                currentLocation: parseAgent['currentLocation']
            };
            agents.push(agent);
        }
    }
    console.log("agents: ", agents);
    return agents;
}
exports.loadAgentsFromJSON = loadAgentsFromJSON;
function loadActionsFromJSON(actions_json) {
    // var _actions_json = JSON.parse(actions_json);
    var actions = [];
    for (var _i = 0, actions_json_1 = actions_json; _i < actions_json_1.length; _i++) {
        var parseAction = actions_json_1[_i];
        var requirementList = [];
        for (var _a = 0, _b = parseAction['requirements']; _a < _b.length; _a++) {
            var parseReq = _b[_a];
            var _reqType = parseReq["type"];
            var requirement = {
                type: simTypes.ReqType[_reqType],
                req: parseReq['req']
            };
            requirementList.push(requirement);
        }
        var effectsList = [];
        for (var _c = 0, _d = parseAction['effects']; _c < _d.length; _c++) {
            var parseEffect = _d[_c];
            var _motType = parseEffect["motive"];
            var effect = {
                motive: simTypes.MotiveType[_motType],
                delta: parseEffect['delta']
            };
            effectsList.push(effect);
        }
        var action = {
            name: parseAction["name"],
            requirements: requirementList,
            effects: effectsList,
            time_min: parseAction["time_min"]
        };
        actions.push(action);
    }
    console.log("actions: ", actions);
    return actions;
}
exports.loadActionsFromJSON = loadActionsFromJSON;
function loadLocationsFromJSON(locations_json) {
    var locations = [];
    for (var _i = 0, locations_json_1 = locations_json; _i < locations_json_1.length; _i++) {
        var parseLocation = locations_json_1[_i];
        var location = {
            name: parseLocation['name'],
            xPos: parseLocation['xPos'],
            yPos: parseLocation['yPos'],
            tags: parseLocation['tags']
        };
        locations.push(location);
    }
    console.log("locations: ", locations);
    return locations;
}
exports.loadLocationsFromJSON = loadLocationsFromJSON;

},{"./agent":1,"./main":4}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWdlbnQudHMiLCJzcmMvZGF0YS5qc29uIiwic3JjL2V4ZWN1dGlvbl9lbmdpbmUudHMiLCJzcmMvbWFpbi50cyIsInNyYy91dGlsaXRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUNBQSx5Q0FBMkM7QUFDM0MsOENBQThDO0FBQzlDLGdEQUFnRDtBQUNoRCxxQ0FBdUM7QUFHdkMsb0JBQW9CO0FBQ3BCLDRGQUE0RjtBQUM1Rix5R0FBeUc7QUFDekcsSUFBWSxVQU1YO0FBTkQsV0FBWSxVQUFVO0lBQ3JCLG1DQUFxQixDQUFBO0lBQ3JCLHFDQUF1QixDQUFBO0lBQ3ZCLCtCQUFpQixDQUFBO0lBQ2pCLHFDQUF1QixDQUFBO0lBQ3ZCLCtDQUFpQyxDQUFBO0FBQ2xDLENBQUMsRUFOVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQU1yQjtBQWNELG1GQUFtRjtBQUNuRixJQUFNLFdBQVcsR0FBYSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLE9BQU8sVUFBVSxDQUFDLENBQTRCLENBQUMsS0FBSyxRQUFRLEVBQTVELENBQTRELENBQUMsQ0FBQztBQUVoSSxrRUFBa0U7QUFDbEUsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUNqQyxrQ0FBa0M7QUFDbEMsb0NBQW9DO0FBQ3BDLElBQUk7QUFFSiwyQ0FBMkM7QUFHM0MsbURBQW1EO0FBQ25ELElBQVksS0FNWDtBQU5ELFdBQVksS0FBSztJQUNoQixxQ0FBTSxDQUFBO0lBQ04saURBQVksQ0FBQTtJQUNaLDJDQUFTLENBQUE7SUFDVCwrQkFBRyxDQUFBO0lBQ0gsK0JBQUcsQ0FBQTtBQUNKLENBQUMsRUFOVyxLQUFLLEdBQUwsYUFBSyxLQUFMLGFBQUssUUFNaEI7QUFFRCw4QkFBOEI7QUFDOUIsNEZBQTRGO0FBQzVGLElBQVksT0FJ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QUMsZUFBZSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM1SCxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDO2dCQUN2QyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDO2FBQ3ZDO1NBQ0Q7S0FDRDtBQUNGLENBQUM7QUF2Q0Qsb0JBdUNDOzs7QUN2UkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QWQsSUFBYyxFQUFFO1FBQXJDLElBQUksYUFBYSx1QkFBQTtRQUNyQixJQUFJLFFBQVEsR0FBc0I7WUFDakMsSUFBSSxFQUFHLGFBQXFCLENBQUMsTUFBTSxDQUFDO1lBQ3BDLElBQUksRUFBRyxhQUFxQixDQUFDLE1BQU0sQ0FBQztZQUNwQyxJQUFJLEVBQUcsYUFBcUIsQ0FBQyxNQUFNLENBQUM7WUFDcEMsSUFBSSxFQUFHLGFBQXFCLENBQUMsTUFBTSxDQUFDO1NBQ3BDLENBQUE7UUFDRCxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3pCO0lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDdEMsT0FBTyxTQUFTLENBQUM7QUFDbEIsQ0FBQztBQWRELHNEQWNDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0ICogYXMgZXhlYyBmcm9tIFwiLi9leGVjdXRpb25fZW5naW5lXCI7XG4vLyBpbXBvcnQge3dhaXRfYWN0aW9ufSBmcm9tIFwiLi9hY3Rpb25fc3BlY3NcIjtcbi8vIGltcG9ydCB7dHJhdmVsX2FjdGlvbn0gZnJvbSBcIi4vYWN0aW9uX3NwZWNzXCI7XG5pbXBvcnQgKiBhcyB1dGlsaXR5IGZyb20gXCIuL3V0aWxpdGllc1wiO1xuXG5cbi8vIEZpdmUgbW90aXZlIHR5cGVzXG4vLyBEaXNjdXNzOiBUaGlzIGlzIGFuIGVudW0sIGJ1dCB3ZSBkb24ndCB1c2UgaXQuIFdlIHBhc3MgMCwxLDIgaW50byB0aGUgYWN0aW9uIHNwZWNzIGZpbGUuIFxuLy8gRGlzY3VzczogV2hpbGUgdGhpcyBjYW4gYmUgYW4gZW51bSAtLSByZW5hbWVkIHRvIE1vdGl2ZVR5cGUgfCBDaGFuZ2U6IGRlY2xhcmUgYSB1bmlvbiB0eXBlIGZvciBNb3RpdmUgXG5leHBvcnQgZW51bSBNb3RpdmVUeXBlIHtcblx0cGh5c2ljYWwgPSBcInBoeXNpY2FsXCIsXG5cdGVtb3Rpb25hbCA9IFwiZW1vdGlvbmFsXCIsXG5cdHNvY2lhbCA9IFwic29jaWFsXCIsXG5cdGZpbmFuY2lhbCA9IFwiZmluYW5jaWFsXCIsXG5cdGFjY29tcGxpc2htZW50ID0gXCJhY2NvbXBsaXNobWVudFwiXG59XG5cbi8vIFRoaXMgaXMgbW9yZSBvZiBhIG5lZWQgYW5kIGxlc3Mgb2YgYSBtb3RpdmUgc2luY2UgaXQncyBhIHNldCBvZiB0aGVtIGFsbFxuXG5leHBvcnQgaW50ZXJmYWNlIE1vdGl2ZSB7XG5cdHBoeXNpY2FsOiBudW1iZXI7XG5cdGVtb3Rpb25hbDogbnVtYmVyO1xuXHRzb2NpYWw6IG51bWJlcjtcblx0ZmluYW5jaWFsOiBudW1iZXI7XG5cdGFjY29tcGxpc2htZW50OiBudW1iZXI7XG5cdFtrZXk6IHN0cmluZ106IG51bWJlcjtcdFx0Ly8gbGV0cyB1cyBsb29rdXAgYSB2YWx1ZSBieSBhIHN0cmluZyBrZXlcbn1cblxuXG4vLyBjb252ZW5pZW50IGxpc3Qgb2Yga2V5cyBvZiB0aGUgbW90aXZlIHR5cGVzIHdlIGhhdmUgd2hpY2ggd2UgY2FuIGl0ZXJhdGUgdGhyb3VnaFxuY29uc3QgbW90aXZlVHlwZXM6IHN0cmluZ1tdID0gT2JqZWN0LmtleXMoTW90aXZlVHlwZSkuZmlsdGVyKGsgPT4gdHlwZW9mIE1vdGl2ZVR5cGVbayBhcyBrZXlvZiB0eXBlb2YgTW90aXZlVHlwZV0gPT09IFwic3RyaW5nXCIpO1xuXG4vLyBjb25zdCBTdHJpbmdJc051bWJlciA9IHZhbHVlID0+IGlzTmFOKE51bWJlcih2YWx1ZSkpID09PSBmYWxzZTtcbi8vIGZ1bmN0aW9uIFRvQXJyYXkoZW51bW1lKSB7XG4vLyAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGVudW1tZSlcbi8vICAgICAgICAgLmZpbHRlcihTdHJpbmdJc051bWJlcilcbi8vICAgICAgICAgLm1hcChrZXkgPT4gZW51bW1lW2tleV0pO1xuLy8gfVxuXG4vLyBjb25zdCBtb3RpdmVUeXBlcyA9IFRvQXJyYXkoTW90aXZlVHlwZSk7XG5cblxuLy8gQmluYXJ5IE9wZXJhdGlvbnMgdXNlZCBwcmltYXJpbHkgaW4gcmVxdWlyZW1lbnRzXG5leHBvcnQgZW51bSBCaW5PcCB7XG5cdGVxdWFscyxcblx0Z3JlYXRlcl90aGFuLFxuXHRsZXNzX3RoYW4sXG5cdGdlcSxcblx0bGVxXG59XG5cbi8vIFRocmVlIHR5cGVzIG9mIHJlcXVpcmVtZW50c1xuLy8gRGlzY3VzczogVGhpcyBpcyBhbiBlbnVtLCBidXQgd2UgZG9uJ3QgdXNlIGl0LiBXZSBwYXNzIDAsMSwyIGludG8gdGhlIGFjdGlvbiBzcGVjcyBmaWxlLiBcbmV4cG9ydCBlbnVtIFJlcVR5cGUge1xuXHRsb2NhdGlvbiA9IFwibG9jYXRpb25cIixcblx0cGVvcGxlID0gXCJwZW9wbGVcIixcblx0bW90aXZlID0gXCJtb3RpdmVcIlxufVxuXG4vLyBSZXF1aXJlbWVudHMgb24gdGhlIHR5cGUgb2YgbG9jYXRpb24gdGhlIGFjdGlvbiB0YWtlcyBwbGFjZSBpbi5cbi8vIEJhc2VkIG9uIGEgdGFncyBzeXN0ZW0gZm9yIGxvY2F0aW9ucy5cbi8vIGVnOiBtdXN0IGJlIGF0IGEgcmVzdGF1cmFudFxuZXhwb3J0IGludGVyZmFjZSBMb2NhdGlvblJlcSB7XG5cdGhhc0FsbE9mOiBzdHJpbmdbXSxcblx0aGFzT25lT3JNb3JlT2Y6IHN0cmluZ1tdLFxuXHRoYXNOb25lT2Y6IHN0cmluZ1tdXG59XG5cbi8vIFJlcXVpcmVtZW50cyBvbiB3aG8gaXMgcHJlc2VudCBmb3IgYW4gYWN0aW9uLlxuLy8gZWc6IG11c3QgYmUgd2l0aCBhIHNlcGNpZmljIHBlcnNvblxuZXhwb3J0IGludGVyZmFjZSBQZW9wbGVSZXEge1xuXHRtaW5OdW1QZW9wbGU6IG51bWJlcixcblx0bWF4TnVtUGVvcGxlOiBudW1iZXIsXG5cdHNwZWNpZmljUGVvcGxlUHJlc2VudDogc3RyaW5nW10sXG5cdHNwZWNpZmljUGVvcGxlQWJzZW50OiBzdHJpbmdbXSxcblx0cmVsYXRpb25zaGlwc1ByZXNlbnQ6IHN0cmluZ1tdLFxuXHRyZWxhdGlvbnNoaXBzQWJzZW50OiBzdHJpbmdbXVxufVxuXG4vLyBSZXF1aXJlbWVudHMgb24gdGhlIGV4ZWN1dGluZyBhZ2VuJ3QgY3VycmVudCBtb3RpdmUgc2NvcmVzLlxuLy8gZWc6IGVnIG11c3QgaGF2ZSBtb25leSAoZmluYW5jaWFsIG1vdGl2ZSA+IDApIHRvIGRvIHRoaXNcbi8vIERpc2N1c3M6IFRoaXMgc2hvdWxkIGJlIHVzaW5nIHRoZSBpbnRlcmZhY2UgYW5kIG5vdCBhbiBlbnVtXG5cbi8vIGV4cG9ydCBpbnRlcmZhY2UgU2luZ2xlTW90aXZlIHtcbi8vIFx0bW90aXZlOiBNb3RpdmVUeXBlLFxuLy8gXHR2YWxlbmNlOiBudW1iZXIgXG4vLyB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgTW90aXZlUmVxIHtcblx0bW90aXZlOiBNb3RpdmVUeXBlLFxuXHRvcDogICAgIEJpbk9wLFxuXHR0aHJlc2g6IG51bWJlclxufVxuXG4vLyBHZW5lcmFsIHJlcXVpcmVtZW50IHR5cGUuXG4vLyBlZzogYW55IG9mIHRoZSBhYm92ZSB0aHJlZVxuZXhwb3J0IGludGVyZmFjZSBSZXF1aXJlbWVudCB7XG5cdHR5cGU6IFJlcVR5cGUsXG5cdHJlcTogTG9jYXRpb25SZXEgfCBQZW9wbGVSZXEgfCBNb3RpdmVSZXFcbn1cblxuLy8gQWN0aW9uIGVmZmVjdCB0eXBlLlxuLy8gZWc6IHNsZWVwIGluY3JlYXNlcyB0aGUgcGh5c2ljYWwgbW90aXZlXG5leHBvcnQgaW50ZXJmYWNlIEVmZmVjdCB7XG5cdG1vdGl2ZTogTW90aXZlVHlwZSxcblx0ZGVsdGE6IG51bWJlclxufVxuXG4vLyBHZW5lcmFsIGFjdGlvbiB0eXBlLlxuLy8gTmFtZSwgcmVxdWlyZW1udHMsIGVmZmVjdHMsIGFuZCBtaW5pbXVtIHRpbWUgdGFrZW4uXG4vLyBlZzogc2xlZXBcbmV4cG9ydCBpbnRlcmZhY2UgQWN0aW9uIHtcblx0bmFtZTogc3RyaW5nLFxuXHRyZXF1aXJlbWVudHM6IFJlcXVpcmVtZW50W10sXG5cdGVmZmVjdHM6ICAgICAgRWZmZWN0W10sXG5cdHRpbWVfbWluOiAgICAgbnVtYmVyXG59XG5cblxuXG4vL0dlbmVyYWwgYWdlbnQgdHlwZS5cbi8vIE5hbWUgYW5kIEN1cnJlbnQgTW90aXZlIFNjb3Jlcy5cbi8vIGVnOiBhbnkgbnBjIGNoYXJhY3RlclxuZXhwb3J0IGludGVyZmFjZSBBZ2VudCB7XG5cdC8vIEFnZW50IFByb3BlcnRpZXNcblx0bmFtZTogc3RyaW5nLFxuXHRtb3RpdmU6IE1vdGl2ZSxcblx0Y3VycmVudExvY2F0aW9uOiBTaW1wbGVMb2NhdGlvbiB8IExvY2F0aW9uLFxuXHRvY2N1cGllZENvdW50ZXI6IG51bWJlcixcblx0Y3VycmVudEFjdGlvbjogQWN0aW9uLFxuXHRkZXN0aW5hdGlvbjogU2ltcGxlTG9jYXRpb24gfCBMb2NhdGlvbiB8IG51bGxcbn1cblxuLy8gTG9jYXRpb25zIGNhbiBiZSBhbiB1bm5hbWVkIHBvc2l0aW9uLCB3aXRoIGp1c3QgYW4gYXNzb2NpYXRlZCB4LHkgY29vcmRpbmF0ZVxuZXhwb3J0IGludGVyZmFjZSBTaW1wbGVMb2NhdGlvbiB7XG5cdHhQb3M6IG51bWJlcixcblx0eVBvczogbnVtYmVyXG59XG5cbi8vIExvY2F0aW9ucyBjYW4gYWxzbyBiZSBhIG5hbWVkIHBvc2l0aW9uLCBhIG5hbWUsIGFuZCBhIGxpc3Qgb2YgdGFnc1xuLy8gZWc6IGEgc3BlY2lmaWMgcmVzdGF1cmFudFxuLy8gRGlzY3VzczogVGhlcmUgc2hvdWxkIGJlIGEgcG9pbnQgSW50ZXJmYWNlIHNpbmNlIHNvbWUgbG9jYXRpb25zIGFyZSBub3QgbmFtZWQuIFxuZXhwb3J0IGludGVyZmFjZSBMb2NhdGlvbiBleHRlbmRzIFNpbXBsZUxvY2F0aW9uIHtcblx0bmFtZTogc3RyaW5nXG5cdHRhZ3M6IHN0cmluZ1tdXG59XG5cblxuLyogIENoZWNrcyB0byBzZWUgaWYgYW4gYWdlbnQgaGFzIG1heGltdW0gbW90aXZlc1xuXHRcdGFnZW50OiB0aGUgYWdlbnQgYmVpbmcgdGVzdGVkXG5cdFx0cmV0dXJuOiBhIGJvb2xlYW4gYW5zd2VyaW5nIHRoZSBxdWVzdGlvbiAqL1xuXG4vLyBUbyBkbzogdGhpcyB3YXkuIFxuLy8gY29uc3QgZ2V0S2V5VmFsdWUgPSA8VSBleHRlbmRzIGtleW9mIFQsIFQgZXh0ZW5kcyBvYmplY3Q+KGtleTogVSkgPT4gKG9iajogVCkgPT4gb2JqW2tleV07XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbnRlbnQoYWdlbnQ6QWdlbnQpOmJvb2xlYW4ge1xuXHRmb3IodmFyIG1vdGl2ZVR5cGUgb2YgbW90aXZlVHlwZXMpe1xuXHRcdC8vIGNvbnN0IGdldG1vdGl2ZSA9IGdldEtleVZhbHVlPGtleW9mIE1vdGl2ZSwgTW90aXZlPihtb3RpdmVUeXBlKShhZ2VudC5tb3RpdmUpO1xuXHRcdGlmKGFnZW50Lm1vdGl2ZVttb3RpdmVUeXBlXSA8IGV4ZWMuTUFYX01FVEVSKXtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRydWU7XG59XG5cblxuLyogIFNlbGVjdHMgYW4gYWN0aW9uIGZyb20gYSBsaXN0IG9mIHZhbGlkIGFjdGlvbnMgdG8gYmUgcHJlZm9ybWVkIGJ5IGEgc3BlY2lmaWMgYWdlbnQuXG5cdFx0Q2hvc2VzIHRoZSBhY3Rpb24gd2l0aCB0aGUgbWF4aW1hbCB1dGlsaXR5IG9mIHRoZSBhZ2VudCAobW90aXZlIGluY3JlYXNlL3RpbWUpLlxuXHRcdGFnZW50OiB0aGUgYWdlbnQgaW4gcXVlc3Rpb25cblx0XHRhY3Rpb25MaXN0OiB0aGUgbGlzdCBvZiB2YWxpZCBhY3Rpb25zXG5cdFx0bG9jYXRpb25MaXN0OiBhbGwgbG9jYXRpb25zIGluIHRoZSB3b3JsZFxuXHRcdHJldHVybjogVGhlIHNpbmdsZSBhY3Rpb24gY2hvc2VuIGZyb20gdGhlIGxpc3QgKi9cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RfYWN0aW9uKGFnZW50OkFnZW50LCBhY3Rpb25MaXN0OkFjdGlvbltdLCBsb2NhdGlvbkxpc3Q6TG9jYXRpb25bXSk6QWN0aW9uIHtcblx0Ly8gaW5pdGlhbGl6ZWQgdG8gMCAobm8gcmVhc29uIHRvIGRvIGFuIGFjdGlvbiBpZiBpdCB3aWxsIGhhcm0geW91KVxuXHR2YXIgbWF4RGVsdGFVdGlsaXR5Om51bWJlciA9IDA7XG5cdFxuXHQvLyBpbml0aWFsaXplZCB0byB0aGUgaW5hY3Rpb25cblx0dmFyIGN1cnJlbnRDaG9pY2U6QWN0aW9uID0gdXRpbGl0eS5nZXRBY3Rpb25CeU5hbWUoXCJ3YWl0X2FjdGlvblwiKTtcblx0XG5cblx0Ly8gVGFsayB0byBKZW4gYWJvdXQgdGhpcyBtZXRob2QgXG5cdC8vIEZpbmRzIHRoZSB1dGlsaXR5IGZvciBlYWNoIGFjdGlvbiB0byB0aGUgZ2l2ZW4gYWdlbnRcblx0Zm9yICh2YXIgaSA9IDA7IGk8YWN0aW9uTGlzdC5sZW5ndGg7IGkrKyl7XG5cdFx0dmFyIGRlc3Q6TG9jYXRpb24gPSBudWxsO1xuXHRcdHZhciB0cmF2ZWxUaW1lOm51bWJlciA9IDA7XG5cdFx0dmFyIGNoZWNrOmJvb2xlYW4gPSB0cnVlO1xuXG5cdFx0Zm9yICh2YXIgazpudW1iZXIgPSAwOyBrPGFjdGlvbkxpc3RbaV0ucmVxdWlyZW1lbnRzLmxlbmd0aDsgaysrKSB7XG5cdFx0XHRpZiAoYWN0aW9uTGlzdFtpXS5yZXF1aXJlbWVudHNba10udHlwZSA9PSBSZXFUeXBlLmxvY2F0aW9uKXtcblx0XHRcdFx0dmFyIHJlcXVpcmVtZW50OkxvY2F0aW9uUmVxID0gYWN0aW9uTGlzdFtpXS5yZXF1aXJlbWVudHNba10ucmVxIGFzIExvY2F0aW9uUmVxO1xuXHRcdFx0XHRkZXN0ID0gZXhlYy5nZXROZWFyZXN0TG9jYXRpb24ocmVxdWlyZW1lbnQsIGxvY2F0aW9uTGlzdCwgYWdlbnQuY3VycmVudExvY2F0aW9uLnhQb3MsIGFnZW50LmN1cnJlbnRMb2NhdGlvbi55UG9zKTtcblx0XHRcdFx0aWYgKGRlc3QgPT0gbnVsbCkge1xuXHRcdFx0XHRcdC8vIERvbid0IGhhdmUgdG8gdHJhdmVsLCBhbHJlYWR5IHRoZXJlPz8/XG5cdFx0XHRcdFx0Y2hlY2sgPSBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0cmF2ZWxUaW1lID0gTWF0aC5hYnMoZGVzdC54UG9zIC0gYWdlbnQuY3VycmVudExvY2F0aW9uLnhQb3MpICsgTWF0aC5hYnMoZGVzdC55UG9zIC0gYWdlbnQuY3VycmVudExvY2F0aW9uLnlQb3MpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIGlmIGFuIGFjdGlvbiBoYXMgc2F0aXNmaWFibGUgcmVxdWlyZW1lbnRzXG5cdFx0aWYgKGNoZWNrKSB7XG5cdFx0XHR2YXIgZGVsdGFVdGlsaXR5Om51bWJlciA9IDA7XG5cdFx0XHRcblx0XHRcdGZvciAodmFyIGo6bnVtYmVyPTA7IGo8YWN0aW9uTGlzdFtpXS5lZmZlY3RzLmxlbmd0aDsgaisrKXtcblx0XHRcdFx0dmFyIF9kZWx0YSA9IGFjdGlvbkxpc3RbaV0uZWZmZWN0c1tqXS5kZWx0YTtcblx0XHRcdFx0dmFyIF9tb3RpdmV0eXBlID0gTW90aXZlVHlwZVthY3Rpb25MaXN0W2ldLmVmZmVjdHNbal0ubW90aXZlXTtcblx0XHRcdCAgIGRlbHRhVXRpbGl0eSArPSBleGVjLmNsYW1wKF9kZWx0YSArIGFnZW50Lm1vdGl2ZVtfbW90aXZldHlwZV0sIGV4ZWMuTUFYX01FVEVSLCBleGVjLk1JTl9NRVRFUikgLSBhZ2VudC5tb3RpdmVbX21vdGl2ZXR5cGVdO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBhZGp1c3QgZm9yIHRpbWUgKGluY2x1ZGluZyB0cmF2ZWwgdGltZSlcblx0XHRcdGRlbHRhVXRpbGl0eSA9IGRlbHRhVXRpbGl0eS8oYWN0aW9uTGlzdFtpXS50aW1lX21pbiArIHRyYXZlbFRpbWUpO1xuXHRcdFx0Ly8vIHVwZGF0ZSBjaG9pY2UgaWYgbmV3IHV0aWxpdHkgaXMgbWF4aW11bSBzZWVuIHNvIGZhclxuXHRcdFx0aWYgKGRlbHRhVXRpbGl0eSA+IG1heERlbHRhVXRpbGl0eSkge1xuXHRcdFx0XHRtYXhEZWx0YVV0aWxpdHkgPSBkZWx0YVV0aWxpdHk7XG5cdFx0XHRcdGN1cnJlbnRDaG9pY2UgPSBhY3Rpb25MaXN0W2ldO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gY3VycmVudENob2ljZTtcbn1cblxuLyogIGFwcGxpZXMgdGhlIGVmZmVjdHMgb2YgYW4gYWN0aW9uIHRvIGFuIGFnZW50LlxuXHRcdGFnZW50OiB0aGUgYWdlbnQgaW4gcXVlc3Rpb25cblx0XHRhY3Rpb246IHRoZSBhY3Rpb24gaW4gcXVlc3Rpb24gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGVjdXRlX2FjdGlvbihhZ2VudDpBZ2VudCwgYWN0aW9uOkFjdGlvbik6dm9pZCB7XG5cdHZhciBpOm51bWJlciA9IDA7XG5cdC8vIGFwcGx5IGVhY2ggZWZmZWN0IG9mIHRoZSBhY3Rpb24gYnkgdXBkYXRpbmcgdGhlIGFnZW50J3MgbW90aXZlc1xuXG5cdGZvciAoaT0wOyBpPGFjdGlvbi5lZmZlY3RzLmxlbmd0aDsgaSsrKXtcblx0XHR2YXIgX2RlbHRhID0gYWN0aW9uLmVmZmVjdHNbaV0uZGVsdGE7XG5cdFx0dmFyIF9tb3RpdmV0eXBlID0gTW90aXZlVHlwZVthY3Rpb24uZWZmZWN0c1tpXS5tb3RpdmVdO1xuXHQgICBhZ2VudC5tb3RpdmVbX21vdGl2ZXR5cGVdID0gZXhlYy5jbGFtcChhZ2VudC5tb3RpdmVbX21vdGl2ZXR5cGVdICsgX2RlbHRhLCBleGVjLk1BWF9NRVRFUiwgZXhlYy5NSU5fTUVURVIpO1xuXHR9XG59XG5cbi8qICB1cGRhdGVzIG1vdmVtZW50IGFuZCBvY2N1cGF0aW9uIGNvdW50ZXJzIGZvciBhbiBhZ2VudC4gY2hvb3NlcyBhbmQgZXhlY3V0ZXMgYSBuZXcgYWN0aW9uIGlmIG5lY2Vzc2FyeSBcblx0XHRhZ2VudDogYWdlbnQgZXhlY3V0aW5nIGEgdHVyblxuXHRcdGFjdGlvbkxpc3Q6IHRoZSBsaXN0IG9mIHZhbGlkIGFjdGlvbnNcblx0XHRsb2NhdGlvbkxpc3Q6IGFsbCBsb2NhdGlvbnMgaW4gdGhlIHdvcmxkXG5cdFx0dGltZTogY3VycmVudCB0aWNrIHRpbWUgKi9cbmV4cG9ydCBmdW5jdGlvbiB0dXJuKGFnZW50OkFnZW50LCBhY3Rpb25MaXN0OkFjdGlvbltdLCBsb2NhdGlvbkxpc3Q6TG9jYXRpb25bXSwgdGltZTpudW1iZXIpOnZvaWQge1xuXHRpZiAodGltZSU2MDAgPT0gMCkge1xuXHRcdGlmICghaXNDb250ZW50KGFnZW50KSkge1xuXHRcdFx0Zm9yKHZhciBtb3RpdmVUeXBlIG9mIG1vdGl2ZVR5cGVzKSB7XG5cdFx0XHRcdGFnZW50Lm1vdGl2ZVttb3RpdmVUeXBlXSA9IGV4ZWMuY2xhbXAoYWdlbnQubW90aXZlW21vdGl2ZVR5cGVdIC0gMSwgZXhlYy5NQVhfTUVURVIsIGV4ZWMuTUlOX01FVEVSKTtcblx0XHRcdH1cdFxuXHRcdH1cblx0fVxuXHRpZiAoYWdlbnQub2NjdXBpZWRDb3VudGVyID4gMCkge1xuXHRcdGFnZW50Lm9jY3VwaWVkQ291bnRlci0tO1xuXHR9IFxuXHRlbHNlIHtcblx0XHRpZiAoIWlzQ29udGVudChhZ2VudCkpIHtcblx0XHRcdGFnZW50LmRlc3RpbmF0aW9uID0gbnVsbDtcblx0XHRcdGV4ZWN1dGVfYWN0aW9uKGFnZW50LCBhZ2VudC5jdXJyZW50QWN0aW9uKTtcblx0XHRcdGNvbnNvbGUubG9nKFwidGltZTogXCIgKyB0aW1lLnRvU3RyaW5nKCkgKyBcIiB8IFwiICsgYWdlbnQubmFtZSArIFwiOiBGaW5pc2hlZCBcIiArIGFnZW50LmN1cnJlbnRBY3Rpb24ubmFtZSk7XG5cdFx0XHR2YXIgY2hvaWNlOkFjdGlvbiA9IHNlbGVjdF9hY3Rpb24oYWdlbnQsIGFjdGlvbkxpc3QsIGxvY2F0aW9uTGlzdCk7XG5cdFx0XHR2YXIgZGVzdDpMb2NhdGlvbiA9IG51bGw7XG5cdFx0XHR2YXIgazpudW1iZXIgPSAwO1xuXHRcdFx0Zm9yIChrID0gMDsgazxjaG9pY2UucmVxdWlyZW1lbnRzLmxlbmd0aDsgaysrKSB7XG5cdFx0XHRcdGlmIChjaG9pY2UucmVxdWlyZW1lbnRzW2tdLnR5cGUgPT0gUmVxVHlwZS5sb2NhdGlvbikge1xuXHRcdFx0XHRcdHZhciByZXF1aXJlbWVudDpMb2NhdGlvblJlcSA9IGNob2ljZS5yZXF1aXJlbWVudHNba10ucmVxIGFzIExvY2F0aW9uUmVxO1xuXHRcdFx0XHRcdGRlc3QgPSBleGVjLmdldE5lYXJlc3RMb2NhdGlvbihyZXF1aXJlbWVudCwgbG9jYXRpb25MaXN0LCBhZ2VudC5jdXJyZW50TG9jYXRpb24ueFBvcywgYWdlbnQuY3VycmVudExvY2F0aW9uLnlQb3MpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvL3NldCBhY3Rpb24gdG8gY2hvaWNlIG9yIHRvIHRyYXZlbCBpZiBhZ2VudCBpcyBub3QgYXQgbG9jYXRpb24gZm9yIGNob2ljZVxuXHRcdFx0aWYgKGRlc3QgPT09IG51bGwgfHwgKGRlc3QueFBvcyA9PSBhZ2VudC5jdXJyZW50TG9jYXRpb24ueFBvcyAmJiBkZXN0LnlQb3MgPT0gYWdlbnQuY3VycmVudExvY2F0aW9uLnlQb3MpKSB7XG5cdFx0XHRcdGFnZW50LmN1cnJlbnRBY3Rpb24gPSBjaG9pY2U7XG5cdFx0XHRcdGFnZW50Lm9jY3VwaWVkQ291bnRlciA9IGNob2ljZS50aW1lX21pbjtcblx0XHRcdFx0Ly8gY29uc29sZS5sb2coXCJ0aW1lOiBcIiArIHRpbWUudG9TdHJpbmcoKSArIFwiIHwgXCIgKyBhZ2VudC5uYW1lICsgXCI6IFN0YXJ0ZWQgXCIgKyBhZ2VudC5jdXJyZW50QWN0aW9uLm5hbWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIHRyYXZlbFRpbWU6bnVtYmVyID0gTWF0aC5hYnMoZGVzdC54UG9zIC0gYWdlbnQuY3VycmVudExvY2F0aW9uLnhQb3MpICsgTWF0aC5hYnMoZGVzdC55UG9zIC0gYWdlbnQuY3VycmVudExvY2F0aW9uLnlQb3MpO1xuXHRcdFx0XHRhZ2VudC5jdXJyZW50QWN0aW9uID0gdXRpbGl0eS5nZXRBY3Rpb25CeU5hbWUoXCJ0cmF2ZWxfYWN0aW9uXCIpO1xuXHRcdFx0XHRhZ2VudC5vY2N1cGllZENvdW50ZXIgPSBNYXRoLmFicyhkZXN0LnhQb3MgLSBhZ2VudC5jdXJyZW50TG9jYXRpb24ueFBvcykgKyBNYXRoLmFicyhkZXN0LnlQb3MgLSBhZ2VudC5jdXJyZW50TG9jYXRpb24ueVBvcyk7XG5cdFx0XHRcdGRlc3QueFBvcyA9IGFnZW50LmN1cnJlbnRMb2NhdGlvbi54UG9zO1xuXHRcdFx0XHRkZXN0LnlQb3MgPSBhZ2VudC5jdXJyZW50TG9jYXRpb24ueVBvcztcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcblx0XCJhZ2VudHNcIjogW1xuXHRcdHtcblx0XHRcdFwibmFtZVwiOiBcIkpvaG4gRG9lXCIsXG5cdFx0XHRcIm1vdGl2ZVwiOiB7XG5cdFx0XHRcdFwicGh5c2ljYWxcIjogMSxcblx0XHRcdFx0XCJlbW90aW9uYWxcIjogMSxcblx0XHRcdFx0XCJzb2NpYWxcIjogMSxcblx0XHRcdFx0XCJmaW5hbmNpYWxcIjogMSxcblx0XHRcdFx0XCJhY2NvbXBsaXNobWVudFwiOiAxXG5cdFx0XHR9LFxuXHRcdFx0XCJjdXJyZW50TG9jYXRpb25cIjoge1xuXHRcdFx0XHRcInhQb3NcIjogMCxcblx0XHRcdFx0XCJ5UG9zXCI6IDBcblx0XHRcdH0sXG5cdFx0XHRcIm9jY3VwaWVkQ291bnRlclwiOiAwLFxuXHRcdFx0XCJjdXJyZW50QWN0aW9uXCI6IFwid2FpdF9hY3Rpb25cIixcblx0XHRcdFwiZGVzdGluYXRpb25cIjoge1xuXHRcdFx0XHRcInhQb3NcIjogNSxcblx0XHRcdFx0XCJ5UG9zXCI6IDVcblx0XHRcdH1cblx0XHR9LFxuXHRcdHtcblx0XHRcdFwibmFtZVwiOiBcIkphbmUgRG9lXCIsXG5cdFx0XHRcIm1vdGl2ZVwiOiB7XG5cdFx0XHRcdFwicGh5c2ljYWxcIjogNSxcblx0XHRcdFx0XCJlbW90aW9uYWxcIjogMSxcblx0XHRcdFx0XCJzb2NpYWxcIjogNCxcblx0XHRcdFx0XCJmaW5hbmNpYWxcIjogMSxcblx0XHRcdFx0XCJhY2NvbXBsaXNobWVudFwiOiA0XG5cdFx0XHR9LFxuXHRcdFx0XCJjdXJyZW50TG9jYXRpb25cIjoge1xuXHRcdFx0XHRcInhQb3NcIjogNSxcblx0XHRcdFx0XCJ5UG9zXCI6IDVcblx0XHRcdH0sXG5cdFx0XHRcIm9jY3VwaWVkQ291bnRlclwiOiAwLFxuXHRcdFx0XCJjdXJyZW50QWN0aW9uXCI6IFwid2FpdF9hY3Rpb25cIixcblx0XHRcdFwiZGVzdGluYXRpb25cIjoge1xuXHRcdFx0XHRcInhQb3NcIjogMCxcblx0XHRcdFx0XCJ5UG9zXCI6IDBcblx0XHRcdH1cblx0XHR9XG5cdF0sXG5cdFwiYWN0aW9uc1wiOiBbXG5cdCAge1xuXHRcdFwibmFtZVwiOiBcIndhaXRfYWN0aW9uXCIsXG5cdFx0XCJyZXF1aXJlbWVudHNcIjogW10sXG5cdFx0XCJlZmZlY3RzXCI6IFtdLFxuXHRcdFwidGltZV9taW5cIjogMFxuXHQgIH0sXG5cdCAge1xuXHRcdFwibmFtZVwiOiBcInRyYXZlbF9hY3Rpb25cIixcblx0XHRcInJlcXVpcmVtZW50c1wiOiBbXSxcblx0XHRcImVmZmVjdHNcIjogW10sXG5cdFx0XCJ0aW1lX21pblwiOiAwXG5cdCAgfSxcblx0ICB7XG5cdFx0XCJuYW1lXCI6IFwiZWF0X2FjdGlvblwiLFxuXHRcdFwicmVxdWlyZW1lbnRzXCI6IFt7XCJ0eXBlXCI6XCJsb2NhdGlvblwiLCBcInJlcVwiOntcImhhc0FsbE9mXCI6W1wicmVzdGF1cmFudFwiXSwgXCJoYXNPbmVPck1vcmVPZlwiOltdLCBcImhhc05vbmVPZlwiOltdfX1dLFxuXHRcdFwiZWZmZWN0c1wiOiAgICAgIFt7XCJtb3RpdmVcIjpcInBoeXNpY2FsXCIsIFwiZGVsdGFcIjoyfV0sXG5cdFx0XCJ0aW1lX21pblwiOiAgICAgNjBcblx0ICB9LFxuXHQgIHtcblx0ICAgIFwibmFtZVwiOiBcIm1vdmllX2FjdGlvblwiLFxuXHQgICAgXCJyZXF1aXJlbWVudHNcIjogW1xuXHQgICAgXHR7IFwidHlwZVwiOlwibG9jYXRpb25cIiwgXCJyZXFcIjp7XCJoYXNBbGxPZlwiOltcIm1vdmllIHRoZWF0cmVcIl0sIFwiaGFzT25lT3JNb3JlT2ZcIjpbXSwgXCJoYXNOb25lT2ZcIjpbXX19XG4gICAgXHRdLFxuXHQgICAgXCJlZmZlY3RzXCI6ICAgICAgW3tcIm1vdGl2ZVwiOlwiZW1vdGlvbmFsXCIsIFwiZGVsdGFcIjozfV0sXG5cdCAgICBcInRpbWVfbWluXCI6ICAgICAxMjBcblx0ICB9LFxuXHQgIHtcblx0ICAgIFwibmFtZVwiOiBcImVhdF9mcmllbmRfYWN0aW9uXCIsXG5cdCAgICBcInJlcXVpcmVtZW50c1wiOiBbXG5cdCAgICBcdHtcInR5cGVcIjpcImxvY2F0aW9uXCIsIFwicmVxXCI6e1wiaGFzQWxsT2ZcIjpbXCJyZXN0YXVyYW50XCJdLCBcImhhc09uZU9yTW9yZU9mXCI6W10sIFwiaGFzTm9uZU9mXCI6W119fSxcblx0XHRcdHtcInR5cGVcIjpcInBlb3BsZVwiLCBcInJlcVwiOntcIm1pbk51bVBlb3BsZVwiOjIsIFwibWF4TnVtUGVvcGxlXCI6LTEsIFwic3BlY2lmaWNQZW9wbGVQcmVzZW50XCI6W10sIFwic3BlY2lmaWNQZW9wbGVBYnNlbnRcIjpbXSwgXCJyZWxhdGlvbnNoaXBzUHJlc2VudFwiOltdLCBcInJlbGF0aW9uc2hpcHNBYnNlbnRcIjpbXX19XG5cdFx0XSxcblx0ICAgIFwiZWZmZWN0c1wiOiAgICAgIFt7XCJtb3RpdmVcIjpcInBoeXNpY2FsXCIsIFwiZGVsdGFcIjoyfSwge1wibW90aXZlXCI6XCJzb2NpYWxcIiwgXCJkZWx0YVwiOjJ9XSxcblx0ICAgIFwidGltZV9taW5cIjogICAgIDcwXG5cdCAgfSxcblx0ICB7XG5cdCAgICBcIm5hbWVcIjogXCJtb3ZpZV9mcmllbmRfYWN0aW9uXCIsXG5cdCAgICBcInJlcXVpcmVtZW50c1wiOiBbXG5cdCAgICBcdHtcInR5cGVcIjpcImxvY2F0aW9uXCIsIFwicmVxXCI6e1wiaGFzQWxsT2ZcIjpbXCJtb3ZpZSB0aGVhdHJlXCJdLCBcImhhc09uZU9yTW9yZU9mXCI6W10sIFwiaGFzTm9uZU9mXCI6W119fSxcblx0XHRcdHtcInR5cGVcIjpcInBlb3BsZVwiLCBcInJlcVwiOntcIm1pbk51bVBlb3BsZVwiOjIsIFwibWF4TnVtUGVvcGxlXCI6LTEsIFwic3BlY2lmaWNQZW9wbGVQcmVzZW50XCI6W10sIFwic3BlY2lmaWNQZW9wbGVBYnNlbnRcIjpbXSwgXCJyZWxhdGlvbnNoaXBzUHJlc2VudFwiOltdLCBcInJlbGF0aW9uc2hpcHNBYnNlbnRcIjpbXX19XG5cdFx0XSxcblx0ICAgIFwiZWZmZWN0c1wiOiAgICAgIFt7XCJtb3RpdmVcIjpcImVtb3Rpb25hbFwiLCBcImRlbHRhXCI6M30sIHtcIm1vdGl2ZVwiOlwic29jaWFsXCIsIFwiZGVsdGFcIjoyfV0sXG5cdCAgICBcInRpbWVfbWluXCI6ICAgICAxMzBcblx0ICB9LFxuXHQgIHtcblx0ICAgIFwibmFtZVwiOiBcIndvcmtfYWN0aW9uXCIsXG5cdCAgICBcInJlcXVpcmVtZW50c1wiOiBbXG5cdCAgICBcdHtcInR5cGVcIjpcImxvY2F0aW9uXCIsIFwicmVxXCI6e1wiaGFzQWxsT2ZcIjpbXCJlbXBsb3ltZW50XCJdLCBcImhhc09uZU9yTW9yZU9mXCI6W10sIFwiaGFzTm9uZU9mXCI6W119fVxuICAgIFx0XSxcblx0ICAgIFwiZWZmZWN0c1wiOiAgICAgIFt7XCJtb3RpdmVcIjpcImZpbmFuY2lhbFwiLCBcImRlbHRhXCI6MX1dLFxuXHQgICAgXCJ0aW1lX21pblwiOiAgICAgMjQwXG5cdCAgfSxcblx0ICB7XG5cdCAgICBcIm5hbWVcIjogXCJob2JieV9hY3Rpb25cIixcblx0ICAgIFwicmVxdWlyZW1lbnRzXCI6IFtcblx0ICAgIFx0e1widHlwZVwiOlwibG9jYXRpb25cIiwgXCJyZXFcIjp7XCJoYXNBbGxPZlwiOltcImhvbWVcIl0sIFwiaGFzT25lT3JNb3JlT2ZcIjpbXSwgXCJoYXNOb25lT2ZcIjpbXX19XG4gICAgXHRdLFxuXHQgICAgXCJlZmZlY3RzXCI6ICAgICAgW3tcIm1vdGl2ZVwiOlwiYWNjb21wbGlzaG1lbnRcIiwgXCJkZWx0YVwiOjJ9XSxcblx0ICAgIFwidGltZV9taW5cIjogICAgIDYwXG5cdCAgfVxuXHRdLFxuXHRcImxvY2F0aW9uc1wiOiBbXG5cdFx0e1xuXHRcdFx0XCJuYW1lXCI6IFwicmVzdGF1cmFudFwiLCBcblx0XHRcdFwieFBvc1wiOiA1LCBcInlQb3NcIjogNSwgXG5cdFx0XHRcInRhZ3NcIjogW1wicmVzdGF1cmFudFwiLCBcImVtcGxveW1lbnRcIl1cblx0XHR9LFxuXHRcdHtcblx0XHRcdFwibmFtZVwiOiBcIm1vdmllIHRoZWF0cmVcIiwgXG5cdFx0XHRcInhQb3NcIjogMCwgXCJ5UG9zXCI6IDUsIFxuXHRcdFx0XCJ0YWdzXCI6IFtcIm1vdmllIHRoZWF0cmVcIiwgXCJlbXBsb3ltZW50XCJdXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRcIm5hbWVcIjogXCJob21lXCIsIFxuXHRcdFx0XCJ4UG9zXCI6IDUsIFwieVBvc1wiOiAwLCBcblx0XHRcdFwidGFnc1wiOiBbXCJob21lXCJdXG5cdFx0fVxuXHRdXG59IiwiaW1wb3J0ICogYXMgbnBjIGZyb20gXCIuL2FnZW50XCI7XG4vLyBpbXBvcnQge3dhaXRfYWN0aW9ufSBmcm9tIFwiLi9hY3Rpb25fc3BlY3NcIjtcbi8vIGltcG9ydCB7dHJhdmVsX2FjdGlvbn0gZnJvbSBcIi4vYWN0aW9uX3NwZWNzXCI7XG5cbi8vIGltcG9ydCB7YWN0aW9uTGlzdH0gZnJvbSBcIi4vbWFpblwiO1xuXG5leHBvcnQgdmFyIHRpbWU6bnVtYmVyID0gMDtcbmV4cG9ydCBjb25zdCBNQVhfTUVURVIgPSA1O1xuZXhwb3J0IGNvbnN0IE1JTl9NRVRFUiA9IDE7XG5cbi8qICBTaW1wbGUgbWF0aGVtYXRpY2FsIGNsYW1wIGZ1bmN0aW9uLlxuICAgIG46IG51bWJlciBiZWluZyB0ZXN0ZWRcbiAgICBtOiBtYXhpbXVtIHZhbHVlIG9mIG51bWJlclxuICAgIG86IG1pbmltdW0gdmFsdWUgb2YgbnVtYmVyXG4gICAgcmV0dXJuOiBlaXRoZXIgdGhlIG51bWJlciwgb3IgdGhlIG1heC9taW4gaWYgaXQgd2FzIG91dHNpZGUgb2YgdGhlIHJhbmdlICovXG5leHBvcnQgZnVuY3Rpb24gY2xhbXAobjpudW1iZXIsIG06bnVtYmVyLCBvOm51bWJlcik6bnVtYmVyIHtcbiAgaWYgKG4gPiBtKSB7XG4gICAgcmV0dXJuIG07XG4gIH0gZWxzZSBpZiAobiA8IG8pIHtcbiAgICByZXR1cm4gbztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbjtcbiAgfVxuXG59XG5cbi8qICBSYW5kb21pemUgYXJyYXkgaW4tcGxhY2UgdXNpbmcgRHVyc3RlbmZlbGQgc2h1ZmZsZSBhbGdvcml0aG1cbiAgICBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yNDUwOTU0L2hvdy10by1yYW5kb21pemUtc2h1ZmZsZS1hLWphdmFzY3JpcHQtYXJyYXlcbiAgICAqL1xuZnVuY3Rpb24gc2h1ZmZsZUFycmF5KGFycmF5Om5wYy5BZ2VudFtdKTp2b2lkIHtcbiAgICBmb3IgKHZhciBpOm51bWJlciA9IGFycmF5Lmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgdmFyIGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaSArIDEpKTtcbiAgICAgICAgdmFyIHRlbXA6bnBjLkFnZW50ID0gYXJyYXlbaV07XG4gICAgICAgIGFycmF5W2ldID0gYXJyYXlbal07XG4gICAgICAgIGFycmF5W2pdID0gdGVtcDtcbiAgICB9XG59XG5cbi8qICBjaGVja3MgbWVtYmVyc2hpcCBpbiBhIGxpc3QuIFN0cmluZyB0eXBlXG4gICAgaXRlbTogYSBzdHJpbmcgdG8gYmUgY2hlY2tlZFxuICAgIGxpc3Q6IGEgbGlzdCBvZiBzdHJpbmdzIHRvIGNoZWNrIGFnYWluc3RcbiAgICByZXR1cm46IGEgYm9vbGVhbiBhbnN3ZXJpbmcgdGhlIHF1ZXN0aW9uICovXG5leHBvcnQgZnVuY3Rpb24gaW5MaXN0KGl0ZW06c3RyaW5nLCBsaXN0OnN0cmluZ1tdKTpib29sZWFuIHtcbiAgdmFyIHJldDpib29sZWFuID0gZmFsc2U7XG4gIHZhciBpOm51bWJlciA9IDA7XG4gIGZvciAoaSA9IDA7IGk8bGlzdC5sZW5ndGg7IGkrKyl7XG4gICAgaWYgKGxpc3RbaV0gPT0gaXRlbSkge1xuICAgICAgcmV0ID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuLyogIHJldHVybnMgdGhlIG5lYXJlc3QgbG9jYXRpb24gdGhhdCBzYXRpc2ZpZXMgdGhlIGdpdmVuIHJlcXVpcmVtZW50LCBvciBudWxsLlxuICAgIGRpc3RhbmNlIG1lYXN1cmVkIGJ5IG1hbmhhdHRhbiBkaXN0YW5jZVxuICAgIHJlcTogYSBsb2NhdGlvbiByZXF1aXJlbWVudCB0byBzYXRpc2Z5XG4gICAgbGlzdDogYSBsaXN0IG9mIGxvY2F0aW9ucyB0byBjaGVja1xuICAgIHggJiB5OiBjb29yZGluYXRlIHBhaXIgdG8gZGV0ZXJtaW5lIGRpc3RhbmNlIGFnYWluc3QuXG4gICAgcmV0dXJuOiB0aGUgbG9jYXRpb24gaW4gcXVlc3Rpb24gb3IgbnVsbCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE5lYXJlc3RMb2NhdGlvbihyZXE6bnBjLkxvY2F0aW9uUmVxLCBsaXN0Om5wYy5Mb2NhdGlvbltdLCB4Om51bWJlciwgeTpudW1iZXIpOm5wYy5Mb2NhdGlvbiB7XG4gIHZhciByZXQ6bnBjLkxvY2F0aW9uID0gbnVsbDtcbiAgdmFyIG1pbkRpc3Q6bnVtYmVyID0gLTE7XG4gIHZhciBpOm51bWJlciA9IDA7XG4gIGZvciAoaSA9IDA7IGk8bGlzdC5sZW5ndGg7IGkrKyl7XG4gICAgdmFyIHZhbGlkOmJvb2xlYW4gPSB0cnVlO1xuICAgIHZhciBjaGVjazE6Ym9vbGVhbiA9IHRydWU7XG4gICAgdmFyIGo6bnVtYmVyID0gMDtcbiAgICBmb3IgKGogPSAwOyBqPHJlcS5oYXNBbGxPZi5sZW5ndGg7IGorKyl7XG4gICAgICBpZiAoIShpbkxpc3QocmVxLmhhc0FsbE9mW2pdLGxpc3RbaV0udGFncykpKSB7XG4gICAgICAgIGNoZWNrMSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgY2hlY2syOmJvb2xlYW4gPSBmYWxzZTtcbiAgICBmb3IgKGogPSAwOyBqPHJlcS5oYXNPbmVPck1vcmVPZi5sZW5ndGg7IGorKyl7XG4gICAgICBpZiAoaW5MaXN0KHJlcS5oYXNPbmVPck1vcmVPZltqXSxsaXN0W2ldLnRhZ3MpKSB7XG4gICAgICAgIGNoZWNrMiA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChyZXEuaGFzT25lT3JNb3JlT2YubGVuZ3RoID09IDApIHtcbiAgICAgIGNoZWNrMiA9IHRydWU7XG4gICAgfVxuICAgIHZhciBjaGVjazM6Ym9vbGVhbiA9IHRydWU7XG4gICAgZm9yIChqID0gMDsgajxyZXEuaGFzTm9uZU9mLmxlbmd0aDsgaisrKXtcbiAgICAgIGlmIChpbkxpc3QocmVxLmhhc05vbmVPZltqXSxsaXN0W2ldLnRhZ3MpKSB7XG4gICAgICAgIGNoZWNrMyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocmVxLmhhc05vbmVPZi5sZW5ndGggPT0gMCkge1xuICAgICAgY2hlY2szID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKCEoY2hlY2sxICYmIGNoZWNrMiAmJiBjaGVjazMpKSB7XG4gICAgICB2YWxpZCA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAodmFsaWQpIHtcbiAgICAgIHZhciB0cmF2ZWxEaXN0OiBudW1iZXIgPSBNYXRoLmFicyhsaXN0W2ldLnhQb3MgLSB4KSArIE1hdGguYWJzKGxpc3RbaV0ueVBvcyAtIHkpO1xuICAgICAgaWYgKChtaW5EaXN0ID4gdHJhdmVsRGlzdCkgfHwgKG1pbkRpc3QgPSAtMSkpIHtcbiAgICAgICAgbWluRGlzdCA9IHRyYXZlbERpc3Q7XG4gICAgICAgIHJldCA9IGxpc3RbaV07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbi8qICByYW5kb21pemVzIG9yZGVyIGFuZCBleGVjdXRlcyBhIHR1cm4gZm9yIGVhY2ggYWdlbnQgZXZlcnkgdGljay5cbiAgICBhZ2VudExpc3Q6IGxpc3Qgb2YgYWdlbnRzIGluIHRoZSBzaW1cbiAgICBhY3Rpb25MaXN0OiB0aGUgbGlzdCBvZiB2YWxpZCBhY3Rpb25zXG4gICAgbG9jYXRpb25MaXN0OiBhbGwgbG9jYXRpb25zIGluIHRoZSB3b3JsZFxuICAgIGNvbnRpbnVlRnVuY3Rpb246IGJvb2xlYW4gZnVuY3Rpb24gdGhhdCBpcyB1c2VkIGFzIGEgY2hlY2sgYXMgdG8gd2hldGhlciBvciBub3QgdG8ga2VlcCBydW5uaW5nIHRoZSBzaW0gKi9cbmV4cG9ydCBmdW5jdGlvbiBydW5fc2ltKGFnZW50TGlzdDpucGMuQWdlbnRbXSwgYWN0aW9uTGlzdDpucGMuQWN0aW9uW10sIGxvY2F0aW9uTGlzdDpucGMuTG9jYXRpb25bXSwgY29udGludWVGdW5jdGlvbjogKCkgPT4gYm9vbGVhbik6dm9pZCB7XG4gIHdoaWxlIChjb250aW51ZUZ1bmN0aW9uKCkpIHtcbiAgICBzaHVmZmxlQXJyYXkoYWdlbnRMaXN0KTtcbiAgICBmb3IgKHZhciBhZ2VudCBvZiBhZ2VudExpc3QpIHtcbiAgICAgIG5wYy50dXJuKGFnZW50LCBhY3Rpb25MaXN0LCBsb2NhdGlvbkxpc3QsIHRpbWUpO1xuICAgIH1cbiAgICB0aW1lICs9IDE7XG4gIH1cbiAgY29uc29sZS5sb2coXCJGaW5pc2hlZC5cIik7XG59XG5cblxuIiwiaW1wb3J0ICogYXMgZW5naW5lIGZyb20gXCIuL2V4ZWN1dGlvbl9lbmdpbmVcIjtcbmltcG9ydCAqIGFzIGFjdGlvbnMgZnJvbSBcIi4vYWN0aW9uX3NwZWNzXCI7XG5pbXBvcnQgKiBhcyBucGMgZnJvbSBcIi4vYWdlbnRcIjtcbmltcG9ydCAqIGFzIHV0aWxpdHkgZnJvbSBcIi4vdXRpbGl0aWVzXCI7XG5cbi8vIGltcG9ydCAqIGFzIGpzb25fZGF0YSBmcm9tIFwiLi9kYXRhLmpzb25cIjtcbmNvbnN0IGpzb25fZGF0YSA9IHJlcXVpcmUoXCIuL2RhdGEuanNvblwiKTtcbmV4cG9ydCB2YXIgbG9jYXRpb25MaXN0OiBucGMuTG9jYXRpb25bXSA9IHV0aWxpdHkubG9hZExvY2F0aW9uc0Zyb21KU09OKGpzb25fZGF0YVsnbG9jYXRpb25zJ10pXG5leHBvcnQgdmFyIGFjdGlvbkxpc3Q6IG5wYy5BY3Rpb25bXSA9IHV0aWxpdHkubG9hZEFjdGlvbnNGcm9tSlNPTihqc29uX2RhdGFbJ2FjdGlvbnMnXSlcbmV4cG9ydCB2YXIgYWdlbnRMaXN0OiBucGMuQWdlbnRbXSA9IHV0aWxpdHkubG9hZEFnZW50c0Zyb21KU09OKGpzb25fZGF0YVtcImFnZW50c1wiXSk7XG5cbi8vIGNvbmRpdGlvbiBmdW5jdGlvbi5cbi8vIFN0b3BzIHRoZSBzaW0gd2hlbiBhbGwgYWdlbnRzIGFyZSBhdCBmdWxsIG1ldGVyc1xuZnVuY3Rpb24gY29uZGl0aW9uKCk6Ym9vbGVhbiB7XG5cdGZvciAodmFyIGFnZW50IG9mIGFnZW50TGlzdCl7XG5cdFx0Ly8gSWYgYW55IGFnZW50IGlzIG5vdCBjb250ZW50LCBjb250aW51ZSBydW5uaW5nIHNpbVxuXHRcdGlmKCFucGMuaXNDb250ZW50KGFnZW50KSl7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH1cblx0Ly8gSWYgYWxsIGFnZW50cyBhcmUgY29udGVudCwgc3RvcCBydW5uaW5nXG5cdHJldHVybiBmYWxzZTtcbn1cblxuXG5lbmdpbmUucnVuX3NpbShhZ2VudExpc3QsIGFjdGlvbkxpc3QsIGxvY2F0aW9uTGlzdCwgY29uZGl0aW9uKTtcblxuLy8gRGlzcGxheXMgdGV4dCBvbiB0aGUgYnJvd3Nlcj8gSSBhc3N1bWVcbmZ1bmN0aW9uIHNob3dPbkJyb3dzZXIoZGl2TmFtZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcblx0Y29uc3QgZWx0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGl2TmFtZSk7XG5cdGVsdC5pbm5lclRleHQgPSBuYW1lICsgXCJIZWxsbyBXb3JsZCFcIjtcbn1cblxuc2hvd09uQnJvd3NlcihcImdyZWV0aW5nXCIsIFwiVHlwZVNjcmlwdFwiKTtcbiIsIi8vIFV0aWx0aWVzIEZpbGVcblxuaW1wb3J0ICogYXMgc2ltVHlwZXMgZnJvbSBcIi4vYWdlbnRcIjtcbmltcG9ydCB7YWN0aW9uTGlzdH0gZnJvbSBcIi4vbWFpblwiO1xuXG5cbi8vIEN1cnJlbnRseSB1c2luZyBnbG9iYWwgYWN0aW9uTGlzdCwgYnV0IGNhbiBhbHNvIHBhc3MgcGFyYW0gdG8gZnVuY3Rpb246IGFjdGlvbkxpc3Q6c2ltVHlwZXMuQWN0aW9uW11cbmV4cG9ydCBmdW5jdGlvbiBnZXRBY3Rpb25CeU5hbWUobmFtZTpzdHJpbmcpOnNpbVR5cGVzLkFjdGlvbiB7XG5cdHZhciBwb3NzaWJsZV9hY3Rpb25zID0gYWN0aW9uTGlzdC5maWx0ZXIoKGFjdGlvbjogc2ltVHlwZXMuQWN0aW9uKSA9PiBhY3Rpb24ubmFtZSA9PT0gbmFtZSk7XG5cblx0Ly8gaWYgdGhlcmVzIGFuIGFjdGlvbiB3aXRoIHRoaXMgbmFtZSwgcmV0dXJuIHRoZSBmaXJzdCBvbmVcblx0aWYgKHBvc3NpYmxlX2FjdGlvbnMubGVuZ3RoID4gMCl7XG5cdFx0cmV0dXJuIHBvc3NpYmxlX2FjdGlvbnNbMF1cblx0fVxuXHRlbHNle1xuXHRcdC8vIHJldHVybnMgZmFsc2UgaWYgdGhlcmUgaXMgbm8gbGlzdGVkIGFjdGlvbiB3aXRoIHRoaXMgbmFtZVxuXHRcdGNvbnNvbGUubG9nKFwiZ2V0QWN0aW9uQnlOYW1lID0+IENvdWxkbid0IGZpbmQgYWN0aW9uIHdpdGggbmFtZTogXCIsIG5hbWUpO1xuXHR9XG59XG5cblxuLy8gUmV0dXJucyBhIEFnZW50W10gdXNpbmcgZGF0YSBmcm9tIHRoZSBkYXRhLmpzb24gZmlsZSBcbi8vIG1hdGNoZXMgdGhlIHN0cmluZzphY3Rpb25fbmFtZSBhZ2FpbnN0IGV4aXN0aW5nIGFjdGlvbnMgYW5kIHJldHVybnMgdGhlIHNhbWVcbmV4cG9ydCBmdW5jdGlvbiBsb2FkQWdlbnRzRnJvbUpTT04oYWdlbnRfanNvbjphbnkpOiBzaW1UeXBlcy5BZ2VudFtde1xuXHR2YXIgYWdlbnRzOiBzaW1UeXBlcy5BZ2VudFtdID0gW107XG5cdGZvciAodmFyIHBhcnNlQWdlbnQgb2YgYWdlbnRfanNvbil7XG5cdFx0dmFyIHBvc3NpYmxlX2FjdGlvbiA9IGdldEFjdGlvbkJ5TmFtZShwYXJzZUFnZW50LmN1cnJlbnRBY3Rpb24pXG5cdFx0aWYgKHBvc3NpYmxlX2FjdGlvbil7XG5cdFx0XHR2YXIgYWdlbnQgOiBzaW1UeXBlcy5BZ2VudCA9IHtcblx0XHRcdFx0bmFtZTogcGFyc2VBZ2VudFsnbmFtZSddLFxuXHRcdFx0XHRtb3RpdmU6IHBhcnNlQWdlbnRbJ21vdGl2ZSddLFxuXHRcdFx0XHRvY2N1cGllZENvdW50ZXI6IHBhcnNlQWdlbnRbJ29jY3VwaWVkQ291bnRlciddLFxuXHRcdFx0XHRjdXJyZW50QWN0aW9uOiBwb3NzaWJsZV9hY3Rpb24sXG5cdFx0XHRcdGRlc3RpbmF0aW9uOiBwYXJzZUFnZW50WydkZXN0aW5hdGlvbiddLFxuXHRcdFx0XHRjdXJyZW50TG9jYXRpb246IHBhcnNlQWdlbnRbJ2N1cnJlbnRMb2NhdGlvbiddXG5cdFx0XHR9XG5cdFx0XHRhZ2VudHMucHVzaChhZ2VudCk7XG5cdFx0fVxuXHRcdFxuXHR9XG5cdGNvbnNvbGUubG9nKFwiYWdlbnRzOiBcIiwgYWdlbnRzKTtcblx0cmV0dXJuIGFnZW50cztcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZEFjdGlvbnNGcm9tSlNPTihhY3Rpb25zX2pzb246YW55KTogc2ltVHlwZXMuQWN0aW9uW117XG5cdC8vIHZhciBfYWN0aW9uc19qc29uID0gSlNPTi5wYXJzZShhY3Rpb25zX2pzb24pO1xuXHR2YXIgYWN0aW9uczogc2ltVHlwZXMuQWN0aW9uW10gPSBbXTtcblx0Zm9yICh2YXIgcGFyc2VBY3Rpb24gb2YgYWN0aW9uc19qc29uKXtcblx0XHR2YXIgcmVxdWlyZW1lbnRMaXN0OiBzaW1UeXBlcy5SZXF1aXJlbWVudFtdID0gW107XG5cdFx0Zm9yICh2YXIgcGFyc2VSZXEgb2YgcGFyc2VBY3Rpb25bJ3JlcXVpcmVtZW50cyddKXtcblx0XHRcdHZhciBfcmVxVHlwZToga2V5b2YgdHlwZW9mIHNpbVR5cGVzLlJlcVR5cGUgPSBwYXJzZVJlcVtcInR5cGVcIl07XG5cdFx0XHR2YXIgcmVxdWlyZW1lbnQ6IHNpbVR5cGVzLlJlcXVpcmVtZW50ID0ge1xuXHRcdFx0XHR0eXBlOiBzaW1UeXBlcy5SZXFUeXBlW19yZXFUeXBlXSxcblx0XHRcdFx0cmVxOiBwYXJzZVJlcVsncmVxJ11cblx0XHRcdH1cblx0XHRcdHJlcXVpcmVtZW50TGlzdC5wdXNoKHJlcXVpcmVtZW50KTtcblx0XHR9XG5cblx0XHR2YXIgZWZmZWN0c0xpc3Q6IHNpbVR5cGVzLkVmZmVjdFtdID0gW107XG5cdFx0Zm9yICh2YXIgcGFyc2VFZmZlY3Qgb2YgcGFyc2VBY3Rpb25bJ2VmZmVjdHMnXSl7XG5cdFx0XHR2YXIgX21vdFR5cGU6IGtleW9mIHR5cGVvZiBzaW1UeXBlcy5Nb3RpdmVUeXBlID0gcGFyc2VFZmZlY3RbXCJtb3RpdmVcIl07XG5cdFx0XHR2YXIgZWZmZWN0OiBzaW1UeXBlcy5FZmZlY3QgPSB7XG5cdFx0XHRcdG1vdGl2ZTogKHNpbVR5cGVzLk1vdGl2ZVR5cGUgYXMgYW55KVtfbW90VHlwZV0sXG5cdFx0XHRcdGRlbHRhOiBwYXJzZUVmZmVjdFsnZGVsdGEnXVxuXHRcdFx0fVxuXHRcdFx0ZWZmZWN0c0xpc3QucHVzaChlZmZlY3QpO1xuXHRcdH1cblxuXHRcdHZhciBhY3Rpb24gOiBzaW1UeXBlcy5BY3Rpb24gPSB7XG5cdFx0XHRuYW1lOiBwYXJzZUFjdGlvbltcIm5hbWVcIl0sXG5cdFx0XHRyZXF1aXJlbWVudHM6IHJlcXVpcmVtZW50TGlzdCxcblx0XHRcdGVmZmVjdHM6IGVmZmVjdHNMaXN0LFxuXHRcdFx0dGltZV9taW46IHBhcnNlQWN0aW9uW1widGltZV9taW5cIl1cblx0XHR9XG5cblx0XHRhY3Rpb25zLnB1c2goYWN0aW9uKTtcblx0fVxuXHRjb25zb2xlLmxvZyhcImFjdGlvbnM6IFwiLCBhY3Rpb25zKTtcblx0cmV0dXJuIGFjdGlvbnM7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRMb2NhdGlvbnNGcm9tSlNPTihsb2NhdGlvbnNfanNvbjphbnkpOiBzaW1UeXBlcy5Mb2NhdGlvbltde1xuXHR2YXIgbG9jYXRpb25zOiBzaW1UeXBlcy5Mb2NhdGlvbltdID0gW107XG5cblx0Zm9yICh2YXIgcGFyc2VMb2NhdGlvbiBvZiBsb2NhdGlvbnNfanNvbikge1xuXHRcdHZhciBsb2NhdGlvbjogc2ltVHlwZXMuTG9jYXRpb24gPSB7XG5cdFx0XHRuYW1lOiAocGFyc2VMb2NhdGlvbiBhcyBhbnkpWyduYW1lJ10sXG5cdFx0XHR4UG9zOiAocGFyc2VMb2NhdGlvbiBhcyBhbnkpWyd4UG9zJ10sXG5cdFx0XHR5UG9zOiAocGFyc2VMb2NhdGlvbiBhcyBhbnkpWyd5UG9zJ10sXG5cdFx0XHR0YWdzOiAocGFyc2VMb2NhdGlvbiBhcyBhbnkpWyd0YWdzJ11cblx0XHR9XG5cdFx0bG9jYXRpb25zLnB1c2gobG9jYXRpb24pO1xuXHR9XG5cdGNvbnNvbGUubG9nKFwibG9jYXRpb25zOiBcIiwgbG9jYXRpb25zKTtcblx0cmV0dXJuIGxvY2F0aW9ucztcbn1cblxuXG5cblxuXG4iXX0=
