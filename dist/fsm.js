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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgY2E1NmE1OWQ4YjVjZDcyYjYxMGEiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ZzbS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbGl0eS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FjdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7OztBQzdEd0I7O0FBRXhCO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCLHFCQUFxQjtBQUNyQixzQkFBc0I7QUFDdEIscUJBQXFCO0FBQ3JCLGlGQUF1QjtBQUN2Qiw0QkFBNEI7QUFDNUI7O0FBRUE7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQixhQUFhLElBQUk7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QjtBQUNBLE9BQU87QUFDUDtBQUNBLE87QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBLGFBQWEsS0FBSztBQUNsQjtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsMkJBQTJCO0FBQzlDO0FBQ0E7O0FBRUE7QUFDQSxn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QWtCO0FBQ2xCLG9CQUFvQjtBQUNwQixZQUFZO0FBQ1oseUJBQXlCO0FBQ3pCOztBQUVBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQjtBQUNBO0FBQ0E7QUFDQSxDOzs7Ozs7OztBQ3RXQTtBQUFBOztBQUVBO0FBQ0E7QUFDQSxXQUFXLElBQUk7QUFDZixZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx1QkFBdUI7QUFDdkIsWUFBWSxPQUFPO0FBQ25CO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGlCQUFpQixRQUFRO0FBQ3pCOztBQUVBO0FBQ0EsQzs7Ozs7Ozs7OztBQ3ZCa0M7QUFDbEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUNOQTtBQUN3Qjs7QUFFeEI7O0FBRUE7QUFDQTtBQUNBLDhDQUE4QyxLQUFLO0FBQ25EO0FBQ0EsV0FBVyxjQUFjO0FBQ3pCLFdBQVcsTUFBTTtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsY0FBYyxPQUFPO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLFdBQVcsSUFBSTtBQUNmLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsSUFBSTtBQUNmLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEMiLCJmaWxlIjoiZnNtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgY2E1NmE1OWQ4YjVjZDcyYjYxMGEiLCJpbXBvcnQgeyBtYWtlSUQsIHNsZWVwIH0gZnJvbSAnLi91dGlsaXR5JztcblxuLyoqIEdlbmVyYWxpemVkIGZpbml0ZSBzdGF0ZSBtYWNoaW5lICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGU00ge1xuICBjb25zdHJ1Y3RvciAobmFtZSA9IFwiRlNNXCIpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuY3VycmVudFN0YXRlOyAgICAgICAgLy8gVGhlIGN1cnJlbnRseSBhY3RpdmUgc3RhdGUgb2YgdGhlIEZTTVxuICAgIHRoaXMuc3RhdGVzID0gW107ICAgICAgICAgLy8gQWxsIHN0YXRlcyB3aXRoaW4gdGhpcyBzdGF0ZSBtYWNoaW5lXG4gICAgdGhpcy5hY3Rpb25zID0ge307ICAgICAgICAvLyBBbGwgQWN0aW9ucyB1c2VkcyB3aXRoaW4gdGhpcyBzdGF0ZSBtYWNoaW5lLCBrZXllZCBieSBpZFxuICAgIHRoaXMuZXZlbnRzID0gW107ICAgICAgICAgLy8gRXZlbnQgcXVldWVcbiAgICB0aGlzLmlkID0gbWFrZUlEKCk7ICAgICAgIC8vIFVuaXF1ZSAxMiBjaGFyYWN0ZXIgc3RyaW5nIGlkXG4gICAgdGhpcy5sb2dNZXNzYWdlcyA9IHRydWU7ICAvLyBMb2cgYWxsIGludGVybmFsIG1lc3NhZ2VzIHRvIGNvbnNvbGVcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuZCByZXR1cm5zIGEgbmV3IHN0YXRlIG1hY2hpbmVcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSBzdGF0ZSBtYWNoaW5lXG4gICAqL1xuICBzdGF0aWMgY3JlYXRlIChuYW1lKSB7XG4gICAgY29uc3QgZnNtID0gbmV3IEZTTShuYW1lKTtcbiAgICBpZiAoIUZTTS5zdGF0ZU1hY2hpbmVzKSBGU00uc3RhdGVNYWNoaW5lcyA9IFtdO1xuICAgIEZTTS5zdGF0ZU1hY2hpbmVzLnB1c2goZnNtKTtcbiAgICBcbiAgICByZXR1cm4gZnNtO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgZ2l2ZW4gZXZlbnQgdG8gYWxsIHN0YXRlIG1hY2hpbmVzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBFdmVudCB0byBicm9hZGNhc3QgdG8gRlNNcy5cbiAgICogQHBhcmFtIHtGU019IG9ubHkgLSBPbmx5IHN0YXRlIG1hY2hpbmUgdG8gcmVjZWl2ZSBldmVudC5cbiAgICovXG4gIHN0YXRpYyBicm9hZGNhc3QgKGV2ZW50LCBvbmx5ID0gbnVsbCkge1xuICAgIEZTTS5zdGF0ZU1hY2hpbmVzLmZvckVhY2goc20gPT4ge1xuICAgICAgaWYgKCFvbmx5KSB7XG4gICAgICAgIHNtLmxpc3RlbihldmVudCk7ICBcbiAgICAgIH0gZWxzZSBpZiAoc20uaWQgPT0gb25seS5pZCkge1xuICAgICAgICBzbS5saXN0ZW4oZXZlbnQpO1xuICAgICAgfSBcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFdmFsdWF0ZXMgZWFjaCBzdGF0ZSBtYWNoaW5lIHNlcXVlbnRpYWxseS5cbiAgICogQHBhcmFtIHtib29sfSBsb29wIC0gV2hldGhlciB0byBldmFsdWF0ZSBhbGwgc3RhdGUgbWFjaGluZXMgb25jZSBvciBjb250aW51YWxseVxuICAgKi9cbiAgc3RhdGljIGFzeW5jIGV2YWx1YXRlIChsb29wKSB7XG4gICAgY29uc3Qgc3RhdGVNYWNoaW5lcyA9IEZTTS5zdGF0ZU1hY2hpbmVzO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RhdGVNYWNoaW5lcy5sZW5ndGggOyBpKyspIHtcbiAgICAgIGF3YWl0IHN0YXRlTWFjaGluZXNbaV0uZXZhbHVhdGUoKTtcbiAgICB9XG4gICAgXG4gICAgaWYgKGxvb3ApIHtcbiAgICAgIGF3YWl0IHNsZWVwKDEwKTsgLy8gV2FpdCAxMCBtcyBiZWZvcmUgbG9vcGluZ1xuICAgICAgRlNNLmV2YWx1YXRlKGxvb3ApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBzdGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHN0YXRlIHRvIGNyZWF0ZS5cbiAgICogQHBhcmFtIHtib29sfSBsb29wIC0gV2hldGhlciBzdGF0ZSBzaG91bGQgcnVuIEFjdGlvbnMgZXZlcnkgZXZhbHVhdGlvbi4gRGVmYXVsdCBmYWxzZS5cbiAgICogQHJldHVybiB7U3RhdGV9IEEgU3RhdGUgb2JqZWN0LlxuICAgKi9cbiAgYWRkU3RhdGUgKG5hbWUsIGxvb3AgPSBmYWxzZSkge1xuICAgIGNvbnN0IHN0YXRlID0gbmV3IFN0YXRlKG5hbWUpO1xuICAgIHN0YXRlLmlkID0gbWFrZUlEKCk7XG4gICAgc3RhdGUubG9vcCA9IGxvb3A7XG4gICAgdGhpcy5zdGF0ZXMucHVzaChzdGF0ZSk7XG5cbiAgICBpZiAoIXRoaXMuY3VycmVudFN0YXRlKSB0aGlzLmN1cnJlbnRTdGF0ZSA9IHN0YXRlO1xuXG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBzdGF0ZSBmcm9tIHN0YXRlcyBhcnJheS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHN0YXRlIHRvIHJlbW92ZS5cbiAgICovXG4gIHJlbW92ZVN0YXRlIChuYW1lKSB7XG4gICAgICBpZiAoIXRoaXMuc3RhdGVFeGlzdHMobmFtZSkpIHRocm93IG5ldyBGU01FcnJvcihcIk5vIHN0YXRlIGZvdW5kIHdpdGggdGhpcyBuYW1lOiBcIiArIG5hbWUpXG5cbiAgICAgIGNvbnN0IGZpbHRlcmVkU3RhdGVzID0gdGhpcy5zdGF0ZXMuZmlsdGVyKHN0YXRlID0+IHtcbiAgICAgICAgaWYgKHN0YXRlLm5hbWUgIT0gbmFtZSkgcmV0dXJuIHN0YXRlO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnN0YXRlcyA9IGZpbHRlcmVkU3RhdGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZSB0aGlzIHN0YXRlIG1hY2hpbmUuXG4gICAqL1xuICBkZXN0cm95ICgpIHtcbiAgICBjb25zdCBpbmRleCA9IEZTTS5zdGF0ZU1hY2hpbmVzLmluZGV4T2YodGhpcyk7XG4gICAgY29uc3QgcHJlID0gRlNNLnN0YXRlTWFjaGluZXMuc2xpY2UoMCwgaW5kZXgpO1xuICAgIGNvbnN0IHBvc3QgPSBGU00uc3RhdGVNYWNoaW5lcy5zbGljZShpbmRleCsxKTtcbiAgICBGU00uc3RhdGVNYWNoaW5lcyA9IHByZS5jb25jYXQocG9zdCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgc3RhdGUgaXMgaW4gc3RhdGVzIGFycmF5LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBzdGF0ZSB0byBjaGVjayBmb3IuXG4gICAqIEByZXR1cm4ge2Jvb2x9XG4gICAqL1xuICBzdGF0ZUV4aXN0cyAobmFtZSkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlcy5zb21lKHN0YXRlID0+IHtcbiAgICAgICAgaWYgKHN0YXRlLm5hbWUgPT0gbmFtZSkgcmV0dXJuIHN0YXRlO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYSBzdGF0ZSBjb250YWlucyBhIGxpbmsgdG8gYSBnaXZlbiBzdGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlRnJvbSAtIFRoZSBzdGF0ZSB0byBjaGVjayBmb3IgbGlua3MuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZVRvIC0gVGhlIHN0YXRlIGJlaW5nIGxpbmtlZCB0by5cbiAgICogQHJldHVybiB7Ym9vbH1cbiAgICovXG4gIGxpbmtFeGlzdHMgKHN0YXRlRnJvbSwgc3RhdGVUbykge1xuICAgIGNvbnN0IGZyb21TdGF0ZSA9IHRoaXMuZmluZFN0YXRlKHN0YXRlRnJvbSk7XG4gICAgY29uc3QgZXhpc3RzID0gZnJvbVN0YXRlLmxpbmtzLnNvbWUoc3RhdGVMaW5rID0+IHtcbiAgICAgICAgaWYgKHN0YXRlTGluay5zdGF0ZU5hbWUgPT0gc3RhdGVUbykgcmV0dXJuIHN0YXRlTGluaztcbiAgICB9KTtcblxuICAgIHJldHVybiBleGlzdHM7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBhbiBhY3Rpb24gZXhpc3RzIHdpdGhpbiBhIGdpdmVuIHN0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVOYW1lIC0gTmFtZSBvZiBzdGF0ZSB0byBzZWFyY2ggZm9yIGFjdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uSUQgLSBJRCBvZiBBY3Rpb24gdG8gZmluZC5cbiAgICovXG4gICBhY3Rpb25FeGlzdHMgKHN0YXRlTmFtZSwgYWN0aW9uSUQpIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmluZFN0YXRlKHN0YXRlTmFtZSk7XG4gICAgY29uc3QgZXhpc3RzID0gc3RhdGUuYWN0aW9ucy5pbmRleE9mKGFjdGlvbklEKTtcblxuICAgIHJldHVybiAoZXhpc3RzID4gLTEpO1xuICAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIGEgc3RhdGUgYnkgbmFtZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHN0YXRlIHRvIGZpbmQuXG4gICAqIEByZXR1cm4ge1N0YXRlfSBBIFN0YXRlIG9iamVjdC5cbiAgICovXG4gIGZpbmRTdGF0ZSAobmFtZSkge1xuICAgIGNvbnN0IGZvdW5kU3RhdGUgPSB0aGlzLnN0YXRlcy5maWx0ZXIoc3RhdGUgPT4ge1xuICAgICAgaWYgKHN0YXRlLm5hbWUgPT0gbmFtZSkgcmV0dXJuIHN0YXRlO1xuICAgIH0pO1xuXG4gICAgaWYgKGZvdW5kU3RhdGUubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIGZvdW5kU3RhdGVbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBGU01FcnJvcihcIk5vIHN0YXRlIGZvdW5kIHdpdGggdGhpcyBuYW1lOiBcIiArIG5hbWUpXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBsaW5rIGJldHdlZW4gdHdvIHN0YXRlcyBmb3IgYSBnaXZlbiBldmVudC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlRnJvbSAtIFN0YXRlIHRvIHJlZ2lzdGVyIGxpbmsgb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZVRvIC0gU3RhdGUgdG8gbGluayB0by5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IC0gRXZlbnQgd2hpY2ggZXhlY3V0ZXMgdGhlIGxpbmsuXG4gICAqL1xuICBsaW5rU3RhdGUgKHN0YXRlRnJvbSwgc3RhdGVUbywgZXZlbnQpIHtcbiAgICBjb25zdCBsaW5rID0gbmV3IExpbmsoZXZlbnQsIHN0YXRlVG8pO1xuXG4gICAgY29uc3QgZnJvbVN0YXRlID0gdGhpcy5maW5kU3RhdGUoc3RhdGVGcm9tKTtcbiAgICBmcm9tU3RhdGUubGlua3MucHVzaChsaW5rKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMaXN0ZW5zIGZvciBldmVudHMgYW5kIHF1ZXVlcyB0aGVtLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBFdmVudCByZWNlaXZlZCBmcm9tIEZTTS5cbiAgICovXG4gIGxpc3RlbiAoZXZlbnQpIHtcbiAgICB0aGlzLmV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIFJlY2VpdmUgYW4gZXZlbnQgdG8gYmUgcHJvY2Vzc2VkIGZyb20gdGhlIGV2ZW50IHF1ZXVlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRcbiAgICogQHJldHVybiB7Ym9vbH0gLSBSZXR1cm5zIHRydWUgaWYgc3RhdGUgY2hhbmdlIG9jY3VycmVkLlxuICAgKi9cbiAgcmVjZWl2ZSAoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuY3VycmVudFN0YXRlKSByZXR1cm47XG4gICAgaWYgKHRoaXMuY3VycmVudFN0YXRlLmxpbmtzLmxlbmd0aCA9PSAwKSByZXR1cm47XG5cbiAgICBjb25zdCBsaW5rcyA9ICh0aGlzLmN1cnJlbnRTdGF0ZS5saW5rcy5maWx0ZXIobGluayA9PiB7XG4gICAgICAgIGlmIChsaW5rLmV2ZW50ID09IGV2ZW50KSByZXR1cm4gbGluaztcbiAgICB9KSk7XG5cbiAgICBpZiAobGlua3MubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5sb2coYHJlY2VpdmVkIGFjdGlvbmFibGUgZXZlbnQ6ICR7ZXZlbnR9YCk7XG4gICAgICB0aGlzLmNoYW5nZVN0YXRlKGxpbmtzWzBdLnN0YXRlTmFtZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogRXZhbHVhdGVzIHRoZSBjdXJyZW50IHN0YXRlLiBSZXR1cm5pbmcgdHJ1ZSBpZiBldmFsdWF0ZWQuXG4gICAqIEByZXR1cm4ge2Jvb2x9IC0gUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgc3RhdGUgd2FzIGV2YWx1YXRlZC5cbiAgICovXG4gIGFzeW5jIGV2YWx1YXRlICgpIHtcbiAgICBpZiAoIXRoaXMuY3VycmVudFN0YXRlKSB7XG4gICAgICB0aGlzLmxvZyhgY29udGFpbnMgbm8gY3VycmVudCBzdGF0ZWApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gXG5cbiAgICB0aGlzLmxvZyhgZXZhbHVhdGluZyBzdGF0ZSBvZiBtYWNoaW5lYCk7XG4gICAgdGhpcy5sb2coYGN1cnJlbnQgc3RhdGUgaXMgJHt0aGlzLmN1cnJlbnRTdGF0ZS5uYW1lfWApO1xuXG4gICAgYXdhaXQgdGhpcy5ldmFsdWF0ZUFjdGlvbnMoKTtcbiAgICBhd2FpdCB0aGlzLmV2YWx1YXRlRXZlbnRzKCk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFdmFsdXRlcyB0aGUgY3VycmVudCBzdGF0ZSdzIGFjdGlvbnMuXG4gICAqIEByZXR1cm4ge2Jvb2x9IC0gUmV0dXJucyB0cnVlIGlmIGV2YWx1YXRlZC5cbiAgICovXG4gIGFzeW5jIGV2YWx1YXRlQWN0aW9ucyAoKSB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRTdGF0ZS5sb29wICYmIHRoaXMuY3VycmVudFN0YXRlLmV2YWx1YXRlZCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgYWN0aW9ucyA9IHRoaXMuY3VycmVudFN0YXRlLmFjdGlvbnM7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhY3Rpb25zLmxlbmd0aCA7IGkrKykge1xuICAgICAgbGV0IGFjdGlvbklEID0gYWN0aW9uc1tpXTtcbiAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICBjb25zdCBsaW1pdCA9IDEwO1xuICAgICAgbGV0IHJlcztcbiAgICAgIHdoaWxlICghcmVzICYmIGNvdW50IDwgbGltaXQpIHtcbiAgICAgICAgbGV0IGFjdGlvbiA9IHRoaXMuYWN0aW9uc1thY3Rpb25JRF07IFxuICAgICAgICByZXMgPSBhd2FpdCBhY3Rpb24uY2FsbGJhY2soLi4uYWN0aW9uLmFyZ3MpO1xuICAgICAgICBjb3VudCsrO1xuICAgICAgICBpZiAoY291bnQgPT0gbGltaXQpIHt0aGlzLmxvZyhcInN0YXRlIGV2YWx1YXRpb24gbGltaXQgcmVhY2hlZFwiKTt9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50U3RhdGUuZXZhbHVhdGVkID0gdHJ1ZTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2YWx1YXRlcyBldmVudCBxdWV1ZSB0byBjaGVjayBmb3Igc3RhdGUgY2hhbmdlcy5cbiAgICogQHJldHVybiB7Ym9vbH0gLSBSZXR1cm5zIHRydWUgaWYgZXZhbHVhdGVkLlxuICAgKi9cbiAgYXN5bmMgZXZhbHVhdGVFdmVudHMgKCkge1xuICAgIGNvbnN0IGV2ZW50cyA9IHRoaXMuZXZlbnRzO1xuICAgIGZvciAobGV0IGkgPSAwIDsgaSA8IGV2ZW50cy5sZW5ndGggOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLnJlY2VpdmUoZXZlbnRzW2ldKSkgYnJlYWs7XG4gICAgfVxuICAgIHRoaXMuZXZlbnRzID0gW107XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSAgXG5cbiAgLyoqXG4gICAqIENoYW5nZSBjdXJyZW50IHN0YXRlIHRvIGdpdmVuIHN0YXRlIGJ5IG5hbWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZU5hbWUgLSBTdGF0ZSB0byBjaGFuZ2UgdG8uIFxuICAgKi9cbiAgY2hhbmdlU3RhdGUgKHN0YXRlTmFtZSkge1xuICAgIHRoaXMubG9nKGBjaGFuZ2luZyBzdGF0ZSBmcm9tICR7dGhpcy5jdXJyZW50U3RhdGUubmFtZX0gdG8gJHtzdGF0ZU5hbWV9YCk7XG5cbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmluZFN0YXRlKHN0YXRlTmFtZSk7XG4gICAgdGhpcy5jdXJyZW50U3RhdGUgPSBzdGF0ZTtcbiAgICB0aGlzLmN1cnJlbnRTdGF0ZS5ldmFsdWF0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgdGhlIG5hbWUgb2YgdGhlIGdpdmVuIHN0YXRlIHdpdGggdGhlIG5ldyBuYW1lIHByb3ZpZGVkLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVOYW1lIC0gTmFtZSBvZiBzdGF0ZSB0byByZW5hbWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuZXdTdGF0ZU5hbWUgLSBOZXcgbmFtZSBmb3Igc3RhdGUuXG4gICAqL1xuICByZW5hbWVTdGF0ZSAoc3RhdGVOYW1lLCBuZXdTdGF0ZU5hbWUpIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmluZFN0YXRlKHN0YXRlTmFtZSk7XG4gICAgc3RhdGUubmFtZSA9IG5ld1N0YXRlTmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGFjdGlvbiB0byBhIGdpdmVuIHN0YXRlLiBSZXR1cm5zIHRoZSBBY3Rpb24gaWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZU5hbWUgLSBOYW1lIG9mIHN0YXRlIHRvIGFkZCBhY3Rpb24gdG8uXG4gICAqIEBwYXJhbSB7QWN0aW9ufSBhY3Rpb24gLSBBY3Rpb24gdG8gYWRkLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBBY3Rpb24gSUQuXG4gICAqL1xuICBhZGRBY3Rpb24gKHN0YXRlTmFtZSwgYWN0aW9uKSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZpbmRTdGF0ZShzdGF0ZU5hbWUpO1xuICAgIGNvbnN0IGFjdGlvbklEID0gYWN0aW9uLmNyZWF0ZUlEKCk7XG4gICAgdGhpcy5hY3Rpb25zW2FjdGlvbklEXSA9IGFjdGlvbjtcbiAgICBzdGF0ZS5hY3Rpb25zLnB1c2goYWN0aW9uSUQpO1xuXG4gICAgcmV0dXJuIGFjdGlvbklEXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbiBhY3Rpb24gZnJvbSBhIHN0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVOYW1lIC0gTmFtZSBvZiB0aGUgc3RhdGUgdG8gcmVtb3ZlIGFjdGlvbiBmcm9tLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uSUQgLSBJRCBvZiBBY3Rpb24gdG8gcmVtb3ZlLlxuICAgKi9cbiAgIHJlbW92ZUFjdGlvbiAoc3RhdGVOYW1lLCBhY3Rpb25JRCkge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5maW5kU3RhdGUoc3RhdGVOYW1lKTtcblxuICAgIGlmICghdGhpcy5hY3Rpb25FeGlzdHMoc3RhdGVOYW1lLCBhY3Rpb25JRCkpIHtcbiAgICAgIHRocm93IG5ldyBGU01FcnJvcihgYWN0aW9uIGRvZXMgbm90IGV4aXN0IHdpdGhpbiAke3N0YXRlTmFtZX1gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBpbmRleCA9IHN0YXRlLmFjdGlvbnMuaW5kZXhPZihhY3Rpb25JRCk7XG4gICAgc3RhdGUuYWN0aW9ucy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIGRlbGV0ZSB0aGlzLmFjdGlvbnNbYWN0aW9uSURdXG5cbiAgICB0aGlzLmxvZyhgcmVtb3ZlZCBhY3Rpb24gZnJvbSAke3N0YXRlTmFtZX1gKTtcbiAgIH1cblxuICAvKipcbiAgICogUHJpbnRzIGZvcm1hdHRlZCBtZXNzYWdlIHRvIGNvbnNvbGUubG9nLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIFRleHQgb2YgbWVzc2FnZSB0byBsb2cuXG4gICAqL1xuICBsb2cgKHRleHQpIHtcbiAgICBpZiAodGhpcy5sb2dNZXNzYWdlcykgY29uc29sZS5sb2coYCR7dGhpcy5uYW1lfTogJHt0ZXh0fWApO1xuICB9XG4gIFxuICAvKipcbiAgICogQWN0aXZhdGUgbWVzc2FnZSBsb2dnaW5nLiBEZWZhdWx0IGlzIHRydWUuXG4gICAqIEBwYXJhbSB7Ym9vbH0gYWN0aXZlIC0gSWYgdHJ1ZSB3aWxsIGxvZyBhbGwgZnNtIG1lc3NhZ2VzXG4gICAqL1xuICBkZWJ1ZyAoYWN0aXZlKSB7XG4gICAgdGhpcy5sb2dNZXNzYWdlcyA9IGFjdGl2ZTtcbiAgfVxufVxuXG4vKipcbiAqIEEgZGlzY3JldGUgc3RhdGUgb2YgYSBzdGF0ZSBtYWNoaW5lLlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHN0YXRlLlxuICovXG5mdW5jdGlvbiBTdGF0ZSAobmFtZSkge1xuICB0aGlzLm5hbWUgPSBuYW1lO1xuICB0aGlzLmlkO1xuICB0aGlzLmxpbmtzID0gW107ICAgICAgICAvLyBBbGwgb3V0Ym91bmQgY29ubmVjdGluZyBzdGF0ZXMgZnJvbSB0aGlzIHN0YXRlXG4gIHRoaXMuYWN0aW9ucyA9IFtdOyAgICAgIC8vIEFsbCBhY3Rpb25zIGFzc2lnbmVkIHRvIHRoaXMgc3RhdGU7XG4gIHRoaXMubG9vcDsgICAgICAgICAgICAgIC8vIFdoZXRoZXIgc3RhdGUgbG9vcHMgdGhyb3VnaCBhY3Rpb25zIGV2ZXJ5IGV2YWx1YXRpb25cbiAgdGhpcy5ldmFsdWF0ZWQgPSBmYWxzZTsgLy8gV2hldGhlciBzdGF0ZSBhbHJlYWR5IGV2YWx1YXRlZCBhY3Rpb25zXG59XG5cbi8qKlxuICogVGhlIHVuaWRpcmVjdGlvbmFsIGxpbmsgYmV0d2VlbiB0d28gc3RhdGVzLlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IC0gTmFtZSBvZiBldmVudCB0byBsaXN0ZW4gZm9yLlxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlIC0gTmFtZSBvZiBldmVudCB0byBsaW5rIHRvLlxuICovXG5mdW5jdGlvbiBMaW5rIChldmVudCwgc3RhdGUpIHtcbiAgdGhpcy5ldmVudCA9IGV2ZW50O1xuICB0aGlzLnN0YXRlTmFtZSA9IHN0YXRlO1xufVxuXG4vKipcbiAqIEdlbmVyYWwgRlNNIGVycm9yIEV4Y2VwdGlvbiBjbGFzcy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gRXJyb3IgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gRlNNRXJyb3IgKHRleHQpIHtcbiAgdGhpcy50ZXh0ID0gdGV4dDtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9mc20uanNcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqIEdlbmVyYWwgdXRpbGl0eSBmdW5jdGlvbnMgKi9cblxuLyoqXG4gKiBQcm9taXNlIGJhc2VkIGRlbGF5IHRpbWVyLlxuICogQHBhcmFtIHtpbnR9IG1zIC0gRGVsYXkgaW4gbWlsaXNlY29uZHMuXG4gKiBAcmV0dXJuIHtQcm9taXNlfSAtIFByb21pc2Ugd3JhcHBlZCB0aW1lci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNsZWVwIChtcykge1xuICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgdW5pcXVlIGlkIHtzdHJpbmd9XG4gKiBAcmV0dXJuIHtzdHJpbmd9IC0gYSByYW5kb20gMTIgY2hhcmFjdGVyIGlkIHN0cmluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1ha2VJRCAoKSB7XG4gIGxldCB0ZXh0ID0gXCJcIjtcbiAgY29uc3QgcG9zc2libGUgPSBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5XCI7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMjsgaSsrKVxuICAgIHRleHQgKz0gcG9zc2libGUuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlLmxlbmd0aCkpO1xuXG4gIHJldHVybiB0ZXh0O1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3V0aWxpdHkuanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHsgQWN0aW9uLCB3YWl0LCBzZW5kRXZlbnQgfSBmcm9tICcuL2FjdGlvbic7XG5pbXBvcnQgRlNNIGZyb20gJy4vZnNtJztcblxuZXhwb3J0cy5GU00gPSBGU007XG5leHBvcnRzLkFjdGlvbiA9IEFjdGlvbjtcbmV4cG9ydHMud2FpdCA9IHdhaXQ7XG5leHBvcnRzLnNlbmRFdmVudCA9IHNlbmRFdmVudDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCBGU00gZnJvbSAnLi9mc20nO1xuaW1wb3J0IHsgc2xlZXAsIG1ha2VJRCB9IGZyb20gJy4vdXRpbGl0eSc7XG5cbi8qKiBBY3Rpb24gdHlwZSBhbmQgcHJlbWFkZSBhY3Rpb25zICovXG5cbi8qKlxuICogQWN0aW9ucyBwZXJmb3JtZWQgYnkgYSBzdGF0ZSBvbmNlIGFjdGl2YXRlZC5cbiAqIEFjdGlvbnMgbXVzdCBiZSBhc3luY2hyb25vdXMgYW5kIHJldHVybiBhIHtib29sfSBvbiBjb21wbGV0aW9uOiBcbiAqICB0cnVlIGlmIGZpbmlzaGVkLCBvciBmYWxzZSBpZiBpdCBtdXN0IGJlIHJlZXZhbHVhdGVkLlxuICogQHBhcmFtIHtBc3luY0Z1bmN0aW9ufSBjYWxsYmFjayAtIEFzeW5jaHJvbm91cyBmdW5jdGlvbiB0byBjYWxsIGR1cmluZyBhY3Rpb24gZXZhbHVhdGlvbi5cbiAqIEBwYXJhbSB7YXJncyp9IGFyZ3MgLSBBcmd1bWVudHMgdG8gcGFzcyB0byBjYWxsYmFjay5cbiAqL1xuZXhwb3J0IGNsYXNzIEFjdGlvbiB7XG4gIGNvbnN0cnVjdG9yIChjYWxsYmFjaywgLi4uYXJncykge1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLmFyZ3MgPSBhcmdzO1xuICAgIHRoaXMuaWQ7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbmQgcmV0dXJucyBhIHVuaXF1ZSBpZCBzdHJpbmcuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gQSAxMiBjaGFyYWN0ZXIgc3RyaW5nIGlkLlxuICAgKi9cbiAgY3JlYXRlSUQgKCkge1xuICAgIHRoaXMuaWQgPSBtYWtlSUQoKTtcbiAgICByZXR1cm4gdGhpcy5pZDtcbiAgfVxufVxuXG4vKiogQWN0aW9ucyAqL1xuXG4vKipcbiAqIERlbGF5IHRpbWVyIGFjdGlvbi5cbiAqIEBwYXJhbSB7aW50fSBtcyAtIERlbGF5IGluIG1pbGlzZWNvbmRzLlxuICogQHJldHVybiB7Ym9vbH1cbiAqL1xuZXhwb3J0IGNvbnN0IHdhaXQgPSBhc3luYyAobXMgPSAxMDAwKSA9PiB7XG4gIGNvbnN0IHNvbWV0aGluZyA9IGF3YWl0IHNsZWVwKG1zKTtcbiAgcmV0dXJuIHRydWVcbn1cblxuLyoqXG4gKiBEZWJ1Z2dpbmcgYWN0aW9uLlxuICogQHJldHVybiB7Ym9vbH1cbiAqL1xuZXhwb3J0IGNvbnN0IHJldHVybkZhbHNlID0gYXN5bmMgKCkgPT4ge1xuICByZXR1cm4gZmFsc2Vcbn1cblxuLyoqXG4gKiBTaW1wbGUgZXZlbnQgYnJvYWRjYXN0aW5nIGFjdGlvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCAtIEV2ZW50IHRvIGJyb2FkY2FzdC5cbiAqIEBwYXJhbSB7RlNNfSBvbmx5IC0gU2VuZCBtZXNzYWdlIHRvIHNwZWNpZmljIHN0YXRlIG1hY2hpbmUuXG4gKiBAcmV0dXJuIHtib29sfVxuICovXG5leHBvcnQgY29uc3Qgc2VuZEV2ZW50ID0gYXN5bmMgKGV2ZW50LCBvbmx5ID0gbnVsbCkgPT4ge1xuICBGU00uYnJvYWRjYXN0KGV2ZW50LCBvbmx5KTtcbiAgcmV0dXJuIHRydWU7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvYWN0aW9uLmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=