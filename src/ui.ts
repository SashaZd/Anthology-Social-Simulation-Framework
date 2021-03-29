import * as npc from "./agent";
import * as main from "./main";

var n:number = 8;
var board:string[][] = [];
for(var i:number=0; i<n; i++){
	board[i]=[];
	for(var j:number=0; j<n; j++){
		board[i][j] = "";
	}
}

function sleep(milliseconds:number) {
  var start:number = new Date().getTime();
  for (var i:number = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}



//Executed every turn
export function updateUI(agentList:npc.Agent[], locationList:npc.Location[], time:number){
  main.showOnBrowser("time", time.toString());
  sleep(10);
}
