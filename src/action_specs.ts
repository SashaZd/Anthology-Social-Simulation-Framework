import { Motive } from "./execution_engine";
import { BinOp } from "./execution_engine";
import { ReqType } from "./execution_engine";
import { Thresh } from "./execution_engine";
import { Requirement } from "./execution_engine";
import { Effect } from "./execution_engine";
import { Action } from "./execution_engine";
import { Agent } from "./execution_engine";

export var eat_action : Action =
{
  name: "eat_action",
  requirements: [{type:0, op:0, value:"restaurant"}],
  effects:      [{motive:0, delta:2}],
  time_min:     60
};

export var movie_action : Action =
{
  name: "movie_action",
  requirements: [{type:0, op:0, value:"moive theatre"}],
  effects:      [{motive:1, delta:3}],
  time_min:     120
};

export var eat_friend_action : Action =
{
  name: "eat_friend_action",
  requirements: [{type:0, op:0, value:"restaurant"}, {type:1, op:3, value:1}],
  effects:      [{motive:0, delta:2}, {motive:2, delta:2}],
  time_min:     70
};

export var movie_friend_action : Action =
{
  name: "movie_friend_action",
  requirements: [{type:0, op:0, value:"moive theatre"}, {type:1, op:3, value:1}],
  effects:      [{motive:1, delta:3}, {motive:2, delta:2}],
  time_min:     130
};

export var work_action : Action =
{
  name: "work_action",
  requirements: [{type:0, op:0, value:"moive theatre"}],
  effects:      [{motive:3, delta:1}],
  time_min:     240
};

export var hobby_action : Action =
{
  name: "hobby_action",
  requirements: [{type:0, op:0, value:"home"}],
  effects:      [{motive:4, delta:2}],
  time_min:     60
};
