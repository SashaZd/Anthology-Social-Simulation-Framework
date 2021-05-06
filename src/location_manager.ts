import * as types from "./types";
import * as utility from "./utilities";
import * as action_manager from "./action_manager"
import * as agent_manager from "./agent"

/** @type {types.SimLocation[]} List of locations used internally within the simulation */
export var locationList: types.SimLocation[] = [];


/**
 * Loads locations provided in the JSON object 
 * These locations will be availble in the global locationList during the simulation run 
 * 
 * @param  {types.SimLocation[]} locations_json locations JSON Object
 * @returns {void} sets an internal array of locations available within the simulation of type types.SimLocation[]
 */
export function loadLocationsFromJSON(locations_json:types.SimLocation[]): void{
	let locations: types.SimLocation[] = [];

	for (let parse_location of locations_json) {
		let location:types.SimLocation = Object.assign({}, parse_location);
		locations.push(location);
	}
	console.log("locations: ", locations);
	locationList = locations;
}


/**
 * Filters through available SimLocations by name, and returns the matching location 
 * @param  {string}            name - name of the location being searched for 
 * @returns {types.SimLocation}      - first location matched by name
 */
export function getLocationByName(name: string): types.SimLocation{
	let possible_locations = locationList.filter((location: types.SimLocation) => location.name === name);

	// if theres an action with this name, return the first one
	if (possible_locations.length > 0)
		return possible_locations[0]

	// returns false if there is no listed action with this name
	console.log("getLocationByName => Couldn't find location with name: ", name);	
	return null
}


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

	var available_agents:types.Agent[] = agent_manager.agentList.filter(agent => !exclude.includes(agent) && isAgentAtLocation(agent, location));
	
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
export function getLocationsSortedByDistanceFromOther(locations:types.SimLocation[], other:types.SimLocation): types.SimLocation[]{
	return locations.sort(function(a, b){
		let aDiff = getManhattanDistance(other, a);
        let bDiff = getManhattanDistance(other, b);
        return aDiff - bDiff;
	})
}


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
 * Move an agent closer to another destination. 
 *
 * @remarks 
 * Uses the manhattan distance to move the agent. So either increments the x axis or the y axis during any time tick.
 * 
 * @param {types.Agent} agent agent that must be moved 
 */
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


/**
 * Return the number of agents at a current location 
 * @param  {types.SimLocation} location a specified location to check
 * @returns {number}                    The number of agents at the specific location
 */
export function numberOfAgentsAtLocation(location:types.SimLocation): number{
	return agent_manager.agentList.filter(agent => isAgentAtLocation(agent, location)).length;
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
 * Starts travel to the agent's current destination 
 * 
 * @param {types.Agent} agent - agent starting travel action 
 * @param {types.SimLocation} destination - destination being travelled to 
 * @param {number} time - time of execution for logs
 */
export function startTravelToLocation(agent: types.Agent, destination: types.SimLocation, time: number): void {
	agent.destination = destination;
	agent.currentAction = action_manager.getActionByName("travel_action");
	agent.occupiedCounter = getManhattanDistance(agent.currentLocation, destination);
	console.log("time: " + time.toString() + " | " + agent.name + ": Started " + agent.currentAction.name + "; Destination: " + destination.name);
}