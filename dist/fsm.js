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
        res = await action.callback(action.args);
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
  this.loop;              // Loop through state actions every evaluation
  this.evaluated = false; // Whether state already evaluated
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZTFjOWFmNWZkY2EwNWUzMTg1NmIiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ZzbS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbGl0eS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FjdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7OztBQzdEd0I7O0FBRXhCO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCLHFCQUFxQjtBQUNyQixzQkFBc0I7QUFDdEIscUJBQXFCO0FBQ3JCLGlGQUF1QjtBQUN2Qiw0QkFBNEI7QUFDNUI7O0FBRUE7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0EsYUFBYSxLQUFLO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQiwyQkFBMkI7QUFDOUM7QUFDQTs7QUFFQTtBQUNBLGdGQUFzQjtBQUN0QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWEsT0FB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OztBQUVBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQjtBQUNBO0FBQ0E7QUFDQSxDOzs7Ozs7OztBQ2xXQTtBQUFBOztBQUVBO0FBQ0E7QUFDQSxXQUFXLElBQUk7QUFDZixZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx1QkFBdUI7QUFDdkIsWUFBWSxPQUFPO0FBQ25CO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGlCQUFpQixRQUFRO0FBQ3pCOztBQUVBO0FBQ0EsQzs7Ozs7Ozs7OztBQ3ZCa0M7QUFDbEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUNOQTtBQUN3Qjs7QUFFeEI7O0FBRUE7QUFDQTtBQUNBLDhDQUE4QyxLQUFLO0FBQ25EO0FBQ0EsV0FBVyxTQUFTO0FBQ3BCLFdBQVcsTUFBTTtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsY0FBYyxPQUFPO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLFdBQVcsSUFBSTtBQUNmLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEMiLCJmaWxlIjoiZnNtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgZTFjOWFmNWZkY2EwNWUzMTg1NmIiLCJpbXBvcnQgeyBtYWtlSUQsIHNsZWVwIH0gZnJvbSAnLi91dGlsaXR5JztcblxuLyoqIEdlbmVyYWxpemVkIGZpbml0ZSBzdGF0ZSBtYWNoaW5lICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGU00ge1xuICBjb25zdHJ1Y3RvciAobmFtZSA9IFwiRlNNXCIpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuY3VycmVudFN0YXRlOyAgICAgICAgLy8gVGhlIGN1cnJlbnRseSBhY3RpdmUgc3RhdGUgb2YgdGhlIEZTTVxuICAgIHRoaXMuc3RhdGVzID0gW107ICAgICAgICAgLy8gQWxsIHN0YXRlcyB3aXRoaW4gdGhpcyBzdGF0ZSBtYWNoaW5lXG4gICAgdGhpcy5hY3Rpb25zID0ge307ICAgICAgICAvLyBBbGwgQWN0aW9ucyB1c2VkcyB3aXRoaW4gdGhpcyBzdGF0ZSBtYWNoaW5lLCBrZXllZCBieSBpZFxuICAgIHRoaXMuZXZlbnRzID0gW107ICAgICAgICAgLy8gRXZlbnQgcXVldWVcbiAgICB0aGlzLmlkID0gbWFrZUlEKCk7ICAgICAgIC8vIFVuaXF1ZSAxMiBjaGFyYWN0ZXIgc3RyaW5nIGlkXG4gICAgdGhpcy5sb2dNZXNzYWdlcyA9IHRydWU7ICAvLyBMb2cgYWxsIGludGVybmFsIG1lc3NhZ2VzIHRvIGNvbnNvbGVcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuZCByZXR1cm5zIGEgbmV3IHN0YXRlIG1hY2hpbmVcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSBzdGF0ZSBtYWNoaW5lXG4gICAqL1xuICBzdGF0aWMgY3JlYXRlIChuYW1lKSB7XG4gICAgY29uc3QgZnNtID0gbmV3IEZTTShuYW1lKTtcbiAgICBpZiAoIUZTTS5zdGF0ZU1hY2hpbmVzKSBGU00uc3RhdGVNYWNoaW5lcyA9IFtdO1xuICAgIEZTTS5zdGF0ZU1hY2hpbmVzLnB1c2goZnNtKTtcbiAgICBcbiAgICByZXR1cm4gZnNtO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgZ2l2ZW4gZXZlbnQgdG8gYWxsIHN0YXRlIG1hY2hpbmVzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBFdmVudCB0byBicm9hZGNhc3QgdG8gRlNNcy5cbiAgICovXG4gIHN0YXRpYyBicm9hZGNhc3QgKGV2ZW50KSB7XG4gICAgRlNNLnN0YXRlTWFjaGluZXMuZm9yRWFjaChzbSA9PiB7XG4gICAgICBzbS5saXN0ZW4oZXZlbnQpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2YWx1YXRlcyBlYWNoIHN0YXRlIG1hY2hpbmUgc2VxdWVudGlhbGx5LlxuICAgKiBAcGFyYW0ge2Jvb2x9IGxvb3AgLSBXaGV0aGVyIHRvIGV2YWx1YXRlIGFsbCBzdGF0ZSBtYWNoaW5lcyBvbmNlIG9yIGNvbnRpbnVhbGx5XG4gICAqL1xuICBzdGF0aWMgYXN5bmMgZXZhbHVhdGUgKGxvb3ApIHtcbiAgICBjb25zdCBzdGF0ZU1hY2hpbmVzID0gRlNNLnN0YXRlTWFjaGluZXM7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdGF0ZU1hY2hpbmVzLmxlbmd0aCA7IGkrKykge1xuICAgICAgYXdhaXQgc3RhdGVNYWNoaW5lc1tpXS5ldmFsdWF0ZSgpO1xuICAgIH1cbiAgICBcbiAgICBpZiAobG9vcCkge1xuICAgICAgYXdhaXQgc2xlZXAoMTApOyAvLyBXYWl0IDEwIG1zIGJlZm9yZSBsb29waW5nXG4gICAgICBGU00uZXZhbHVhdGUobG9vcCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHN0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2Ygc3RhdGUgdG8gY3JlYXRlLlxuICAgKiBAcGFyYW0ge2Jvb2x9IGxvb3AgLSBXaGV0aGVyIHN0YXRlIHNob3VsZCBydW4gQWN0aW9ucyBldmVyeSBldmFsdWF0aW9uLiBEZWZhdWx0IGZhbHNlLlxuICAgKiBAcmV0dXJuIHtTdGF0ZX0gQSBTdGF0ZSBvYmplY3QuXG4gICAqL1xuICBhZGRTdGF0ZSAobmFtZSwgbG9vcCA9IGZhbHNlKSB7XG4gICAgY29uc3Qgc3RhdGUgPSBuZXcgU3RhdGUobmFtZSk7XG4gICAgc3RhdGUuaWQgPSBtYWtlSUQoKTtcbiAgICBzdGF0ZS5sb29wID0gbG9vcDtcbiAgICB0aGlzLnN0YXRlcy5wdXNoKHN0YXRlKTtcblxuICAgIGlmICghdGhpcy5jdXJyZW50U3RhdGUpIHRoaXMuY3VycmVudFN0YXRlID0gc3RhdGU7XG5cbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIHN0YXRlIGZyb20gc3RhdGVzIGFycmF5LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2Ygc3RhdGUgdG8gcmVtb3ZlLlxuICAgKi9cbiAgcmVtb3ZlU3RhdGUgKG5hbWUpIHtcbiAgICAgIGlmICghdGhpcy5zdGF0ZUV4aXN0cyhuYW1lKSkgdGhyb3cgbmV3IEZTTUVycm9yKFwiTm8gc3RhdGUgZm91bmQgd2l0aCB0aGlzIG5hbWU6IFwiICsgbmFtZSlcblxuICAgICAgY29uc3QgZmlsdGVyZWRTdGF0ZXMgPSB0aGlzLnN0YXRlcy5maWx0ZXIoc3RhdGUgPT4ge1xuICAgICAgICBpZiAoc3RhdGUubmFtZSAhPSBuYW1lKSByZXR1cm4gc3RhdGU7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuc3RhdGVzID0gZmlsdGVyZWRTdGF0ZXM7XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlIHRoaXMgc3RhdGUgbWFjaGluZS5cbiAgICovXG4gIGRlc3Ryb3kgKCkge1xuICAgIGNvbnN0IGluZGV4ID0gRlNNLnN0YXRlTWFjaGluZXMuaW5kZXhPZih0aGlzKTtcbiAgICBjb25zdCBwcmUgPSBGU00uc3RhdGVNYWNoaW5lcy5zbGljZSgwLCBpbmRleCk7XG4gICAgY29uc3QgcG9zdCA9IEZTTS5zdGF0ZU1hY2hpbmVzLnNsaWNlKGluZGV4KzEpO1xuICAgIEZTTS5zdGF0ZU1hY2hpbmVzID0gcHJlLmNvbmNhdChwb3N0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBzdGF0ZSBpcyBpbiBzdGF0ZXMgYXJyYXkuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHN0YXRlIHRvIGNoZWNrIGZvci5cbiAgICogQHJldHVybiB7Ym9vbH1cbiAgICovXG4gIHN0YXRlRXhpc3RzIChuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGVzLnNvbWUoc3RhdGUgPT4ge1xuICAgICAgICBpZiAoc3RhdGUubmFtZSA9PSBuYW1lKSByZXR1cm4gc3RhdGU7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBhIHN0YXRlIGNvbnRhaW5zIGEgbGluayB0byBhIGdpdmVuIHN0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVGcm9tIC0gVGhlIHN0YXRlIHRvIGNoZWNrIGZvciBsaW5rcy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlVG8gLSBUaGUgc3RhdGUgYmVpbmcgbGlua2VkIHRvLlxuICAgKiBAcmV0dXJuIHtib29sfVxuICAgKi9cbiAgbGlua0V4aXN0cyAoc3RhdGVGcm9tLCBzdGF0ZVRvKSB7XG4gICAgY29uc3QgZnJvbVN0YXRlID0gdGhpcy5maW5kU3RhdGUoc3RhdGVGcm9tKTtcbiAgICBjb25zdCBleGlzdHMgPSBmcm9tU3RhdGUubGlua3Muc29tZShzdGF0ZUxpbmsgPT4ge1xuICAgICAgICBpZiAoc3RhdGVMaW5rLnN0YXRlTmFtZSA9PSBzdGF0ZVRvKSByZXR1cm4gc3RhdGVMaW5rO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGV4aXN0cztcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIGFuIGFjdGlvbiBleGlzdHMgd2l0aGluIGEgZ2l2ZW4gc3RhdGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZU5hbWUgLSBOYW1lIG9mIHN0YXRlIHRvIHNlYXJjaCBmb3IgYWN0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb25JRCAtIElEIG9mIEFjdGlvbiB0byBmaW5kLlxuICAgKi9cbiAgIGFjdGlvbkV4aXN0cyAoc3RhdGVOYW1lLCBhY3Rpb25JRCkge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5maW5kU3RhdGUoc3RhdGVOYW1lKTtcbiAgICBjb25zdCBleGlzdHMgPSBzdGF0ZS5hY3Rpb25zLmluZGV4T2YoYWN0aW9uSUQpO1xuXG4gICAgcmV0dXJuIChleGlzdHMgPiAtMSk7XG4gICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgYSBzdGF0ZSBieSBuYW1lLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2Ygc3RhdGUgdG8gZmluZC5cbiAgICogQHJldHVybiB7U3RhdGV9IEEgU3RhdGUgb2JqZWN0LlxuICAgKi9cbiAgZmluZFN0YXRlIChuYW1lKSB7XG4gICAgY29uc3QgZm91bmRTdGF0ZSA9IHRoaXMuc3RhdGVzLmZpbHRlcihzdGF0ZSA9PiB7XG4gICAgICBpZiAoc3RhdGUubmFtZSA9PSBuYW1lKSByZXR1cm4gc3RhdGU7XG4gICAgfSk7XG5cbiAgICBpZiAoZm91bmRTdGF0ZS5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gZm91bmRTdGF0ZVswXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEZTTUVycm9yKFwiTm8gc3RhdGUgZm91bmQgd2l0aCB0aGlzIG5hbWU6IFwiICsgbmFtZSlcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGxpbmsgYmV0d2VlbiB0d28gc3RhdGVzIGZvciBhIGdpdmVuIGV2ZW50LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVGcm9tIC0gU3RhdGUgdG8gcmVnaXN0ZXIgbGluayBvbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlVG8gLSBTdGF0ZSB0byBsaW5rIHRvLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBFdmVudCB3aGljaCBleGVjdXRlcyB0aGUgbGluay5cbiAgICovXG4gIGxpbmtTdGF0ZSAoc3RhdGVGcm9tLCBzdGF0ZVRvLCBldmVudCkge1xuICAgIGNvbnN0IGxpbmsgPSBuZXcgTGluayhldmVudCwgc3RhdGVUbyk7XG5cbiAgICBjb25zdCBmcm9tU3RhdGUgPSB0aGlzLmZpbmRTdGF0ZShzdGF0ZUZyb20pO1xuICAgIGZyb21TdGF0ZS5saW5rcy5wdXNoKGxpbmspO1xuICB9XG5cbiAgLyoqXG4gICAqIExpc3RlbnMgZm9yIGV2ZW50cyBhbmQgcXVldWVzIHRoZW0uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCAtIEV2ZW50IHJlY2VpdmVkIGZyb20gRlNNLlxuICAgKi9cbiAgbGlzdGVuIChldmVudCkge1xuICAgIHRoaXMuZXZlbnRzLnB1c2goZXZlbnQpO1xuICB9XG4gIFxuICAvKipcbiAgICogUmVjZWl2ZSBhbiBldmVudCB0byBiZSBwcm9jZXNzZWQgZnJvbSB0aGUgZXZlbnQgcXVldWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFxuICAgKiBAcmV0dXJuIHtib29sfSAtIFJldHVybnMgdHJ1ZSBpZiBzdGF0ZSBjaGFuZ2Ugb2NjdXJyZWQuXG4gICAqL1xuICByZWNlaXZlIChldmVudCkge1xuICAgIHRoaXMubG9nKGByZWNlaXZlZCBldmVudDogJHtldmVudH1gKTtcbiAgICBcbiAgICBpZiAoIXRoaXMuY3VycmVudFN0YXRlKSByZXR1cm47XG4gICAgaWYgKHRoaXMuY3VycmVudFN0YXRlLmxpbmtzLmxlbmd0aCA9PSAwKSByZXR1cm47XG5cbiAgICBjb25zdCBsaW5rcyA9ICh0aGlzLmN1cnJlbnRTdGF0ZS5saW5rcy5maWx0ZXIobGluayA9PiB7XG4gICAgICAgIGlmIChsaW5rLmV2ZW50ID09IGV2ZW50KSByZXR1cm4gbGluaztcbiAgICB9KSk7XG5cbiAgICBpZiAobGlua3MubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5jaGFuZ2VTdGF0ZShsaW5rc1swXS5zdGF0ZU5hbWUpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2YWx1YXRlcyB0aGUgY3VycmVudCBzdGF0ZS4gUmV0dXJuaW5nIHRydWUgaWYgZXZhbHVhdGVkLlxuICAgKiBAcmV0dXJuIHtib29sfSAtIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHN0YXRlIHdhcyBldmFsdWF0ZWQuXG4gICAqL1xuICBhc3luYyBldmFsdWF0ZSAoKSB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRTdGF0ZSkge1xuICAgICAgdGhpcy5sb2coYGNvbnRhaW5zIG5vIGN1cnJlbnQgc3RhdGVgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IFxuXG4gICAgdGhpcy5sb2coYGV2YWx1YXRpbmcgc3RhdGUgb2YgbWFjaGluZWApO1xuICAgIHRoaXMubG9nKGBjdXJyZW50IHN0YXRlIGlzICR7dGhpcy5jdXJyZW50U3RhdGUubmFtZX1gKTtcblxuICAgIGF3YWl0IHRoaXMuZXZhbHVhdGVBY3Rpb25zKCk7XG4gICAgYXdhaXQgdGhpcy5ldmFsdWF0ZUV2ZW50cygpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogRXZhbHV0ZXMgdGhlIGN1cnJlbnQgc3RhdGUncyBhY3Rpb25zLlxuICAgKiBAcmV0dXJuIHtib29sfSAtIFJldHVybnMgdHJ1ZSBpZiBldmFsdWF0ZWQuXG4gICAqL1xuICBhc3luYyBldmFsdWF0ZUFjdGlvbnMgKCkge1xuICAgIGlmICghdGhpcy5jdXJyZW50U3RhdGUubG9vcCAmJiB0aGlzLmN1cnJlbnRTdGF0ZS5ldmFsdWF0ZWQpIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IGFjdGlvbnMgPSB0aGlzLmN1cnJlbnRTdGF0ZS5hY3Rpb25zO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWN0aW9ucy5sZW5ndGggOyBpKyspIHtcbiAgICAgIGxldCBhY3Rpb25JRCA9IGFjdGlvbnNbaV07XG4gICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgY29uc3QgbGltaXQgPSAxMDtcbiAgICAgIGxldCByZXM7XG4gICAgICB3aGlsZSAoIXJlcyAmJiBjb3VudCA8IGxpbWl0KSB7XG4gICAgICAgIGxldCBhY3Rpb24gPSB0aGlzLmFjdGlvbnNbYWN0aW9uSURdOyBcbiAgICAgICAgcmVzID0gYXdhaXQgYWN0aW9uLmNhbGxiYWNrKGFjdGlvbi5hcmdzKTtcbiAgICAgICAgY291bnQrKztcbiAgICAgICAgaWYgKGNvdW50ID09IGxpbWl0KSB7dGhpcy5sb2coXCJzdGF0ZSBldmFsdWF0aW9uIGxpbWl0IHJlYWNoZWRcIik7fVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY3VycmVudFN0YXRlLmV2YWx1YXRlZCA9IHRydWU7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFdmFsdWF0ZXMgZXZlbnQgcXVldWUgdG8gY2hlY2sgZm9yIHN0YXRlIGNoYW5nZXMuXG4gICAqIEByZXR1cm4ge2Jvb2x9IC0gUmV0dXJucyB0cnVlIGlmIGV2YWx1YXRlZC5cbiAgICovXG4gIGFzeW5jIGV2YWx1YXRlRXZlbnRzICgpIHtcbiAgICBjb25zdCBldmVudHMgPSB0aGlzLmV2ZW50cztcbiAgICBmb3IgKGxldCBpID0gMCA7IGkgPCBldmVudHMubGVuZ3RoIDsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5yZWNlaXZlKGV2ZW50c1tpXSkpIGJyZWFrO1xuICAgIH1cbiAgICB0aGlzLmV2ZW50cyA9IFtdO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0gIFxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgY3VycmVudCBzdGF0ZSB0byBnaXZlbiBzdGF0ZSBieSBuYW1lLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVOYW1lIC0gU3RhdGUgdG8gY2hhbmdlIHRvLiBcbiAgICovXG4gIGNoYW5nZVN0YXRlIChzdGF0ZU5hbWUpIHtcbiAgICB0aGlzLmxvZyhgY2hhbmdpbmcgc3RhdGUgZnJvbSAke3RoaXMuY3VycmVudFN0YXRlLm5hbWV9IHRvICR7c3RhdGVOYW1lfWApO1xuXG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZpbmRTdGF0ZShzdGF0ZU5hbWUpO1xuICAgIHRoaXMuY3VycmVudFN0YXRlID0gc3RhdGU7XG4gICAgdGhpcy5jdXJyZW50U3RhdGUuZXZhbHVhdGVkID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlIHRoZSBuYW1lIG9mIHRoZSBnaXZlbiBzdGF0ZSB3aXRoIHRoZSBuZXcgbmFtZSBwcm92aWRlZC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlTmFtZSAtIE5hbWUgb2Ygc3RhdGUgdG8gcmVuYW1lLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmV3U3RhdGVOYW1lIC0gTmV3IG5hbWUgZm9yIHN0YXRlLlxuICAgKi9cbiAgcmVuYW1lU3RhdGUgKHN0YXRlTmFtZSwgbmV3U3RhdGVOYW1lKSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZpbmRTdGF0ZShzdGF0ZU5hbWUpO1xuICAgIHN0YXRlLm5hbWUgPSBuZXdTdGF0ZU5hbWU7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbiBhY3Rpb24gdG8gYSBnaXZlbiBzdGF0ZS4gUmV0dXJucyB0aGUgQWN0aW9uIGlkLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVOYW1lIC0gTmFtZSBvZiBzdGF0ZSB0byBhZGQgYWN0aW9uIHRvLlxuICAgKiBAcGFyYW0ge0FjdGlvbn0gYWN0aW9uIC0gQWN0aW9uIHRvIGFkZC5cbiAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgQWN0aW9uIElELlxuICAgKi9cbiAgYWRkQWN0aW9uIChzdGF0ZU5hbWUsIGFjdGlvbikge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5maW5kU3RhdGUoc3RhdGVOYW1lKTtcbiAgICBjb25zdCBhY3Rpb25JRCA9IGFjdGlvbi5jcmVhdGVJRCgpO1xuICAgIHRoaXMuYWN0aW9uc1thY3Rpb25JRF0gPSBhY3Rpb247XG4gICAgc3RhdGUuYWN0aW9ucy5wdXNoKGFjdGlvbklEKTtcblxuICAgIHJldHVybiBhY3Rpb25JRFxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYW4gYWN0aW9uIGZyb20gYSBzdGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlTmFtZSAtIE5hbWUgb2YgdGhlIHN0YXRlIHRvIHJlbW92ZSBhY3Rpb24gZnJvbS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvbklEIC0gSUQgb2YgQWN0aW9uIHRvIHJlbW92ZS5cbiAgICovXG4gICByZW1vdmVBY3Rpb24gKHN0YXRlTmFtZSwgYWN0aW9uSUQpIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmluZFN0YXRlKHN0YXRlTmFtZSk7XG5cbiAgICBpZiAoIXRoaXMuYWN0aW9uRXhpc3RzKHN0YXRlTmFtZSwgYWN0aW9uSUQpKSB7XG4gICAgICB0aHJvdyBuZXcgRlNNRXJyb3IoYGFjdGlvbiBkb2VzIG5vdCBleGlzdCB3aXRoaW4gJHtzdGF0ZU5hbWV9YCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaW5kZXggPSBzdGF0ZS5hY3Rpb25zLmluZGV4T2YoYWN0aW9uSUQpO1xuICAgIHN0YXRlLmFjdGlvbnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICBkZWxldGUgdGhpcy5hY3Rpb25zW2FjdGlvbklEXVxuXG4gICAgdGhpcy5sb2coYHJlbW92ZWQgYWN0aW9uIGZyb20gJHtzdGF0ZU5hbWV9YCk7XG4gICB9XG5cbiAgLyoqXG4gICAqIFByaW50cyBmb3JtYXR0ZWQgbWVzc2FnZSB0byBjb25zb2xlLmxvZy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBUZXh0IG9mIG1lc3NhZ2UgdG8gbG9nLlxuICAgKi9cbiAgbG9nICh0ZXh0KSB7XG4gICAgaWYgKHRoaXMubG9nTWVzc2FnZXMpIGNvbnNvbGUubG9nKGAke3RoaXMubmFtZX06ICR7dGV4dH1gKTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIEFjdGl2YXRlIG1lc3NhZ2UgbG9nZ2luZy4gRGVmYXVsdCBpcyB0cnVlLlxuICAgKiBAcGFyYW0ge2Jvb2x9IGFjdGl2ZSAtIElmIHRydWUgd2lsbCBsb2cgYWxsIGZzbSBtZXNzYWdlc1xuICAgKi9cbiAgZGVidWcgKGFjdGl2ZSkge1xuICAgIHRoaXMubG9nTWVzc2FnZXMgPSBhY3RpdmU7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGRpc2NyZXRlIHN0YXRlIG9mIGEgc3RhdGUgbWFjaGluZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiBzdGF0ZS5cbiAqL1xuZnVuY3Rpb24gU3RhdGUgKG5hbWUpIHtcbiAgdGhpcy5uYW1lID0gbmFtZTtcbiAgdGhpcy5pZDtcbiAgdGhpcy5saW5rcyA9IFtdOyAgICAgICAgLy8gQWxsIG91dGJvdW5kIGNvbm5lY3Rpbmcgc3RhdGVzIGZyb20gdGhpcyBzdGF0ZVxuICB0aGlzLmFjdGlvbnMgPSBbXTsgICAgICAvLyBBbGwgYWN0aW9ucyBhc3NpZ25lZCB0byB0aGlzIHN0YXRlO1xuICB0aGlzLmxvb3A7ICAgICAgICAgICAgICAvLyBMb29wIHRocm91Z2ggc3RhdGUgYWN0aW9ucyBldmVyeSBldmFsdWF0aW9uXG4gIHRoaXMuZXZhbHVhdGVkID0gZmFsc2U7IC8vIFdoZXRoZXIgc3RhdGUgYWxyZWFkeSBldmFsdWF0ZWRcbn1cblxuLyoqXG4gKiBUaGUgdW5pZGlyZWN0aW9uYWwgbGluayBiZXR3ZWVuIHR3byBzdGF0ZXMuXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBOYW1lIG9mIGV2ZW50IHRvIGxpc3RlbiBmb3IuXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RhdGUgLSBOYW1lIG9mIGV2ZW50IHRvIGxpbmsgdG8uXG4gKi9cbmZ1bmN0aW9uIExpbmsgKGV2ZW50LCBzdGF0ZSkge1xuICB0aGlzLmV2ZW50ID0gZXZlbnQ7XG4gIHRoaXMuc3RhdGVOYW1lID0gc3RhdGU7XG59XG5cbi8qKlxuICogR2VuZXJhbCBGU00gZXJyb3IgRXhjZXB0aW9uIGNsYXNzLlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBFcnJvciBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBGU01FcnJvciAodGV4dCkge1xuICB0aGlzLnRleHQgPSB0ZXh0O1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2ZzbS5qc1xuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiogR2VuZXJhbCB1dGlsaXR5IGZ1bmN0aW9ucyAqL1xuXG4vKipcbiAqIFByb21pc2UgYmFzZWQgZGVsYXkgdGltZXIuXG4gKiBAcGFyYW0ge2ludH0gbXMgLSBEZWxheSBpbiBtaWxpc2Vjb25kcy5cbiAqIEByZXR1cm4ge1Byb21pc2V9IC0gUHJvbWlzZSB3cmFwcGVkIHRpbWVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2xlZXAgKG1zKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSB1bmlxdWUgaWQge3N0cmluZ31cbiAqIEByZXR1cm4ge3N0cmluZ30gLSBhIHJhbmRvbSAxMiBjaGFyYWN0ZXIgaWQgc3RyaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZUlEICgpIHtcbiAgbGV0IHRleHQgPSBcIlwiO1xuICBjb25zdCBwb3NzaWJsZSA9IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODlcIjtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IDEyOyBpKyspXG4gICAgdGV4dCArPSBwb3NzaWJsZS5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcG9zc2libGUubGVuZ3RoKSk7XG5cbiAgcmV0dXJuIHRleHQ7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdXRpbGl0eS5qc1xuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgeyBBY3Rpb24sIHdhaXQsIHNlbmRFdmVudCB9IGZyb20gJy4vYWN0aW9uJztcbmltcG9ydCBGU00gZnJvbSAnLi9mc20nO1xuXG5leHBvcnRzLkZTTSA9IEZTTTtcbmV4cG9ydHMuQWN0aW9uID0gQWN0aW9uO1xuZXhwb3J0cy53YWl0ID0gd2FpdDtcbmV4cG9ydHMuc2VuZEV2ZW50ID0gc2VuZEV2ZW50O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IEZTTSBmcm9tICcuL2ZzbSc7XG5pbXBvcnQgeyBzbGVlcCwgbWFrZUlEIH0gZnJvbSAnLi91dGlsaXR5JztcblxuLyoqIEFjdGlvbiB0eXBlIGFuZCBwcmVtYWRlIGFjdGlvbnMgKi9cblxuLyoqXG4gKiBBY3Rpb25zIHBlcmZvcm1lZCBieSBhIHN0YXRlIG9uY2UgYWN0aXZhdGVkLlxuICogQWN0aW9ucyBtdXN0IGJlIGFzeW5jaHJvbm91cyBhbmQgcmV0dXJuIGEge2Jvb2x9IG9uIGNvbXBsZXRpb246IFxuICogIHRydWUgaWYgZmluaXNoZWQsIG9yIGZhbHNlIGlmIGl0IG11c3QgYmUgcmVldmFsdWF0ZWQuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIEFzeW5jaHJvbm91cyBmdW5jdGlvbiB0byBjYWxsIGR1cmluZyBhY3Rpb24gZXZhbHVhdGlvbi5cbiAqIEBwYXJhbSB7YXJncyp9IGFyZ3MgLSBBcmd1bWVudHMgdG8gcGFzcyB0byBjYWxsYmFjay5cbiAqL1xuZXhwb3J0IGNsYXNzIEFjdGlvbiB7XG4gIGNvbnN0cnVjdG9yIChjYWxsYmFjaywgYXJncyA9IG51bGwpIHtcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgdGhpcy5hcmdzID0gYXJncztcbiAgICB0aGlzLmlkO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW5kIHJldHVybnMgYSB1bmlxdWUgaWQgc3RyaW5nLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IEEgMTIgY2hhcmFjdGVyIHN0cmluZyBpZC5cbiAgICovXG4gIGNyZWF0ZUlEICgpIHtcbiAgICB0aGlzLmlkID0gbWFrZUlEKCk7XG4gICAgcmV0dXJuIHRoaXMuaWQ7XG4gIH1cbn1cblxuLyoqIEFjdGlvbnMgKi9cblxuLyoqXG4gKiBEZWxheSB0aW1lciBhY3Rpb24uXG4gKiBAcGFyYW0ge2ludH0gbXMgLSBEZWxheSBpbiBtaWxpc2Vjb25kcy5cbiAqIEByZXR1cm4ge2Jvb2x9XG4gKi9cbmV4cG9ydCBjb25zdCB3YWl0ID0gYXN5bmMgKG1zID0gMTAwMCkgPT4ge1xuICBjb25zdCBzb21ldGhpbmcgPSBhd2FpdCBzbGVlcChtcyk7XG4gIHJldHVybiB0cnVlXG59XG5cbi8qKlxuICogRGVidWdnaW5nIGFjdGlvbi5cbiAqIEByZXR1cm4ge2Jvb2x9XG4gKi9cbmV4cG9ydCBjb25zdCByZXR1cm5GYWxzZSA9IGFzeW5jICgpID0+IHtcbiAgcmV0dXJuIGZhbHNlXG59XG5cbi8qKlxuICogU2ltcGxlIGV2ZW50IGJyb2FkY2FzdGluZyBhY3Rpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBFdmVudCB0byBicm9hZGNhc3QuXG4gKiBAcmV0dXJuIHtib29sfVxuICovXG5leHBvcnQgY29uc3Qgc2VuZEV2ZW50ID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gIEZTTS5icm9hZGNhc3QoZXZlbnQpO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9hY3Rpb24uanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==