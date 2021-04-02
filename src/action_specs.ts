import { Motive } from "./agent";
import { BinOp } from "./agent";
import { ReqType } from "./agent";
import { MotiveReq } from "./agent";
import { PeopleReq } from "./agent";
import { LocationReq } from "./agent";
import { Requirement } from "./agent";
import { Effect } from "./agent";
import { Action } from "./agent";
import { Agent } from "./agent";

// DEFAULT ACTIONS - REQUIRED
// The following actions are required for the current structure of the execution execution_engine
//When modifying this file for more test scenarios, DO NOT CHANGE THESE action_specs

var actionsData = {
  "actions": [
    {
      name: "wait_action",
      requirements: [],
      effects: [],
      time_min: 0
    }
  ]
}





// The wait action is used when an agent has maximal motives
export var wait_action : Action =
{
  name: "wait_action",
  requirements: [],
  effects: [],
  time_min: 0
}

// The travel action is used when an agent is travelling to a location.
// The time is handdles by the execution engine
export var travel_action : Action =
{
  name: "travel_action",
  requirements: [],
  effects: [],
  time_min: 0
}
// END

// Fills physical, requires a restaurant location
// Discuss: replace type:0 with type:ReqType.location 
// Discuss: replace effect's motive:0 with Motive.physical
export var eat_action : Action =
{
  name: "eat_action",
  requirements: [{type:0, req:{hasAllOf:["restaurant"], hasOneOrMoreOf:[], hasNoneOf:[]}}],
  effects:      [{motive:0, delta:2}],
  time_min:     60
};

// Fills emotional, requires a movie theatre location
export var movie_action : Action =
{
  name: "movie_action",
  requirements: [{type:0, req:{hasAllOf:["movie theatre"], hasOneOrMoreOf:[], hasNoneOf:[]}}],
  effects:      [{motive:1, delta:3}],
  time_min:     120
};

// Fills physical and social, requires a restaurant location and an additional person
export var eat_friend_action : Action =
{
  name: "eat_friend_action",
  requirements: [{type:0, req:{hasAllOf:["restaurant"], hasOneOrMoreOf:[], hasNoneOf:[]}},
                {type:1, req:{minNumPeople:2, maxNumPeople:-1, specificPeoplePresent:[], specificPeopleAbsent:[], relationshipsPresent:[], relationshipsAbsent:[]}}],
  effects:      [{motive:0, delta:2}, {motive:2, delta:2}],
  time_min:     70
};

// Fills emotional and social, requires a movie theatre location and an additional person
export var movie_friend_action : Action =
{
  name: "movie_friend_action",
  requirements: [{type:0, req:{hasAllOf:["movie theatre"], hasOneOrMoreOf:[], hasNoneOf:[]}},
                {type:1, req:{minNumPeople:2, maxNumPeople:-1, specificPeoplePresent:[], specificPeopleAbsent:[], relationshipsPresent:[], relationshipsAbsent:[]}}],
  effects:      [{motive:1, delta:3}, {motive:2, delta:2}],
  time_min:     130
};

// Fills financial, requires a movie theatre location
export var work_action : Action =
{
  name: "work_action",
  requirements: [{type:0, req:{hasAllOf:["employment"], hasOneOrMoreOf:[], hasNoneOf:[]}}],
  effects:      [{motive:3, delta:1}],
  time_min:     240
};

// Fills accomplishment, requires a home location
export var hobby_action : Action =
{
  name: "hobby_action",
  requirements: [{type:0, req:{hasAllOf:["home"], hasOneOrMoreOf:[], hasNoneOf:[]}}],
  effects:      [{motive:4, delta:2}],
  time_min:     60
};

// List of available actions in sim
export var actionList: Action[] = [wait_action, travel_action, eat_action, movie_action, eat_friend_action, movie_friend_action, work_action, hobby_action];


