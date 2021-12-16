import * as types from "./types";
import * as utility from "./utilities";
import * as world from "./world";


/**
 * Returns the list of agents at a particular location at any instant
 *
 * @param  {types.SimLocation} location location to checking
 * @param  {types.Agent[]}     exclude  any agents to exclude
 * @returns {types.Agent[]}              array of agents present at the location
 */
export function getPeopleAtLocation(location:types.SimLocation, exclude?: types.Agent[]):types.Agent[] {
	if(!exclude)
		exclude = [];

	var available_agents:types.Agent[] = world.agentList.filter(agent => !exclude.includes(agent) && isAgentAtLocation(agent, location));

	return available_agents

}


/**
 * Checks if a specific agent is at a specific location
 * @param  {types.Agent}       agent    agent we are checking for
 * @param  {types.SimLocation} location location we are testing
 * @returns {boolean}                    true if the agent is at the location; false if not
 */
export function isAgentAtLocation(agent:types.Agent, location:types.SimLocation):boolean {
	if(location == null){
		return true
	}
	else if(agent.currentLocation.xPos == location.xPos && agent.currentLocation.yPos == location.yPos){
		return true;
	}
	return false;
}



/**
 * Filter given array of locations to find those locations that satisfy conditions specified in a location requirement
 * Returns a list of locations that match the hasAllOf, hasOneOrMoreOf, and hasNoneOf constraints
 * returns all the locations that satisfies the given requirement, or [] if none match.
 *
 * @param  {types.SimLocation[]} locations   list of locations to filter and test
 * @param  {types.LocationReq}   locationReq location requirement or condition to satisfy
 * @returns {types.SimLocation[]}             list of locations that meet the requirement; or [] if none match
 */
export function locationsSatisfyingLocationRequirement(locations:types.SimLocation[], locationReq: types.LocationReq): types.SimLocation[]{
	var hasAllOf:types.SimLocation[] = []
	var hasOneOrMoreOf:types.SimLocation[] = []
	var hasNoneOf:types.SimLocation[] = []

	hasAllOf = locations.filter((location: types.SimLocation) => utility.arrayIncludesAllOf(location.tags, locationReq.hasAllOf));

	if(hasAllOf.length > 0)
		hasOneOrMoreOf = hasAllOf.filter((location: types.SimLocation) => utility.arrayIncludesSomeOf(location.tags, locationReq.hasOneOrMoreOf));

	if(hasOneOrMoreOf.length > 0)
		hasNoneOf = hasOneOrMoreOf.filter((location: types.SimLocation) => utility.arrayIncludesNoneOf(location.tags, locationReq.hasNoneOf));

	return hasNoneOf;
}

/**
 * Checks if a given location meets the location requirements
 * @param  {types.SimLocation} location    Location to check
 * @param  {types.LocationReq} locationReq Location Requirement to test against
 * @returns {boolean}                       True if the location satisfies the location requirements; False if it doesn't
 */
export function doesLocationSatisfyLocationRequirement(location:types.SimLocation, locationReq:types.LocationReq): boolean {

	location = getListedLocationFromCoords(location);
	let possibleLocs:types.SimLocation[] = locationsSatisfyingLocationRequirement([location], locationReq)
	if (possibleLocs.length > 0 && location == possibleLocs[0]){
		return true
	}
	return false
}


export function getListedLocationFromCoords(location:types.SimLocation): types.SimLocation{
	if(location.tags == undefined){
		// Check if there's a named location that actually exists
		let possible_locations:types.SimLocation[] = world.locationList.filter((test: types.SimLocation) => location.xPos==test.xPos && location.yPos==test.yPos);
		if (possible_locations.length > 0){
			return possible_locations[0];
		}

		location.tags = [];
		return location;
	}
	return location;
}


/**
 * From a list of locations, return the one closest to another SimLocation. If two locations are equidistant, return one of them randomly
 *
 * @param  {types.SimLocation[]} locations list of locations to filter through
 * @param  {types.SimLocation}   other     a SimLocation to compare with for distance
 * @returns {types.SimLocation}             one of the locations closest to the other location.
 */
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


/**
 * Sort a list of locations based on their distance from another SimLocation
 *
 * @param  {types.SimLocation[]} locations list of locations to be sorted
 * @param  {types.SimLocation}   other     another SimLocation for comparison and measure of distance
 * @returns {types.SimLocation[]}           the sorted list of SimLocations
 */
// export function getLocationsSortedByDistanceFromOther(locations:types.SimLocation[], other:types.SimLocation): types.SimLocation[]{
// 	return locations.sort(function(a, b){
// 		let aDiff = getManhattanDistance(other, a);
//         let bDiff = getManhattanDistance(other, b);
//         return aDiff - bDiff;
// 	})
// }


/**
 * Calculates and returns the Manhattan distance between any two locations
 *
 * @param  {types.SimLocation} loc1 Location 1 to be tested
 * @param  {types.SimLocation} loc2 Loction 2 to be tested
 *
 * @returns {number}                 Manhattan distance between the two tested locations
 *
 */
export function getManhattanDistance(loc1:types.SimLocation, loc2:types.SimLocation): number{
	return Math.abs(loc1.xPos - loc2.xPos) + Math.abs(loc1.yPos - loc2.yPos);
}


/**
 * Check if locations satisfy the people requirement
 * Currently people requirement is tested by checking if the apt. agents are present at the location at the specific time
 * No check for calendar events/invitations for future events
 *
 * @param  {types.Agent}         agent              agent for which this requirement must be satisfied
 * @param  {types.SimLocation[]} locations          list of locations to test
 * @param  {types.PeopleReq}     people_requirement people requirement whose preconditions must be satisfied
 *
 * @returns {types.SimLocation[]}                    list of locations that satisfy this people requirement
 */
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


/**
 * Check if the agent's current location satisfies a given people requirement
 * @param  {types.Agent}     agent              Agent to be tested
 * @param  {types.PeopleReq} people_requirement People Requirement to be tested against
 * @returns {boolean}                            True if the people requirement is satisfied at the current location; False if not
 */
export function doesAgentCurrentLocationSatisfyPeopleRequirement(agent: types.Agent, people_requirement:types.PeopleReq): boolean{

	let location:types.SimLocation[] = [getListedLocationFromCoords(agent.currentLocation)];
	let possible_locations:types.SimLocation[] = locationsSatisfyingPeopleRequirement(agent, location, people_requirement);

	if(possible_locations.length>0 && agent.currentLocation==possible_locations[0]){
		return true;
	}
	return false;
}


/**
 * Starts travel to the agent's current destination
 *
 * @param {types.Agent} agent - agent starting travel action
 * @param {types.SimLocation} destination - destination being travelled to
 * @param {number} time - time of execution for logs
 */
export function startTravelToLocation(agent: types.Agent, destination: types.SimLocation, time: number): void {
	agent.destination = destination;
	agent.occupiedCounter = getManhattanDistance(agent.currentLocation, destination);
	utility.log("time: " + time.toString() + " | " + agent.name + ": Started " + agent.currentAction[0].name + "; Destination: " + destination.name);
}


// *
//  * Return the number of agents at a current location
//  * @param  {types.SimLocation} location a specified location to check
//  * @returns {number}                    The number of agents at the specific location

// export function numberOfAgentsAtLocation(location:types.SimLocation): number{
// 	return world.agentList.filter(agent => isAgentAtLocation(agent, location)).length;
// }


// /**
//  * Filters through available SimLocations by name, and returns the matching location
//  * @param  {string}            name - name of the location being searched for
//  * @returns {types.SimLocation}      - first location matched by name
//  */
// export function getLocationByName(name: string): types.SimLocation{
// 	let possible_locations = locationList.filter((location: types.SimLocation) => location.name === name);

// 	// if theres an action with this name, return the first one
// 	if (possible_locations.length > 0)
// 		return possible_locations[0]

// 	// returns false if there is no listed action with this name
// 	utility.log("getLocationByName => Couldn't find location with name: ", name);	
// 	return null
// }
