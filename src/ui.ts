import * as npc from "./agent";
import * as exec from "./execution_engine";

var n:number = 6;
export var sleepMove:number = 1000;
export var sleepStill:number = 10;
var board:string[][] = [];

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

//Executed every turn, calls the next turn if applicable
export function updateUI(agentList:npc.Agent[], actionList:npc.Action[], locationList:npc.Location[], continueFunction: () => boolean, time:number, movement:boolean){
  showOnBrowser("time", time.toString());
	clearBoard();
	for (let l of locationList){
		board[l.xPos][l.yPos] += l.name[0] + ": ";
	}
	for (let a of agentList){
		board[a.currentLocation.xPos][a.currentLocation.yPos] += a.name[0] + ", ";
	}
	for(var i:number=0; i<n; i++){
		for(var j:number=0; j<n; j++){
			var div:string = "space " + i.toString() + "-" + j.toString();
			showOnBrowser(div, board[i][j]);
		}
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
