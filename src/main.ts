import * as engine from "./execution_engine";
import * as action_manager from "./action_manager";
import * as npc from "./agent";
import * as utility from "./utilities";
import * as ui from "./ui";
import * as types from "./types";
import * as location_manager from "./location_manager";

// import * as json_data from "./data.json";
const json_data = require("./data.json");

export var locationList: types.SimLocation[] = location_manager.loadLocationsFromJSON(json_data['locations'])
export var actionList: types.Action[] = action_manager.loadActionsFromJSON(json_data['actions'])
export var agentList: types.Agent[] = utility.loadAgentsFromJSON(json_data["agents"]);


/**
 * Stopping condition for the simulation
 * Stops the sim when all agents are content
 * 
 * @returns {boolean} true if the simulation cna continue; false if the simulation can stop
 */
function condition():boolean {
	for (var agent of agentList){
		// If any agent is not content, continue running sim
		if(npc.isContent(agent)){
			console.log(agent.name, " IS content.")
		}

		if(!npc.isContent(agent)){
			// console.log(agent.name, " IS NOT content.")
			return true;
		}
	}
	// If all agents are content, stop running
	return false;
}


window.onload = () => {
  ui.updateUI(agentList, actionList, locationList, condition, 0, false);
	ui.changeValueOnBrowser("sleepMove", ui.sleepMove);
	ui.changeValueOnBrowser("sleepStill", ui.sleepStill);
	document.getElementById("sleepMove").addEventListener("input", ui.inputSleepMove);
	document.getElementById("sleepStill").addEventListener("input", ui.inputSleepStill);
	for (var agent of agentList){
		ui.addOption(agent.name);
	}
	document.getElementById("agent").addEventListener("change", ui.activeAgentChange);
}
