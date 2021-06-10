import * as types from "./types";

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
}


/** 
 * List of actions available within the simulation. 
 * Loaded from a JSON input file.
 * @type {types.Action[]}
 */
export var actionList: types.Action[] = [];

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
		let possible_action: types.Action = actionList.filter((action: types.Action) => action.name === parse_agent.currentAction)[0] as types.Action; //action_manager.getActionByName(parse_agent.currentAction);
		let agent:types.Agent = Object.assign({}, parse_agent, {
			currentAction: possible_action
		});
		agents.push(agent);
	}
	console.log("agents: ", agents);
	agentList = agents;
}



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
	console.log("locations: ", locations);
	locationList = locations;
}


