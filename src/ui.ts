import * as types from "./types";
import * as main from "./main";
import * as npc from "./agent";
import * as utility from "./utilities";
import * as exec from "./execution_engine";

var n:number = 6;
export var sleepMove:number = 1000;
export var sleepStill:number = 10;

var board:string[][] = [];
var activeAgent:string = "-None-";

for(var i:number=0; i<n; i++){
	board[i]=[];
	for(var j:number=0; j<n; j++){
		board[i][j] = "";
	}
}

function clearBoard() {
	for(var i:number=0; i<n; i++){
		for(var j:number=0; j<n; j++){
			board[i][j] = "";
		}
	}
}

// Displays text on the browser? I assume
function showOnBrowser(divName: string, name: string) {
  const elt = document.getElementById(divName);
  elt.innerText = name;
}

// Displays text on the browser? I assume
export function changeValueOnBrowser(divName: string, val: number) {
  const elt:HTMLInputElement = <HTMLInputElement>document.getElementById(divName);
  elt.value = val.toString();
}

export function inputSleepMove() {
	const elt:HTMLInputElement = <HTMLInputElement>document.getElementById("sleepMove");
	sleepMove = parseFloat(elt.value);
}

export function inputSleepStill() {
	const elt:HTMLInputElement = <HTMLInputElement>document.getElementById("sleepStill");
	sleepStill = parseFloat(elt.value);
}

export function addOption(name:string) {
	const elt:HTMLSelectElement = <HTMLSelectElement>document.getElementById("agent");
	var opt:HTMLOptionElement = document.createElement("option");
	opt.value = name;
	opt.innerHTML = name;
	elt.appendChild(opt);
}

export function activeAgentChange() {
	const elt:HTMLSelectElement = <HTMLSelectElement>document.getElementById("agent");
	activeAgent = elt.value;
}

//Executed every turn, calls the next turn if applicable
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
	var agent:types.Agent = utility.getAgentByName(activeAgent);
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
