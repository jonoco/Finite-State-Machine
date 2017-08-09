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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utility__ = __webpack_require__(3);


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
   * @param {bool} loop - Whether state should run Actions every evaluation. Default false.
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
   * @return {bool} - Returns true if evaluated.
   */
  async evaluateActions () {
    if (!this.currentState.loop && this.currentState.evaluated) return false;

    const actions = this.currentState.actions;
    for (let i = 0; i < actions.length ; i++) {
      let actionID = actions[i];
      let count = 0;
      const limit = 10;
      let res;
      while (!res && count < limit) {
        let action = this.actions[actionID]; 
        res = await action.callback(...action.args);
        count++;
        if (count == limit) {this.log("state evaluation limit reached");}
      }
    }

    this.currentState.evaluated = true;

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
  this.links = [];        // All outbound connecting states from this state
  this.actions = [];      // All actions assigned to this state;
  this.loop;              // Whether state loops through actions every evaluation
  this.evaluated = false; // Whether state already evaluated actions
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
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__action__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__fsm__ = __webpack_require__(0);



exports.FSM = __WEBPACK_IMPORTED_MODULE_1__fsm__["a" /* default */];
exports.Action = __WEBPACK_IMPORTED_MODULE_0__action__["a" /* Action */];
exports.wait = __WEBPACK_IMPORTED_MODULE_0__action__["c" /* wait */];
exports.sendEvent = __WEBPACK_IMPORTED_MODULE_0__action__["b" /* sendEvent */];


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__fsm__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utility__ = __webpack_require__(3);



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


/***/ }),
/* 3 */
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

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNjk4MTc2YTc1YWU3ZmQ2OTU5MTMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ZzbS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FjdGlvbi5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbGl0eS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7OztBQzdEd0I7O0FBRXhCO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCLHFCQUFxQjtBQUNyQixzQkFBc0I7QUFDdEIscUJBQXFCO0FBQ3JCLGlGQUF1QjtBQUN2Qiw0QkFBNEI7QUFDNUI7O0FBRUE7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQixhQUFhLElBQUk7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QjtBQUNBLE9BQU87QUFDUDtBQUNBLE87QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBLGFBQWEsS0FBSztBQUNsQjtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsMkJBQTJCO0FBQzlDO0FBQ0E7O0FBRUE7QUFDQSxnRkFBc0I7QUFDdEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhLE9BQU87QUFDcEIsYUFBYSxLQUFLO0FBQ2xCLGNBQWMsTUFBTTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhLE9BQU87QUFDcEIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBO0FBQ0E7QUFDQSxhQUFhLE9BQU87QUFDcEIsYUFBYSxPQUFPO0FBQ3BCLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhLE9BQU87QUFDcEIsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQixjQUFjLE1BQU07QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQixhQUFhLE9BQU87QUFDcEIsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCLGNBQWMsS0FBSztBQUNuQjtBQUNBO0FBQ0EsZ0NBQWdDLE1BQU07O0FBRXRDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsY0FBYyxLQUFLO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLOztBQUVBO0FBQ0EsaUNBQWlDLHVCQUF1Qjs7QUFFeEQ7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxjQUFjLEtBQUs7QUFDbkI7QUFDQTtBQUNBOztBQUVBO0FBQ0EsbUJBQW1CLHFCQUFxQjtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEM7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCO0FBQzdCO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsY0FBYyxLQUFLO0FBQ25CO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixvQkFBb0I7QUFDeEM7QUFDQTtBQUNBOztBQUVBO0FBQ0EsRzs7QUFFQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQSxvQ0FBb0MsdUJBQXVCLE1BQU0sVUFBVTs7QUFFM0U7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCLGFBQWEsT0FBTztBQUNwQixjQUFjLE9BQU87QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBOztBQUVBO0FBQ0EseURBQXlELFVBQVU7QUFDbkU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsb0NBQW9DLFVBQVU7QUFDOUM7O0FBRUE7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0EseUNBQXlDLFVBQVUsSUFBSSxLQUFLO0FBQzVEOztBQUVBO0FBQ0E7QUFDQSxhQUFhLEtBQUs7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7O0FBRUE7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQixvQkFBb0I7QUFDcEIsWUFBWTtBQUNaLHlCQUF5QjtBQUN6Qjs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEI7QUFDQTtBQUNBO0FBQ0EsQzs7Ozs7Ozs7OztBQ3ZXa0M7QUFDbEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUNOQTtBQUN3Qjs7QUFFeEI7O0FBRUE7QUFDQTtBQUNBLDhDQUE4QyxLQUFLO0FBQ25EO0FBQ0EsV0FBVyxjQUFjO0FBQ3pCLFdBQVcsTUFBTTtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsY0FBYyxPQUFPO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLFdBQVcsSUFBSTtBQUNmLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsSUFBSTtBQUNmLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEM7Ozs7Ozs7Ozs7QUMxREE7QUFBQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxJQUFJO0FBQ2YsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsdUJBQXVCO0FBQ3ZCLFlBQVksT0FBTztBQUNuQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpQkFBaUIsUUFBUTtBQUN6Qjs7QUFFQTtBQUNBLEMiLCJmaWxlIjoiZnNtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNjk4MTc2YTc1YWU3ZmQ2OTU5MTMiLCJpbXBvcnQgeyBtYWtlSUQsIHNsZWVwIH0gZnJvbSAnLi91dGlsaXR5JztcblxuLyoqIEdlbmVyYWxpemVkIGZpbml0ZSBzdGF0ZSBtYWNoaW5lICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGU00ge1xuICBjb25zdHJ1Y3RvciAobmFtZSA9IFwiRlNNXCIpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuY3VycmVudFN0YXRlOyAgICAgICAgLy8gVGhlIGN1cnJlbnRseSBhY3RpdmUgc3RhdGUgb2YgdGhlIEZTTVxuICAgIHRoaXMuc3RhdGVzID0gW107ICAgICAgICAgLy8gQWxsIHN0YXRlcyB3aXRoaW4gdGhpcyBzdGF0ZSBtYWNoaW5lXG4gICAgdGhpcy5hY3Rpb25zID0ge307ICAgICAgICAvLyBBbGwgQWN0aW9ucyB1c2VkcyB3aXRoaW4gdGhpcyBzdGF0ZSBtYWNoaW5lLCBrZXllZCBieSBpZFxuICAgIHRoaXMuZXZlbnRzID0gW107ICAgICAgICAgLy8gRXZlbnQgcXVldWVcbiAgICB0aGlzLmlkID0gbWFrZUlEKCk7ICAgICAgIC8vIFVuaXF1ZSAxMiBjaGFyYWN0ZXIgc3RyaW5nIGlkXG4gICAgdGhpcy5sb2dNZXNzYWdlcyA9IHRydWU7ICAvLyBMb2cgYWxsIGludGVybmFsIG1lc3NhZ2VzIHRvIGNvbnNvbGVcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuZCByZXR1cm5zIGEgbmV3IHN0YXRlIG1hY2hpbmVcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSBzdGF0ZSBtYWNoaW5lXG4gICAqL1xuICBzdGF0aWMgY3JlYXRlIChuYW1lKSB7XG4gICAgY29uc3QgZnNtID0gbmV3IEZTTShuYW1lKTtcbiAgICBpZiAoIUZTTS5zdGF0ZU1hY2hpbmVzKSBGU00uc3RhdGVNYWNoaW5lcyA9IFtdO1xuICAgIEZTTS5zdGF0ZU1hY2hpbmVzLnB1c2goZnNtKTtcbiAgICBcbiAgICByZXR1cm4gZnNtO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgZ2l2ZW4gZXZlbnQgdG8gYWxsIHN0YXRlIG1hY2hpbmVzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBFdmVudCB0byBicm9hZGNhc3QgdG8gRlNNcy5cbiAgICogQHBhcmFtIHtGU019IG9ubHkgLSBPbmx5IHN0YXRlIG1hY2hpbmUgdG8gcmVjZWl2ZSBldmVudC5cbiAgICovXG4gIHN0YXRpYyBicm9hZGNhc3QgKGV2ZW50LCBvbmx5ID0gbnVsbCkge1xuICAgIEZTTS5zdGF0ZU1hY2hpbmVzLmZvckVhY2goc20gPT4ge1xuICAgICAgaWYgKCFvbmx5KSB7XG4gICAgICAgIHNtLmxpc3RlbihldmVudCk7ICBcbiAgICAgIH0gZWxzZSBpZiAoc20uaWQgPT0gb25seS5pZCkge1xuICAgICAgICBzbS5saXN0ZW4oZXZlbnQpO1xuICAgICAgfSBcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFdmFsdWF0ZXMgZWFjaCBzdGF0ZSBtYWNoaW5lIHNlcXVlbnRpYWxseS5cbiAgICogQHBhcmFtIHtib29sfSBsb29wIC0gV2hldGhlciB0byBldmFsdWF0ZSBhbGwgc3RhdGUgbWFjaGluZXMgb25jZSBvciBjb250aW51YWxseVxuICAgKi9cbiAgc3RhdGljIGFzeW5jIGV2YWx1YXRlIChsb29wKSB7XG4gICAgY29uc3Qgc3RhdGVNYWNoaW5lcyA9IEZTTS5zdGF0ZU1hY2hpbmVzO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RhdGVNYWNoaW5lcy5sZW5ndGggOyBpKyspIHtcbiAgICAgIGF3YWl0IHN0YXRlTWFjaGluZXNbaV0uZXZhbHVhdGUoKTtcbiAgICB9XG4gICAgXG4gICAgaWYgKGxvb3ApIHtcbiAgICAgIGF3YWl0IHNsZWVwKDEwKTsgLy8gV2FpdCAxMCBtcyBiZWZvcmUgbG9vcGluZ1xuICAgICAgRlNNLmV2YWx1YXRlKGxvb3ApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBzdGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHN0YXRlIHRvIGNyZWF0ZS5cbiAgICogQHBhcmFtIHtib29sfSBsb29wIC0gV2hldGhlciBzdGF0ZSBzaG91bGQgcnVuIEFjdGlvbnMgZXZlcnkgZXZhbHVhdGlvbi4gRGVmYXVsdCBmYWxzZS5cbiAgICogQHJldHVybiB7U3RhdGV9IEEgU3RhdGUgb2JqZWN0LlxuICAgKi9cbiAgYWRkU3RhdGUgKG5hbWUsIGxvb3AgPSBmYWxzZSkge1xuICAgIGNvbnN0IHN0YXRlID0gbmV3IFN0YXRlKG5hbWUpO1xuICAgIHN0YXRlLmlkID0gbWFrZUlEKCk7XG4gICAgc3RhdGUubG9vcCA9IGxvb3A7XG4gICAgdGhpcy5zdGF0ZXMucHVzaChzdGF0ZSk7XG5cbiAgICBpZiAoIXRoaXMuY3VycmVudFN0YXRlKSB0aGlzLmN1cnJlbnRTdGF0ZSA9IHN0YXRlO1xuXG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBzdGF0ZSBmcm9tIHN0YXRlcyBhcnJheS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHN0YXRlIHRvIHJlbW92ZS5cbiAgICovXG4gIHJlbW92ZVN0YXRlIChuYW1lKSB7XG4gICAgICBpZiAoIXRoaXMuc3RhdGVFeGlzdHMobmFtZSkpIHRocm93IG5ldyBGU01FcnJvcihcIk5vIHN0YXRlIGZvdW5kIHdpdGggdGhpcyBuYW1lOiBcIiArIG5hbWUpXG5cbiAgICAgIGNvbnN0IGZpbHRlcmVkU3RhdGVzID0gdGhpcy5zdGF0ZXMuZmlsdGVyKHN0YXRlID0+IHtcbiAgICAgICAgaWYgKHN0YXRlLm5hbWUgIT0gbmFtZSkgcmV0dXJuIHN0YXRlO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnN0YXRlcyA9IGZpbHRlcmVkU3RhdGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZSB0aGlzIHN0YXRlIG1hY2hpbmUuXG4gICAqL1xuICBkZXN0cm95ICgpIHtcbiAgICBjb25zdCBpbmRleCA9IEZTTS5zdGF0ZU1hY2hpbmVzLmluZGV4T2YodGhpcyk7XG4gICAgY29uc3QgcHJlID0gRlNNLnN0YXRlTWFjaGluZXMuc2xpY2UoMCwgaW5kZXgpO1xuICAgIGNvbnN0IHBvc3QgPSBGU00uc3RhdGVNYWNoaW5lcy5zbGljZShpbmRleCsxKTtcbiAgICBGU00uc3RhdGVNYWNoaW5lcyA9IHByZS5jb25jYXQocG9zdCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgc3RhdGUgaXMgaW4gc3RhdGVzIGFycmF5LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBzdGF0ZSB0byBjaGVjayBmb3IuXG4gICAqIEByZXR1cm4ge2Jvb2x9XG4gICAqL1xuICBzdGF0ZUV4aXN0cyAobmFtZSkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlcy5zb21lKHN0YXRlID0+IHtcbiAgICAgICAgaWYgKHN0YXRlLm5hbWUgPT0gbmFtZSkgcmV0dXJuIHN0YXRlO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYSBzdGF0ZSBjb250YWlucyBhIGxpbmsgdG8gYSBnaXZlbiBzdGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlRnJvbSAtIFRoZSBzdGF0ZSB0byBjaGVjayBmb3IgbGlua3MuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZVRvIC0gVGhlIHN0YXRlIGJlaW5nIGxpbmtlZCB0by5cbiAgICogQHJldHVybiB7Ym9vbH1cbiAgICovXG4gIGxpbmtFeGlzdHMgKHN0YXRlRnJvbSwgc3RhdGVUbykge1xuICAgIGNvbnN0IGZyb21TdGF0ZSA9IHRoaXMuZmluZFN0YXRlKHN0YXRlRnJvbSk7XG4gICAgY29uc3QgZXhpc3RzID0gZnJvbVN0YXRlLmxpbmtzLnNvbWUoc3RhdGVMaW5rID0+IHtcbiAgICAgICAgaWYgKHN0YXRlTGluay5zdGF0ZU5hbWUgPT0gc3RhdGVUbykgcmV0dXJuIHN0YXRlTGluaztcbiAgICB9KTtcblxuICAgIHJldHVybiBleGlzdHM7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBhbiBhY3Rpb24gZXhpc3RzIHdpdGhpbiBhIGdpdmVuIHN0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVOYW1lIC0gTmFtZSBvZiBzdGF0ZSB0byBzZWFyY2ggZm9yIGFjdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uSUQgLSBJRCBvZiBBY3Rpb24gdG8gZmluZC5cbiAgICovXG4gICBhY3Rpb25FeGlzdHMgKHN0YXRlTmFtZSwgYWN0aW9uSUQpIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmluZFN0YXRlKHN0YXRlTmFtZSk7XG4gICAgY29uc3QgZXhpc3RzID0gc3RhdGUuYWN0aW9ucy5pbmRleE9mKGFjdGlvbklEKTtcblxuICAgIHJldHVybiAoZXhpc3RzID4gLTEpO1xuICAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIGEgc3RhdGUgYnkgbmFtZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHN0YXRlIHRvIGZpbmQuXG4gICAqIEByZXR1cm4ge1N0YXRlfSBBIFN0YXRlIG9iamVjdC5cbiAgICovXG4gIGZpbmRTdGF0ZSAobmFtZSkge1xuICAgIGNvbnN0IGZvdW5kU3RhdGUgPSB0aGlzLnN0YXRlcy5maWx0ZXIoc3RhdGUgPT4ge1xuICAgICAgaWYgKHN0YXRlLm5hbWUgPT0gbmFtZSkgcmV0dXJuIHN0YXRlO1xuICAgIH0pO1xuXG4gICAgaWYgKGZvdW5kU3RhdGUubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIGZvdW5kU3RhdGVbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBGU01FcnJvcihcIk5vIHN0YXRlIGZvdW5kIHdpdGggdGhpcyBuYW1lOiBcIiArIG5hbWUpXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBsaW5rIGJldHdlZW4gdHdvIHN0YXRlcyBmb3IgYSBnaXZlbiBldmVudC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlRnJvbSAtIFN0YXRlIHRvIHJlZ2lzdGVyIGxpbmsgb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZVRvIC0gU3RhdGUgdG8gbGluayB0by5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IC0gRXZlbnQgd2hpY2ggZXhlY3V0ZXMgdGhlIGxpbmsuXG4gICAqL1xuICBsaW5rU3RhdGUgKHN0YXRlRnJvbSwgc3RhdGVUbywgZXZlbnQpIHtcbiAgICBjb25zdCBsaW5rID0gbmV3IExpbmsoZXZlbnQsIHN0YXRlVG8pO1xuXG4gICAgY29uc3QgZnJvbVN0YXRlID0gdGhpcy5maW5kU3RhdGUoc3RhdGVGcm9tKTtcbiAgICBmcm9tU3RhdGUubGlua3MucHVzaChsaW5rKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMaXN0ZW5zIGZvciBldmVudHMgYW5kIHF1ZXVlcyB0aGVtLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBFdmVudCByZWNlaXZlZCBmcm9tIEZTTS5cbiAgICovXG4gIGxpc3RlbiAoZXZlbnQpIHtcbiAgICB0aGlzLmV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIFJlY2VpdmUgYW4gZXZlbnQgdG8gYmUgcHJvY2Vzc2VkIGZyb20gdGhlIGV2ZW50IHF1ZXVlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRcbiAgICogQHJldHVybiB7Ym9vbH0gLSBSZXR1cm5zIHRydWUgaWYgc3RhdGUgY2hhbmdlIG9jY3VycmVkLlxuICAgKi9cbiAgcmVjZWl2ZSAoZXZlbnQpIHtcbiAgICB0aGlzLmxvZyhgcmVjZWl2ZWQgZXZlbnQ6ICR7ZXZlbnR9YCk7XG4gICAgXG4gICAgaWYgKCF0aGlzLmN1cnJlbnRTdGF0ZSkgcmV0dXJuO1xuICAgIGlmICh0aGlzLmN1cnJlbnRTdGF0ZS5saW5rcy5sZW5ndGggPT0gMCkgcmV0dXJuO1xuXG4gICAgY29uc3QgbGlua3MgPSAodGhpcy5jdXJyZW50U3RhdGUubGlua3MuZmlsdGVyKGxpbmsgPT4ge1xuICAgICAgICBpZiAobGluay5ldmVudCA9PSBldmVudCkgcmV0dXJuIGxpbms7XG4gICAgfSkpO1xuXG4gICAgaWYgKGxpbmtzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuY2hhbmdlU3RhdGUobGlua3NbMF0uc3RhdGVOYW1lKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFdmFsdWF0ZXMgdGhlIGN1cnJlbnQgc3RhdGUuIFJldHVybmluZyB0cnVlIGlmIGV2YWx1YXRlZC5cbiAgICogQHJldHVybiB7Ym9vbH0gLSBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBzdGF0ZSB3YXMgZXZhbHVhdGVkLlxuICAgKi9cbiAgYXN5bmMgZXZhbHVhdGUgKCkge1xuICAgIGlmICghdGhpcy5jdXJyZW50U3RhdGUpIHtcbiAgICAgIHRoaXMubG9nKGBjb250YWlucyBubyBjdXJyZW50IHN0YXRlYCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBcblxuICAgIHRoaXMubG9nKGBldmFsdWF0aW5nIHN0YXRlIG9mIG1hY2hpbmVgKTtcbiAgICB0aGlzLmxvZyhgY3VycmVudCBzdGF0ZSBpcyAke3RoaXMuY3VycmVudFN0YXRlLm5hbWV9YCk7XG5cbiAgICBhd2FpdCB0aGlzLmV2YWx1YXRlQWN0aW9ucygpO1xuICAgIGF3YWl0IHRoaXMuZXZhbHVhdGVFdmVudHMoKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2YWx1dGVzIHRoZSBjdXJyZW50IHN0YXRlJ3MgYWN0aW9ucy5cbiAgICogQHJldHVybiB7Ym9vbH0gLSBSZXR1cm5zIHRydWUgaWYgZXZhbHVhdGVkLlxuICAgKi9cbiAgYXN5bmMgZXZhbHVhdGVBY3Rpb25zICgpIHtcbiAgICBpZiAoIXRoaXMuY3VycmVudFN0YXRlLmxvb3AgJiYgdGhpcy5jdXJyZW50U3RhdGUuZXZhbHVhdGVkKSByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBhY3Rpb25zID0gdGhpcy5jdXJyZW50U3RhdGUuYWN0aW9ucztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFjdGlvbnMubGVuZ3RoIDsgaSsrKSB7XG4gICAgICBsZXQgYWN0aW9uSUQgPSBhY3Rpb25zW2ldO1xuICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgIGNvbnN0IGxpbWl0ID0gMTA7XG4gICAgICBsZXQgcmVzO1xuICAgICAgd2hpbGUgKCFyZXMgJiYgY291bnQgPCBsaW1pdCkge1xuICAgICAgICBsZXQgYWN0aW9uID0gdGhpcy5hY3Rpb25zW2FjdGlvbklEXTsgXG4gICAgICAgIHJlcyA9IGF3YWl0IGFjdGlvbi5jYWxsYmFjayguLi5hY3Rpb24uYXJncyk7XG4gICAgICAgIGNvdW50Kys7XG4gICAgICAgIGlmIChjb3VudCA9PSBsaW1pdCkge3RoaXMubG9nKFwic3RhdGUgZXZhbHVhdGlvbiBsaW1pdCByZWFjaGVkXCIpO31cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnRTdGF0ZS5ldmFsdWF0ZWQgPSB0cnVlO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogRXZhbHVhdGVzIGV2ZW50IHF1ZXVlIHRvIGNoZWNrIGZvciBzdGF0ZSBjaGFuZ2VzLlxuICAgKiBAcmV0dXJuIHtib29sfSAtIFJldHVybnMgdHJ1ZSBpZiBldmFsdWF0ZWQuXG4gICAqL1xuICBhc3luYyBldmFsdWF0ZUV2ZW50cyAoKSB7XG4gICAgY29uc3QgZXZlbnRzID0gdGhpcy5ldmVudHM7XG4gICAgZm9yIChsZXQgaSA9IDAgOyBpIDwgZXZlbnRzLmxlbmd0aCA7IGkrKykge1xuICAgICAgaWYgKHRoaXMucmVjZWl2ZShldmVudHNbaV0pKSBicmVhaztcbiAgICB9XG4gICAgdGhpcy5ldmVudHMgPSBbXTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9ICBcblxuICAvKipcbiAgICogQ2hhbmdlIGN1cnJlbnQgc3RhdGUgdG8gZ2l2ZW4gc3RhdGUgYnkgbmFtZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlTmFtZSAtIFN0YXRlIHRvIGNoYW5nZSB0by4gXG4gICAqL1xuICBjaGFuZ2VTdGF0ZSAoc3RhdGVOYW1lKSB7XG4gICAgdGhpcy5sb2coYGNoYW5naW5nIHN0YXRlIGZyb20gJHt0aGlzLmN1cnJlbnRTdGF0ZS5uYW1lfSB0byAke3N0YXRlTmFtZX1gKTtcblxuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5maW5kU3RhdGUoc3RhdGVOYW1lKTtcbiAgICB0aGlzLmN1cnJlbnRTdGF0ZSA9IHN0YXRlO1xuICAgIHRoaXMuY3VycmVudFN0YXRlLmV2YWx1YXRlZCA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIENoYW5nZSB0aGUgbmFtZSBvZiB0aGUgZ2l2ZW4gc3RhdGUgd2l0aCB0aGUgbmV3IG5hbWUgcHJvdmlkZWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZU5hbWUgLSBOYW1lIG9mIHN0YXRlIHRvIHJlbmFtZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5ld1N0YXRlTmFtZSAtIE5ldyBuYW1lIGZvciBzdGF0ZS5cbiAgICovXG4gIHJlbmFtZVN0YXRlIChzdGF0ZU5hbWUsIG5ld1N0YXRlTmFtZSkge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5maW5kU3RhdGUoc3RhdGVOYW1lKTtcbiAgICBzdGF0ZS5uYW1lID0gbmV3U3RhdGVOYW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYW4gYWN0aW9uIHRvIGEgZ2l2ZW4gc3RhdGUuIFJldHVybnMgdGhlIEFjdGlvbiBpZC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlTmFtZSAtIE5hbWUgb2Ygc3RhdGUgdG8gYWRkIGFjdGlvbiB0by5cbiAgICogQHBhcmFtIHtBY3Rpb259IGFjdGlvbiAtIEFjdGlvbiB0byBhZGQuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIEFjdGlvbiBJRC5cbiAgICovXG4gIGFkZEFjdGlvbiAoc3RhdGVOYW1lLCBhY3Rpb24pIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmluZFN0YXRlKHN0YXRlTmFtZSk7XG4gICAgY29uc3QgYWN0aW9uSUQgPSBhY3Rpb24uY3JlYXRlSUQoKTtcbiAgICB0aGlzLmFjdGlvbnNbYWN0aW9uSURdID0gYWN0aW9uO1xuICAgIHN0YXRlLmFjdGlvbnMucHVzaChhY3Rpb25JRCk7XG5cbiAgICByZXR1cm4gYWN0aW9uSURcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFuIGFjdGlvbiBmcm9tIGEgc3RhdGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZU5hbWUgLSBOYW1lIG9mIHRoZSBzdGF0ZSB0byByZW1vdmUgYWN0aW9uIGZyb20uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb25JRCAtIElEIG9mIEFjdGlvbiB0byByZW1vdmUuXG4gICAqL1xuICAgcmVtb3ZlQWN0aW9uIChzdGF0ZU5hbWUsIGFjdGlvbklEKSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZpbmRTdGF0ZShzdGF0ZU5hbWUpO1xuXG4gICAgaWYgKCF0aGlzLmFjdGlvbkV4aXN0cyhzdGF0ZU5hbWUsIGFjdGlvbklEKSkge1xuICAgICAgdGhyb3cgbmV3IEZTTUVycm9yKGBhY3Rpb24gZG9lcyBub3QgZXhpc3Qgd2l0aGluICR7c3RhdGVOYW1lfWApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGluZGV4ID0gc3RhdGUuYWN0aW9ucy5pbmRleE9mKGFjdGlvbklEKTtcbiAgICBzdGF0ZS5hY3Rpb25zLnNwbGljZShpbmRleCwgMSk7XG4gICAgZGVsZXRlIHRoaXMuYWN0aW9uc1thY3Rpb25JRF1cblxuICAgIHRoaXMubG9nKGByZW1vdmVkIGFjdGlvbiBmcm9tICR7c3RhdGVOYW1lfWApO1xuICAgfVxuXG4gIC8qKlxuICAgKiBQcmludHMgZm9ybWF0dGVkIG1lc3NhZ2UgdG8gY29uc29sZS5sb2cuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGV4dCBvZiBtZXNzYWdlIHRvIGxvZy5cbiAgICovXG4gIGxvZyAodGV4dCkge1xuICAgIGlmICh0aGlzLmxvZ01lc3NhZ2VzKSBjb25zb2xlLmxvZyhgJHt0aGlzLm5hbWV9OiAke3RleHR9YCk7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBBY3RpdmF0ZSBtZXNzYWdlIGxvZ2dpbmcuIERlZmF1bHQgaXMgdHJ1ZS5cbiAgICogQHBhcmFtIHtib29sfSBhY3RpdmUgLSBJZiB0cnVlIHdpbGwgbG9nIGFsbCBmc20gbWVzc2FnZXNcbiAgICovXG4gIGRlYnVnIChhY3RpdmUpIHtcbiAgICB0aGlzLmxvZ01lc3NhZ2VzID0gYWN0aXZlO1xuICB9XG59XG5cbi8qKlxuICogQSBkaXNjcmV0ZSBzdGF0ZSBvZiBhIHN0YXRlIG1hY2hpbmUuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2Ygc3RhdGUuXG4gKi9cbmZ1bmN0aW9uIFN0YXRlIChuYW1lKSB7XG4gIHRoaXMubmFtZSA9IG5hbWU7XG4gIHRoaXMuaWQ7XG4gIHRoaXMubGlua3MgPSBbXTsgICAgICAgIC8vIEFsbCBvdXRib3VuZCBjb25uZWN0aW5nIHN0YXRlcyBmcm9tIHRoaXMgc3RhdGVcbiAgdGhpcy5hY3Rpb25zID0gW107ICAgICAgLy8gQWxsIGFjdGlvbnMgYXNzaWduZWQgdG8gdGhpcyBzdGF0ZTtcbiAgdGhpcy5sb29wOyAgICAgICAgICAgICAgLy8gV2hldGhlciBzdGF0ZSBsb29wcyB0aHJvdWdoIGFjdGlvbnMgZXZlcnkgZXZhbHVhdGlvblxuICB0aGlzLmV2YWx1YXRlZCA9IGZhbHNlOyAvLyBXaGV0aGVyIHN0YXRlIGFscmVhZHkgZXZhbHVhdGVkIGFjdGlvbnNcbn1cblxuLyoqXG4gKiBUaGUgdW5pZGlyZWN0aW9uYWwgbGluayBiZXR3ZWVuIHR3byBzdGF0ZXMuXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBOYW1lIG9mIGV2ZW50IHRvIGxpc3RlbiBmb3IuXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RhdGUgLSBOYW1lIG9mIGV2ZW50IHRvIGxpbmsgdG8uXG4gKi9cbmZ1bmN0aW9uIExpbmsgKGV2ZW50LCBzdGF0ZSkge1xuICB0aGlzLmV2ZW50ID0gZXZlbnQ7XG4gIHRoaXMuc3RhdGVOYW1lID0gc3RhdGU7XG59XG5cbi8qKlxuICogR2VuZXJhbCBGU00gZXJyb3IgRXhjZXB0aW9uIGNsYXNzLlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBFcnJvciBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBGU01FcnJvciAodGV4dCkge1xuICB0aGlzLnRleHQgPSB0ZXh0O1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2ZzbS5qc1xuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgeyBBY3Rpb24sIHdhaXQsIHNlbmRFdmVudCB9IGZyb20gJy4vYWN0aW9uJztcbmltcG9ydCBGU00gZnJvbSAnLi9mc20nO1xuXG5leHBvcnRzLkZTTSA9IEZTTTtcbmV4cG9ydHMuQWN0aW9uID0gQWN0aW9uO1xuZXhwb3J0cy53YWl0ID0gd2FpdDtcbmV4cG9ydHMuc2VuZEV2ZW50ID0gc2VuZEV2ZW50O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IEZTTSBmcm9tICcuL2ZzbSc7XG5pbXBvcnQgeyBzbGVlcCwgbWFrZUlEIH0gZnJvbSAnLi91dGlsaXR5JztcblxuLyoqIEFjdGlvbiB0eXBlIGFuZCBwcmVtYWRlIGFjdGlvbnMgKi9cblxuLyoqXG4gKiBBY3Rpb25zIHBlcmZvcm1lZCBieSBhIHN0YXRlIG9uY2UgYWN0aXZhdGVkLlxuICogQWN0aW9ucyBtdXN0IGJlIGFzeW5jaHJvbm91cyBhbmQgcmV0dXJuIGEge2Jvb2x9IG9uIGNvbXBsZXRpb246IFxuICogIHRydWUgaWYgZmluaXNoZWQsIG9yIGZhbHNlIGlmIGl0IG11c3QgYmUgcmVldmFsdWF0ZWQuXG4gKiBAcGFyYW0ge0FzeW5jRnVuY3Rpb259IGNhbGxiYWNrIC0gQXN5bmNocm9ub3VzIGZ1bmN0aW9uIHRvIGNhbGwgZHVyaW5nIGFjdGlvbiBldmFsdWF0aW9uLlxuICogQHBhcmFtIHthcmdzKn0gYXJncyAtIEFyZ3VtZW50cyB0byBwYXNzIHRvIGNhbGxiYWNrLlxuICovXG5leHBvcnQgY2xhc3MgQWN0aW9uIHtcbiAgY29uc3RydWN0b3IgKGNhbGxiYWNrLCAuLi5hcmdzKSB7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHRoaXMuYXJncyA9IGFyZ3M7XG4gICAgdGhpcy5pZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuZCByZXR1cm5zIGEgdW5pcXVlIGlkIHN0cmluZy5cbiAgICogQHJldHVybiB7c3RyaW5nfSBBIDEyIGNoYXJhY3RlciBzdHJpbmcgaWQuXG4gICAqL1xuICBjcmVhdGVJRCAoKSB7XG4gICAgdGhpcy5pZCA9IG1ha2VJRCgpO1xuICAgIHJldHVybiB0aGlzLmlkO1xuICB9XG59XG5cbi8qKiBBY3Rpb25zICovXG5cbi8qKlxuICogRGVsYXkgdGltZXIgYWN0aW9uLlxuICogQHBhcmFtIHtpbnR9IG1zIC0gRGVsYXkgaW4gbWlsaXNlY29uZHMuXG4gKiBAcmV0dXJuIHtib29sfVxuICovXG5leHBvcnQgY29uc3Qgd2FpdCA9IGFzeW5jIChtcyA9IDEwMDApID0+IHtcbiAgY29uc3Qgc29tZXRoaW5nID0gYXdhaXQgc2xlZXAobXMpO1xuICByZXR1cm4gdHJ1ZVxufVxuXG4vKipcbiAqIERlYnVnZ2luZyBhY3Rpb24uXG4gKiBAcmV0dXJuIHtib29sfVxuICovXG5leHBvcnQgY29uc3QgcmV0dXJuRmFsc2UgPSBhc3luYyAoKSA9PiB7XG4gIHJldHVybiBmYWxzZVxufVxuXG4vKipcbiAqIFNpbXBsZSBldmVudCBicm9hZGNhc3RpbmcgYWN0aW9uLlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IC0gRXZlbnQgdG8gYnJvYWRjYXN0LlxuICogQHBhcmFtIHtGU019IG9ubHkgLSBTZW5kIG1lc3NhZ2UgdG8gc3BlY2lmaWMgc3RhdGUgbWFjaGluZS5cbiAqIEByZXR1cm4ge2Jvb2x9XG4gKi9cbmV4cG9ydCBjb25zdCBzZW5kRXZlbnQgPSBhc3luYyAoZXZlbnQsIG9ubHkgPSBudWxsKSA9PiB7XG4gIEZTTS5icm9hZGNhc3QoZXZlbnQsIG9ubHkpO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9hY3Rpb24uanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqIEdlbmVyYWwgdXRpbGl0eSBmdW5jdGlvbnMgKi9cblxuLyoqXG4gKiBQcm9taXNlIGJhc2VkIGRlbGF5IHRpbWVyLlxuICogQHBhcmFtIHtpbnR9IG1zIC0gRGVsYXkgaW4gbWlsaXNlY29uZHMuXG4gKiBAcmV0dXJuIHtQcm9taXNlfSAtIFByb21pc2Ugd3JhcHBlZCB0aW1lci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNsZWVwIChtcykge1xuICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgdW5pcXVlIGlkIHtzdHJpbmd9XG4gKiBAcmV0dXJuIHtzdHJpbmd9IC0gYSByYW5kb20gMTIgY2hhcmFjdGVyIGlkIHN0cmluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1ha2VJRCAoKSB7XG4gIGxldCB0ZXh0ID0gXCJcIjtcbiAgY29uc3QgcG9zc2libGUgPSBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5XCI7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMjsgaSsrKVxuICAgIHRleHQgKz0gcG9zc2libGUuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlLmxlbmd0aCkpO1xuXG4gIHJldHVybiB0ZXh0O1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3V0aWxpdHkuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==