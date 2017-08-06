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
   */
  static broadcast (event) {
    FSM.stateMachines.forEach(sm => {
      sm.listen(event);
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
   * @return {State} A State object.
   */
  addState (name) {
    const state = new State(name);
    state.id = Object(__WEBPACK_IMPORTED_MODULE_0__utility__["a" /* makeID */])();
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
    this.log(`received event: ${event}`);
    
    if (!this.currentState) return;
    if (this.currentState.links.length == 0) return;

    const links = (this.currentState.links.filter(link => {
        if (link.event == event) return link;
    }));

    if (links.length > 0) {
      this.changeState(links[0].stateName);
      return true;
    }

    return false;
  }

  /**
   * Evaluates the current state, returning true when complete.
   * @return {bool} 
   */
  async evaluate () {
    this.log(`evaluating state of machine`);
    
    if (!this.currentState) {
      this.log(`contains no current state`);
      return true;
    } else {
      this.log(`current state is ${this.currentState.name}`);
    }

    // Evaluates actions of the current state
    const actions = this.currentState.actions;
    for (let i = 0; i < actions.length ; i++) {
      let actionID = actions[i];
      let count = 0;
      const limit = 10;
      let res;
      while (!res && count < limit) {
        let action = this.actions[actionID]; 
        res = await action.callback(action.args);
        count++;
        if (count == limit) {this.log("state evaluation limit reached");}
      }
    }

    // Evaluates event queue to check for state changes
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
   * @return {string} The Action ID.
   */
  addAction (stateName, action) {
    const state = this.findState(stateName);
    const actionID = action.createID();
    this.actions[actionID] = action;
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
  this.links = []; // All outbound connecting states from this state
  this.actions = []; // All actions assigned to this state;
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
 * @param {function} callback - Asynchronous function to call during action evaluation.
 * @param {args*} args - Arguments to pass to callback.
 */
class Action {
  constructor (callback, args = null) {
    this.callback = callback;
    this.args = args;
    this.id;
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
 * @return {bool}
 */
const sendEvent = async (event) => {
  __WEBPACK_IMPORTED_MODULE_0__fsm__["a" /* default */].broadcast(event);
  return true;
}
/* harmony export (immutable) */ __webpack_exports__["b"] = sendEvent;


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgOWI2YWZkZGVjMjUzNzdhZjdiNGUiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ZzbS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbGl0eS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FjdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7OztBQzdEd0I7O0FBRXhCO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCLHFCQUFxQjtBQUNyQixzQkFBc0I7QUFDdEIscUJBQXFCO0FBQ3JCLGlGQUF1QjtBQUN2Qiw0QkFBNEI7QUFDNUI7O0FBRUE7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0EsYUFBYSxLQUFLO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQiwyQkFBMkI7QUFDOUM7QUFDQTs7QUFFQTtBQUNBLGdGQUFzQjtBQUN0QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWEsT0FB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QVcsSUFBSTtBQUNmLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHVCQUF1QjtBQUN2QixZQUFZLE9BQU87QUFDbkI7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsaUJBQWlCLFFBQVE7QUFDekI7O0FBRUE7QUFDQSxDOzs7Ozs7Ozs7O0FDdkJrQztBQUNsQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7OztBQ05BO0FBQ3dCOztBQUV4Qjs7QUFFQTtBQUNBO0FBQ0EsOENBQThDLEtBQUs7QUFDbkQ7QUFDQSxXQUFXLFNBQVM7QUFDcEIsV0FBVyxNQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxjQUFjLE9BQU87QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxJQUFJO0FBQ2YsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBOztBQUVBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBOztBQUVBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQyIsImZpbGUiOiJmc20uanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAyKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA5YjZhZmRkZWMyNTM3N2FmN2I0ZSIsImltcG9ydCB7IG1ha2VJRCwgc2xlZXAgfSBmcm9tICcuL3V0aWxpdHknO1xuXG4vKiogR2VuZXJhbGl6ZWQgZmluaXRlIHN0YXRlIG1hY2hpbmUgKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZTTSB7XG4gIGNvbnN0cnVjdG9yIChuYW1lID0gXCJGU01cIikge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5jdXJyZW50U3RhdGU7ICAgICAgICAvLyBUaGUgY3VycmVudGx5IGFjdGl2ZSBzdGF0ZSBvZiB0aGUgRlNNXG4gICAgdGhpcy5zdGF0ZXMgPSBbXTsgICAgICAgICAvLyBBbGwgc3RhdGVzIHdpdGhpbiB0aGlzIHN0YXRlIG1hY2hpbmVcbiAgICB0aGlzLmFjdGlvbnMgPSB7fTsgICAgICAgIC8vIEFsbCBBY3Rpb25zIHVzZWRzIHdpdGhpbiB0aGlzIHN0YXRlIG1hY2hpbmUsIGtleWVkIGJ5IGlkXG4gICAgdGhpcy5ldmVudHMgPSBbXTsgICAgICAgICAvLyBFdmVudCBxdWV1ZVxuICAgIHRoaXMuaWQgPSBtYWtlSUQoKTsgICAgICAgLy8gVW5pcXVlIDEyIGNoYXJhY3RlciBzdHJpbmcgaWRcbiAgICB0aGlzLmxvZ01lc3NhZ2VzID0gdHJ1ZTsgIC8vIExvZyBhbGwgaW50ZXJuYWwgbWVzc2FnZXMgdG8gY29uc29sZVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW5kIHJldHVybnMgYSBuZXcgc3RhdGUgbWFjaGluZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgdGhlIHN0YXRlIG1hY2hpbmVcbiAgICovXG4gIHN0YXRpYyBjcmVhdGUgKG5hbWUpIHtcbiAgICBjb25zdCBmc20gPSBuZXcgRlNNKG5hbWUpO1xuICAgIGlmICghRlNNLnN0YXRlTWFjaGluZXMpIEZTTS5zdGF0ZU1hY2hpbmVzID0gW107XG4gICAgRlNNLnN0YXRlTWFjaGluZXMucHVzaChmc20pO1xuICAgIFxuICAgIHJldHVybiBmc207XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBnaXZlbiBldmVudCB0byBhbGwgc3RhdGUgbWFjaGluZXMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCAtIEV2ZW50IHRvIGJyb2FkY2FzdCB0byBGU01zLlxuICAgKi9cbiAgc3RhdGljIGJyb2FkY2FzdCAoZXZlbnQpIHtcbiAgICBGU00uc3RhdGVNYWNoaW5lcy5mb3JFYWNoKHNtID0+IHtcbiAgICAgIHNtLmxpc3RlbihldmVudCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRXZhbHVhdGVzIGVhY2ggc3RhdGUgbWFjaGluZSBzZXF1ZW50aWFsbHkuXG4gICAqIEBwYXJhbSB7Ym9vbH0gbG9vcCAtIFdoZXRoZXIgdG8gZXZhbHVhdGUgYWxsIHN0YXRlIG1hY2hpbmVzIG9uY2Ugb3IgY29udGludWFsbHlcbiAgICovXG4gIHN0YXRpYyBhc3luYyBldmFsdWF0ZSAobG9vcCkge1xuICAgIGNvbnN0IHN0YXRlTWFjaGluZXMgPSBGU00uc3RhdGVNYWNoaW5lcztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0YXRlTWFjaGluZXMubGVuZ3RoIDsgaSsrKSB7XG4gICAgICBhd2FpdCBzdGF0ZU1hY2hpbmVzW2ldLmV2YWx1YXRlKCk7XG4gICAgfVxuICAgIFxuICAgIGlmIChsb29wKSB7XG4gICAgICBhd2FpdCBzbGVlcCgxMCk7IC8vIFdhaXQgMTAgbXMgYmVmb3JlIGxvb3BpbmdcbiAgICAgIEZTTS5ldmFsdWF0ZShsb29wKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgc3RhdGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiBzdGF0ZSB0byBjcmVhdGUuXG4gICAqIEByZXR1cm4ge1N0YXRlfSBBIFN0YXRlIG9iamVjdC5cbiAgICovXG4gIGFkZFN0YXRlIChuYW1lKSB7XG4gICAgY29uc3Qgc3RhdGUgPSBuZXcgU3RhdGUobmFtZSk7XG4gICAgc3RhdGUuaWQgPSBtYWtlSUQoKTtcbiAgICB0aGlzLnN0YXRlcy5wdXNoKHN0YXRlKTtcblxuICAgIGlmICghdGhpcy5jdXJyZW50U3RhdGUpIHRoaXMuY3VycmVudFN0YXRlID0gc3RhdGU7XG5cbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIHN0YXRlIGZyb20gc3RhdGVzIGFycmF5LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2Ygc3RhdGUgdG8gcmVtb3ZlLlxuICAgKi9cbiAgcmVtb3ZlU3RhdGUgKG5hbWUpIHtcbiAgICAgIGlmICghdGhpcy5zdGF0ZUV4aXN0cyhuYW1lKSkgdGhyb3cgbmV3IEZTTUVycm9yKFwiTm8gc3RhdGUgZm91bmQgd2l0aCB0aGlzIG5hbWU6IFwiICsgbmFtZSlcblxuICAgICAgY29uc3QgZmlsdGVyZWRTdGF0ZXMgPSB0aGlzLnN0YXRlcy5maWx0ZXIoc3RhdGUgPT4ge1xuICAgICAgICBpZiAoc3RhdGUubmFtZSAhPSBuYW1lKSByZXR1cm4gc3RhdGU7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuc3RhdGVzID0gZmlsdGVyZWRTdGF0ZXM7XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlIHRoaXMgc3RhdGUgbWFjaGluZS5cbiAgICovXG4gIGRlc3Ryb3kgKCkge1xuICAgIGNvbnN0IGluZGV4ID0gRlNNLnN0YXRlTWFjaGluZXMuaW5kZXhPZih0aGlzKTtcbiAgICBjb25zdCBwcmUgPSBGU00uc3RhdGVNYWNoaW5lcy5zbGljZSgwLCBpbmRleCk7XG4gICAgY29uc3QgcG9zdCA9IEZTTS5zdGF0ZU1hY2hpbmVzLnNsaWNlKGluZGV4KzEpO1xuICAgIEZTTS5zdGF0ZU1hY2hpbmVzID0gcHJlLmNvbmNhdChwb3N0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBzdGF0ZSBpcyBpbiBzdGF0ZXMgYXJyYXkuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHN0YXRlIHRvIGNoZWNrIGZvci5cbiAgICogQHJldHVybiB7Ym9vbH1cbiAgICovXG4gIHN0YXRlRXhpc3RzIChuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGVzLnNvbWUoc3RhdGUgPT4ge1xuICAgICAgICBpZiAoc3RhdGUubmFtZSA9PSBuYW1lKSByZXR1cm4gc3RhdGU7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBhIHN0YXRlIGNvbnRhaW5zIGEgbGluayB0byBhIGdpdmVuIHN0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVGcm9tIC0gVGhlIHN0YXRlIHRvIGNoZWNrIGZvciBsaW5rcy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlVG8gLSBUaGUgc3RhdGUgYmVpbmcgbGlua2VkIHRvLlxuICAgKiBAcmV0dXJuIHtib29sfVxuICAgKi9cbiAgbGlua0V4aXN0cyAoc3RhdGVGcm9tLCBzdGF0ZVRvKSB7XG4gICAgY29uc3QgZnJvbVN0YXRlID0gdGhpcy5maW5kU3RhdGUoc3RhdGVGcm9tKTtcbiAgICBjb25zdCBleGlzdHMgPSBmcm9tU3RhdGUubGlua3Muc29tZShzdGF0ZUxpbmsgPT4ge1xuICAgICAgICBpZiAoc3RhdGVMaW5rLnN0YXRlTmFtZSA9PSBzdGF0ZVRvKSByZXR1cm4gc3RhdGVMaW5rO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGV4aXN0cztcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIGFuIGFjdGlvbiBleGlzdHMgd2l0aGluIGEgZ2l2ZW4gc3RhdGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZU5hbWUgLSBOYW1lIG9mIHN0YXRlIHRvIHNlYXJjaCBmb3IgYWN0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb25JRCAtIElEIG9mIEFjdGlvbiB0byBmaW5kLlxuICAgKi9cbiAgIGFjdGlvbkV4aXN0cyAoc3RhdGVOYW1lLCBhY3Rpb25JRCkge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5maW5kU3RhdGUoc3RhdGVOYW1lKTtcbiAgICBjb25zdCBleGlzdHMgPSBzdGF0ZS5hY3Rpb25zLmluZGV4T2YoYWN0aW9uSUQpO1xuXG4gICAgcmV0dXJuIChleGlzdHMgPiAtMSk7XG4gICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgYSBzdGF0ZSBieSBuYW1lLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2Ygc3RhdGUgdG8gZmluZC5cbiAgICogQHJldHVybiB7U3RhdGV9IEEgU3RhdGUgb2JqZWN0LlxuICAgKi9cbiAgZmluZFN0YXRlIChuYW1lKSB7XG4gICAgY29uc3QgZm91bmRTdGF0ZSA9IHRoaXMuc3RhdGVzLmZpbHRlcihzdGF0ZSA9PiB7XG4gICAgICBpZiAoc3RhdGUubmFtZSA9PSBuYW1lKSByZXR1cm4gc3RhdGU7XG4gICAgfSk7XG5cbiAgICBpZiAoZm91bmRTdGF0ZS5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gZm91bmRTdGF0ZVswXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEZTTUVycm9yKFwiTm8gc3RhdGUgZm91bmQgd2l0aCB0aGlzIG5hbWU6IFwiICsgbmFtZSlcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGxpbmsgYmV0d2VlbiB0d28gc3RhdGVzIGZvciBhIGdpdmVuIGV2ZW50LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVGcm9tIC0gU3RhdGUgdG8gcmVnaXN0ZXIgbGluayBvbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlVG8gLSBTdGF0ZSB0byBsaW5rIHRvLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBFdmVudCB3aGljaCBleGVjdXRlcyB0aGUgbGluay5cbiAgICovXG4gIGxpbmtTdGF0ZSAoc3RhdGVGcm9tLCBzdGF0ZVRvLCBldmVudCkge1xuICAgIGNvbnN0IGxpbmsgPSBuZXcgTGluayhldmVudCwgc3RhdGVUbyk7XG5cbiAgICBjb25zdCBmcm9tU3RhdGUgPSB0aGlzLmZpbmRTdGF0ZShzdGF0ZUZyb20pO1xuICAgIGZyb21TdGF0ZS5saW5rcy5wdXNoKGxpbmspO1xuICB9XG5cbiAgLyoqXG4gICAqIExpc3RlbnMgZm9yIGV2ZW50cyBhbmQgcXVldWVzIHRoZW0uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCAtIEV2ZW50IHJlY2VpdmVkIGZyb20gRlNNLlxuICAgKi9cbiAgbGlzdGVuIChldmVudCkge1xuICAgIHRoaXMuZXZlbnRzLnB1c2goZXZlbnQpO1xuICB9XG4gIFxuICAvKipcbiAgICogUmVjZWl2ZSBhbiBldmVudCB0byBiZSBwcm9jZXNzZWQgZnJvbSB0aGUgZXZlbnQgcXVldWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFxuICAgKiBAcmV0dXJuIHtib29sfSAtIFJldHVybnMgdHJ1ZSBpZiBzdGF0ZSBjaGFuZ2Ugb2NjdXJyZWQuXG4gICAqL1xuICByZWNlaXZlIChldmVudCkge1xuICAgIHRoaXMubG9nKGByZWNlaXZlZCBldmVudDogJHtldmVudH1gKTtcbiAgICBcbiAgICBpZiAoIXRoaXMuY3VycmVudFN0YXRlKSByZXR1cm47XG4gICAgaWYgKHRoaXMuY3VycmVudFN0YXRlLmxpbmtzLmxlbmd0aCA9PSAwKSByZXR1cm47XG5cbiAgICBjb25zdCBsaW5rcyA9ICh0aGlzLmN1cnJlbnRTdGF0ZS5saW5rcy5maWx0ZXIobGluayA9PiB7XG4gICAgICAgIGlmIChsaW5rLmV2ZW50ID09IGV2ZW50KSByZXR1cm4gbGluaztcbiAgICB9KSk7XG5cbiAgICBpZiAobGlua3MubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5jaGFuZ2VTdGF0ZShsaW5rc1swXS5zdGF0ZU5hbWUpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2YWx1YXRlcyB0aGUgY3VycmVudCBzdGF0ZSwgcmV0dXJuaW5nIHRydWUgd2hlbiBjb21wbGV0ZS5cbiAgICogQHJldHVybiB7Ym9vbH0gXG4gICAqL1xuICBhc3luYyBldmFsdWF0ZSAoKSB7XG4gICAgdGhpcy5sb2coYGV2YWx1YXRpbmcgc3RhdGUgb2YgbWFjaGluZWApO1xuICAgIFxuICAgIGlmICghdGhpcy5jdXJyZW50U3RhdGUpIHtcbiAgICAgIHRoaXMubG9nKGBjb250YWlucyBubyBjdXJyZW50IHN0YXRlYCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sb2coYGN1cnJlbnQgc3RhdGUgaXMgJHt0aGlzLmN1cnJlbnRTdGF0ZS5uYW1lfWApO1xuICAgIH1cblxuICAgIC8vIEV2YWx1YXRlcyBhY3Rpb25zIG9mIHRoZSBjdXJyZW50IHN0YXRlXG4gICAgY29uc3QgYWN0aW9ucyA9IHRoaXMuY3VycmVudFN0YXRlLmFjdGlvbnM7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhY3Rpb25zLmxlbmd0aCA7IGkrKykge1xuICAgICAgbGV0IGFjdGlvbklEID0gYWN0aW9uc1tpXTtcbiAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICBjb25zdCBsaW1pdCA9IDEwO1xuICAgICAgbGV0IHJlcztcbiAgICAgIHdoaWxlICghcmVzICYmIGNvdW50IDwgbGltaXQpIHtcbiAgICAgICAgbGV0IGFjdGlvbiA9IHRoaXMuYWN0aW9uc1thY3Rpb25JRF07IFxuICAgICAgICByZXMgPSBhd2FpdCBhY3Rpb24uY2FsbGJhY2soYWN0aW9uLmFyZ3MpO1xuICAgICAgICBjb3VudCsrO1xuICAgICAgICBpZiAoY291bnQgPT0gbGltaXQpIHt0aGlzLmxvZyhcInN0YXRlIGV2YWx1YXRpb24gbGltaXQgcmVhY2hlZFwiKTt9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRXZhbHVhdGVzIGV2ZW50IHF1ZXVlIHRvIGNoZWNrIGZvciBzdGF0ZSBjaGFuZ2VzXG4gICAgY29uc3QgZXZlbnRzID0gdGhpcy5ldmVudHM7XG4gICAgZm9yIChsZXQgaSA9IDAgOyBpIDwgZXZlbnRzLmxlbmd0aCA7IGkrKykge1xuICAgICAgaWYgKHRoaXMucmVjZWl2ZShldmVudHNbaV0pKSBicmVhaztcbiAgICB9XG4gICAgdGhpcy5ldmVudHMgPSBbXTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENoYW5nZSBjdXJyZW50IHN0YXRlIHRvIGdpdmVuIHN0YXRlIGJ5IG5hbWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZU5hbWUgLSBTdGF0ZSB0byBjaGFuZ2UgdG8uIFxuICAgKi9cbiAgY2hhbmdlU3RhdGUgKHN0YXRlTmFtZSkge1xuICAgIHRoaXMubG9nKGBjaGFuZ2luZyBzdGF0ZSBmcm9tICR7dGhpcy5jdXJyZW50U3RhdGUubmFtZX0gdG8gJHtzdGF0ZU5hbWV9YCk7XG5cbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmluZFN0YXRlKHN0YXRlTmFtZSk7XG4gICAgdGhpcy5jdXJyZW50U3RhdGUgPSBzdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgdGhlIG5hbWUgb2YgdGhlIGdpdmVuIHN0YXRlIHdpdGggdGhlIG5ldyBuYW1lIHByb3ZpZGVkLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVOYW1lIC0gTmFtZSBvZiBzdGF0ZSB0byByZW5hbWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuZXdTdGF0ZU5hbWUgLSBOZXcgbmFtZSBmb3Igc3RhdGUuXG4gICAqL1xuICByZW5hbWVTdGF0ZSAoc3RhdGVOYW1lLCBuZXdTdGF0ZU5hbWUpIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmluZFN0YXRlKHN0YXRlTmFtZSk7XG4gICAgc3RhdGUubmFtZSA9IG5ld1N0YXRlTmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGFjdGlvbiB0byBhIGdpdmVuIHN0YXRlLiBSZXR1cm5zIHRoZSBBY3Rpb24gaWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZU5hbWUgLSBOYW1lIG9mIHN0YXRlIHRvIGFkZCBhY3Rpb24gdG8uXG4gICAqIEBwYXJhbSB7QWN0aW9ufSBhY3Rpb24gLSBBY3Rpb24gdG8gYWRkLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBBY3Rpb24gSUQuXG4gICAqL1xuICBhZGRBY3Rpb24gKHN0YXRlTmFtZSwgYWN0aW9uKSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZpbmRTdGF0ZShzdGF0ZU5hbWUpO1xuICAgIGNvbnN0IGFjdGlvbklEID0gYWN0aW9uLmNyZWF0ZUlEKCk7XG4gICAgdGhpcy5hY3Rpb25zW2FjdGlvbklEXSA9IGFjdGlvbjtcbiAgICBzdGF0ZS5hY3Rpb25zLnB1c2goYWN0aW9uSUQpO1xuXG4gICAgcmV0dXJuIGFjdGlvbklEXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbiBhY3Rpb24gZnJvbSBhIHN0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVOYW1lIC0gTmFtZSBvZiB0aGUgc3RhdGUgdG8gcmVtb3ZlIGFjdGlvbiBmcm9tLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uSUQgLSBJRCBvZiBBY3Rpb24gdG8gcmVtb3ZlLlxuICAgKi9cbiAgIHJlbW92ZUFjdGlvbiAoc3RhdGVOYW1lLCBhY3Rpb25JRCkge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5maW5kU3RhdGUoc3RhdGVOYW1lKTtcblxuICAgIGlmICghdGhpcy5hY3Rpb25FeGlzdHMoc3RhdGVOYW1lLCBhY3Rpb25JRCkpIHtcbiAgICAgIHRocm93IG5ldyBGU01FcnJvcihgYWN0aW9uIGRvZXMgbm90IGV4aXN0IHdpdGhpbiAke3N0YXRlTmFtZX1gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBpbmRleCA9IHN0YXRlLmFjdGlvbnMuaW5kZXhPZihhY3Rpb25JRCk7XG4gICAgc3RhdGUuYWN0aW9ucy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIGRlbGV0ZSB0aGlzLmFjdGlvbnNbYWN0aW9uSURdXG5cbiAgICB0aGlzLmxvZyhgcmVtb3ZlZCBhY3Rpb24gZnJvbSAke3N0YXRlTmFtZX1gKTtcbiAgIH1cblxuICAvKipcbiAgICogUHJpbnRzIGZvcm1hdHRlZCBtZXNzYWdlIHRvIGNvbnNvbGUubG9nLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIFRleHQgb2YgbWVzc2FnZSB0byBsb2cuXG4gICAqL1xuICBsb2cgKHRleHQpIHtcbiAgICBpZiAodGhpcy5sb2dNZXNzYWdlcykgY29uc29sZS5sb2coYCR7dGhpcy5uYW1lfTogJHt0ZXh0fWApO1xuICB9XG4gIFxuICAvKipcbiAgICogQWN0aXZhdGUgbWVzc2FnZSBsb2dnaW5nLiBEZWZhdWx0IGlzIHRydWUuXG4gICAqIEBwYXJhbSB7Ym9vbH0gYWN0aXZlIC0gSWYgdHJ1ZSB3aWxsIGxvZyBhbGwgZnNtIG1lc3NhZ2VzXG4gICAqL1xuICBkZWJ1ZyAoYWN0aXZlKSB7XG4gICAgdGhpcy5sb2dNZXNzYWdlcyA9IGFjdGl2ZTtcbiAgfVxufVxuXG4vKipcbiAqIEEgZGlzY3JldGUgc3RhdGUgb2YgYSBzdGF0ZSBtYWNoaW5lLlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHN0YXRlLlxuICovXG5mdW5jdGlvbiBTdGF0ZSAobmFtZSkge1xuICB0aGlzLm5hbWUgPSBuYW1lO1xuICB0aGlzLmlkO1xuICB0aGlzLmxpbmtzID0gW107IC8vIEFsbCBvdXRib3VuZCBjb25uZWN0aW5nIHN0YXRlcyBmcm9tIHRoaXMgc3RhdGVcbiAgdGhpcy5hY3Rpb25zID0gW107IC8vIEFsbCBhY3Rpb25zIGFzc2lnbmVkIHRvIHRoaXMgc3RhdGU7XG59XG5cbi8qKlxuICogVGhlIHVuaWRpcmVjdGlvbmFsIGxpbmsgYmV0d2VlbiB0d28gc3RhdGVzLlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IC0gTmFtZSBvZiBldmVudCB0byBsaXN0ZW4gZm9yLlxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlIC0gTmFtZSBvZiBldmVudCB0byBsaW5rIHRvLlxuICovXG5mdW5jdGlvbiBMaW5rIChldmVudCwgc3RhdGUpIHtcbiAgdGhpcy5ldmVudCA9IGV2ZW50O1xuICB0aGlzLnN0YXRlTmFtZSA9IHN0YXRlO1xufVxuXG4vKipcbiAqIEdlbmVyYWwgRlNNIGVycm9yIEV4Y2VwdGlvbiBjbGFzcy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gRXJyb3IgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gRlNNRXJyb3IgKHRleHQpIHtcbiAgdGhpcy50ZXh0ID0gdGV4dDtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9mc20uanNcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqIEdlbmVyYWwgdXRpbGl0eSBmdW5jdGlvbnMgKi9cblxuLyoqXG4gKiBQcm9taXNlIGJhc2VkIGRlbGF5IHRpbWVyLlxuICogQHBhcmFtIHtpbnR9IG1zIC0gRGVsYXkgaW4gbWlsaXNlY29uZHMuXG4gKiBAcmV0dXJuIHtQcm9taXNlfSAtIFByb21pc2Ugd3JhcHBlZCB0aW1lci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNsZWVwIChtcykge1xuICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgdW5pcXVlIGlkIHtzdHJpbmd9XG4gKiBAcmV0dXJuIHtzdHJpbmd9IC0gYSByYW5kb20gMTIgY2hhcmFjdGVyIGlkIHN0cmluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1ha2VJRCAoKSB7XG4gIGxldCB0ZXh0ID0gXCJcIjtcbiAgY29uc3QgcG9zc2libGUgPSBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5XCI7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMjsgaSsrKVxuICAgIHRleHQgKz0gcG9zc2libGUuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlLmxlbmd0aCkpO1xuXG4gIHJldHVybiB0ZXh0O1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3V0aWxpdHkuanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHsgQWN0aW9uLCB3YWl0LCBzZW5kRXZlbnQgfSBmcm9tICcuL2FjdGlvbic7XG5pbXBvcnQgRlNNIGZyb20gJy4vZnNtJztcblxuZXhwb3J0cy5GU00gPSBGU007XG5leHBvcnRzLkFjdGlvbiA9IEFjdGlvbjtcbmV4cG9ydHMud2FpdCA9IHdhaXQ7XG5leHBvcnRzLnNlbmRFdmVudCA9IHNlbmRFdmVudDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCBGU00gZnJvbSAnLi9mc20nO1xuaW1wb3J0IHsgc2xlZXAsIG1ha2VJRCB9IGZyb20gJy4vdXRpbGl0eSc7XG5cbi8qKiBBY3Rpb24gdHlwZSBhbmQgcHJlbWFkZSBhY3Rpb25zICovXG5cbi8qKlxuICogQWN0aW9ucyBwZXJmb3JtZWQgYnkgYSBzdGF0ZSBvbmNlIGFjdGl2YXRlZC5cbiAqIEFjdGlvbnMgbXVzdCBiZSBhc3luY2hyb25vdXMgYW5kIHJldHVybiBhIHtib29sfSBvbiBjb21wbGV0aW9uOiBcbiAqICB0cnVlIGlmIGZpbmlzaGVkLCBvciBmYWxzZSBpZiBpdCBtdXN0IGJlIHJlZXZhbHVhdGVkLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBBc3luY2hyb25vdXMgZnVuY3Rpb24gdG8gY2FsbCBkdXJpbmcgYWN0aW9uIGV2YWx1YXRpb24uXG4gKiBAcGFyYW0ge2FyZ3MqfSBhcmdzIC0gQXJndW1lbnRzIHRvIHBhc3MgdG8gY2FsbGJhY2suXG4gKi9cbmV4cG9ydCBjbGFzcyBBY3Rpb24ge1xuICBjb25zdHJ1Y3RvciAoY2FsbGJhY2ssIGFyZ3MgPSBudWxsKSB7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHRoaXMuYXJncyA9IGFyZ3M7XG4gICAgdGhpcy5pZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuZCByZXR1cm5zIGEgdW5pcXVlIGlkIHN0cmluZy5cbiAgICogQHJldHVybiB7c3RyaW5nfSBBIDEyIGNoYXJhY3RlciBzdHJpbmcgaWQuXG4gICAqL1xuICBjcmVhdGVJRCAoKSB7XG4gICAgdGhpcy5pZCA9IG1ha2VJRCgpO1xuICAgIHJldHVybiB0aGlzLmlkO1xuICB9XG59XG5cbi8qKiBBY3Rpb25zICovXG5cbi8qKlxuICogRGVsYXkgdGltZXIgYWN0aW9uLlxuICogQHBhcmFtIHtpbnR9IG1zIC0gRGVsYXkgaW4gbWlsaXNlY29uZHMuXG4gKiBAcmV0dXJuIHtib29sfVxuICovXG5leHBvcnQgY29uc3Qgd2FpdCA9IGFzeW5jIChtcyA9IDEwMDApID0+IHtcbiAgY29uc3Qgc29tZXRoaW5nID0gYXdhaXQgc2xlZXAobXMpO1xuICByZXR1cm4gdHJ1ZVxufVxuXG4vKipcbiAqIERlYnVnZ2luZyBhY3Rpb24uXG4gKiBAcmV0dXJuIHtib29sfVxuICovXG5leHBvcnQgY29uc3QgcmV0dXJuRmFsc2UgPSBhc3luYyAoKSA9PiB7XG4gIHJldHVybiBmYWxzZVxufVxuXG4vKipcbiAqIFNpbXBsZSBldmVudCBicm9hZGNhc3RpbmcgYWN0aW9uLlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IC0gRXZlbnQgdG8gYnJvYWRjYXN0LlxuICogQHJldHVybiB7Ym9vbH1cbiAqL1xuZXhwb3J0IGNvbnN0IHNlbmRFdmVudCA9IGFzeW5jIChldmVudCkgPT4ge1xuICBGU00uYnJvYWRjYXN0KGV2ZW50KTtcbiAgcmV0dXJuIHRydWU7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvYWN0aW9uLmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=