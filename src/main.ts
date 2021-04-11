import * as engine from "./execution_engine";
import * as actions from "./action_specs";
import * as npc from "./agent";
import * as utility from "./utilities";
import * as ui from "./ui";

// import * as json_data from "./data.json";
const json_data = require("./data.json");
export var locationList: npc.Location[] = utility.loadLocationsFromJSON(json_data['locations'])
export var actionList: npc.Action[] = utility.loadActionsFromJSON(json_data['actions'])
export var agentList: npc.Agent[] = utility.loadAgentsFromJSON(json_data["agents"]);

// Stopping condition for Simulation function.
// Stops the sim when all agents are content
function condition():boolean {
	for (var agent of agentList){
		// If any agent is not content, continue running sim
		if(!npc.isContent(agent)){
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
