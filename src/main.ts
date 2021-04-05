import * as engine from "./execution_engine";
import * as actions from "./action_specs";
import * as npc from "./agent";
import * as utility from "./utilities";

// import * as json_data from "./data.json";
const json_data = require("./data.json");
export var locationList: npc.Location[] = utility.loadLocationsFromJSON(json_data['locations'])
export var actionList: npc.Action[] = utility.loadActionsFromJSON(json_data['actions'])
export var agentList: npc.Agent[] = utility.loadAgentsFromJSON(json_data["agents"]);

console.log("Testing getRequirementByType: ", utility.getRequirementByType(utility.getActionByName("eat_friend_action").requirements, npc.ReqType.location));

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


engine.run_sim(agentList, actionList, locationList, condition);

// Displays text on the browser? I assume
function showOnBrowser(divName: string, name: string) {
	const elt = document.getElementById(divName);
	elt.innerText = name + "Hello World!";
}

showOnBrowser("greeting", "TypeScript");
