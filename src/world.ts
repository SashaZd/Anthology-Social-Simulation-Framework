import * as types from "./types";
import * as agent_manager from "./agent"
// import * as utility from "./utilities";

////////////////////////////////////////////////////////
/////////////// GLOBALS ///////////////////////////
////////////////////////////////////////////////////////

/**
 * World Time - Ticks
 * @type {number}
 */
export var TIME:number = 0;

/**
 * Increment simulation time or ticks
 */
export function increment_time():void {
	TIME += 1;
	if (TIME%1200 == 0) {
		for (var agent of agentList){
			if (!agent_manager.isContent(agent)) {
				agent_manager.decrement_motives(agent);
			}
		}
	}
}


/**
 * List of actions available within the simulation.
 * Loaded from a JSON input file.
 * @type {types.Action[]}
 */
export var actionList: types.Action[] = [];

/**
 * Size parameter for the simulation grid (n x n)
 * Loaded from a JSON input file.
 * @type {types.number}
 */
export var n:number = 0;

/**
 * Loads actions available in the simulation from the data.json file.
 *
 * @param  {types.Action[]} actions_json - JSON description of the actions
 * @returns {void} - sets an internal array of actions of type types.Actions that are available in the simulation
 */
export function loadActionsFromJSON(actions_json: types.Action[]): void {
	let actions: types.Action[] = [];
	for (let parse_action of actions_json) {
		var action: types.Action = Object.assign({}, parse_action);
		actions.push(action);
	}

	let defaultActions: types.Action[] = [{
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
		}]

	for (let parse_action of defaultActions) {
		var action: types.Action = Object.assign({}, parse_action);
		actions.push(action);
	}

	console.log("actions: ", actions);
	actionList = actions;
}

/**
 * List of agents available within the simulation
 * @type {types.Agent[]}
 */
export var agentList: types.Agent[] = []


/**
 * Load agents for the simulation from the JSON file object
 *
 * Returns a Agent[] using data from the data.json file
 * matches the string:action_name against existing actions and returns the same to avoid duplicating information
 * @param  {types.JSONAgent[]} agent_json raw JSON array of agents
 * @returns {types.Agent[]}                array of agents for the simulation run
 */
export function loadAgentsFromJSON(agent_json:types.SerializableAgent[]): void {
	let agents: types.Agent[] = [];
	for (let parse_agent of agent_json){
		let possible_actions: types.Action[] = [];
		for (let eachAction of possible_actions){
			let actualAction = actionList.filter((action: types.Action) => action.name === eachAction.name)[0] as types.Action;
			possible_actions.push(actualAction);
		}

		  //action_manager.getActionByName(parse_agent.currentAction);
		let agent:types.Agent = Object.assign({}, parse_agent, {
			currentAction: possible_actions
		});
		agents.push(agent);
	}
	agentList = agents;
}

// /**
//  * Creates random agents (amount specified in json)
//  * @param {number}	agent_json Number of agents to create
//  * @returns {void} sets an internal array of locations available within the simulation of type types.SimLocation[]
//  */
// export function createRandomAgents(agent_json:number): void {
// 	for(let i:number = 0; i<agent_json; i++) {
// 		let name:string = "Agent " + i.toString();
// 		let motive:types.Motive =
// 			{
// 				physical: utility.getRandomInt(1,5),
// 				emotional: utility.getRandomInt(1,5),
// 				social: utility.getRandomInt(1,5),
// 				financial: utility.getRandomInt(1,5),
// 				accomplishment: utility.getRandomInt(1,5)
// 			};
// 		let currentLocation:types.SimLocation =
// 			{
// 				xPos: utility.getRandomInt(0,n),
// 				yPos: utility.getRandomInt(0,n)
// 			};
// 		let possible_action: types.Action = actionList.filter((action: types.Action) => action.name === "wait_action")[0] as types.Action;
// 		let agent:types.Agent = {name:name, motive:motive, currentLocation:currentLocation, occupiedCounter:0, currentAction:possible_action, destination:null};
// 		agentList.push(agent);
// 	}
// 	console.log("agents: ", agentList);
// }

/**
 * List of locations used internally within the simulation
 * @type {types.SimLocation[]}
 */
export var locationList: types.SimLocation[] = [];


/**
 * Loads locations provided in the JSON object
 * These locations will be availble in the global locationList during the simulation run
 *
 * @param  {types.SimLocation[]} locations_json locations JSON Object
 * @returns {void} sets an internal array of locations available within the simulation of type types.SimLocation[]
 */
export function loadLocationsFromJSON(locations_json:types.SimLocation[]): void{
	let locations: types.SimLocation[] = [];

	for (let parse_location of locations_json) {
		let location:types.SimLocation = Object.assign({}, parse_location);
		locations.push(location);
	}
	locationList = locations;
}

// /**
//  * Creates random locations (amount specified in json)
//  * @param {number}	locations_json	Number of locations to create
//  * @param {number}	n_json 					Size of simularion grid
//  * @returns {void} 									sets an internal array of locations available within the simulation of type types.SimLocation[]
//  */
// export function createRandomLocations(locations_json:number, n_json:number): void{
// 	n = n_json;
// 	let tagList:string[] = ["restaurant", "movie theatre", "home", "employment"];
// 	for(let i:number = 0; i<locations_json; i++) {
// 		let name:string = "location " + i.toString();
// 		let tags:string[] = [tagList[i%4]];
// 		let xPos:number = utility.getRandomInt(0,n);
// 		let yPos:number = utility.getRandomInt(0,n);
// 		let loc:types.SimLocation = {name:name, tags:tags, xPos:xPos, yPos:yPos};
// 		locationList.push(loc);
// 	}
// 	console.log("locations: ", locationList);
// }
