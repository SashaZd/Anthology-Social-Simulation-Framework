import * as types from "./types";
import * as world from "./world";
import * as agent_manager from "./agent";
import * as exec from "./execution_engine";

var n:number = 6; // the size of the ui grid (n * n)
export var sleepMove:number = 1000; //
export var sleepStill:number = 10;

var board:string[][] = []; // each slot in the array is the characters contained on one board space
var activeAgent:string = "-None-"; // anme of the agent selected in the agent dropdown

// creates an empty board
for(var i:number=0; i<n; i++){
	board[i]=[];
	for(var j:number=0; j<n; j++){
		board[i][j] = "";
	}
}

/**
 * Clears the board GUI and fills all the cells with blanks
 */
function clearBoard() {
	for(var i:number=0; i<n; i++){
		for(var j:number=0; j<n; j++){
			board[i][j] = "";
		}
	}
}

/**
 * Display text on the browser
 * @param {string} divName Where to display text
 * @param {string} name    What to display
 */
function showOnBrowser(divName: string, name: string) {
  const elt = document.getElementById(divName);
  elt.innerText = name;
}

/**
 * Changes the value in an input box to match a provided parameter
 * @param {string} divName Where to display text
 * @param {number} val     What to display
 */
export function changeValueOnBrowser(divName: string, val: number) {
  const elt:HTMLInputElement = <HTMLInputElement>document.getElementById(divName);
  elt.value = val.toString();
}

/**
 * Updates the wait time on a turn with no movement to match input provided from the browser
 */
export function inputSleepMove() {
	const elt:HTMLInputElement = <HTMLInputElement>document.getElementById("sleepMove");
	sleepMove = parseFloat(elt.value);
}

/**
 * Updates the wait time on a turn with movement to match input provided from the browser
 */
export function inputSleepStill() {
	const elt:HTMLInputElement = <HTMLInputElement>document.getElementById("sleepStill");
	sleepStill = parseFloat(elt.value);
}

/**
 * adds an option to the agent dropdown menu
 * @param  {string} name The option to be added
 */
export function addOption(name:string) {
	const elt:HTMLSelectElement = <HTMLSelectElement>document.getElementById("agent");
	var opt:HTMLOptionElement = document.createElement("option");
	opt.value = name;
	opt.innerHTML = name;
	elt.appendChild(opt);
}

/**
 * Updates the activeAgent variable to match the selected agent on the browser
 */
export function activeAgentChange() {
	const elt:HTMLSelectElement = <HTMLSelectElement>document.getElementById("agent");
	activeAgent = elt.value;
}

/**
 * Main fuunction to update the ui elements.
 * Shows the current state of the board and any changes made in the dropdowns or input boxes.
 * Executed every turn
 * @param  {types.Agent[]} agentList - list of agents in the simulation
 * @param {types.SimLocation[]} locationList - list of locations in the simulation
 */
export function updateUI(agentList:types.Agent[], locationList:types.SimLocation[]){
  	showOnBrowser("time", world.TIME.toString());
	clearBoard();
	for (let location of locationList){
		board[location.xPos][location.yPos] += location.name[0] + ": ";
	}
	for (let agent of agentList){
		board[agent.currentLocation.xPos][agent.currentLocation.yPos] += agent.name[0] + ", ";
	}
	for(var i:number=0; i<n; i++){
		for(var j:number=0; j<n; j++){
			var div:string = "space " + i.toString() + "-" + j.toString();
			showOnBrowser(div, board[i][j]);
		}
	}
	var agent:types.Agent = agent_manager.getAgentByName(activeAgent);

	if (agent != null) {
		console.log(agent);
		var action_names: string[] = agent.currentAction.map(a => a.name);

		showOnBrowser("occupied", agent.occupiedCounter.toString());
		showOnBrowser("action", action_names.join(", "));
		showOnBrowser("physical", agent.motive.physical.toString());
		showOnBrowser("emotional", agent.motive.emotional.toString());
		showOnBrowser("social", agent.motive.social.toString());
		showOnBrowser("financial", agent.motive.financial.toString());
		showOnBrowser("accomplishment", agent.motive.accomplishment.toString());
	} else {
		showOnBrowser("occupied", "");
		showOnBrowser("action", "");
		showOnBrowser("physical", "");
		showOnBrowser("emotional", "");
		showOnBrowser("social", "");
		showOnBrowser("financial", "");
		showOnBrowser("accomplishment", "");
	}
}


window.onload = () => {
  updateUI(world.agentList, world.locationList);
	changeValueOnBrowser("sleepMove", sleepMove);
	changeValueOnBrowser("sleepStill", sleepStill);
	document.getElementById("sleepMove").addEventListener("input", inputSleepMove);
	document.getElementById("sleepStill").addEventListener("input", inputSleepStill);
	for (var agent of world.agentList){
		addOption(agent.name);
	}
	document.getElementById("agent").addEventListener("change", activeAgentChange);
	exec.run_sim(world.agentList, world.actionList, world.locationList, agent_manager.allAgentsContent);
}
