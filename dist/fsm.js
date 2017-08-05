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
      sm.receive(event);
    });
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
   * Receive an event.
   * @param {string} event
   */
  receive (event) {
    this.log(`received event: ${event}`);

    const links = (this.currentState.links.filter(link => {
        if (link.event == event) return link;
    }));

    if (links.length > 0) this.changeState(links[0].stateName);
  }

  /**
   * Evaluates state by running all actions of current state, returning true when complete.
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYjdjMWE3OTQzYTI4ZTU4Y2IzMDgiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ZzbS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbGl0eS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FjdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7OztBQzdEaUI7O0FBRWpCO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCLHFCQUFxQjtBQUNyQixzQkFBc0I7QUFDdEIsaUZBQXVCO0FBQ3ZCLDRCQUE0QjtBQUM1Qjs7QUFFQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQSxhQUFhLE9BQU87QUFDcEIsY0FBYyxNQUFNO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Es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LE1BQU07QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGNBQWMsT0FBTztBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxXQUFXLElBQUk7QUFDZixZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7O0FBRUE7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7O0FBRUE7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDIiwiZmlsZSI6ImZzbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDIpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGI3YzFhNzk0M2EyOGU1OGNiMzA4IiwiaW1wb3J0IHsgbWFrZUlEIH0gZnJvbSAnLi91dGlsaXR5JztcblxuLyoqIEdlbmVyYWxpemVkIGZpbml0ZSBzdGF0ZSBtYWNoaW5lICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGU00ge1xuICBjb25zdHJ1Y3RvciAobmFtZSA9IFwiRlNNXCIpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuY3VycmVudFN0YXRlOyAgICAgICAgLy8gVGhlIGN1cnJlbnRseSBhY3RpdmUgc3RhdGUgb2YgdGhlIEZTTVxuICAgIHRoaXMuc3RhdGVzID0gW107ICAgICAgICAgLy8gQWxsIHN0YXRlcyB3aXRoaW4gdGhpcyBzdGF0ZSBtYWNoaW5lXG4gICAgdGhpcy5hY3Rpb25zID0ge307ICAgICAgICAvLyBBbGwgQWN0aW9ucyB1c2VkcyB3aXRoaW4gdGhpcyBzdGF0ZSBtYWNoaW5lLCBrZXllZCBieSBpZFxuICAgIHRoaXMuaWQgPSBtYWtlSUQoKTsgICAgICAgLy8gVW5pcXVlIDEyIGNoYXJhY3RlciBzdHJpbmcgaWRcbiAgICB0aGlzLmxvZ01lc3NhZ2VzID0gdHJ1ZTsgIC8vIExvZyBhbGwgaW50ZXJuYWwgbWVzc2FnZXMgdG8gY29uc29sZVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW5kIHJldHVybnMgYSBuZXcgc3RhdGUgbWFjaGluZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgdGhlIHN0YXRlIG1hY2hpbmVcbiAgICovXG4gIHN0YXRpYyBjcmVhdGUgKG5hbWUpIHtcbiAgICBjb25zdCBmc20gPSBuZXcgRlNNKG5hbWUpO1xuICAgIGlmICghRlNNLnN0YXRlTWFjaGluZXMpIEZTTS5zdGF0ZU1hY2hpbmVzID0gW107XG4gICAgRlNNLnN0YXRlTWFjaGluZXMucHVzaChmc20pO1xuICAgIFxuICAgIHJldHVybiBmc207XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBnaXZlbiBldmVudCB0byBhbGwgc3RhdGUgbWFjaGluZXMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCAtIEV2ZW50IHRvIGJyb2FkY2FzdCB0byBGU01zLlxuICAgKi9cbiAgc3RhdGljIGJyb2FkY2FzdCAoZXZlbnQpIHtcbiAgICBGU00uc3RhdGVNYWNoaW5lcy5mb3JFYWNoKHNtID0+IHtcbiAgICAgIHNtLnJlY2VpdmUoZXZlbnQpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHN0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2Ygc3RhdGUgdG8gY3JlYXRlLlxuICAgKiBAcmV0dXJuIHtTdGF0ZX0gQSBTdGF0ZSBvYmplY3QuXG4gICAqL1xuICBhZGRTdGF0ZSAobmFtZSkge1xuICAgIGNvbnN0IHN0YXRlID0gbmV3IFN0YXRlKG5hbWUpO1xuICAgIHN0YXRlLmlkID0gbWFrZUlEKCk7XG4gICAgdGhpcy5zdGF0ZXMucHVzaChzdGF0ZSk7XG5cbiAgICBpZiAoIXRoaXMuY3VycmVudFN0YXRlKSB0aGlzLmN1cnJlbnRTdGF0ZSA9IHN0YXRlO1xuXG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBzdGF0ZSBmcm9tIHN0YXRlcyBhcnJheS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHN0YXRlIHRvIHJlbW92ZS5cbiAgICovXG4gIHJlbW92ZVN0YXRlIChuYW1lKSB7XG4gICAgICBpZiAoIXRoaXMuc3RhdGVFeGlzdHMobmFtZSkpIHRocm93IG5ldyBGU01FcnJvcihcIk5vIHN0YXRlIGZvdW5kIHdpdGggdGhpcyBuYW1lOiBcIiArIG5hbWUpXG5cbiAgICAgIGNvbnN0IGZpbHRlcmVkU3RhdGVzID0gdGhpcy5zdGF0ZXMuZmlsdGVyKHN0YXRlID0+IHtcbiAgICAgICAgaWYgKHN0YXRlLm5hbWUgIT0gbmFtZSkgcmV0dXJuIHN0YXRlO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnN0YXRlcyA9IGZpbHRlcmVkU3RhdGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZSB0aGlzIHN0YXRlIG1hY2hpbmUuXG4gICAqL1xuICBkZXN0cm95ICgpIHtcbiAgICBjb25zdCBpbmRleCA9IEZTTS5zdGF0ZU1hY2hpbmVzLmluZGV4T2YodGhpcyk7XG4gICAgY29uc3QgcHJlID0gRlNNLnN0YXRlTWFjaGluZXMuc2xpY2UoMCwgaW5kZXgpO1xuICAgIGNvbnN0IHBvc3QgPSBGU00uc3RhdGVNYWNoaW5lcy5zbGljZShpbmRleCsxKTtcbiAgICBGU00uc3RhdGVNYWNoaW5lcyA9IHByZS5jb25jYXQocG9zdCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgc3RhdGUgaXMgaW4gc3RhdGVzIGFycmF5LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBzdGF0ZSB0byBjaGVjayBmb3IuXG4gICAqIEByZXR1cm4ge2Jvb2x9XG4gICAqL1xuICBzdGF0ZUV4aXN0cyAobmFtZSkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlcy5zb21lKHN0YXRlID0+IHtcbiAgICAgICAgaWYgKHN0YXRlLm5hbWUgPT0gbmFtZSkgcmV0dXJuIHN0YXRlO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYSBzdGF0ZSBjb250YWlucyBhIGxpbmsgdG8gYSBnaXZlbiBzdGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlRnJvbSAtIFRoZSBzdGF0ZSB0byBjaGVjayBmb3IgbGlua3MuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZVRvIC0gVGhlIHN0YXRlIGJlaW5nIGxpbmtlZCB0by5cbiAgICogQHJldHVybiB7Ym9vbH1cbiAgICovXG4gIGxpbmtFeGlzdHMgKHN0YXRlRnJvbSwgc3RhdGVUbykge1xuICAgIGNvbnN0IGZyb21TdGF0ZSA9IHRoaXMuZmluZFN0YXRlKHN0YXRlRnJvbSk7XG4gICAgY29uc3QgZXhpc3RzID0gZnJvbVN0YXRlLmxpbmtzLnNvbWUoc3RhdGVMaW5rID0+IHtcbiAgICAgICAgaWYgKHN0YXRlTGluay5zdGF0ZU5hbWUgPT0gc3RhdGVUbykgcmV0dXJuIHN0YXRlTGluaztcbiAgICB9KTtcblxuICAgIHJldHVybiBleGlzdHM7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBhbiBhY3Rpb24gZXhpc3RzIHdpdGhpbiBhIGdpdmVuIHN0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVOYW1lIC0gTmFtZSBvZiBzdGF0ZSB0byBzZWFyY2ggZm9yIGFjdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uSUQgLSBJRCBvZiBBY3Rpb24gdG8gZmluZC5cbiAgICovXG4gICBhY3Rpb25FeGlzdHMgKHN0YXRlTmFtZSwgYWN0aW9uSUQpIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmluZFN0YXRlKHN0YXRlTmFtZSk7XG4gICAgY29uc3QgZXhpc3RzID0gc3RhdGUuYWN0aW9ucy5pbmRleE9mKGFjdGlvbklEKTtcblxuICAgIHJldHVybiAoZXhpc3RzID4gLTEpO1xuICAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIGEgc3RhdGUgYnkgbmFtZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHN0YXRlIHRvIGZpbmQuXG4gICAqIEByZXR1cm4ge1N0YXRlfSBBIFN0YXRlIG9iamVjdC5cbiAgICovXG4gIGZpbmRTdGF0ZSAobmFtZSkge1xuICAgIGNvbnN0IGZvdW5kU3RhdGUgPSB0aGlzLnN0YXRlcy5maWx0ZXIoc3RhdGUgPT4ge1xuICAgICAgaWYgKHN0YXRlLm5hbWUgPT0gbmFtZSkgcmV0dXJuIHN0YXRlO1xuICAgIH0pO1xuXG4gICAgaWYgKGZvdW5kU3RhdGUubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIGZvdW5kU3RhdGVbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBGU01FcnJvcihcIk5vIHN0YXRlIGZvdW5kIHdpdGggdGhpcyBuYW1lOiBcIiArIG5hbWUpXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBsaW5rIGJldHdlZW4gdHdvIHN0YXRlcyBmb3IgYSBnaXZlbiBldmVudC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlRnJvbSAtIFN0YXRlIHRvIHJlZ2lzdGVyIGxpbmsgb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZVRvIC0gU3RhdGUgdG8gbGluayB0by5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IC0gRXZlbnQgd2hpY2ggZXhlY3V0ZXMgdGhlIGxpbmsuXG4gICAqL1xuICBsaW5rU3RhdGUgKHN0YXRlRnJvbSwgc3RhdGVUbywgZXZlbnQpIHtcbiAgICBjb25zdCBsaW5rID0gbmV3IExpbmsoZXZlbnQsIHN0YXRlVG8pO1xuXG4gICAgY29uc3QgZnJvbVN0YXRlID0gdGhpcy5maW5kU3RhdGUoc3RhdGVGcm9tKTtcbiAgICBmcm9tU3RhdGUubGlua3MucHVzaChsaW5rKTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIFJlY2VpdmUgYW4gZXZlbnQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFxuICAgKi9cbiAgcmVjZWl2ZSAoZXZlbnQpIHtcbiAgICB0aGlzLmxvZyhgcmVjZWl2ZWQgZXZlbnQ6ICR7ZXZlbnR9YCk7XG5cbiAgICBjb25zdCBsaW5rcyA9ICh0aGlzLmN1cnJlbnRTdGF0ZS5saW5rcy5maWx0ZXIobGluayA9PiB7XG4gICAgICAgIGlmIChsaW5rLmV2ZW50ID09IGV2ZW50KSByZXR1cm4gbGluaztcbiAgICB9KSk7XG5cbiAgICBpZiAobGlua3MubGVuZ3RoID4gMCkgdGhpcy5jaGFuZ2VTdGF0ZShsaW5rc1swXS5zdGF0ZU5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2YWx1YXRlcyBzdGF0ZSBieSBydW5uaW5nIGFsbCBhY3Rpb25zIG9mIGN1cnJlbnQgc3RhdGUsIHJldHVybmluZyB0cnVlIHdoZW4gY29tcGxldGUuXG4gICAqIEByZXR1cm4ge2Jvb2x9IFxuICAgKi9cbiAgYXN5bmMgZXZhbHVhdGUgKCkge1xuICAgIHRoaXMubG9nKGBldmFsdWF0aW5nIHN0YXRlIG9mIG1hY2hpbmVgKTtcbiAgICBcbiAgICBpZiAoIXRoaXMuY3VycmVudFN0YXRlKSB7XG4gICAgICB0aGlzLmxvZyhgY29udGFpbnMgbm8gY3VycmVudCBzdGF0ZWApO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9nKGBjdXJyZW50IHN0YXRlIGlzICR7dGhpcy5jdXJyZW50U3RhdGUubmFtZX1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBhY3Rpb25zID0gdGhpcy5jdXJyZW50U3RhdGUuYWN0aW9ucztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFjdGlvbnMubGVuZ3RoIDsgaSsrKSB7XG4gICAgICBsZXQgYWN0aW9uSUQgPSBhY3Rpb25zW2ldO1xuICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgIGNvbnN0IGxpbWl0ID0gMTA7XG4gICAgICBsZXQgcmVzO1xuICAgICAgd2hpbGUgKCFyZXMgJiYgY291bnQgPCBsaW1pdCkge1xuICAgICAgICBsZXQgYWN0aW9uID0gdGhpcy5hY3Rpb25zW2FjdGlvbklEXTsgXG4gICAgICAgIHJlcyA9IGF3YWl0IGFjdGlvbi5jYWxsYmFjayhhY3Rpb24uYXJncyk7XG4gICAgICAgIGNvdW50Kys7XG4gICAgICAgIGlmIChjb3VudCA9PSBsaW1pdCkge3RoaXMubG9nKFwic3RhdGUgZXZhbHVhdGlvbiBsaW1pdCByZWFjaGVkXCIpO31cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgY3VycmVudCBzdGF0ZSB0byBnaXZlbiBzdGF0ZSBieSBuYW1lLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVOYW1lIC0gU3RhdGUgdG8gY2hhbmdlIHRvLiBcbiAgICovXG4gIGNoYW5nZVN0YXRlIChzdGF0ZU5hbWUpIHtcbiAgICB0aGlzLmxvZyhgY2hhbmdpbmcgc3RhdGUgZnJvbSAke3RoaXMuY3VycmVudFN0YXRlLm5hbWV9IHRvICR7c3RhdGVOYW1lfWApO1xuXG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZpbmRTdGF0ZShzdGF0ZU5hbWUpO1xuICAgIHRoaXMuY3VycmVudFN0YXRlID0gc3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlIHRoZSBuYW1lIG9mIHRoZSBnaXZlbiBzdGF0ZSB3aXRoIHRoZSBuZXcgbmFtZSBwcm92aWRlZC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlTmFtZSAtIE5hbWUgb2Ygc3RhdGUgdG8gcmVuYW1lLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmV3U3RhdGVOYW1lIC0gTmV3IG5hbWUgZm9yIHN0YXRlLlxuICAgKi9cbiAgcmVuYW1lU3RhdGUgKHN0YXRlTmFtZSwgbmV3U3RhdGVOYW1lKSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZpbmRTdGF0ZShzdGF0ZU5hbWUpO1xuICAgIHN0YXRlLm5hbWUgPSBuZXdTdGF0ZU5hbWU7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbiBhY3Rpb24gdG8gYSBnaXZlbiBzdGF0ZS4gUmV0dXJucyB0aGUgQWN0aW9uIGlkLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVOYW1lIC0gTmFtZSBvZiBzdGF0ZSB0byBhZGQgYWN0aW9uIHRvLlxuICAgKiBAcGFyYW0ge0FjdGlvbn0gYWN0aW9uIC0gQWN0aW9uIHRvIGFkZC5cbiAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgQWN0aW9uIElELlxuICAgKi9cbiAgYWRkQWN0aW9uIChzdGF0ZU5hbWUsIGFjdGlvbikge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5maW5kU3RhdGUoc3RhdGVOYW1lKTtcbiAgICBjb25zdCBhY3Rpb25JRCA9IGFjdGlvbi5jcmVhdGVJRCgpO1xuICAgIHRoaXMuYWN0aW9uc1thY3Rpb25JRF0gPSBhY3Rpb247XG4gICAgc3RhdGUuYWN0aW9ucy5wdXNoKGFjdGlvbklEKTtcblxuICAgIHJldHVybiBhY3Rpb25JRFxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYW4gYWN0aW9uIGZyb20gYSBzdGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlTmFtZSAtIE5hbWUgb2YgdGhlIHN0YXRlIHRvIHJlbW92ZSBhY3Rpb24gZnJvbS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvbklEIC0gSUQgb2YgQWN0aW9uIHRvIHJlbW92ZS5cbiAgICovXG4gICByZW1vdmVBY3Rpb24gKHN0YXRlTmFtZSwgYWN0aW9uSUQpIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmluZFN0YXRlKHN0YXRlTmFtZSk7XG5cbiAgICBpZiAoIXRoaXMuYWN0aW9uRXhpc3RzKHN0YXRlTmFtZSwgYWN0aW9uSUQpKSB7XG4gICAgICB0aHJvdyBuZXcgRlNNRXJyb3IoYGFjdGlvbiBkb2VzIG5vdCBleGlzdCB3aXRoaW4gJHtzdGF0ZU5hbWV9YCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaW5kZXggPSBzdGF0ZS5hY3Rpb25zLmluZGV4T2YoYWN0aW9uSUQpO1xuICAgIHN0YXRlLmFjdGlvbnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICBkZWxldGUgdGhpcy5hY3Rpb25zW2FjdGlvbklEXVxuXG4gICAgdGhpcy5sb2coYHJlbW92ZWQgYWN0aW9uIGZyb20gJHtzdGF0ZU5hbWV9YCk7XG4gICB9XG5cbiAgLyoqXG4gICAqIFByaW50cyBmb3JtYXR0ZWQgbWVzc2FnZSB0byBjb25zb2xlLmxvZy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBUZXh0IG9mIG1lc3NhZ2UgdG8gbG9nLlxuICAgKi9cbiAgbG9nICh0ZXh0KSB7XG4gICAgaWYgKHRoaXMubG9nTWVzc2FnZXMpIGNvbnNvbGUubG9nKGAke3RoaXMubmFtZX06ICR7dGV4dH1gKTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIEFjdGl2YXRlIG1lc3NhZ2UgbG9nZ2luZy4gRGVmYXVsdCBpcyB0cnVlLlxuICAgKiBAcGFyYW0ge2Jvb2x9IGFjdGl2ZSAtIElmIHRydWUgd2lsbCBsb2cgYWxsIGZzbSBtZXNzYWdlc1xuICAgKi9cbiAgZGVidWcgKGFjdGl2ZSkge1xuICAgIHRoaXMubG9nTWVzc2FnZXMgPSBhY3RpdmU7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGRpc2NyZXRlIHN0YXRlIG9mIGEgc3RhdGUgbWFjaGluZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiBzdGF0ZS5cbiAqL1xuZnVuY3Rpb24gU3RhdGUgKG5hbWUpIHtcbiAgdGhpcy5uYW1lID0gbmFtZTtcbiAgdGhpcy5pZDtcbiAgdGhpcy5saW5rcyA9IFtdOyAvLyBBbGwgb3V0Ym91bmQgY29ubmVjdGluZyBzdGF0ZXMgZnJvbSB0aGlzIHN0YXRlXG4gIHRoaXMuYWN0aW9ucyA9IFtdOyAvLyBBbGwgYWN0aW9ucyBhc3NpZ25lZCB0byB0aGlzIHN0YXRlO1xufVxuXG4vKipcbiAqIFRoZSB1bmlkaXJlY3Rpb25hbCBsaW5rIGJldHdlZW4gdHdvIHN0YXRlcy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCAtIE5hbWUgb2YgZXZlbnQgdG8gbGlzdGVuIGZvci5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZSAtIE5hbWUgb2YgZXZlbnQgdG8gbGluayB0by5cbiAqL1xuZnVuY3Rpb24gTGluayAoZXZlbnQsIHN0YXRlKSB7XG4gIHRoaXMuZXZlbnQgPSBldmVudDtcbiAgdGhpcy5zdGF0ZU5hbWUgPSBzdGF0ZTtcbn1cblxuLyoqXG4gKiBHZW5lcmFsIEZTTSBlcnJvciBFeGNlcHRpb24gY2xhc3MuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIEVycm9yIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIEZTTUVycm9yICh0ZXh0KSB7XG4gIHRoaXMudGV4dCA9IHRleHQ7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvZnNtLmpzXG4vLyBtb2R1bGUgaWQgPSAwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKiBHZW5lcmFsIHV0aWxpdHkgZnVuY3Rpb25zICovXG5cbi8qKlxuICogUHJvbWlzZSBiYXNlZCBkZWxheSB0aW1lci5cbiAqIEBwYXJhbSB7aW50fSBtcyAtIERlbGF5IGluIG1pbGlzZWNvbmRzLlxuICogQHJldHVybiB7UHJvbWlzZX0gLSBQcm9taXNlIHdyYXBwZWQgdGltZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbGVlcCAobXMpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIHVuaXF1ZSBpZCB7c3RyaW5nfVxuICogQHJldHVybiB7c3RyaW5nfSAtIGEgcmFuZG9tIDEyIGNoYXJhY3RlciBpZCBzdHJpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlSUQgKCkge1xuICBsZXQgdGV4dCA9IFwiXCI7XG4gIGNvbnN0IHBvc3NpYmxlID0gXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OVwiO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMTI7IGkrKylcbiAgICB0ZXh0ICs9IHBvc3NpYmxlLmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwb3NzaWJsZS5sZW5ndGgpKTtcblxuICByZXR1cm4gdGV4dDtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy91dGlsaXR5LmpzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IEFjdGlvbiwgd2FpdCwgc2VuZEV2ZW50IH0gZnJvbSAnLi9hY3Rpb24nO1xuaW1wb3J0IEZTTSBmcm9tICcuL2ZzbSc7XG5cbmV4cG9ydHMuRlNNID0gRlNNO1xuZXhwb3J0cy5BY3Rpb24gPSBBY3Rpb247XG5leHBvcnRzLndhaXQgPSB3YWl0O1xuZXhwb3J0cy5zZW5kRXZlbnQgPSBzZW5kRXZlbnQ7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgRlNNIGZyb20gJy4vZnNtJztcbmltcG9ydCB7IHNsZWVwLCBtYWtlSUQgfSBmcm9tICcuL3V0aWxpdHknO1xuXG4vKiogQWN0aW9uIHR5cGUgYW5kIHByZW1hZGUgYWN0aW9ucyAqL1xuXG4vKipcbiAqIEFjdGlvbnMgcGVyZm9ybWVkIGJ5IGEgc3RhdGUgb25jZSBhY3RpdmF0ZWQuXG4gKiBBY3Rpb25zIG11c3QgYmUgYXN5bmNocm9ub3VzIGFuZCByZXR1cm4gYSB7Ym9vbH0gb24gY29tcGxldGlvbjogXG4gKiAgdHJ1ZSBpZiBmaW5pc2hlZCwgb3IgZmFsc2UgaWYgaXQgbXVzdCBiZSByZWV2YWx1YXRlZC5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gQXN5bmNocm9ub3VzIGZ1bmN0aW9uIHRvIGNhbGwgZHVyaW5nIGFjdGlvbiBldmFsdWF0aW9uLlxuICogQHBhcmFtIHthcmdzKn0gYXJncyAtIEFyZ3VtZW50cyB0byBwYXNzIHRvIGNhbGxiYWNrLlxuICovXG5leHBvcnQgY2xhc3MgQWN0aW9uIHtcbiAgY29uc3RydWN0b3IgKGNhbGxiYWNrLCBhcmdzID0gbnVsbCkge1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLmFyZ3MgPSBhcmdzO1xuICAgIHRoaXMuaWQ7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbmQgcmV0dXJucyBhIHVuaXF1ZSBpZCBzdHJpbmcuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gQSAxMiBjaGFyYWN0ZXIgc3RyaW5nIGlkLlxuICAgKi9cbiAgY3JlYXRlSUQgKCkge1xuICAgIHRoaXMuaWQgPSBtYWtlSUQoKTtcbiAgICByZXR1cm4gdGhpcy5pZDtcbiAgfVxufVxuXG4vKiogQWN0aW9ucyAqL1xuXG4vKipcbiAqIERlbGF5IHRpbWVyIGFjdGlvbi5cbiAqIEBwYXJhbSB7aW50fSBtcyAtIERlbGF5IGluIG1pbGlzZWNvbmRzLlxuICogQHJldHVybiB7Ym9vbH1cbiAqL1xuZXhwb3J0IGNvbnN0IHdhaXQgPSBhc3luYyAobXMgPSAxMDAwKSA9PiB7XG4gIGNvbnN0IHNvbWV0aGluZyA9IGF3YWl0IHNsZWVwKG1zKTtcbiAgcmV0dXJuIHRydWVcbn1cblxuLyoqXG4gKiBEZWJ1Z2dpbmcgYWN0aW9uLlxuICogQHJldHVybiB7Ym9vbH1cbiAqL1xuZXhwb3J0IGNvbnN0IHJldHVybkZhbHNlID0gYXN5bmMgKCkgPT4ge1xuICByZXR1cm4gZmFsc2Vcbn1cblxuLyoqXG4gKiBTaW1wbGUgZXZlbnQgYnJvYWRjYXN0aW5nIGFjdGlvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCAtIEV2ZW50IHRvIGJyb2FkY2FzdC5cbiAqIEByZXR1cm4ge2Jvb2x9XG4gKi9cbmV4cG9ydCBjb25zdCBzZW5kRXZlbnQgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgRlNNLmJyb2FkY2FzdChldmVudCk7XG4gIHJldHVybiB0cnVlO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2FjdGlvbi5qc1xuLy8gbW9kdWxlIGlkID0gM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9