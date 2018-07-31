/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utility__ = __webpack_require__(1);


/** Generalized finite state machine */
class FSM {
  constructor (name = "FSM") {
    this.name = name;
    this.currentState;        // The currently active state of the FSM
    this.states = [];         // All states within this state machine
    this.actions = {};        // All Actions useds within this state machine, keyed by id
    this.events = [];         // Event queue
    this.id = Object(__WEBPACK_IMPORTED_MODULE_0__utility__["a" /* makeID */])();       // Unique 12 character string id
    this.logMessages = true;  // Log all internal messages to console
  }

  /**
   * Creates and returns a new state machine
   * @param {string} name - Name of the state machine
   */
  static create (name) {
    const fsm = new FSM(name);
    if (!FSM.stateMachines) FSM.stateMachines = [];
    FSM.stateMachines.push(fsm);
    
    return fsm;
  }

  /**
   * Send given event to all state machines.
   * @param {string} event - Event to broadcast to FSMs.
   * @param {FSM} only - Only state machine to receive event.
   */
  static broadcast (event, only = null) {
    console.log(`broadcasting event: ${event}`);

    FSM.stateMachines.forEach(sm => {
      if (!only) {
        sm.listen(event);  
      } else if (sm.id == only.id) {
        sm.listen(event);
      } 
    });
  }

  /**
   * Evaluates each state machine sequentially.
   * @param {bool} loop - Whether to evaluate all state machines once or continually
   */
  static async evaluate (loop) {
    const stateMachines = FSM.stateMachines;
    for (let i = 0; i < stateMachines.length ; i++) {
      await stateMachines[i].evaluate();
    }
    
    if (loop) {
      await Object(__WEBPACK_IMPORTED_MODULE_0__utility__["b" /* sleep */])(10); // Wait 10 ms before looping
      FSM.evaluate(loop);
    }
  }

  /**
   * Add a state.
   * @param {string} name - Name of state to create.
   * @param {bool} loop - Whether state should run Actions every evaluation. Overrides action loop property if true. Default false.
   * @return {State} A State object.
   */
  addState (name, loop = false) {
    const state = new State(name);
    state.id = Object(__WEBPACK_IMPORTED_MODULE_0__utility__["a" /* makeID */])();
    state.loop = loop;
    this.states.push(state);

    if (!this.currentState) this.currentState = state;

    return state;
  }

  /**
   * Remove state from states array.
   * @param {string} name - Name of state to remove.
   */
  removeState (name) {
      if (!this.stateExists(name)) throw new FSMError("No state found with this name: " + name)

      const filteredStates = this.states.filter(state => {
        if (state.name != name) return state;
      });
      this.states = filteredStates;
  }

  /**
   * Delete this state machine.
   */
  destroy () {
    const index = FSM.stateMachines.indexOf(this);
    const pre = FSM.stateMachines.slice(0, index);
    const post = FSM.stateMachines.slice(index+1);
    FSM.stateMachines = pre.concat(post);
  }

  /**
   * Check if state is in states array.
   * @param {string} name - The name of the state to check for.
   * @return {bool}
   */
  stateExists (name) {
    return this.states.some(state => {
        if (state.name == name) return state;
      });
  }

  /**
   * Check if a state contains a link to a given state.
   * @param {string} stateFrom - The state to check for links.
   * @param {string} stateTo - The state being linked to.
   * @return {bool}
   */
  linkExists (stateFrom, stateTo) {
    const fromState = this.findState(stateFrom);
    const exists = fromState.links.some(stateLink => {
        if (stateLink.stateName == stateTo) return stateLink;
    });

    return exists;
  }

  /**
   * Check whether an action exists within a given state.
   * @param {string} stateName - Name of state to search for action
   * @param {string} actionID - ID of Action to find.
   */
   actionExists (stateName, actionID) {
    const state = this.findState(stateName);
    const exists = state.actions.indexOf(actionID);

    return (exists > -1);
   }

  /**
   * Find a state by name.
   * @param {string} name - Name of state to find.
   * @return {State} A State object.
   */
  findState (name) {
    const foundState = this.states.filter(state => {
      if (state.name == name) return state;
    });

    if (foundState.length > 0) {
      return foundState[0];
    } else {
      throw new FSMError("No state found with this name: " + name)
      return null
    }
  }

  /**
   * Create a link between two states for a given event.
   * @param {string} stateFrom - State to register link on.
   * @param {string} stateTo - State to link to.
   * @param {string} event - Event which executes the link.
   */
  linkState (stateFrom, stateTo, event) {
    const link = new Link(event, stateTo);

    const fromState = this.findState(stateFrom);
    fromState.links.push(link);
  }

  /**
   * Listens for events and queues them.
   * @param {string} event - Event received from FSM.
   */
  listen (event) {
    this.events.push(event);
  }
  
  /**
   * Receive an event to be processed from the event queue.
   * @param {string} event
   * @return {bool} - Returns true if state change occurred.
   */
  receive (event) {
    if (!this.currentState) return;
    if (this.currentState.links.length == 0) return;

    const links = (this.currentState.links.filter(link => {
        if (link.event == event) return link;
    }));

    if (links.length > 0) {
      this.log(`received actionable event: ${event}`);
      this.changeState(links[0].stateName);
      return true;
    }

    return false;
  }

  /**
   * Evaluates the current state. Returning true if evaluated.
   * @return {bool} - Returns whether or not the state was evaluated.
   */
  async evaluate () {
    if (!this.currentState) {
      this.log(`contains no current state`);
      return false;
    } 

    this.log(`evaluating state of machine`);
    this.log(`current state is ${this.currentState.name}`);

    await this.evaluateActions();
    await this.evaluateEvents();

    return true;
  }

  /**
   * Evalutes the current state's actions.
   * @return {bool}
   */
  async evaluateActions () {
    const actions = this.currentState.actions;
    for (let i = 0; i < actions.length ; i++) {
      let actionID = actions[i];
      let count = 0;
      const limit = 10;
      let res; // response from action
      while (!res && count < limit) {
        let action = this.actions[actionID]; 

        // Call action only if state or action loops, or action still unevaluated
        if (!this.currentState.loop && (!action.loop && action.evaluated)) {
          break;
        }

        action.evaluated = true;

        res = await action.callback(...action.args);
        count++;
        if (count == limit) {this.log("state evaluation limit reached");}
      }
    }

    return true;
  }

  /**
   * Evaluates event queue to check for state changes.
   * @return {bool} - Returns true if evaluated.
   */
  async evaluateEvents () {
    const events = this.events;
    for (let i = 0 ; i < events.length ; i++) {
      if (this.receive(events[i])) break;
    }
    this.events = [];

    return true;
  }  

  /**
   * Change current state to given state by name.
   * @param {string} stateName - State to change to. 
   */
  changeState (stateName) {
    this.log(`changing state from ${this.currentState.name} to ${stateName}`);

    const state = this.findState(stateName);
    this.currentState = state;
    this.currentState.evaluated = false;
  }

  /**
   * Change the name of the given state with the new name provided.
   * @param {string} stateName - Name of state to rename.
   * @param {string} newStateName - New name for state.
   */
  renameState (stateName, newStateName) {
    const state = this.findState(stateName);
    state.name = newStateName;
  }

  /**
   * Adds an action to a given state. Returns the Action id.
   * @param {string} stateName - Name of state to add action to.
   * @param {Action} action - Action to add.
   * @param {bool} loop - Whether action should run once or loop on each evaluation. Default is false.
   * @return {string} The Action ID.
   */
  addAction (stateName, action, loop = false) {
    action.loop = loop;

    const actionID = action.createID();

    // Save the action's id
    this.actions[actionID] = action;
    
    const state = this.findState(stateName);

    // Add action to state's action array
    state.actions.push(actionID);

    return actionID
  }

  /**
   * Removes an action from a state.
   * @param {string} stateName - Name of the state to remove action from.
   * @param {string} actionID - ID of Action to remove.
   */
   removeAction (stateName, actionID) {
    const state = this.findState(stateName);

    if (!this.actionExists(stateName, actionID)) {
      throw new FSMError(`action does not exist within ${stateName}`);
      return;
    }

    const index = state.actions.indexOf(actionID);
    state.actions.splice(index, 1);
    delete this.actions[actionID]

    this.log(`removed action from ${stateName}`);
   }

  /**
   * Prints formatted message to console.log.
   * @param {string} text - Text of message to log.
   */
  log (text) {
    if (this.logMessages) console.log(`${this.name}: ${text}`);
  }
  
  /**
   * Activate message logging. Default is true.
   * @param {bool} active - If true will log all fsm messages
   */
  debug (active) {
    this.logMessages = active;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = FSM;


/**
 * A discrete state of a state machine.
 * @param {string} name - Name of state.
 */
function State (name) {
  this.name = name;
  this.id;
  this.links = [];        // All outbound connecting states from this state
  this.actions = [];      // All actions assigned to this state
  this.loop;              // Whether state loops through actions every evaluation - Default false
}

/**
 * The unidirectional link between two states.
 * @param {string} event - Name of event to listen for.
 * @param {string} state - Name of event to link to.
 */
function Link (event, state) {
  this.event = event;
  this.stateName = state;
}

/**
 * General FSM error Exception class.
 * @param {string} text - Error message.
 */
function FSMError (text) {
  this.text = text;
}

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = sleep;
/* harmony export (immutable) */ __webpack_exports__["a"] = makeID;
/** General utility functions */

/**
 * Promise based delay timer.
 * @param {int} ms - Delay in miliseconds.
 * @return {Promise} - Promise wrapped timer.
 */
function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a unique id {string}
 * @return {string} - a random 12 character id string.
 */
function makeID () {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 12; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__action__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__fsm__ = __webpack_require__(0);



exports.FSM = __WEBPACK_IMPORTED_MODULE_1__fsm__["a" /* default */];
exports.Action = __WEBPACK_IMPORTED_MODULE_0__action__["a" /* Action */];
exports.wait = __WEBPACK_IMPORTED_MODULE_0__action__["c" /* wait */];
exports.sendEvent = __WEBPACK_IMPORTED_MODULE_0__action__["b" /* sendEvent */];


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__fsm__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utility__ = __webpack_require__(1);



/** Action type and premade actions */

/**
 * Actions performed by a state once activated.
 * Actions must be asynchronous and return a {bool} on completion: 
 *  true if finished, or false if it must be reevaluated.
 * @param {AsyncFunction} callback - Asynchronous function to call during action evaluation.
 * @param {args*} args - Arguments to pass to callback.
 */
class Action {
  constructor (callback, ...args) {
    this.callback = callback;
    this.args = args;
    this.id;
    this.evaluated = false;
    this.loop; // Indicates whether action should be evaluated once or repeatedly
  }

  /**
   * Creates and returns a unique id string.
   * @return {string} A 12 character string id.
   */
  createID () {
    this.id = Object(__WEBPACK_IMPORTED_MODULE_1__utility__["a" /* makeID */])();
    return this.id;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Action;


/** Actions */

/**
 * Delay timer action.
 * @param {int} ms - Delay in miliseconds.
 * @return {bool}
 */
const wait = async (ms = 1000) => {
  const something = await Object(__WEBPACK_IMPORTED_MODULE_1__utility__["b" /* sleep */])(ms);
  return true
}
/* harmony export (immutable) */ __webpack_exports__["c"] = wait;


/**
 * Debugging action.
 * @return {bool}
 */
const returnFalse = async () => {
  return false
}
/* unused harmony export returnFalse */


/**
 * Simple event broadcasting action.
 * @param {string} event - Event to broadcast.
 * @param {FSM} only - Send message to specific state machine.
 * @return {bool}
 */
const sendEvent = async (event, only = null) => {
  __WEBPACK_IMPORTED_MODULE_0__fsm__["a" /* default */].broadcast(event, only);
  return true;
}
/* harmony export (immutable) */ __webpack_exports__["b"] = sendEvent;


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNTI2Y2NhNGVjMzE4MzJlNzdjNjEiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ZzbS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbGl0eS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FjdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7OztBQzdEd0I7O0FBRXhCO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCLHFCQUFxQjtBQUNyQixzQkFBc0I7QUFDdEIscUJBQXFCO0FBQ3JCLGlGQUF1QjtBQUN2Qiw0QkFBNEI7QUFDNUI7O0FBRUE7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQixhQUFhLElBQUk7QUFDakI7QUFDQTtBQUNBLHVDQUF1QyxNQUFNOztBQUU3QztBQUNBO0FBQ0EseUI7QUFDQSxPQUFPO0FBQ1A7QUFDQSxPO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQSxhQUFhLEtBQUs7QUFDbEI7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLDJCQUEyQjtBQUM5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dWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAyKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA1MjZjY2E0ZWMzMTgzMmU3N2M2MSIsImltcG9ydCB7IG1ha2VJRCwgc2xlZXAgfSBmcm9tICcuL3V0aWxpdHknO1xuXG4vKiogR2VuZXJhbGl6ZWQgZmluaXRlIHN0YXRlIG1hY2hpbmUgKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZTTSB7XG4gIGNvbnN0cnVjdG9yIChuYW1lID0gXCJGU01cIikge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5jdXJyZW50U3RhdGU7ICAgICAgICAvLyBUaGUgY3VycmVudGx5IGFjdGl2ZSBzdGF0ZSBvZiB0aGUgRlNNXG4gICAgdGhpcy5zdGF0ZXMgPSBbXTsgICAgICAgICAvLyBBbGwgc3RhdGVzIHdpdGhpbiB0aGlzIHN0YXRlIG1hY2hpbmVcbiAgICB0aGlzLmFjdGlvbnMgPSB7fTsgICAgICAgIC8vIEFsbCBBY3Rpb25zIHVzZWRzIHdpdGhpbiB0aGlzIHN0YXRlIG1hY2hpbmUsIGtleWVkIGJ5IGlkXG4gICAgdGhpcy5ldmVudHMgPSBbXTsgICAgICAgICAvLyBFdmVudCBxdWV1ZVxuICAgIHRoaXMuaWQgPSBtYWtlSUQoKTsgICAgICAgLy8gVW5pcXVlIDEyIGNoYXJhY3RlciBzdHJpbmcgaWRcbiAgICB0aGlzLmxvZ01lc3NhZ2VzID0gdHJ1ZTsgIC8vIExvZyBhbGwgaW50ZXJuYWwgbWVzc2FnZXMgdG8gY29uc29sZVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW5kIHJldHVybnMgYSBuZXcgc3RhdGUgbWFjaGluZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgdGhlIHN0YXRlIG1hY2hpbmVcbiAgICovXG4gIHN0YXRpYyBjcmVhdGUgKG5hbWUpIHtcbiAgICBjb25zdCBmc20gPSBuZXcgRlNNKG5hbWUpO1xuICAgIGlmICghRlNNLnN0YXRlTWFjaGluZXMpIEZTTS5zdGF0ZU1hY2hpbmVzID0gW107XG4gICAgRlNNLnN0YXRlTWFjaGluZXMucHVzaChmc20pO1xuICAgIFxuICAgIHJldHVybiBmc207XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBnaXZlbiBldmVudCB0byBhbGwgc3RhdGUgbWFjaGluZXMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCAtIEV2ZW50IHRvIGJyb2FkY2FzdCB0byBGU01zLlxuICAgKiBAcGFyYW0ge0ZTTX0gb25seSAtIE9ubHkgc3RhdGUgbWFjaGluZSB0byByZWNlaXZlIGV2ZW50LlxuICAgKi9cbiAgc3RhdGljIGJyb2FkY2FzdCAoZXZlbnQsIG9ubHkgPSBudWxsKSB7XG4gICAgY29uc29sZS5sb2coYGJyb2FkY2FzdGluZyBldmVudDogJHtldmVudH1gKTtcblxuICAgIEZTTS5zdGF0ZU1hY2hpbmVzLmZvckVhY2goc20gPT4ge1xuICAgICAgaWYgKCFvbmx5KSB7XG4gICAgICAgIHNtLmxpc3RlbihldmVudCk7ICBcbiAgICAgIH0gZWxzZSBpZiAoc20uaWQgPT0gb25seS5pZCkge1xuICAgICAgICBzbS5saXN0ZW4oZXZlbnQpO1xuICAgICAgfSBcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFdmFsdWF0ZXMgZWFjaCBzdGF0ZSBtYWNoaW5lIHNlcXVlbnRpYWxseS5cbiAgICogQHBhcmFtIHtib29sfSBsb29wIC0gV2hldGhlciB0byBldmFsdWF0ZSBhbGwgc3RhdGUgbWFjaGluZXMgb25jZSBvciBjb250aW51YWxseVxuICAgKi9cbiAgc3RhdGljIGFzeW5jIGV2YWx1YXRlIChsb29wKSB7XG4gICAgY29uc3Qgc3RhdGVNYWNoaW5lcyA9IEZTTS5zdGF0ZU1hY2hpbmVzO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RhdGVNYWNoaW5lcy5sZW5ndGggOyBpKyspIHtcbiAgICAgIGF3YWl0IHN0YXRlTWFjaGluZXNbaV0uZXZhbHVhdGUoKTtcbiAgICB9XG4gICAgXG4gICAgaWYgKGxvb3ApIHtcbiAgICAgIGF3YWl0IHNsZWVwKDEwKTsgLy8gV2FpdCAxMCBtcyBiZWZvcmUgbG9vcGluZ1xuICAgICAgRlNNLmV2YWx1YXRlKGxvb3ApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBzdGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHN0YXRlIHRvIGNyZWF0ZS5cbiAgICogQHBhcmFtIHtib29sfSBsb29wIC0gV2hldGhlciBzdGF0ZSBzaG91bGQgcnVuIEFjdGlvbnMgZXZlcnkgZXZhbHVhdGlvbi4gT3ZlcnJpZGVzIGFjdGlvbiBsb29wIHByb3BlcnR5IGlmIHRydWUuIERlZmF1bHQgZmFsc2UuXG4gICAqIEByZXR1cm4ge1N0YXRlfSBBIFN0YXRlIG9iamVjdC5cbiAgICovXG4gIGFkZFN0YXRlIChuYW1lLCBsb29wID0gZmFsc2UpIHtcbiAgICBjb25zdCBzdGF0ZSA9IG5ldyBTdGF0ZShuYW1lKTtcbiAgICBzdGF0ZS5pZCA9IG1ha2VJRCgpO1xuICAgIHN0YXRlLmxvb3AgPSBsb29wO1xuICAgIHRoaXMuc3RhdGVzLnB1c2goc3RhdGUpO1xuXG4gICAgaWYgKCF0aGlzLmN1cnJlbnRTdGF0ZSkgdGhpcy5jdXJyZW50U3RhdGUgPSBzdGF0ZTtcblxuICAgIHJldHVybiBzdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgc3RhdGUgZnJvbSBzdGF0ZXMgYXJyYXkuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiBzdGF0ZSB0byByZW1vdmUuXG4gICAqL1xuICByZW1vdmVTdGF0ZSAobmFtZSkge1xuICAgICAgaWYgKCF0aGlzLnN0YXRlRXhpc3RzKG5hbWUpKSB0aHJvdyBuZXcgRlNNRXJyb3IoXCJObyBzdGF0ZSBmb3VuZCB3aXRoIHRoaXMgbmFtZTogXCIgKyBuYW1lKVxuXG4gICAgICBjb25zdCBmaWx0ZXJlZFN0YXRlcyA9IHRoaXMuc3RhdGVzLmZpbHRlcihzdGF0ZSA9PiB7XG4gICAgICAgIGlmIChzdGF0ZS5uYW1lICE9IG5hbWUpIHJldHVybiBzdGF0ZTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5zdGF0ZXMgPSBmaWx0ZXJlZFN0YXRlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGUgdGhpcyBzdGF0ZSBtYWNoaW5lLlxuICAgKi9cbiAgZGVzdHJveSAoKSB7XG4gICAgY29uc3QgaW5kZXggPSBGU00uc3RhdGVNYWNoaW5lcy5pbmRleE9mKHRoaXMpO1xuICAgIGNvbnN0IHByZSA9IEZTTS5zdGF0ZU1hY2hpbmVzLnNsaWNlKDAsIGluZGV4KTtcbiAgICBjb25zdCBwb3N0ID0gRlNNLnN0YXRlTWFjaGluZXMuc2xpY2UoaW5kZXgrMSk7XG4gICAgRlNNLnN0YXRlTWFjaGluZXMgPSBwcmUuY29uY2F0KHBvc3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHN0YXRlIGlzIGluIHN0YXRlcyBhcnJheS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgc3RhdGUgdG8gY2hlY2sgZm9yLlxuICAgKiBAcmV0dXJuIHtib29sfVxuICAgKi9cbiAgc3RhdGVFeGlzdHMgKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZXMuc29tZShzdGF0ZSA9PiB7XG4gICAgICAgIGlmIChzdGF0ZS5uYW1lID09IG5hbWUpIHJldHVybiBzdGF0ZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGEgc3RhdGUgY29udGFpbnMgYSBsaW5rIHRvIGEgZ2l2ZW4gc3RhdGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZUZyb20gLSBUaGUgc3RhdGUgdG8gY2hlY2sgZm9yIGxpbmtzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVUbyAtIFRoZSBzdGF0ZSBiZWluZyBsaW5rZWQgdG8uXG4gICAqIEByZXR1cm4ge2Jvb2x9XG4gICAqL1xuICBsaW5rRXhpc3RzIChzdGF0ZUZyb20sIHN0YXRlVG8pIHtcbiAgICBjb25zdCBmcm9tU3RhdGUgPSB0aGlzLmZpbmRTdGF0ZShzdGF0ZUZyb20pO1xuICAgIGNvbnN0IGV4aXN0cyA9IGZyb21TdGF0ZS5saW5rcy5zb21lKHN0YXRlTGluayA9PiB7XG4gICAgICAgIGlmIChzdGF0ZUxpbmsuc3RhdGVOYW1lID09IHN0YXRlVG8pIHJldHVybiBzdGF0ZUxpbms7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZXhpc3RzO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgYW4gYWN0aW9uIGV4aXN0cyB3aXRoaW4gYSBnaXZlbiBzdGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlTmFtZSAtIE5hbWUgb2Ygc3RhdGUgdG8gc2VhcmNoIGZvciBhY3Rpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvbklEIC0gSUQgb2YgQWN0aW9uIHRvIGZpbmQuXG4gICAqL1xuICAgYWN0aW9uRXhpc3RzIChzdGF0ZU5hbWUsIGFjdGlvbklEKSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZpbmRTdGF0ZShzdGF0ZU5hbWUpO1xuICAgIGNvbnN0IGV4aXN0cyA9IHN0YXRlLmFjdGlvbnMuaW5kZXhPZihhY3Rpb25JRCk7XG5cbiAgICByZXR1cm4gKGV4aXN0cyA+IC0xKTtcbiAgIH1cblxuICAvKipcbiAgICogRmluZCBhIHN0YXRlIGJ5IG5hbWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiBzdGF0ZSB0byBmaW5kLlxuICAgKiBAcmV0dXJuIHtTdGF0ZX0gQSBTdGF0ZSBvYmplY3QuXG4gICAqL1xuICBmaW5kU3RhdGUgKG5hbWUpIHtcbiAgICBjb25zdCBmb3VuZFN0YXRlID0gdGhpcy5zdGF0ZXMuZmlsdGVyKHN0YXRlID0+IHtcbiAgICAgIGlmIChzdGF0ZS5uYW1lID09IG5hbWUpIHJldHVybiBzdGF0ZTtcbiAgICB9KTtcblxuICAgIGlmIChmb3VuZFN0YXRlLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBmb3VuZFN0YXRlWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRlNNRXJyb3IoXCJObyBzdGF0ZSBmb3VuZCB3aXRoIHRoaXMgbmFtZTogXCIgKyBuYW1lKVxuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbGluayBiZXR3ZWVuIHR3byBzdGF0ZXMgZm9yIGEgZ2l2ZW4gZXZlbnQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZUZyb20gLSBTdGF0ZSB0byByZWdpc3RlciBsaW5rIG9uLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVUbyAtIFN0YXRlIHRvIGxpbmsgdG8uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCAtIEV2ZW50IHdoaWNoIGV4ZWN1dGVzIHRoZSBsaW5rLlxuICAgKi9cbiAgbGlua1N0YXRlIChzdGF0ZUZyb20sIHN0YXRlVG8sIGV2ZW50KSB7XG4gICAgY29uc3QgbGluayA9IG5ldyBMaW5rKGV2ZW50LCBzdGF0ZVRvKTtcblxuICAgIGNvbnN0IGZyb21TdGF0ZSA9IHRoaXMuZmluZFN0YXRlKHN0YXRlRnJvbSk7XG4gICAgZnJvbVN0YXRlLmxpbmtzLnB1c2gobGluayk7XG4gIH1cblxuICAvKipcbiAgICogTGlzdGVucyBmb3IgZXZlbnRzIGFuZCBxdWV1ZXMgdGhlbS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IC0gRXZlbnQgcmVjZWl2ZWQgZnJvbSBGU00uXG4gICAqL1xuICBsaXN0ZW4gKGV2ZW50KSB7XG4gICAgdGhpcy5ldmVudHMucHVzaChldmVudCk7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBSZWNlaXZlIGFuIGV2ZW50IHRvIGJlIHByb2Nlc3NlZCBmcm9tIHRoZSBldmVudCBxdWV1ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50XG4gICAqIEByZXR1cm4ge2Jvb2x9IC0gUmV0dXJucyB0cnVlIGlmIHN0YXRlIGNoYW5nZSBvY2N1cnJlZC5cbiAgICovXG4gIHJlY2VpdmUgKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRTdGF0ZSkgcmV0dXJuO1xuICAgIGlmICh0aGlzLmN1cnJlbnRTdGF0ZS5saW5rcy5sZW5ndGggPT0gMCkgcmV0dXJuO1xuXG4gICAgY29uc3QgbGlua3MgPSAodGhpcy5jdXJyZW50U3RhdGUubGlua3MuZmlsdGVyKGxpbmsgPT4ge1xuICAgICAgICBpZiAobGluay5ldmVudCA9PSBldmVudCkgcmV0dXJuIGxpbms7XG4gICAgfSkpO1xuXG4gICAgaWYgKGxpbmtzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMubG9nKGByZWNlaXZlZCBhY3Rpb25hYmxlIGV2ZW50OiAke2V2ZW50fWApO1xuICAgICAgdGhpcy5jaGFuZ2VTdGF0ZShsaW5rc1swXS5zdGF0ZU5hbWUpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2YWx1YXRlcyB0aGUgY3VycmVudCBzdGF0ZS4gUmV0dXJuaW5nIHRydWUgaWYgZXZhbHVhdGVkLlxuICAgKiBAcmV0dXJuIHtib29sfSAtIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHN0YXRlIHdhcyBldmFsdWF0ZWQuXG4gICAqL1xuICBhc3luYyBldmFsdWF0ZSAoKSB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRTdGF0ZSkge1xuICAgICAgdGhpcy5sb2coYGNvbnRhaW5zIG5vIGN1cnJlbnQgc3RhdGVgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IFxuXG4gICAgdGhpcy5sb2coYGV2YWx1YXRpbmcgc3RhdGUgb2YgbWFjaGluZWApO1xuICAgIHRoaXMubG9nKGBjdXJyZW50IHN0YXRlIGlzICR7dGhpcy5jdXJyZW50U3RhdGUubmFtZX1gKTtcblxuICAgIGF3YWl0IHRoaXMuZXZhbHVhdGVBY3Rpb25zKCk7XG4gICAgYXdhaXQgdGhpcy5ldmFsdWF0ZUV2ZW50cygpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogRXZhbHV0ZXMgdGhlIGN1cnJlbnQgc3RhdGUncyBhY3Rpb25zLlxuICAgKiBAcmV0dXJuIHtib29sfVxuICAgKi9cbiAgYXN5bmMgZXZhbHVhdGVBY3Rpb25zICgpIHtcbiAgICBjb25zdCBhY3Rpb25zID0gdGhpcy5jdXJyZW50U3RhdGUuYWN0aW9ucztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFjdGlvbnMubGVuZ3RoIDsgaSsrKSB7XG4gICAgICBsZXQgYWN0aW9uSUQgPSBhY3Rpb25zW2ldO1xuICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgIGNvbnN0IGxpbWl0ID0gMTA7XG4gICAgICBsZXQgcmVzOyAvLyByZXNwb25zZSBmcm9tIGFjdGlvblxuICAgICAgd2hpbGUgKCFyZXMgJiYgY291bnQgPCBsaW1pdCkge1xuICAgICAgICBsZXQgYWN0aW9uID0gdGhpcy5hY3Rpb25zW2FjdGlvbklEXTsgXG5cbiAgICAgICAgLy8gQ2FsbCBhY3Rpb24gb25seSBpZiBzdGF0ZSBvciBhY3Rpb24gbG9vcHMsIG9yIGFjdGlvbiBzdGlsbCB1bmV2YWx1YXRlZFxuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFN0YXRlLmxvb3AgJiYgKCFhY3Rpb24ubG9vcCAmJiBhY3Rpb24uZXZhbHVhdGVkKSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgYWN0aW9uLmV2YWx1YXRlZCA9IHRydWU7XG5cbiAgICAgICAgcmVzID0gYXdhaXQgYWN0aW9uLmNhbGxiYWNrKC4uLmFjdGlvbi5hcmdzKTtcbiAgICAgICAgY291bnQrKztcbiAgICAgICAgaWYgKGNvdW50ID09IGxpbWl0KSB7dGhpcy5sb2coXCJzdGF0ZSBldmFsdWF0aW9uIGxpbWl0IHJlYWNoZWRcIik7fVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2YWx1YXRlcyBldmVudCBxdWV1ZSB0byBjaGVjayBmb3Igc3RhdGUgY2hhbmdlcy5cbiAgICogQHJldHVybiB7Ym9vbH0gLSBSZXR1cm5zIHRydWUgaWYgZXZhbHVhdGVkLlxuICAgKi9cbiAgYXN5bmMgZXZhbHVhdGVFdmVudHMgKCkge1xuICAgIGNvbnN0IGV2ZW50cyA9IHRoaXMuZXZlbnRzO1xuICAgIGZvciAobGV0IGkgPSAwIDsgaSA8IGV2ZW50cy5sZW5ndGggOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLnJlY2VpdmUoZXZlbnRzW2ldKSkgYnJlYWs7XG4gICAgfVxuICAgIHRoaXMuZXZlbnRzID0gW107XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSAgXG5cbiAgLyoqXG4gICAqIENoYW5nZSBjdXJyZW50IHN0YXRlIHRvIGdpdmVuIHN0YXRlIGJ5IG5hbWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZU5hbWUgLSBTdGF0ZSB0byBjaGFuZ2UgdG8uIFxuICAgKi9cbiAgY2hhbmdlU3RhdGUgKHN0YXRlTmFtZSkge1xuICAgIHRoaXMubG9nKGBjaGFuZ2luZyBzdGF0ZSBmcm9tICR7dGhpcy5jdXJyZW50U3RhdGUubmFtZX0gdG8gJHtzdGF0ZU5hbWV9YCk7XG5cbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmluZFN0YXRlKHN0YXRlTmFtZSk7XG4gICAgdGhpcy5jdXJyZW50U3RhdGUgPSBzdGF0ZTtcbiAgICB0aGlzLmN1cnJlbnRTdGF0ZS5ldmFsdWF0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgdGhlIG5hbWUgb2YgdGhlIGdpdmVuIHN0YXRlIHdpdGggdGhlIG5ldyBuYW1lIHByb3ZpZGVkLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVOYW1lIC0gTmFtZSBvZiBzdGF0ZSB0byByZW5hbWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuZXdTdGF0ZU5hbWUgLSBOZXcgbmFtZSBmb3Igc3RhdGUuXG4gICAqL1xuICByZW5hbWVTdGF0ZSAoc3RhdGVOYW1lLCBuZXdTdGF0ZU5hbWUpIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmluZFN0YXRlKHN0YXRlTmFtZSk7XG4gICAgc3RhdGUubmFtZSA9IG5ld1N0YXRlTmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGFjdGlvbiB0byBhIGdpdmVuIHN0YXRlLiBSZXR1cm5zIHRoZSBBY3Rpb24gaWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZU5hbWUgLSBOYW1lIG9mIHN0YXRlIHRvIGFkZCBhY3Rpb24gdG8uXG4gICAqIEBwYXJhbSB7QWN0aW9ufSBhY3Rpb24gLSBBY3Rpb24gdG8gYWRkLlxuICAgKiBAcGFyYW0ge2Jvb2x9IGxvb3AgLSBXaGV0aGVyIGFjdGlvbiBzaG91bGQgcnVuIG9uY2Ugb3IgbG9vcCBvbiBlYWNoIGV2YWx1YXRpb24uIERlZmF1bHQgaXMgZmFsc2UuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIEFjdGlvbiBJRC5cbiAgICovXG4gIGFkZEFjdGlvbiAoc3RhdGVOYW1lLCBhY3Rpb24sIGxvb3AgPSBmYWxzZSkge1xuICAgIGFjdGlvbi5sb29wID0gbG9vcDtcblxuICAgIGNvbnN0IGFjdGlvbklEID0gYWN0aW9uLmNyZWF0ZUlEKCk7XG5cbiAgICAvLyBTYXZlIHRoZSBhY3Rpb24ncyBpZFxuICAgIHRoaXMuYWN0aW9uc1thY3Rpb25JRF0gPSBhY3Rpb247XG4gICAgXG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZpbmRTdGF0ZShzdGF0ZU5hbWUpO1xuXG4gICAgLy8gQWRkIGFjdGlvbiB0byBzdGF0ZSdzIGFjdGlvbiBhcnJheVxuICAgIHN0YXRlLmFjdGlvbnMucHVzaChhY3Rpb25JRCk7XG5cbiAgICByZXR1cm4gYWN0aW9uSURcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFuIGFjdGlvbiBmcm9tIGEgc3RhdGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZU5hbWUgLSBOYW1lIG9mIHRoZSBzdGF0ZSB0byByZW1vdmUgYWN0aW9uIGZyb20uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb25JRCAtIElEIG9mIEFjdGlvbiB0byByZW1vdmUuXG4gICAqL1xuICAgcmVtb3ZlQWN0aW9uIChzdGF0ZU5hbWUsIGFjdGlvbklEKSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZpbmRTdGF0ZShzdGF0ZU5hbWUpO1xuXG4gICAgaWYgKCF0aGlzLmFjdGlvbkV4aXN0cyhzdGF0ZU5hbWUsIGFjdGlvbklEKSkge1xuICAgICAgdGhyb3cgbmV3IEZTTUVycm9yKGBhY3Rpb24gZG9lcyBub3QgZXhpc3Qgd2l0aGluICR7c3RhdGVOYW1lfWApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGluZGV4ID0gc3RhdGUuYWN0aW9ucy5pbmRleE9mKGFjdGlvbklEKTtcbiAgICBzdGF0ZS5hY3Rpb25zLnNwbGljZShpbmRleCwgMSk7XG4gICAgZGVsZXRlIHRoaXMuYWN0aW9uc1thY3Rpb25JRF1cblxuICAgIHRoaXMubG9nKGByZW1vdmVkIGFjdGlvbiBmcm9tICR7c3RhdGVOYW1lfWApO1xuICAgfVxuXG4gIC8qKlxuICAgKiBQcmludHMgZm9ybWF0dGVkIG1lc3NhZ2UgdG8gY29uc29sZS5sb2cuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGV4dCBvZiBtZXNzYWdlIHRvIGxvZy5cbiAgICovXG4gIGxvZyAodGV4dCkge1xuICAgIGlmICh0aGlzLmxvZ01lc3NhZ2VzKSBjb25zb2xlLmxvZyhgJHt0aGlzLm5hbWV9OiAke3RleHR9YCk7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBBY3RpdmF0ZSBtZXNzYWdlIGxvZ2dpbmcuIERlZmF1bHQgaXMgdHJ1ZS5cbiAgICogQHBhcmFtIHtib29sfSBhY3RpdmUgLSBJZiB0cnVlIHdpbGwgbG9nIGFsbCBmc20gbWVzc2FnZXNcbiAgICovXG4gIGRlYnVnIChhY3RpdmUpIHtcbiAgICB0aGlzLmxvZ01lc3NhZ2VzID0gYWN0aXZlO1xuICB9XG59XG5cbi8qKlxuICogQSBkaXNjcmV0ZSBzdGF0ZSBvZiBhIHN0YXRlIG1hY2hpbmUuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2Ygc3RhdGUuXG4gKi9cbmZ1bmN0aW9uIFN0YXRlIChuYW1lKSB7XG4gIHRoaXMubmFtZSA9IG5hbWU7XG4gIHRoaXMuaWQ7XG4gIHRoaXMubGlua3MgPSBbXTsgICAgICAgIC8vIEFsbCBvdXRib3VuZCBjb25uZWN0aW5nIHN0YXRlcyBmcm9tIHRoaXMgc3RhdGVcbiAgdGhpcy5hY3Rpb25zID0gW107ICAgICAgLy8gQWxsIGFjdGlvbnMgYXNzaWduZWQgdG8gdGhpcyBzdGF0ZVxuICB0aGlzLmxvb3A7ICAgICAgICAgICAgICAvLyBXaGV0aGVyIHN0YXRlIGxvb3BzIHRocm91Z2ggYWN0aW9ucyBldmVyeSBldmFsdWF0aW9uIC0gRGVmYXVsdCBmYWxzZVxufVxuXG4vKipcbiAqIFRoZSB1bmlkaXJlY3Rpb25hbCBsaW5rIGJldHdlZW4gdHdvIHN0YXRlcy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCAtIE5hbWUgb2YgZXZlbnQgdG8gbGlzdGVuIGZvci5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZSAtIE5hbWUgb2YgZXZlbnQgdG8gbGluayB0by5cbiAqL1xuZnVuY3Rpb24gTGluayAoZXZlbnQsIHN0YXRlKSB7XG4gIHRoaXMuZXZlbnQgPSBldmVudDtcbiAgdGhpcy5zdGF0ZU5hbWUgPSBzdGF0ZTtcbn1cblxuLyoqXG4gKiBHZW5lcmFsIEZTTSBlcnJvciBFeGNlcHRpb24gY2xhc3MuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIEVycm9yIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIEZTTUVycm9yICh0ZXh0KSB7XG4gIHRoaXMudGV4dCA9IHRleHQ7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvZnNtLmpzXG4vLyBtb2R1bGUgaWQgPSAwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKiBHZW5lcmFsIHV0aWxpdHkgZnVuY3Rpb25zICovXG5cbi8qKlxuICogUHJvbWlzZSBiYXNlZCBkZWxheSB0aW1lci5cbiAqIEBwYXJhbSB7aW50fSBtcyAtIERlbGF5IGluIG1pbGlzZWNvbmRzLlxuICogQHJldHVybiB7UHJvbWlzZX0gLSBQcm9taXNlIHdyYXBwZWQgdGltZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbGVlcCAobXMpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIHVuaXF1ZSBpZCB7c3RyaW5nfVxuICogQHJldHVybiB7c3RyaW5nfSAtIGEgcmFuZG9tIDEyIGNoYXJhY3RlciBpZCBzdHJpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlSUQgKCkge1xuICBsZXQgdGV4dCA9IFwiXCI7XG4gIGNvbnN0IHBvc3NpYmxlID0gXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OVwiO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMTI7IGkrKylcbiAgICB0ZXh0ICs9IHBvc3NpYmxlLmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwb3NzaWJsZS5sZW5ndGgpKTtcblxuICByZXR1cm4gdGV4dDtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy91dGlsaXR5LmpzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IEFjdGlvbiwgd2FpdCwgc2VuZEV2ZW50IH0gZnJvbSAnLi9hY3Rpb24nO1xuaW1wb3J0IEZTTSBmcm9tICcuL2ZzbSc7XG5cbmV4cG9ydHMuRlNNID0gRlNNO1xuZXhwb3J0cy5BY3Rpb24gPSBBY3Rpb247XG5leHBvcnRzLndhaXQgPSB3YWl0O1xuZXhwb3J0cy5zZW5kRXZlbnQgPSBzZW5kRXZlbnQ7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgRlNNIGZyb20gJy4vZnNtJztcbmltcG9ydCB7IHNsZWVwLCBtYWtlSUQgfSBmcm9tICcuL3V0aWxpdHknO1xuXG4vKiogQWN0aW9uIHR5cGUgYW5kIHByZW1hZGUgYWN0aW9ucyAqL1xuXG4vKipcbiAqIEFjdGlvbnMgcGVyZm9ybWVkIGJ5IGEgc3RhdGUgb25jZSBhY3RpdmF0ZWQuXG4gKiBBY3Rpb25zIG11c3QgYmUgYXN5bmNocm9ub3VzIGFuZCByZXR1cm4gYSB7Ym9vbH0gb24gY29tcGxldGlvbjogXG4gKiAgdHJ1ZSBpZiBmaW5pc2hlZCwgb3IgZmFsc2UgaWYgaXQgbXVzdCBiZSByZWV2YWx1YXRlZC5cbiAqIEBwYXJhbSB7QXN5bmNGdW5jdGlvbn0gY2FsbGJhY2sgLSBBc3luY2hyb25vdXMgZnVuY3Rpb24gdG8gY2FsbCBkdXJpbmcgYWN0aW9uIGV2YWx1YXRpb24uXG4gKiBAcGFyYW0ge2FyZ3MqfSBhcmdzIC0gQXJndW1lbnRzIHRvIHBhc3MgdG8gY2FsbGJhY2suXG4gKi9cbmV4cG9ydCBjbGFzcyBBY3Rpb24ge1xuICBjb25zdHJ1Y3RvciAoY2FsbGJhY2ssIC4uLmFyZ3MpIHtcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgdGhpcy5hcmdzID0gYXJncztcbiAgICB0aGlzLmlkO1xuICAgIHRoaXMuZXZhbHVhdGVkID0gZmFsc2U7XG4gICAgdGhpcy5sb29wOyAvLyBJbmRpY2F0ZXMgd2hldGhlciBhY3Rpb24gc2hvdWxkIGJlIGV2YWx1YXRlZCBvbmNlIG9yIHJlcGVhdGVkbHlcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuZCByZXR1cm5zIGEgdW5pcXVlIGlkIHN0cmluZy5cbiAgICogQHJldHVybiB7c3RyaW5nfSBBIDEyIGNoYXJhY3RlciBzdHJpbmcgaWQuXG4gICAqL1xuICBjcmVhdGVJRCAoKSB7XG4gICAgdGhpcy5pZCA9IG1ha2VJRCgpO1xuICAgIHJldHVybiB0aGlzLmlkO1xuICB9XG59XG5cbi8qKiBBY3Rpb25zICovXG5cbi8qKlxuICogRGVsYXkgdGltZXIgYWN0aW9uLlxuICogQHBhcmFtIHtpbnR9IG1zIC0gRGVsYXkgaW4gbWlsaXNlY29uZHMuXG4gKiBAcmV0dXJuIHtib29sfVxuICovXG5leHBvcnQgY29uc3Qgd2FpdCA9IGFzeW5jIChtcyA9IDEwMDApID0+IHtcbiAgY29uc3Qgc29tZXRoaW5nID0gYXdhaXQgc2xlZXAobXMpO1xuICByZXR1cm4gdHJ1ZVxufVxuXG4vKipcbiAqIERlYnVnZ2luZyBhY3Rpb24uXG4gKiBAcmV0dXJuIHtib29sfVxuICovXG5leHBvcnQgY29uc3QgcmV0dXJuRmFsc2UgPSBhc3luYyAoKSA9PiB7XG4gIHJldHVybiBmYWxzZVxufVxuXG4vKipcbiAqIFNpbXBsZSBldmVudCBicm9hZGNhc3RpbmcgYWN0aW9uLlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IC0gRXZlbnQgdG8gYnJvYWRjYXN0LlxuICogQHBhcmFtIHtGU019IG9ubHkgLSBTZW5kIG1lc3NhZ2UgdG8gc3BlY2lmaWMgc3RhdGUgbWFjaGluZS5cbiAqIEByZXR1cm4ge2Jvb2x9XG4gKi9cbmV4cG9ydCBjb25zdCBzZW5kRXZlbnQgPSBhc3luYyAoZXZlbnQsIG9ubHkgPSBudWxsKSA9PiB7XG4gIEZTTS5icm9hZGNhc3QoZXZlbnQsIG9ubHkpO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9hY3Rpb24uanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==