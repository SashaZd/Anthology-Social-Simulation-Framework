////////////////////////////////////////////////////////
/////////////// MOTIVES ////////////////////////////////
////////////////////////////////////////////////////////


// Five motive types
/**
 * Motive Type Enum
 * Currently has a preset list of 5 motives - physical, emotional, social, financial, accomplishment
 * In future, this will be pulled from the json file.
 */
export enum MotiveType {
	/**
	 * deals with the agent's physical needs - eg. eat or sleep
	 * @type {String}
	 */
	physical = "physical",
	/**
	 * deals with the agent's emotional needs - eg. happiness from watching a movie
	 * @type {String}
	 */
	emotional = "emotional",
	/**
	 * deals with the agent's social needs - eg. spending time with other agents
	 * @type {String}
	 */
	social = "social",
	/**
	 * deals with the agent's financial needs - eg. working for a living
	 * @type {String}
	 */
	financial = "financial",
	/**
	 * deals with the agent's sense of accomplishement - eg. skill learnt by doing a hobby
	 * @type {String}
	 */
	accomplishment = "accomplishment"
}


// export type MotiveType = "physical" | "emotional" | "social" | "financial" | "accomplishment";



// This is more of a need and less of a motive since it's a set of them all


/**
 * Motive Type Interface
 * Current has a preset list of 5 motives:
 * @type {Object.<string, number>}
 */
export type Motive = {
	/**
	 * deals with the agent's physical needs -
	 * eg. eating or sleeping
	 * @type {number}
	 */
	physical: number;
	/**
	 * deals with the agent's emotional needs
	 * eg. happiness from watching a movie
	 * @type {number}
	 */
	emotional: number;
	/**
	 * deals with the agent's social needs
	 * eg. spending time with other agents
	 * @type {number}
	 */
	social: number;
	/**
	 * deals with the agent's financial needs
	 * eg. working for a living
	 * @type {number}
	 */
	financial: number;
	/**
	 * deals with the agent's sense of accomplishement
	 * eg. skill learnt by doing a hobby
	 * @type {number}
	 */
	accomplishment: number;
	/**
	 * Maps the key string to the value associated
	 * @type {[type]}
	 */
	[key: string]: number;
}

// export type Motive = {
// 	[key in MotiveType]: number;
// }



//
/**
 * List of keys of the motive types we have which we can iterate through
 * @param {[type]} keys of the Enum MotiveType
 */
export const motiveTypes: string[] = Object.keys(MotiveType).filter(k => typeof MotiveType[k as keyof typeof MotiveType] === "string");


////////////////////////////////////////////////////////
/////////////// REQUIREMENTS ///////////////////////////
////////////////////////////////////////////////////////

//
/**
 * Binary Operations
 * Used primarily in requirements to test conditions
 * Eg. MotiveReq: social motive must be greater than 5
 * @type {"equals" | "gt" | "lt" | "geq" | "leq"}
 */
export type BinOp = "equals" | "gt" | "lt" | "geq" | "leq";


<<<<<<< HEAD
// Three types of requirements
// export type ReqType = "location" | "people" | "motive";
=======
// // Three types of requirements
// // export type ReqType = "location" | "people" | "motive";
>>>>>>> 506a6e0522e5a75b5f5711de1dd88afbcc32dbea

/**
 * Enum Requirement Type
 * Consists of three types of requirements
 * Unnecessary, to be removed
 */
export enum ReqType {
	/**
	 * Indicates that a Location requirement
	 * @type {String}
	 */
	location = "location",
	/**
	 * Indicates that a People requirement
	 * @type {String}
	 */
	people = "people",
  /**
	 * Indicates that a Relationship requirement
	 * @type {String}
	 */
	relationship = "relationship",
	/**
	 * Indicates that a Motive requirement
	 * @type {String}
	 */
	motive = "motive"
}


/**
 * Location Requirement
 * Requirements on the type of location the action takes place in.
 * Based on a tags system for locations.
 * eg: hasAllOf:['restaurant'] implies to execute the action, one must be at a restaurant
 * @type {Object.<string, string | string[]>}
 */
export type LocationReq = {
	/**
	 * Defines the type of this requirement to be a Location Requirement
	 */
	reqType: "location";
	/**
	 * array of string tags that must be present in the location for the action to occur
	 * @type {string[]}
	 */
	hasAllOf?: string[];
	/**
	 * array of string tags where at least one or more must be present in the location for the action to occur
	 * @type {string[]}
	 */
	hasOneOrMoreOf?: string[];
	/**
	 * array of string tags that should not be present in the location for the action to occur
	 * @type {string[]}
	 */
	hasNoneOf?: string[];
}

//
// eg: must be with a sepcific person

export type SocialReq = PeopleReq | RelationshipReq;


export type RelationshipReq = {

	/**
	 * Defines the type of this requirement to be a relatioship requirement
	 */
	reqType: "relationship",

	/**
	 * Relationships that must occur between the participating agents in order for action to be executed
	 * eg. [teacher, student] relationships for the action: "submit_homework"
	 * @type {string[]}
	 */
	relationshipsPresent?: string[],
	/**
	 * Relationships that must not occur between the participating agents in order for action to be executed
	 * eg. [siblings] relationship for the action: "kiss_romantically"
	 * @type {string[]}
	 */
	relationshipsAbsent?: string[]
}


/**
 * Agent Requirement
 * Requirements on who is or must be present for an action.
 * eg: minNumPeople:2 implies that at least 2 people must be present for this action to occur
 * @type {Object.<string, string | string[] | Agent[] | number>}
 */
export type PeopleReq = {
	/**
	 * Defines the type of this requirement to be a People Requirement
	 */
	reqType: "agent",
	/**
	 * Specifies the minimum number of people that must be present for this action to occur (including this agent)
	 * @type {number}
	 */
	minNumPeople?: number,
	/**
	 * Specifies the maximum number of people that must be present for this action to occur (including this agent)
	 * @type {number}
	 */
	maxNumPeople?: number,
	/**
	 * Array of agents that must be present for the action to be completed
	 * List agents using their names (comma separated)
	 * eg. A cook must be present at a restaurant for food to be served to a customer.
	 * @type {Agent[]}
	 */
	specificPeoplePresent?: string[],
	/**
	 * Array of agents that must be absent for the action to be completed
	 * List agents using their names (comma separated)
	 * @type {Agent[]}
	 */
	specificPeopleAbsent?: string[]
}


/**
 * Motive Requirement
 * Requirements on the executing agen't current motive scores.
 * eg: motive:"financial" > 2 implies the agent must must have at least 2 money units to execute the action
 * @type {Object.<string, string | MotiveType | BinOp | number>}
 */
export type MotiveReq = {
	/**
	 * Defines the type of this requirement to be a Motive Requirement
	 */
	reqType: "motive";
	/**
	 * Describes the type of motive that must be tested for this requirement
	 * Eg. Emotional, Social, Financial, etc.
	 * @type {MotiveType}
	 */
	motive: MotiveType;
	/**
	 * Binary Operation used to test condition
	 * @type {BinOp}
	 */
	op:     BinOp;
	/**
	 * Test for threshold value existing in a requirement
	 * @type {number}
	 */
	thresh: number;
}

/**
 * Requirement Type
 * Union type of Location Requirements, People Requirements or Motive Requirements
 * @type {LocationReq | PeopleReq | MotiveReq}
 */
export type Requirement = LocationReq | SocialReq | MotiveReq;


/**
 * Effect Type
 * Contains the delta change in the motive of an agent implementing the action.
 * One effect per motive type.
 * Eg. Sleep action may affect the physical motive
 * @type {motive:MotiveType, delta:number}
 */
export type Effect = {
	/**
	 * describes the motive affected by this effect.
	 * Eg. if an action affects the social motive of a character,
	 * then motive:MotiveType.social
	 * @type {MotiveType}
	 */
	motive: MotiveType,
	/**
	 * Valence of effect on motiveType
	 * Eg. Social may increase by 2 - delta:2 || motive may decrease by 5 - delta:-5
	 * @type {number}
	 */
	delta: number
}

/**
 * Target Type Enum
 * List of values that determine who the target effects of an action (if applicable),
 * are applied to.
 * This roughly mirrors the parameters of the people requirement
 */
export enum TargetType {
	/**
	 * all agents present when the action is started (ie at the action's associated
	 * location when the the agent begins to perform it) recieve the target effects
	 * This target type could be used for an agent making a public speech
	 * @type {String}
	 */
	all = "all",
  // /**
	//  * only agents who are present when the action is started (ie at the action's associated
	//  * location when the the agent begins to perform it), and who fit the relationshipsPresent
	//  * criteria of the people requirement recieve the target effects
	//  * This could be used for an action that applies to all of the agents friends
	//  * at a restaurant, but not the other patrons.
	//  * @type {String}
	//  */
	// relationship = "relationship",
  // /**
	//  * a single, random agent who is present when the action is started (ie at the action's associated
	//  * location when the the agent begins to perform it), and who fits the relationshipsPresent
	//  * criteria of the people requirement recieves the target effects
	//  * This could be used for an action that has one agent chat with a single friend
	//  * @type {String}
	//  */
	// relationshipSingle = "relationshipSingle",
  /**
	 * only agents who are present when the action is started (ie at the action's associated
	 * location when the the agent begins to perform it), and who fit the specificPeoplePresent
	 * criteria of the people requirement recieve the target effects.
	 * This is used for actions that only apply to a certain few people.
	 * @type {String}
	 */
	specific = "specific",
  /**
	 * a single, random agent who is present when the action is started (ie at the action's associated
	 * location when the the agent begins to perform it), and who fits the specificPeoplePresent
	 * criteria of the people requirement recieves the target effects
	 * This could be used for an action that has one agent chat with a single
	 * friend out of a few specific options
	 * @type {String}
	 */
	specificSingle = "specificSingle",
  /**
	 * a single, random agent who is present when the action is started (ie at the action's associated
	 * location when the the agent begins to perform it) recieves the target effects
	 * this can be used for an action such as asking a strnager for directions
	 * @type {String}
	 */
	randomPresent = "randomPresent"//,
  // /**
	//  * a single, random agent from anywhere in the simulation recieves the target effects
	//  * this can be used for an action that involves inviting an agent to do something (TENTATIVE)
	//  * @type {String}
	//  */
	// random = "random"
}

/**
 * Requirement Type
 * Union type of Location Requirements, People Requirements or Motive Requirements
 * @type {LocationReq | PeopleReq | MotiveReq}
 */
export type Action = PrimaryAction | ScheduleAction;

// General action type.
// Name, requiremnts, effects, and minimum time taken.
// eg: sleep
// Assumptions: 1 LocationReq, 1 People Req, MotiveReq[]

/**
 * Action or Behaviour to be executed by an NPC
 * @type {Object.<string, string | Requirement[] | Effect[] | number>}
 */
export type PrimaryAction = {
	/**
	 * Name of the action to be executed
	 * @type {string}
	 */
	name: 		  string;
	/**
	 * List of pre-conditions or requirements that must fullfilled for this action to be executed
	 * @type {Requirement[]}
	 */
	requirements: Requirement[];
	/**
	 * List of resulting changes to the motives of the agent that occur after an action is executed
	 * @type {Effect[]}
	 */
	effects:      Effect[];
	/**
	 * The minumum amount of time an action takes to be executed
	 * @type {number}
	 */
	time_min:     number;
  /**
	 * optional flag if this action cannot be selected by agents normally
	 * @type {boolean}
	 */
  	hidden?:    boolean;
}

// General action type.
// Name, requiremnts, effects, and minimum time taken.
// eg: sleep
// Assumptions: 1 LocationReq, 1 People Req, MotiveReq[]

/**
 * Action or Behaviour to be executed by an NPC
 * @type {Object.<string, string | Requirement[] | Effect[] | number>}
 */
export type ScheduleAction = {
	/**
	 * Name of the action to be executed
	 * @type {string}
	 */
	name: 		  string;
	/**
	 * List of pre-conditions or requirements that must fullfilled for this action to be executed
	 * @type {Requirement[]}
	 */
	requirements: Requirement[];
  /**
	 * The minumum amount of time an action takes to be executed
	 * @type {number}
	 */
	time_min:     number;
  /**
   * flag for whether the action is preformed immediately or scheduled for later
   * @type {boolean}
   */
  interrupt:    boolean;
  /**
   * primary action that will be performed by the instigator of this action
   * @type {PrimaryAction}
   */
  instigatorAction:      PrimaryAction;
  /**
   * primary action that will be performed by the target of this action
   * @type {PrimaryAction}
   */
	targetAction:      PrimaryAction;
  /**
	 * the method of choosing which agent(s) will be the target of this action
	 * NOTE: some target methods require the action to have a people requirement to function properly
	 * @type {TargetType}
	 */
  target:  TargetType;
  /**
	 * optional flag if this action cannot be selected by agents normally
	 * @type {boolean}
	 */
  hidden?:    boolean;
}
  /**
   * Action or Behaviour to be executed by an NPC
   * @type {Object.<string, string | Requirement[] | Effect[] | number>}
   */
  export type SerializableScheduleAction = {
  	/**
  	 * Name of the action to be executed
  	 * @type {string}
  	 */
  	name: 		  string;
  	/**
  	 * List of pre-conditions or requirements that must fullfilled for this action to be executed
  	 * @type {Requirement[]}
  	 */
  	requirements: Requirement[];
    /**
  	 * The minumum amount of time an action takes to be executed
  	 * @type {number}
  	 */
  	time_min:     number;
    /**
  	 * flag for whether the action is preformed immediately or scheduled for later
  	 * @type {boolean}
  	 */
    interrupt:    boolean;
    /**
  	 * placeholder for the action that will be performed by the instigator of this action
  	 * @type {string}
  	 */
    instigatorAction:      string;
    /**
  	 * placeholder for the action that will be performed by the target of this action
  	 * @type {string}
  	 */
  	targetAction:      string;
    /**
  	 * the method of choosing which agent(s) will be the target of this action
  	 * NOTE: some target methods require the action to have a people requirement to function properly
  	 * @type {TargetType}
  	 */
    target:  TargetType;
    /**
  	 * optional flag if this action cannot be selected by agents normally
  	 * @type {boolean}
  	 */
    hidden?:    boolean;
}


////////////////////////////////////////////////////////
/////////////// AGENTS /////////////////////////////////
////////////////////////////////////////////////////////

/**
 * Individual relationships held by an agent
 * An agent may have multiple relationships with the same person
 * Eg. Alice may have a 'sibling' and 'friend' relationship with Bob
 * @type {Object}
 */
export type Relationship = {
	/** @type {string} Type of the relationship. Eg. sibling, romantic, friend, etc */
	type: string;

	/** @type {string} Recipient of the relationship. Eg. Bob */
	with: string;

	/** @type {string} Optional valence or strength of the relationship. */
	valence?: number;
}



/**
 * Agent type
 * Describes the agent object or NPCs in the simulation
 * @type {Object}
 */
export type Agent = {
	/** @type {string} Name of the agent */
	name: string;

	/** @type {Motive} list of all the motive properties of this agent */
	motive: Motive;

	/** @type {SimLocation} Current location of the agent */
	currentLocation: SimLocation;

	/** @type {number} How long the agent will be occupied with the current action they are executing */
	occupiedCounter: number;

	/** @type {Action[]} A queue containing the next few actions being executed by the agent */
	currentAction: Action[];

	/**
	 * The destination that the agent is headed to
	 * Can be null if the agent has reached their previous destination and is executing an action at the location.
	 * @type {[type]}
	 */
	destination: SimLocation | null;

  /**
   * list of targets for the agent's current action
   * @type {Agent[]}
   */
  currentTargets: Agent[];
}


// JSON agent type: currentAction:string is converted to currentAction:Action by parser

/**
 * Agent type received from a JSON file
 * The action is provided as a string, and matched to the Agent.currentAction object accordingly
 * @type {Object}
 */
export type SerializableAgent = {

	/** @type {string} initialized to the name of the agent */
	name: string,

	/** @type {Motive} motives initialized with values for the agent */
	motive: Motive,

	/** @type {SimLocation} starting location initialized for the agent  */
	currentLocation: SimLocation,

	/** @type {number} describes whether the agent is currently occupied */
	occupiedCounter: number,
<<<<<<< HEAD
	/** @type {string[]} queue containing the next few actions being executed by the agent */
	currentAction: string[],
	/** @type {[type]} Location the agent is currently headed to */
	destination: SimLocation | null,
  /**
   * list of targets for the agent's current action
   * @type {Agent[]}
   */
  currentTargets: Agent[]
=======

	/** @type {string} name of the current action being executed by the agent */
	currentAction: string,

	/** @type {[type]} Location the agent is currently headed to */
	destination: SimLocation | null,
	/** @type {Relationship[]} The relationships this agent has */
	relationships: Relationship[];
>>>>>>> 506a6e0522e5a75b5f5711de1dd88afbcc32dbea
}


////////////////////////////////////////////////////////
/////////////// LOCATIONS ///////////////////////////
////////////////////////////////////////////////////////

//
// eg: a specific restaurant
// There should be a point Interface since some locations are not named.
// Locations can be an unnamed position, with just an associated x,y coordinate

/**
 * Locations in the simulation
 * Locations can be unamed and just comprise of a x-y coordinate
 * Locations can be named and/or have a list of tags eg. Restaurant
 * @type {Object}
 */
export type SimLocation = {
	/** @type {number} x-coordinate of the location */
	xPos: number;

	/** @type {number} y-coordinate of the location */
	yPos: number;

	/** @type {string[]} optional list of tags associated with the location. Eg. Restaurant could have ['food', 'delivery'] as tags */
	tags?: string[];

	/** @type {string} optional name of the location eg. Restaurant, Home, Movie Theatre, etc */
	name?: string;
}
