(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hobby_action = exports.work_action = exports.movie_friend_action = exports.eat_friend_action = exports.movie_action = exports.eat_action = void 0;
exports.eat_action = {
    name: "eat_action",
    requirements: [{ type: 0, op: 0, value: "restaurant" }],
    effects: [{ motive: 0, delta: 2 }],
    time_min: 60
};
exports.movie_action = {
    name: "movie_action",
    requirements: [{ type: 0, op: 0, value: "moive theatre" }],
    effects: [{ motive: 1, delta: 3 }],
    time_min: 120
};
exports.eat_friend_action = {
    name: "eat_friend_action",
    requirements: [{ type: 0, op: 0, value: "restaurant" }, { type: 1, op: 3, value: 1 }],
    effects: [{ motive: 0, delta: 2 }, { motive: 2, delta: 2 }],
    time_min: 70
};
exports.movie_friend_action = {
    name: "movie_friend_action",
    requirements: [{ type: 0, op: 0, value: "moive theatre" }, { type: 1, op: 3, value: 1 }],
    effects: [{ motive: 1, delta: 3 }, { motive: 2, delta: 2 }],
    time_min: 130
};
exports.work_action = {
    name: "work_action",
    requirements: [{ type: 0, op: 0, value: "moive theatre" }],
    effects: [{ motive: 3, delta: 1 }],
    time_min: 240
};
exports.hobby_action = {
    name: "hobby_action",
    requirements: [{ type: 0, op: 0, value: "home" }],
    effects: [{ motive: 4, delta: 2 }],
    time_min: 60
};
},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run_sim = exports.execute_action = exports.select_action = exports.clamp = exports.ReqType = exports.BinOp = exports.Motive = void 0;
var Motive;
(function (Motive) {
    Motive[Motive["physical"] = 0] = "physical";
    Motive[Motive["emotional"] = 1] = "emotional";
    Motive[Motive["social"] = 2] = "social";
    Motive[Motive["financial"] = 3] = "financial";
    Motive[Motive["accomplishment"] = 4] = "accomplishment";
})(Motive = exports.Motive || (exports.Motive = {}));
var BinOp;
(function (BinOp) {
    BinOp[BinOp["equals"] = 0] = "equals";
    BinOp[BinOp["greater_than"] = 1] = "greater_than";
    BinOp[BinOp["less_than"] = 2] = "less_than";
    BinOp[BinOp["geq"] = 3] = "geq";
    BinOp[BinOp["leq"] = 4] = "leq";
})(BinOp = exports.BinOp || (exports.BinOp = {}));
var ReqType;
(function (ReqType) {
    ReqType[ReqType["location"] = 0] = "location";
    ReqType[ReqType["people"] = 1] = "people";
    ReqType[ReqType["motive"] = 2] = "motive";
})(ReqType = exports.ReqType || (exports.ReqType = {}));
var time = 0;
function clamp(n, m, o) {
    if (n > m) {
        return m;
    }
    else if (n < o) {
        return o;
    }
    else {
        return n;
    }
}
exports.clamp = clamp;
function select_action(a, n) {
    var mdu = -26;
    var r = n[0];
    var i = 0;
    for (i = 0; i < n.length; i++) {
        var du = 0;
        var j = 0;
        for (j = 0; j < n[i].effects.length; j++) {
            switch (n[i].effects[j].motive) {
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
        du = du / n[i].time_min;
        if (du > mdu) {
            mdu = du;
            r = n[i];
        }
    }
    return r;
}
exports.select_action = select_action;
function execute_action(a, n) {
    console.log(a.name + ": " + n.name);
    var i = 0;
    for (i = 0; i < n.effects.length; i++) {
        switch (n.effects[i].motive) {
            case 0: {
                a.physical = clamp(a.physical + n.effects[i].delta, 5, 1);
                break;
            }
            case 1: {
                a.emotional = clamp(a.emotional + n.effects[i].delta, 5, 1);
                break;
            }
            case 2: {
                a.social = clamp(a.social + n.effects[i].delta, 5, 1);
                break;
            }
            case 3: {
                a.accomplishment = clamp(a.accomplishment + n.effects[i].delta, 5, 1);
                break;
            }
            case 4: {
                a.financial = clamp(a.financial + n.effects[i].delta, 5, 1);
                break;
            }
            default: {
                break;
            }
        }
    }
}
exports.execute_action = execute_action;
function run_sim(a, n, c) {
    while (c()) {
        console.log("time: " + time.toString());
        time += 1;
        var i = 0;
        for (i = 0; i < a.length; i++) {
            var choice = select_action(a[i], n);
            execute_action(a[i], choice);
        }
    }
    console.log("Finished.");
    // Sasha: Unsure if this is needed
    // return process.exit(0);
}
exports.run_sim = run_sim;
},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var engine = require("./execution_engine");
var actions = require("./action_specs");
var action_list = [actions.eat_action, actions.movie_action, actions.eat_friend_action, actions.movie_friend_action, actions.work_action, actions.hobby_action];
var a1 = {
    name: "John Doe",
    physical: 1,
    emotional: 1,
    social: 1,
    financial: 1,
    accomplishment: 1
};
var agent_list = [a1];
function condition() {
    var check = false;
    var i = 0;
    for (i = 0; i < agent_list.length; i++) {
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
function showOnBrowser(divName, name) {
    var elt = document.getElementById(divName);
    elt.innerText = name + "Hello World!";
}
showOnBrowser("greeting", "TypeScript");
},{"./action_specs":1,"./execution_engine":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWN0aW9uX3NwZWNzLnRzIiwic3JjL2V4ZWN1dGlvbl9lbmdpbmUudHMiLCJzcmMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztBQ1NXLFFBQUEsVUFBVSxHQUNyQjtJQUNFLElBQUksRUFBRSxZQUFZO0lBQ2xCLFlBQVksRUFBRSxDQUFDLEVBQUMsSUFBSSxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxZQUFZLEVBQUMsQ0FBQztJQUNsRCxPQUFPLEVBQU8sQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLENBQUMsRUFBQyxDQUFDO0lBQ25DLFFBQVEsRUFBTSxFQUFFO0NBQ2pCLENBQUM7QUFFUyxRQUFBLFlBQVksR0FDdkI7SUFDRSxJQUFJLEVBQUUsY0FBYztJQUNwQixZQUFZLEVBQUUsQ0FBQyxFQUFDLElBQUksRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsZUFBZSxFQUFDLENBQUM7SUFDckQsT0FBTyxFQUFPLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxDQUFDLEVBQUMsQ0FBQztJQUNuQyxRQUFRLEVBQU0sR0FBRztDQUNsQixDQUFDO0FBRVMsUUFBQSxpQkFBaUIsR0FDNUI7SUFDRSxJQUFJLEVBQUUsbUJBQW1CO0lBQ3pCLFlBQVksRUFBRSxDQUFDLEVBQUMsSUFBSSxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxZQUFZLEVBQUMsRUFBRSxFQUFDLElBQUksRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsQ0FBQyxFQUFDLENBQUM7SUFDM0UsT0FBTyxFQUFPLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxDQUFDLEVBQUMs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QUFDLENBQUM7Z0JBQ04sQ0FBQyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7Z0JBQ3pELE1BQU07YUFDUDtZQUNELEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ04sQ0FBQyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7Z0JBQzNELE1BQU07YUFDUDtZQUNELEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ04sQ0FBQyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7Z0JBQ3JELE1BQU07YUFDUDtZQUNELEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ04sQ0FBQyxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7Z0JBQ3JFLE1BQU07YUFDUDtZQUNELEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ04sQ0FBQyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7Z0JBQzNELE1BQU07YUFDUDtZQUNELE9BQU8sQ0FBQyxDQUFDO2dCQUNQLE1BQU07YUFDUDtTQUNGO0tBQ0Y7QUFDSCxDQUFDO0FBOUJELHdDQThCQztBQUVELFNB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cmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7IE1vdGl2ZSB9IGZyb20gXCIuL2V4ZWN1dGlvbl9lbmdpbmVcIjtcclxuaW1wb3J0IHsgQmluT3AgfSBmcm9tIFwiLi9leGVjdXRpb25fZW5naW5lXCI7XHJcbmltcG9ydCB7IFJlcVR5cGUgfSBmcm9tIFwiLi9leGVjdXRpb25fZW5naW5lXCI7XHJcbmltcG9ydCB7IFRocmVzaCB9IGZyb20gXCIuL2V4ZWN1dGlvbl9lbmdpbmVcIjtcclxuaW1wb3J0IHsgUmVxdWlyZW1lbnQgfSBmcm9tIFwiLi9leGVjdXRpb25fZW5naW5lXCI7XHJcbmltcG9ydCB7IEVmZmVjdCB9IGZyb20gXCIuL2V4ZWN1dGlvbl9lbmdpbmVcIjtcclxuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4vZXhlY3V0aW9uX2VuZ2luZVwiO1xyXG5pbXBvcnQgeyBBZ2VudCB9IGZyb20gXCIuL2V4ZWN1dGlvbl9lbmdpbmVcIjtcclxuXHJcbmV4cG9ydCB2YXIgZWF0X2FjdGlvbiA6IEFjdGlvbiA9XHJcbntcclxuICBuYW1lOiBcImVhdF9hY3Rpb25cIixcclxuICByZXF1aXJlbWVudHM6IFt7dHlwZTowLCBvcDowLCB2YWx1ZTpcInJlc3RhdXJhbnRcIn1dLFxyXG4gIGVmZmVjdHM6ICAgICAgW3ttb3RpdmU6MCwgZGVsdGE6Mn1dLFxyXG4gIHRpbWVfbWluOiAgICAgNjBcclxufTtcclxuXHJcbmV4cG9ydCB2YXIgbW92aWVfYWN0aW9uIDogQWN0aW9uID1cclxue1xyXG4gIG5hbWU6IFwibW92aWVfYWN0aW9uXCIsXHJcbiAgcmVxdWlyZW1lbnRzOiBbe3R5cGU6MCwgb3A6MCwgdmFsdWU6XCJtb2l2ZSB0aGVhdHJlXCJ9XSxcclxuICBlZmZlY3RzOiAgICAgIFt7bW90aXZlOjEsIGRlbHRhOjN9XSxcclxuICB0aW1lX21pbjogICAgIDEyMFxyXG59O1xyXG5cclxuZXhwb3J0IHZhciBlYXRfZnJpZW5kX2FjdGlvbiA6IEFjdGlvbiA9XHJcbntcclxuICBuYW1lOiBcImVhdF9mcmllbmRfYWN0aW9uXCIsXHJcbiAgcmVxdWlyZW1lbnRzOiBbe3R5cGU6MCwgb3A6MCwgdmFsdWU6XCJyZXN0YXVyYW50XCJ9LCB7dHlwZToxLCBvcDozLCB2YWx1ZToxfV0sXHJcbiAgZWZmZWN0czogICAgICBbe21vdGl2ZTowLCBkZWx0YToyfSwge21vdGl2ZToyLCBkZWx0YToyfV0sXHJcbiAgdGltZV9taW46ICAgICA3MFxyXG59O1xyXG5cclxuZXhwb3J0IHZhciBtb3ZpZV9mcmllbmRfYWN0aW9uIDogQWN0aW9uID1cclxue1xyXG4gIG5hbWU6IFwibW92aWVfZnJpZW5kX2FjdGlvblwiLFxyXG4gIHJlcXVpcmVtZW50czogW3t0eXBlOjAsIG9wOjAsIHZhbHVlOlwibW9pdmUgdGhlYXRyZVwifSwge3R5cGU6MSwgb3A6MywgdmFsdWU6MX1dLFxyXG4gIGVmZmVjdHM6ICAgICAgW3ttb3RpdmU6MSwgZGVsdGE6M30sIHttb3RpdmU6MiwgZGVsdGE6Mn1dLFxyXG4gIHRpbWVfbWluOiAgICAgMTMwXHJcbn07XHJcblxyXG5leHBvcnQgdmFyIHdvcmtfYWN0aW9uIDogQWN0aW9uID1cclxue1xyXG4gIG5hbWU6IFwid29ya19hY3Rpb25cIixcclxuICByZXF1aXJlbWVudHM6IFt7dHlwZTowLCBvcDowLCB2YWx1ZTpcIm1vaXZlIHRoZWF0cmVcIn1dLFxyXG4gIGVmZmVjdHM6ICAgICAgW3ttb3RpdmU6MywgZGVsdGE6MX1dLFxyXG4gIHRpbWVfbWluOiAgICAgMjQwXHJcbn07XHJcblxyXG5leHBvcnQgdmFyIGhvYmJ5X2FjdGlvbiA6IEFjdGlvbiA9XHJcbntcclxuICBuYW1lOiBcImhvYmJ5X2FjdGlvblwiLFxyXG4gIHJlcXVpcmVtZW50czogW3t0eXBlOjAsIG9wOjAsIHZhbHVlOlwiaG9tZVwifV0sXHJcbiAgZWZmZWN0czogICAgICBbe21vdGl2ZTo0LCBkZWx0YToyfV0sXHJcbiAgdGltZV9taW46ICAgICA2MFxyXG59O1xyXG4iLCJleHBvcnQgZW51bSBNb3RpdmUge1xyXG4gIHBoeXNpY2FsLFxyXG4gIGVtb3Rpb25hbCxcclxuICBzb2NpYWwsXHJcbiAgZmluYW5jaWFsLFxyXG4gIGFjY29tcGxpc2htZW50XHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIEJpbk9wIHtcclxuICBlcXVhbHMsXHJcbiAgZ3JlYXRlcl90aGFuLFxyXG4gIGxlc3NfdGhhbixcclxuICBnZXEsXHJcbiAgbGVxXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIFJlcVR5cGUge1xyXG4gIGxvY2F0aW9uLFxyXG4gIHBlb3BsZSxcclxuICBtb3RpdmVcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBUaHJlc2gge1xyXG4gIG1vdGl2ZTogTW90aXZlLFxyXG4gIG9wOiAgICAgQmluT3AsXHJcbiAgdGhyZXNoOiBudW1iZXJcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSZXF1aXJlbWVudCB7XHJcbiAgdHlwZTogUmVxVHlwZSxcclxuICBvcDogQmluT3AsXHJcbiAgdmFsdWU6IHN0cmluZyB8IG51bWJlclxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEVmZmVjdCB7XHJcbiAgbW90aXZlOiBNb3RpdmUsXHJcbiAgZGVsdGE6IG51bWJlclxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEFjdGlvbiB7XHJcbiAgbmFtZTogc3RyaW5nLFxyXG4gIHJlcXVpcmVtZW50czogUmVxdWlyZW1lbnRbXSxcclxuICBlZmZlY3RzOiAgICAgIEVmZmVjdFtdLFxyXG4gIHRpbWVfbWluOiAgICAgbnVtYmVyXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQWdlbnQge1xyXG4gIG5hbWU6IHN0cmluZyxcclxuICBwaHlzaWNhbDogbnVtYmVyLFxyXG4gIGVtb3Rpb25hbDogbnVtYmVyLFxyXG4gIHNvY2lhbDogbnVtYmVyLFxyXG4gIGZpbmFuY2lhbDogbnVtYmVyLFxyXG4gIGFjY29tcGxpc2htZW50OiBudW1iZXJcclxufVxyXG5cclxudmFyIHRpbWU6bnVtYmVyID0gMDtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjbGFtcChuOm51bWJlciwgbTpudW1iZXIsIG86bnVtYmVyKTpudW1iZXIge1xyXG4gIGlmIChuID4gbSkge1xyXG4gICAgcmV0dXJuIG07XHJcbiAgfSBlbHNlIGlmIChuIDwgbykge1xyXG4gICAgcmV0dXJuIG87XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiBuO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RfYWN0aW9uKGE6QWdlbnQsIG46QWN0aW9uW10pOkFjdGlvbiB7XHJcbiAgdmFyIG1kdTpudW1iZXIgPSAtMjY7XHJcbiAgdmFyIHI6QWN0aW9uID0gblswXTtcclxuICB2YXIgaTpudW1iZXIgPSAwO1xyXG4gIGZvciAoaSA9IDA7IGk8bi5sZW5ndGg7IGkrKyl7XHJcbiAgICB2YXIgZHU6bnVtYmVyID0gMDtcclxuICAgIHZhciBqOm51bWJlciA9IDA7XHJcbiAgICBmb3IgKGogPSAwOyBqPG5baV0uZWZmZWN0cy5sZW5ndGg7IGorKyl7XHJcbiAgICAgIHN3aXRjaChuW2ldLmVmZmVjdHNbal0ubW90aXZlKXtcclxuICAgICAgICBjYXNlIDA6IHtcclxuICAgICAgICAgIGR1ICs9IGNsYW1wKG5baV0uZWZmZWN0c1tqXS5kZWx0YSArIGEucGh5c2ljYWwsIDUsIDEpIC0gYS5waHlzaWNhbDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXNlIDE6IHtcclxuICAgICAgICAgIGR1ICs9IGNsYW1wKG5baV0uZWZmZWN0c1tqXS5kZWx0YSArIGEuZW1vdGlvbmFsLCA1LCAxKSAtIGEuZW1vdGlvbmFsO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgMjoge1xyXG4gICAgICAgICAgZHUgKz0gY2xhbXAobltpXS5lZmZlY3RzW2pdLmRlbHRhICsgYS5zb2NpYWwsIDUsIDEpIC0gYS5zb2NpYWw7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgY2FzZSAzOiB7XHJcbiAgICAgICAgICBkdSArPSBjbGFtcChuW2ldLmVmZmVjdHNbal0uZGVsdGEgKyBhLmFjY29tcGxpc2htZW50LCA1LCAxKSAtIGEuYWNjb21wbGlzaG1lbnQ7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgY2FzZSA0OiB7XHJcbiAgICAgICAgICBkdSArPSBjbGFtcChuW2ldLmVmZmVjdHNbal0uZGVsdGEgKyBhLmZpbmFuY2lhbCwgNSwgMSkgLSBhLmZpbmFuY2lhbDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGR1ID0gZHUvbltpXS50aW1lX21pbjtcclxuICAgIGlmIChkdSA+IG1kdSkge1xyXG4gICAgICBtZHUgPSBkdTtcclxuICAgICAgciA9IG5baV07XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZXhlY3V0ZV9hY3Rpb24oYTpBZ2VudCwgbjpBY3Rpb24pOnZvaWQge1xyXG4gIGNvbnNvbGUubG9nKGEubmFtZSArIFwiOiBcIiArIG4ubmFtZSk7XHJcbiAgdmFyIGk6bnVtYmVyID0gMDtcclxuICBmb3IgKGkgPSAwOyBpPG4uZWZmZWN0cy5sZW5ndGg7IGkrKyl7XHJcbiAgICBzd2l0Y2gobi5lZmZlY3RzW2ldLm1vdGl2ZSl7XHJcbiAgICAgIGNhc2UgMDoge1xyXG4gICAgICAgIGEucGh5c2ljYWwgPSBjbGFtcChhLnBoeXNpY2FsICsgbi5lZmZlY3RzW2ldLmRlbHRhLCA1LCAxKVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgMToge1xyXG4gICAgICAgIGEuZW1vdGlvbmFsID0gY2xhbXAoYS5lbW90aW9uYWwgKyBuLmVmZmVjdHNbaV0uZGVsdGEsIDUsIDEpXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAyOiB7XHJcbiAgICAgICAgYS5zb2NpYWwgPSBjbGFtcChhLnNvY2lhbCArIG4uZWZmZWN0c1tpXS5kZWx0YSwgNSwgMSlcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlIDM6IHtcclxuICAgICAgICBhLmFjY29tcGxpc2htZW50ID0gY2xhbXAoYS5hY2NvbXBsaXNobWVudCArIG4uZWZmZWN0c1tpXS5kZWx0YSwgNSwgMSlcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlIDQ6IHtcclxuICAgICAgICBhLmZpbmFuY2lhbCA9IGNsYW1wKGEuZmluYW5jaWFsICsgbi5lZmZlY3RzW2ldLmRlbHRhLCA1LCAxKVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJ1bl9zaW0oYTpBZ2VudFtdLCBuOkFjdGlvbltdLCBjOiAoKSA9PiBib29sZWFuKTphbnkge1xyXG4gIHdoaWxlIChjKCkpIHtcclxuICAgIGNvbnNvbGUubG9nKFwidGltZTogXCIgKyB0aW1lLnRvU3RyaW5nKCkpO1xyXG4gICAgdGltZSArPSAxO1xyXG4gICAgdmFyIGk6bnVtYmVyID0gMDtcclxuICAgIGZvciAoaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICB2YXIgY2hvaWNlOkFjdGlvbiA9IHNlbGVjdF9hY3Rpb24oYVtpXSwgbik7XHJcbiAgICAgIGV4ZWN1dGVfYWN0aW9uKGFbaV0sIGNob2ljZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGNvbnNvbGUubG9nKFwiRmluaXNoZWQuXCIpO1xyXG4gIFxyXG4gIC8vIFNhc2hhOiBVbnN1cmUgaWYgdGhpcyBpcyBuZWVkZWRcclxuICAvLyByZXR1cm4gcHJvY2Vzcy5leGl0KDApO1xyXG59XHJcbiIsImltcG9ydCAqIGFzIGVuZ2luZSBmcm9tIFwiLi9leGVjdXRpb25fZW5naW5lXCI7XHJcbmltcG9ydCAqIGFzIGFjdGlvbnMgZnJvbSBcIi4vYWN0aW9uX3NwZWNzXCI7XHJcblxyXG52YXIgYWN0aW9uX2xpc3Q6ZW5naW5lLkFjdGlvbltdID0gW2FjdGlvbnMuZWF0X2FjdGlvbiwgYWN0aW9ucy5tb3ZpZV9hY3Rpb24sIGFjdGlvbnMuZWF0X2ZyaWVuZF9hY3Rpb24sIGFjdGlvbnMubW92aWVfZnJpZW5kX2FjdGlvbiwgYWN0aW9ucy53b3JrX2FjdGlvbiwgYWN0aW9ucy5ob2JieV9hY3Rpb25dO1xyXG5cclxudmFyIGExOmVuZ2luZS5BZ2VudCA9XHJcbntcclxuICBuYW1lOiBcIkpvaG4gRG9lXCIsXHJcbiAgcGh5c2ljYWw6IDEsXHJcbiAgZW1vdGlvbmFsOiAxLFxyXG4gIHNvY2lhbDogMSxcclxuICBmaW5hbmNpYWw6IDEsXHJcbiAgYWNjb21wbGlzaG1lbnQ6IDFcclxufTtcclxuXHJcbnZhciBhZ2VudF9saXN0OmVuZ2luZS5BZ2VudFtdID0gW2ExXTtcclxuXHJcbmZ1bmN0aW9uIGNvbmRpdGlvbigpOmJvb2xlYW4ge1xyXG4gIHZhciBjaGVjazpib29sZWFuID0gZmFsc2U7XHJcbiAgdmFyIGk6bnVtYmVyID0gMDtcclxuICBmb3IgKGkgPSAwOyBpPCBhZ2VudF9saXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAoYWdlbnRfbGlzdFtpXS5waHlzaWNhbCA8IDUpIHtcclxuICAgICAgY2hlY2sgPSB0cnVlO1xyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICAgIGlmIChhZ2VudF9saXN0W2ldLmVtb3Rpb25hbCA8IDUpIHtcclxuICAgICAgY2hlY2sgPSB0cnVlO1xyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICAgIGlmIChhZ2VudF9saXN0W2ldLnNvY2lhbCA8IDUpIHtcclxuICAgICAgY2hlY2sgPSB0cnVlO1xyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICAgIGlmIChhZ2VudF9saXN0W2ldLmZpbmFuY2lhbCA8IDUpIHtcclxuICAgICAgY2hlY2sgPSB0cnVlO1xyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICAgIGlmIChhZ2VudF9saXN0W2ldLmFjY29tcGxpc2htZW50IDwgNSkge1xyXG4gICAgICBjaGVjayA9IHRydWU7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gY2hlY2s7XHJcbn1cclxuXHJcbmVuZ2luZS5ydW5fc2ltKGFnZW50X2xpc3QsIGFjdGlvbl9saXN0LCBjb25kaXRpb24pO1xyXG5cclxuZnVuY3Rpb24gc2hvd09uQnJvd3NlcihkaXZOYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZykge1xyXG4gIGNvbnN0IGVsdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpdk5hbWUpO1xyXG4gIGVsdC5pbm5lclRleHQgPSBuYW1lICsgXCJIZWxsbyBXb3JsZCFcIjtcclxufVxyXG5cclxuc2hvd09uQnJvd3NlcihcImdyZWV0aW5nXCIsIFwiVHlwZVNjcmlwdFwiKTtcclxuIl19
