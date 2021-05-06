import * as action_manager from "./action_manager";
import * as agent_manager from "./agent";
import * as location_manager from "./location_manager";
import * as ui from "./ui";


// import * as json_data from "./data.json";
const json_data = require("./data.json");

action_manager.loadActionsFromJSON(json_data['actions']);
location_manager.loadLocationsFromJSON(json_data['locations']);
agent_manager.loadAgentsFromJSON(json_data["agents"]);


/**
 * Stopping condition for the simulation
 * Stops the sim when all agents are content
 * 
 * @returns {boolean} true if the simulation cna continue; false if the simulation can stop
 */
function condition():boolean {
	for (var agent of agent_manager.agentList){
		// If any agent is not content, continue running sim
		if(agent_manager.isContent(agent)){
			console.log(agent.name, " IS content.")
		}

		if(!agent_manager.isContent(agent)){
			// console.log(agent.name, " IS NOT content.")
			return true;
		}
	}
	// If all agents are content, stop running
	return false;
}


window.onload = () => {
  ui.updateUI(agent_manager.agentList, action_manager.actionList, location_manager.locationList, condition, 0, false);
	ui.changeValueOnBrowser("sleepMove", ui.sleepMove);
	ui.changeValueOnBrowser("sleepStill", ui.sleepStill);
	document.getElementById("sleepMove").addEventListener("input", ui.inputSleepMove);
	document.getElementById("sleepStill").addEventListener("input", ui.inputSleepStill);
	for (var agent of agent_manager.agentList){
		ui.addOption(agent.name);
	}
	document.getElementById("agent").addEventListener("change", ui.activeAgentChange);
}
