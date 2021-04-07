import * as types from "./types";
import {locationList} from "./main";
import * as utility from "./utilities";


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
	if (possible_locations.length > 0){
		return possible_locations[0]
	}
	else{
		// returns false if there is no listed action with this name
		console.log("getLocationByName => Couldn't find location with name: ", name);
	}
}



export function filterLocationsByRequirement(locationReq: types.LocationReq){
	var hasAllOf:types.SimLocation[] = locationList.filter((location: types.SimLocation) => utility.arrayIncludesAllOf(location.tags, locationReq.hasAllOf));
	// var hasOneOrMoreOf:types.SimLocation[] = locationList.filter((location: types.SimLocation) => utility.arrayIncludesAllOf(location.tags, locationReq.hasAllOf));
	// var hasNoneOf:types.SimLocation[] = locationList.filter((location: types.SimLocation) => utility.arrayIncludesAll(location.tags, locationReq.hasAllOf));
}






/*  returns the nearest location that satisfies the given requirement, or null.
		distance measured by manhattan distance
		locReq: a location requirement to satisfy
		locationList: a list of locations to check
		x & y: coordinate pair to determine distance against.
		return: the location in question or null */
export function getNearestLocation(locationReq:types.LocationReq, locationList:types.SimLocation[], x:number, y:number):types.SimLocation {
	var ret:types.SimLocation = null;
	var minDist:number = -1;
	var i:number = 0;

	for (var location of locationList){
	// for (i = 0; i<locationList.length; i++){
		var valid:boolean = true;
		var check1:boolean = true;
		var check2:boolean = false;
		var check3:boolean = true;
		// var j:number = 0;

		// utility.arrayIncludesAll(locationReq.hasAllOf, location.tags);

		// for (j = 0; j<locationReq.hasAllOf.length; j++){
		if (!(utility.arrayIncludesAllOf(location.tags, locationReq.hasAllOf))) {
			check1 = false;
		}
		// }
		
		// for (j = 0; j<locationReq.hasOneOrMoreOf.length; j++){
		if (utility.arrayIncludesAllOf(location.tags, locationReq.hasOneOrMoreOf)) {
			check2 = true;
		}
		// }
		if (locationReq.hasOneOrMoreOf.length == 0) {
			check2 = true;
		}

		
		// for (j = 0; j<locationReq.hasNoneOf.length; j++){
		if (utility.arrayIncludesAllOf(location.tags,locationReq.hasNoneOf)) {
			check3 = false;
		}
		// }
		if (locationReq.hasNoneOf.length == 0) {
			check3 = true;
		}
		if (!(check1 && check2 && check3)) {
			valid = false;
		}
		if (valid) {
			var travelDist: number = Math.abs(location.xPos - x) + Math.abs(location.yPos - y);
			if ((minDist > travelDist) || (minDist = -1)) {
				minDist = travelDist;
				ret = location;
			}
		}
	}
	return ret;
}