import * as types from "./types";
import {locationList, agentList} from "./main";
import * as utility from "./utilities";
import * as action_manager from "./action_manager"


export function loadLocationsFromJSON(locations_json:types.SimLocation[]): types.SimLocation[]{
	let locations: types.SimLocation[] = [];

	for (let parse_location of locations_json) {
		let location:types.SimLocation = Object.assign({}, parse_location);
		locations.push(location);
	}
	console.log("locations: ", locations);
	return locations;
}


export function getLocationByName(name: string): types.SimLocation{
	let possible_locations = locationList.filter((location: types.SimLocation) => location.name === name);

	// if theres an action with this name, return the first one
	if (possible_locations.length > 0)
		return possible_locations[0]

	// returns false if there is no listed action with this name
	console.log("getLocationByName => Couldn't find location with name: ", name);	
	return null
}

export function getPeopleAtLocation(location:types.SimLocation, exclude?: types.Agent[]):types.Agent[] {
	if(!exclude)
		exclude = [];

	var available_agents:types.Agent[] = agentList.filter(agent => !exclude.includes(agent) && isAgentAtLocation(agent, location));
	
	return available_agents
	
}

export function isAgentAtLocation(agent:types.Agent, location:types.SimLocation):boolean {
	if(location == null){
		return true 
	}
	else if(agent.currentLocation.xPos == location.xPos && agent.currentLocation.yPos == location.yPos){
		return true;
	}
	return false;
}


// Filters locations by the LocationReq
// Returns a list of locations that match the hasAllOf, hasOneOrMoreOf, and hasNoneOf constraints
/*  returns the nearest location that satisfies the given requirement, or [] if none match. 
	The distance measured by manhattan distance
		locationReq: a location requirement to satisfy
		return: the locations that match this requirement or [] sorted by distance from agent
*/
export function locationsSatisfyingLocationRequirement(agent:types.Agent, locations:types.SimLocation[], locationReq: types.LocationReq): types.SimLocation[]{
	var hasAllOf:types.SimLocation[] = []
	var hasOneOrMoreOf:types.SimLocation[] = []
	var hasNoneOf:types.SimLocation[] = []

	hasAllOf = locationList.filter((location: types.SimLocation) => utility.arrayIncludesAllOf(location.tags, locationReq.hasAllOf));

	if(hasAllOf.length > 0)
		hasOneOrMoreOf = hasAllOf.filter((location: types.SimLocation) => utility.arrayIncludesSomeOf(location.tags, locationReq.hasOneOrMoreOf));	

	if(hasOneOrMoreOf.length > 0)
		hasNoneOf = hasOneOrMoreOf.filter((location: types.SimLocation) => utility.arrayIncludesNoneOf(location.tags, locationReq.hasNoneOf));

	return getLocationsSortedByDistanceFromOther(hasNoneOf, agent.currentLocation);
}


// Returns the closest SimLocation from any other SimLocation
// If two points are equidistance, return one of them randomly. 
export function getNearestLocationFromOther(locations:types.SimLocation[], other:types.SimLocation): types.SimLocation {
	let closest:types.SimLocation = locations.reduce((a, b) => {
		let aDiff = getManhattanDistance(other,a);
        let bDiff = getManhattanDistance(other, b);

        // Check if the points are equidistant, if so, return one at random 
        if (aDiff == bDiff)
        	return Math.random() < 0.5 ? a : b;
	    
	    // else return whichever is closer 
	    return  aDiff < bDiff ? a : b;
	});
	return closest;
}

export function getLocationsSortedByDistanceFromOther(locations:types.SimLocation[], other:types.SimLocation): types.SimLocation[]{
	return locations.sort(function(a, b){
		let aDiff = getManhattanDistance(other, a);
        let bDiff = getManhattanDistance(other, b);
        return aDiff - bDiff;
	})
}


export function getManhattanDistance(loc1:types.SimLocation, loc2:types.SimLocation): number{
	return Math.abs(loc1.xPos - loc2.xPos) + Math.abs(loc1.yPos - loc2.yPos);
}

export function moveAgentCloserToDestination(agent: types.Agent) {
	if (agent.destination != null) {
		// var dest:types.SimLocation = agent.destination;
		if (agent.currentLocation.xPos != agent.destination.xPos)
			agent.currentLocation.xPos > agent.destination.xPos? agent.currentLocation.xPos -= 1: agent.currentLocation.xPos += 1;
		
		else if (agent.currentLocation.yPos != agent.destination.yPos) {
			agent.currentLocation.yPos > agent.destination.yPos? agent.currentLocation.yPos -= 1: agent.currentLocation.yPos += 1;
		}
	}
}


export function numberOfAgentsAtLocation(location:types.SimLocation): number{
	return agentList.filter(agent => isAgentAtLocation(agent, location)).length;
}


// Currently people requirement is tested by checking if the apt. agents are present at the location 
export function locationsSatisfyingPeopleRequirement(agent:types.Agent, locations:types.SimLocation[], people_requirement:types.PeopleReq): types.SimLocation[] {
	var _locations: types.SimLocation[] = locations;

	// Filtering for minNumPeople
	if(_locations.length > 0 && people_requirement.minNumPeople > 1){
		_locations = _locations.filter((location: types.SimLocation) => getPeopleAtLocation(location, [agent]).length > people_requirement.minNumPeople-1);
	}
	
	// Filtering for maxNumPeople
	if(_locations.length > 0 && people_requirement.maxNumPeople > 1){
		_locations = _locations.filter((location: types.SimLocation) => getPeopleAtLocation(location, [agent]).length < people_requirement.maxNumPeople-1);
	}

	// Filtering for specificPeoplePresent
	if(_locations.length > 0 && people_requirement.specificPeoplePresent.length > 0){
		_locations = _locations.filter((location: types.SimLocation) => utility.arrayIncludesAllOf(getPeopleAtLocation(location), people_requirement.specificPeoplePresent));
	}

	// Filtering for specificPeopleAbsent
	if(_locations.length > 0 && people_requirement.specificPeopleAbsent.length > 0){
		_locations = _locations.filter((location: types.SimLocation) => utility.arrayIncludesNoneOf(getPeopleAtLocation(location), people_requirement.specificPeoplePresent));
	}

	// Todo: relationshipsPresent
	if(_locations.length > 0 && people_requirement.relationshipsPresent.length > 0){

	}

	// Todo: relationshipsAbsent
	if(_locations.length > 0 && people_requirement.relationshipsAbsent.length > 0){
		
	}

	return _locations

}