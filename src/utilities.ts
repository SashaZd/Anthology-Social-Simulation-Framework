// Utilties File
export const MAX_METER:number = 5;
export const MIN_METER:number = 1;

/**
 * Clamps the value between a known minmum and maximum
 *
 * @example Example of this method
 *
 * ```
 * // Returns 5
 * console.log(clamp(6, 5, 0);
 * ```
 *
 * @param  {number} test Value to test
 * @param  {number} max  Maximum value allowed
 * @param  {number} min  Minimum value allowed
 * @returns {number}      Value returned within min-max bounds
 */
export function clamp(test:number, max:number, min:number):number {
	if (test > max) {
		return max;
	} else if (test < min) {
		return min;
	} else {
		return test;
	}
}

/*  Randomize array in-place using Durstenfeld shuffle algorithm
		https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
		*/

// /**
//  * Shuffle an array of objects
//  * @param {any[]} array array of type any to be shuffled
//  */
// export function shuffleArray(array:any[]):void {
// 	for (let i:number = array.length - 1; i > 0; i--) {
// 		let j = Math.floor(Math.random() * (i + 1));
// 		let temp:any = array[i];
// 		array[i] = array[j];
// 		array[j] = temp;
// 	}
// }



/**
 * Test if a given array includes all the items in another array
 *
 * @example Example of this method
 *
 * ```
 * // Returns false
 * console.log(arrayIncludesAllOf([1,2,3], [2,3,4,5]));
 * ```
 *
 * ```
 * // Returns true
 * console.log(arrayIncludesAllOf([1,2,3], [1,2]));
 * ```
 *
 * {@link TSDoc | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every}
 * @param  {any[]}   arr   Array to be tested
 * @param  {any[]}   search Array to be tested against
 * @return {boolean}       True if array contains all the elements of search; Else false
 */
export function arrayIncludesAllOf(arr:any[], search:any[]): boolean{
	return search.every(v => arr.includes(v));
}

/**
 * Test that the array includes none of the search array
 *
 * @example Example of this method
 *
 * ```
 * // Returns false
 * console.log(arrayIncludesNoneOf([1,2,3], [2,3,4,5]));
 * ```
 *
 * ```
 * // Returns true
 * console.log(arrayIncludesNoneOf([1,2,3], [4,5,6]));
 * ```
 *
 * @param  {any[]}   arr   Array to be tested
 * @param  {any[]}   search Array to be tested against
 * @return {boolean}       True if array contains none the elements of search; Else false
 */
export function arrayIncludesNoneOf(arr:any[], search:any[]): boolean{
	return search.every(v => !arr.includes(v));
}

// console.log("Test: arrayIncludesNoneOf: ", arrayIncludesNoneOf([1,2,3,4],[3]), arrayIncludesNoneOf([1,2,3,4],[5,6,2]), arrayIncludesNoneOf([1,2,3,4],[5]), arrayIncludesNoneOf([1,2,3,4],[]))


/**
 * Tests that the array includes at least some of (eg. one or more of) the elements in the search array
 *
 * @example Example of this method
 *
 * ```
 * // Returns true
 * console.log(arrayIncludesSomeOf([1,2,3], [2,3,4,5]));
 * ```
 *
 * ```
 * // Returns false
 * console.log(arrayIncludesSomeOf([1,2,3], [4,5,6]));
 * ```
 *
 * {@link TSDoc | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some}
 * @param  {any[]}   arr   Array to be tested
 * @param  {any[]}   other Array to be tested against
 * @return {boolean}       True if the array contains some elements of the search array; Else false
 */
export function arrayIncludesSomeOf(arr:any[], other:any[]): boolean{
	if(other.length == 0)
		return true
	return other.some(v => arr.includes(v));
}

// /**
//  * Tests if the array includes the searchItem (ie. for membership in a list)
//  * @example Example of this method
//  *
//  * ```
//  * // Returns true
//  * console.log(arrayIncludesItem([1,2,3], 3));
//  * ```
//  *
//  * ```
//  * // Returns false
//  * console.log(arrayIncludesItem([1,2,3], 6));
//  * ```
//  * {@link TSDoc | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes}
//  * @param  {any[]}   arr  Array to be tested
//  * @param  {any}     item Item searched for
//  * @return {boolean}      True if array includes the item; Else false
//  */
// export function arrayIncludesItem(arr:any[], item:any):boolean {
// 	return arr.includes(item)
// }


// /**
//  * Finds the intersection between two arrays
//  *
//  * @example Example of this method
//  *
//  * ```
//  * // Returns [2,3]:
//  * console.log(arrayIntersectionWithOther([1,2,3], [2,3,4,5]));
//  * ```
//  *
//  * ```
//  * // Returns []:
//  * console.log(arrayIntersectionWithOther([1,2,3], [4,5,6]));
//  * ```
//  *
//  * @param  {any[]} arr   First array
//  * @param  {any[]} other Second array
//  * @return {any[]}       Intersected elements
//  */
// export function arrayIntersectionWithOther(arr:any[], other:any[]): any[]{
// 	return arr.filter(item => other.includes(item));
// }

// /**
//  * adds all objects from array old to array target
//  * @param  {any[]}  old   The array to add
//  * @param  {any[]} target The array to be added to
//  */
// export function arrayAddAll(old:any[], target:any[]):void {
//   for (let obj of old) {
//     target.push(obj);
//   }
// }

export function withProbability(geq:number):boolean {
	var chance = Math.random();
    if (chance >= geq){
        return true;
    }
    return false;
}


/**
 * [getRandomInt description]
 * @param  {number} min   minimum return value (inclusive)
 * @param  {number} max   maximum return value (exclusive)
 * @return {number}       resulting integer
 */
export function getRandomInt(min:number, max:number):number {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

var logList:string[] = [];
var bufferedLog:boolean = false;

export function log(item:string):void {
		logList.push(item);
		if (!bufferedLog) {
			console.log(item);
		}
}

export function print():void {
	if (bufferedLog) {
		for (var item of logList) {
			console.log(item);
		}
	}
}
