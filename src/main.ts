import * as engine from "./execution_engine";
import * as actions from "./action_specs";
import * as npc from "./agent";
import * as utility from "./utilities";

// import 'reflect-metadata';
// import 'es6-shim';



var agent_json = {
	"agents": [
		{
			name: "John Doe",
			motive: {
				physical: 1,
				emotional: 1,
				social: 1,
				financial: 1,
				accomplishment: 1,
			},
			currentLocation: {
				xPos: 0,
				yPos: 0
			},
			occupiedCounter: 0,
			currentAction: "wait_action", // actions.wait_action,
			destination: null
		},
		{
			name: "Jane Doe",
			motive: {
				physical: 4,
				emotional: 1,
				social: 4,
				financial: 1,
				accomplishment: 4,
			},
			currentLocation: {
				xPos: 5,
				yPos: 5
			},
			occupiedCounter: 0,
			currentAction: "wait_action", // actions.wait_action,
			destination: null
		}
	]
}


// var agent_json = {
// 	"agents": [
// 		{
// 			name: "Jane Doe",
// 			motive: {
// 				physical: 1,
// 				emotional: 1,
// 				social: 1,
// 				financial: 1,
// 				accomplishment: 1,
// 			},
// 			currentLocation: {
// 				xPos: 0,
// 				yPos: 0
// 			},
// 			occupiedCounter: 0,
// 			currentAction: "eat_action",
// 			destination: null
// 		},
// 		{
// 			name: "Tripti Samal",
// 			motive: {
// 				physical: 1,
// 				emotional: 1,
// 				social: 1,
// 				financial: 1,
// 				accomplishment: 1,
// 			},
// 			currentLocation: {
// 				xPos: 0,
// 				yPos: 0
// 			},
// 			occupiedCounter: 0,
// 			currentAction: "eat_action",
// 			destination: null
// 		}
// 	]
// }

var agentList: npc.Agent[] = [];

for (var parseAgent of agent_json['agents']){
	var possible_action = utility.getActionByName(parseAgent.currentAction)
	if (possible_action){
		var agent : Agent = {
			name: parseAgent.name,
			motive: parseAgent.motive,
			occupiedCounter: parseAgent.occupiedCounter,
			currentAction: possible_actions,
			destination: parseAgent.destination,
			currentLocation: parseAgent.currentLocation
		}
		agentList.push(agent);
	}
	
}


// var agent1:npc.Agent =
// {
//   name: "John Doe",
//   motive: {
//     physical: 1,
//     emotional: 1,
//     social: 1,
//     financial: 1,
//     accomplishment: 1,
//   },
//   xPos: 0,
//   yPos: 0,
//   occupiedCounter: 0,
//   currentAction: actions.wait_action,
//   destination: null
// };

// agents
// var agent2:npc.Agent =
// {
//   name: "Jane Doe",
//   motive: {
//     physical: 4,
//     emotional: 1,
//     social: 4,
//     financial: 1,
//     accomplishment: 4,
//   },
//   xPos: 5,
//   yPos: 5,
//   occupiedCounter: 0,
//   currentAction: actions.wait_action,
//   destination: null
// };



// Uncomment post this


// List of agents in sim
// var agentList:npc.Agent[] = [agent1, agent2];

// Locations
// Locations are a position, a name, and a list of tags
var restaurant:npc.Location = {name: "restaurant", xPos: 5, yPos: 5, tags: ["restaurant", "employment"]}

var movie_theatre:npc.Location = {name: "movie theatre", xPos: 0, yPos: 5, tags: ["movie theatre", "employment"]}

var home:npc.Location = {name: "home", xPos: 5, yPos: 0, tags: ["home"]}

//location List
var locationList:npc.Location[] = [restaurant, movie_theatre, home];

// condition function.
// Stops the sim when all agents are at full meters
function condition():boolean {
	var check:boolean = false;
	var i:number = 0;
	// check the meter levels for each agent in the sim
	for (i = 0; i< agentList.length; i++) {
		if (agentList[i].motive.physical < engine.MAX_METER) {
			check = true;
			break;
		}
		if (agentList[i].motive.emotional < engine.MAX_METER) {
			check = true;
			break;
		}
		if (agentList[i].motive.social < engine.MAX_METER) {
			check = true;
			break;
		}
		if (agentList[i].motive.financial < engine.MAX_METER) {
			check = true;
			break;
		}
		if (agentList[i].motive.accomplishment < engine.MAX_METER) {
			check = true;
			break;
		}
	}
	return check;
}

engine.run_sim(agentList, actions.actionList, locationList, condition);

// Displays text on the browser? I assume
function showOnBrowser(divName: string, name: string) {
	const elt = document.getElementById(divName);
	elt.innerText = name + "Hello World!";
}

showOnBrowser("greeting", "TypeScript");
