import * as types from "./types";
import * as main from "./main";
import * as npc from "./agent";
import * as utility from "./utilities";
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
 * Executed every turn, calls the next turn if applicable
 * @param  {types.Agent[]} agentList - list of agents in the simulation
 * @param {types.Action[]} actionList - list of valid actions in the simulation
 * @param {types.SimLocation[]} locationList - list of locations in the simulation
 * @param {() => boolean} continueFunction - boolean function that is used as a check as to whether or not to keep running the sim
 * @param {number} time - time of execution
 * @param {boolean} movement - whether or not an agent moved
 */
export function updateUI(agentList:types.Agent[], actionList:types.Action[], locationList:types.SimLocation[], continueFunction: () => boolean, time:number, movement:boolean){
  	showOnBrowser("time", time.toString());
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
	var agent:types.Agent = npc.getAgentByName(activeAgent);
	if (agent != null) {
		showOnBrowser("occupied", agent.occupiedCounter.toString());
		showOnBrowser("action", agent.currentAction.name);
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
	if (continueFunction()) {
		if (movement) {
			setTimeout(() => {exec.run_sim(agentList, actionList, locationList, continueFunction)}, sleepMove);
		} else {
			setTimeout(() => {exec.run_sim(agentList, actionList, locationList, continueFunction)}, sleepStill);
		}
	} else {
		console.log("Finished.");
	}
}
