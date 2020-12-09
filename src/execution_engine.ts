export enum Motive {
  physical,
  emotional,
  social,
  financial,
  accomplishment
}

export enum BinOp {
  equals,
  greater_than,
  less_than,
  geq,
  leq
}

export enum ReqType {
  location,
  people,
  motive
}

export interface Thresh {
  motive: Motive,
  op:     BinOp,
  thresh: number
}

export interface Requirement {
  type: ReqType,
  op: BinOp,
  value: string | number
}

export interface Effect {
  motive: Motive,
  delta: number
}

export interface Action {
  name: string,
  requirements: Requirement[],
  effects:      Effect[],
  time_min:     number
}

export interface Agent {
  name: string,
  physical: number,
  emotional: number,
  social: number,
  financial: number,
  accomplishment: number
}

var time:number = 0;

export function clamp(n:number, m:number, o:number):number {
  if (n > m) {
    return m;
  } else if (n < o) {
    return o;
  } else {
    return n;
  }

}

export function select_action(a:Agent, n:Action[]):Action {
  var mdu:number = -26;
  var r:Action = n[0];
  var i:number = 0;
  for (i = 0; i<n.length; i++){
    var du:number = 0;
    var j:number = 0;
    for (j = 0; j<n[i].effects.length; j++){
      switch(n[i].effects[j].motive){
        case 0: {
          du += clamp(n[i].effects[j].delta + a.physical, 5, 1) - a.physical;
          break;
        }
        case 1: {
          du += clamp(n[i].effects[j].delta + a.emotional, 5, 1) - a.emotional;
          break;
        }
        case 2: {
          du += clamp(n[i].effects[j].delta + a.social, 5, 1) - a.social;
          break;
        }
        case 3: {
          du += clamp(n[i].effects[j].delta + a.accomplishment, 5, 1) - a.accomplishment;
          break;
        }
        case 4: {
          du += clamp(n[i].effects[j].delta + a.financial, 5, 1) - a.financial;
          break;
        }
        default: {
          break;
        }
      }
    }
    du = du/n[i].time_min;
    if (du > mdu) {
      mdu = du;
      r = n[i];
    }
  }
  return r;
}

export function execute_action(a:Agent, n:Action):void {
  console.log(a.name + ": " + n.name);
  var i:number = 0;
  for (i = 0; i<n.effects.length; i++){
    switch(n.effects[i].motive){
      case 0: {
        a.physical = clamp(a.physical + n.effects[i].delta, 5, 1)
        break;
      }
      case 1: {
        a.emotional = clamp(a.emotional + n.effects[i].delta, 5, 1)
        break;
      }
      case 2: {
        a.social = clamp(a.social + n.effects[i].delta, 5, 1)
        break;
      }
      case 3: {
        a.accomplishment = clamp(a.accomplishment + n.effects[i].delta, 5, 1)
        break;
      }
      case 4: {
        a.financial = clamp(a.financial + n.effects[i].delta, 5, 1)
        break;
      }
      default: {
        break;
      }
    }
  }
}

export function run_sim(a:Agent[], n:Action[], c: () => boolean):any {
  while (c()) {
    console.log("time: " + time.toString());
    time += 1;
    var i:number = 0;
    for (i = 0; i < a.length; i++ ) {
      var choice:Action = select_action(a[i], n);
      execute_action(a[i], choice);
    }
  }
  console.log("Finished.");
  
  // Sasha: Unsure if this is needed
  // return process.exit(0);
}
