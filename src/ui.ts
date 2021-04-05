import * as npc from "./agent";
import * as main from "./main";
import * as exec from "./execution_engine";

var n:number = 6;
var sleep:number = 1000;
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
export function updateUI(agentList:npc.Agent[], actionList:npc.Action[], locationList:npc.Location[], continueFunction: () => boolean, time:number){
  main.showOnBrowser("time", time.toString());
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
			main.showOnBrowser(div, board[i][j]);
		}
	}
	if (continueFunction()) {
		setTimeout(() => {exec.run_sim(agentList, actionList, locationList, continueFunction)}, sleep);
	} else {
		console.log("Finished.");
	}
}
