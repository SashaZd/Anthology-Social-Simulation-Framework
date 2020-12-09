import * as engine from "./execution_engine";
import * as actions from "./action_specs";

var action_list:engine.Action[] = [actions.eat_action, actions.movie_action, actions.eat_friend_action, actions.movie_friend_action, actions.work_action, actions.hobby_action];

var a1:engine.Agent =
{
  name: "John Doe",
  physical: 1,
  emotional: 1,
  social: 1,
  financial: 1,
  accomplishment: 1
};

var agent_list:engine.Agent[] = [a1];

function condition():boolean {
  var check:boolean = false;
  var i:number = 0;
  for (i = 0; i< agent_list.length; i++) {
    if (agent_list[i].physical < 5) {
      check = true;
      break;
    }
    if (agent_list[i].emotional < 5) {
      check = true;
      break;
    }
    if (agent_list[i].social < 5) {
      check = true;
      break;
    }
    if (agent_list[i].financial < 5) {
      check = true;
      break;
    }
    if (agent_list[i].accomplishment < 5) {
      check = true;
      break;
    }
  }
  return check;
}

engine.run_sim(agent_list, action_list, condition);

function showOnBrowser(divName: string, name: string) {
  const elt = document.getElementById(divName);
  elt.innerText = name + "Hello World!";
}

showOnBrowser("greeting", "TypeScript");
