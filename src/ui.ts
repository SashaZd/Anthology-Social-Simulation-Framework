import * as types from "./types";
import * as main from "./main";
import * as exec from "./execution_engine";

var n:number = 6;
var sleep:number = 10;
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

//Executed every turn, calls the next turn if applicable
export function updateUI(agentList:types.Agent[], actionList:types.Action[], locationList:types.SimLocation[], continueFunction: () => boolean, time:number){
  main.showOnBrowser("time", time.toString());
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
			main.showOnBrowser(div, board[i][j]);
		}
	}
	if (continueFunction()) {
		setTimeout(() => {exec.run_sim(agentList, actionList, locationList, continueFunction)}, sleep);
	} else {
		console.log("Finished.");
	}
}
