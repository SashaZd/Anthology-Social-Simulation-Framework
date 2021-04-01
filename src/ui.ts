import * as npc from "./agent";
import * as main from "./main";
import * as exec from "./execution_engine";

var n:number = 8;
var board:string[][] = [];
for(var i:number=0; i<n; i++){
	board[i]=[];
	for(var j:number=0; j<n; j++){
		board[i][j] = "";
	}
}

//Executed every turn, calls the next turn if applicable
export function updateUI(agentList:npc.Agent[], actionList:npc.Action[], locationList:npc.Location[], continueFunction: () => boolean, time:number){
  main.showOnBrowser("time", time.toString());
	if (continueFunction()) {
		setTimeout(() => {exec.run_sim(agentList, actionList, locationList, continueFunction)}, 10);
	} else {
		console.log("Finished.");
	}
}
