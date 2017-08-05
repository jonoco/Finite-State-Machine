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
    this.currentState; // The currently active state of the FSM
    this.states = []; // All states within this SM
    this.id = Object(__WEBPACK_IMPORTED_MODULE_0__utility__["a" /* makeID */])();
    this.logMessages = true; // Log all internal messages to console
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
   * @param {Action} action - Action to find.
   */
   actionExists (stateName, action) {
    const state = this.findState(stateName);
    const exists = state.actions.indexOf(action);

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
      let action = actions[i];
      let count = 0;
      const limit = 10;
      let res;
      while (!res && count < limit) {
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
   * Adds an action to a given state.
   * @param {string} stateName - Name of state to add action to.
   * @param {Action} action - Action to add.
   */
  addAction (stateName, action) {
    const state = this.findState(stateName);
    state.actions.push(action);
  }

  /**
   * Removes an action from a state.
   * @param {string} stateName - Name of the state to remove action from.
   * @param {Action} action - Action to remove.
   */
   removeAction (stateName, action) {
    const state = this.findState(stateName);

    if (!this.actionExists(stateName, action)) {
      throw new FSMError(`action does not exist within ${stateName}`);
      return;
    }

    const index = state.actions.indexOf(action);
    state.actions.splice(index, 1);

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
/* harmony export (immutable) */ __webpack_exports__["a"] = Action;
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
function Action (callback, args = null) {
  this.callback = callback;
  this.args = args;
  this.id = Object(__WEBPACK_IMPORTED_MODULE_1__utility__["a" /* makeID */])();
}

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNGI1ZmQ0NjczNTI3YTBiZWY2MTkiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ZzbS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbGl0eS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FjdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7OztBQzdEaUI7O0FBRWpCO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCLHFCQUFxQjtBQUNyQjtBQUNBLDRCQUE0QjtBQUM1Qjs7QUFFQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQSxhQUFhLE9BQU87QUFDcEIsY0FBYyxNQUFNO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7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QUFJO0FBQ2YsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBOztBQUVBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBOztBQUVBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQyIsImZpbGUiOiJmc20uanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAyKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA0YjVmZDQ2NzM1MjdhMGJlZjYxOSIsImltcG9ydCB7IG1ha2VJRCB9IGZyb20gJy4vdXRpbGl0eSc7XG5cbi8qKiBHZW5lcmFsaXplZCBmaW5pdGUgc3RhdGUgbWFjaGluZSAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRlNNIHtcbiAgY29uc3RydWN0b3IgKG5hbWUgPSBcIkZTTVwiKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLmN1cnJlbnRTdGF0ZTsgLy8gVGhlIGN1cnJlbnRseSBhY3RpdmUgc3RhdGUgb2YgdGhlIEZTTVxuICAgIHRoaXMuc3RhdGVzID0gW107IC8vIEFsbCBzdGF0ZXMgd2l0aGluIHRoaXMgU01cbiAgICB0aGlzLmlkID0gbWFrZUlEKCk7XG4gICAgdGhpcy5sb2dNZXNzYWdlcyA9IHRydWU7IC8vIExvZyBhbGwgaW50ZXJuYWwgbWVzc2FnZXMgdG8gY29uc29sZVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW5kIHJldHVybnMgYSBuZXcgc3RhdGUgbWFjaGluZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgdGhlIHN0YXRlIG1hY2hpbmVcbiAgICovXG4gIHN0YXRpYyBjcmVhdGUgKG5hbWUpIHtcbiAgICBjb25zdCBmc20gPSBuZXcgRlNNKG5hbWUpO1xuICAgIGlmICghRlNNLnN0YXRlTWFjaGluZXMpIEZTTS5zdGF0ZU1hY2hpbmVzID0gW107XG4gICAgRlNNLnN0YXRlTWFjaGluZXMucHVzaChmc20pO1xuICAgIFxuICAgIHJldHVybiBmc207XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBnaXZlbiBldmVudCB0byBhbGwgc3RhdGUgbWFjaGluZXMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCAtIEV2ZW50IHRvIGJyb2FkY2FzdCB0byBGU01zLlxuICAgKi9cbiAgc3RhdGljIGJyb2FkY2FzdCAoZXZlbnQpIHtcbiAgICBGU00uc3RhdGVNYWNoaW5lcy5mb3JFYWNoKHNtID0+IHtcbiAgICAgIHNtLnJlY2VpdmUoZXZlbnQpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHN0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2Ygc3RhdGUgdG8gY3JlYXRlLlxuICAgKiBAcmV0dXJuIHtTdGF0ZX0gQSBTdGF0ZSBvYmplY3QuXG4gICAqL1xuICBhZGRTdGF0ZSAobmFtZSkge1xuICAgIGNvbnN0IHN0YXRlID0gbmV3IFN0YXRlKG5hbWUpO1xuICAgIHN0YXRlLmlkID0gbWFrZUlEKCk7XG4gICAgdGhpcy5zdGF0ZXMucHVzaChzdGF0ZSk7XG5cbiAgICBpZiAoIXRoaXMuY3VycmVudFN0YXRlKSB0aGlzLmN1cnJlbnRTdGF0ZSA9IHN0YXRlO1xuXG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBzdGF0ZSBmcm9tIHN0YXRlcyBhcnJheS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHN0YXRlIHRvIHJlbW92ZS5cbiAgICovXG4gIHJlbW92ZVN0YXRlIChuYW1lKSB7XG4gICAgICBpZiAoIXRoaXMuc3RhdGVFeGlzdHMobmFtZSkpIHRocm93IG5ldyBGU01FcnJvcihcIk5vIHN0YXRlIGZvdW5kIHdpdGggdGhpcyBuYW1lOiBcIiArIG5hbWUpXG5cbiAgICAgIGNvbnN0IGZpbHRlcmVkU3RhdGVzID0gdGhpcy5zdGF0ZXMuZmlsdGVyKHN0YXRlID0+IHtcbiAgICAgICAgaWYgKHN0YXRlLm5hbWUgIT0gbmFtZSkgcmV0dXJuIHN0YXRlO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnN0YXRlcyA9IGZpbHRlcmVkU3RhdGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZSB0aGlzIHN0YXRlIG1hY2hpbmUuXG4gICAqL1xuICBkZXN0cm95ICgpIHtcbiAgICBjb25zdCBpbmRleCA9IEZTTS5zdGF0ZU1hY2hpbmVzLmluZGV4T2YodGhpcyk7XG4gICAgY29uc3QgcHJlID0gRlNNLnN0YXRlTWFjaGluZXMuc2xpY2UoMCwgaW5kZXgpO1xuICAgIGNvbnN0IHBvc3QgPSBGU00uc3RhdGVNYWNoaW5lcy5zbGljZShpbmRleCsxKTtcbiAgICBGU00uc3RhdGVNYWNoaW5lcyA9IHByZS5jb25jYXQocG9zdCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgc3RhdGUgaXMgaW4gc3RhdGVzIGFycmF5LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBzdGF0ZSB0byBjaGVjayBmb3IuXG4gICAqIEByZXR1cm4ge2Jvb2x9XG4gICAqL1xuICBzdGF0ZUV4aXN0cyAobmFtZSkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlcy5zb21lKHN0YXRlID0+IHtcbiAgICAgICAgaWYgKHN0YXRlLm5hbWUgPT0gbmFtZSkgcmV0dXJuIHN0YXRlO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYSBzdGF0ZSBjb250YWlucyBhIGxpbmsgdG8gYSBnaXZlbiBzdGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlRnJvbSAtIFRoZSBzdGF0ZSB0byBjaGVjayBmb3IgbGlua3MuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZVRvIC0gVGhlIHN0YXRlIGJlaW5nIGxpbmtlZCB0by5cbiAgICogQHJldHVybiB7Ym9vbH1cbiAgICovXG4gIGxpbmtFeGlzdHMgKHN0YXRlRnJvbSwgc3RhdGVUbykge1xuICAgIGNvbnN0IGZyb21TdGF0ZSA9IHRoaXMuZmluZFN0YXRlKHN0YXRlRnJvbSk7XG4gICAgY29uc3QgZXhpc3RzID0gZnJvbVN0YXRlLmxpbmtzLnNvbWUoc3RhdGVMaW5rID0+IHtcbiAgICAgICAgaWYgKHN0YXRlTGluay5zdGF0ZU5hbWUgPT0gc3RhdGVUbykgcmV0dXJuIHN0YXRlTGluaztcbiAgICB9KTtcblxuICAgIHJldHVybiBleGlzdHM7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBhbiBhY3Rpb24gZXhpc3RzIHdpdGhpbiBhIGdpdmVuIHN0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVOYW1lIC0gTmFtZSBvZiBzdGF0ZSB0byBzZWFyY2ggZm9yIGFjdGlvblxuICAgKiBAcGFyYW0ge0FjdGlvbn0gYWN0aW9uIC0gQWN0aW9uIHRvIGZpbmQuXG4gICAqL1xuICAgYWN0aW9uRXhpc3RzIChzdGF0ZU5hbWUsIGFjdGlvbikge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5maW5kU3RhdGUoc3RhdGVOYW1lKTtcbiAgICBjb25zdCBleGlzdHMgPSBzdGF0ZS5hY3Rpb25zLmluZGV4T2YoYWN0aW9uKTtcblxuICAgIHJldHVybiAoZXhpc3RzID4gLTEpO1xuICAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIGEgc3RhdGUgYnkgbmFtZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHN0YXRlIHRvIGZpbmQuXG4gICAqIEByZXR1cm4ge1N0YXRlfSBBIFN0YXRlIG9iamVjdC5cbiAgICovXG4gIGZpbmRTdGF0ZSAobmFtZSkge1xuICAgIGNvbnN0IGZvdW5kU3RhdGUgPSB0aGlzLnN0YXRlcy5maWx0ZXIoc3RhdGUgPT4ge1xuICAgICAgaWYgKHN0YXRlLm5hbWUgPT0gbmFtZSkgcmV0dXJuIHN0YXRlO1xuICAgIH0pO1xuXG4gICAgaWYgKGZvdW5kU3RhdGUubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIGZvdW5kU3RhdGVbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBGU01FcnJvcihcIk5vIHN0YXRlIGZvdW5kIHdpdGggdGhpcyBuYW1lOiBcIiArIG5hbWUpXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBsaW5rIGJldHdlZW4gdHdvIHN0YXRlcyBmb3IgYSBnaXZlbiBldmVudC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlRnJvbSAtIFN0YXRlIHRvIHJlZ2lzdGVyIGxpbmsgb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZVRvIC0gU3RhdGUgdG8gbGluayB0by5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IC0gRXZlbnQgd2hpY2ggZXhlY3V0ZXMgdGhlIGxpbmsuXG4gICAqL1xuICBsaW5rU3RhdGUgKHN0YXRlRnJvbSwgc3RhdGVUbywgZXZlbnQpIHtcbiAgICBjb25zdCBsaW5rID0gbmV3IExpbmsoZXZlbnQsIHN0YXRlVG8pO1xuXG4gICAgY29uc3QgZnJvbVN0YXRlID0gdGhpcy5maW5kU3RhdGUoc3RhdGVGcm9tKTtcbiAgICBmcm9tU3RhdGUubGlua3MucHVzaChsaW5rKTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIFJlY2VpdmUgYW4gZXZlbnQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFxuICAgKi9cbiAgcmVjZWl2ZSAoZXZlbnQpIHtcbiAgICB0aGlzLmxvZyhgcmVjZWl2ZWQgZXZlbnQ6ICR7ZXZlbnR9YCk7XG5cbiAgICBjb25zdCBsaW5rcyA9ICh0aGlzLmN1cnJlbnRTdGF0ZS5saW5rcy5maWx0ZXIobGluayA9PiB7XG4gICAgICAgIGlmIChsaW5rLmV2ZW50ID09IGV2ZW50KSByZXR1cm4gbGluaztcbiAgICB9KSk7XG5cbiAgICBpZiAobGlua3MubGVuZ3RoID4gMCkgdGhpcy5jaGFuZ2VTdGF0ZShsaW5rc1swXS5zdGF0ZU5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2YWx1YXRlcyBzdGF0ZSBieSBydW5uaW5nIGFsbCBhY3Rpb25zIG9mIGN1cnJlbnQgc3RhdGUsIHJldHVybmluZyB0cnVlIHdoZW4gY29tcGxldGUuXG4gICAqIEByZXR1cm4ge2Jvb2x9IFxuICAgKi9cbiAgYXN5bmMgZXZhbHVhdGUgKCkge1xuICAgIHRoaXMubG9nKGBldmFsdWF0aW5nIHN0YXRlIG9mIG1hY2hpbmVgKTtcbiAgICBcbiAgICBpZiAoIXRoaXMuY3VycmVudFN0YXRlKSB7XG4gICAgICB0aGlzLmxvZyhgY29udGFpbnMgbm8gY3VycmVudCBzdGF0ZWApO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9nKGBjdXJyZW50IHN0YXRlIGlzICR7dGhpcy5jdXJyZW50U3RhdGUubmFtZX1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBhY3Rpb25zID0gdGhpcy5jdXJyZW50U3RhdGUuYWN0aW9ucztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFjdGlvbnMubGVuZ3RoIDsgaSsrKSB7XG4gICAgICBsZXQgYWN0aW9uID0gYWN0aW9uc1tpXTtcbiAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICBjb25zdCBsaW1pdCA9IDEwO1xuICAgICAgbGV0IHJlcztcbiAgICAgIHdoaWxlICghcmVzICYmIGNvdW50IDwgbGltaXQpIHtcbiAgICAgICAgcmVzID0gYXdhaXQgYWN0aW9uLmNhbGxiYWNrKGFjdGlvbi5hcmdzKTtcbiAgICAgICAgY291bnQrKztcbiAgICAgICAgaWYgKGNvdW50ID09IGxpbWl0KSB7dGhpcy5sb2coXCJzdGF0ZSBldmFsdWF0aW9uIGxpbWl0IHJlYWNoZWRcIik7fVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENoYW5nZSBjdXJyZW50IHN0YXRlIHRvIGdpdmVuIHN0YXRlIGJ5IG5hbWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZU5hbWUgLSBTdGF0ZSB0byBjaGFuZ2UgdG8uIFxuICAgKi9cbiAgY2hhbmdlU3RhdGUgKHN0YXRlTmFtZSkge1xuICAgIHRoaXMubG9nKGBjaGFuZ2luZyBzdGF0ZSBmcm9tICR7dGhpcy5jdXJyZW50U3RhdGUubmFtZX0gdG8gJHtzdGF0ZU5hbWV9YCk7XG5cbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmluZFN0YXRlKHN0YXRlTmFtZSk7XG4gICAgdGhpcy5jdXJyZW50U3RhdGUgPSBzdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgdGhlIG5hbWUgb2YgdGhlIGdpdmVuIHN0YXRlIHdpdGggdGhlIG5ldyBuYW1lIHByb3ZpZGVkLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVOYW1lIC0gTmFtZSBvZiBzdGF0ZSB0byByZW5hbWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuZXdTdGF0ZU5hbWUgLSBOZXcgbmFtZSBmb3Igc3RhdGUuXG4gICAqL1xuICByZW5hbWVTdGF0ZSAoc3RhdGVOYW1lLCBuZXdTdGF0ZU5hbWUpIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmluZFN0YXRlKHN0YXRlTmFtZSk7XG4gICAgc3RhdGUubmFtZSA9IG5ld1N0YXRlTmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGFjdGlvbiB0byBhIGdpdmVuIHN0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVOYW1lIC0gTmFtZSBvZiBzdGF0ZSB0byBhZGQgYWN0aW9uIHRvLlxuICAgKiBAcGFyYW0ge0FjdGlvbn0gYWN0aW9uIC0gQWN0aW9uIHRvIGFkZC5cbiAgICovXG4gIGFkZEFjdGlvbiAoc3RhdGVOYW1lLCBhY3Rpb24pIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmluZFN0YXRlKHN0YXRlTmFtZSk7XG4gICAgc3RhdGUuYWN0aW9ucy5wdXNoKGFjdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbiBhY3Rpb24gZnJvbSBhIHN0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVOYW1lIC0gTmFtZSBvZiB0aGUgc3RhdGUgdG8gcmVtb3ZlIGFjdGlvbiBmcm9tLlxuICAgKiBAcGFyYW0ge0FjdGlvbn0gYWN0aW9uIC0gQWN0aW9uIHRvIHJlbW92ZS5cbiAgICovXG4gICByZW1vdmVBY3Rpb24gKHN0YXRlTmFtZSwgYWN0aW9uKSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZpbmRTdGF0ZShzdGF0ZU5hbWUpO1xuXG4gICAgaWYgKCF0aGlzLmFjdGlvbkV4aXN0cyhzdGF0ZU5hbWUsIGFjdGlvbikpIHtcbiAgICAgIHRocm93IG5ldyBGU01FcnJvcihgYWN0aW9uIGRvZXMgbm90IGV4aXN0IHdpdGhpbiAke3N0YXRlTmFtZX1gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBpbmRleCA9IHN0YXRlLmFjdGlvbnMuaW5kZXhPZihhY3Rpb24pO1xuICAgIHN0YXRlLmFjdGlvbnMuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgIHRoaXMubG9nKGByZW1vdmVkIGFjdGlvbiBmcm9tICR7c3RhdGVOYW1lfWApO1xuICAgfVxuXG4gIC8qKlxuICAgKiBQcmludHMgZm9ybWF0dGVkIG1lc3NhZ2UgdG8gY29uc29sZS5sb2cuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGV4dCBvZiBtZXNzYWdlIHRvIGxvZy5cbiAgICovXG4gIGxvZyAodGV4dCkge1xuICAgIGlmICh0aGlzLmxvZ01lc3NhZ2VzKSBjb25zb2xlLmxvZyhgJHt0aGlzLm5hbWV9OiAke3RleHR9YCk7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBBY3RpdmF0ZSBtZXNzYWdlIGxvZ2dpbmcuIERlZmF1bHQgaXMgdHJ1ZS5cbiAgICogQHBhcmFtIHtib29sfSBhY3RpdmUgLSBJZiB0cnVlIHdpbGwgbG9nIGFsbCBmc20gbWVzc2FnZXNcbiAgICovXG4gIGRlYnVnIChhY3RpdmUpIHtcbiAgICB0aGlzLmxvZ01lc3NhZ2VzID0gYWN0aXZlO1xuICB9XG59XG5cbi8qKlxuICogQSBkaXNjcmV0ZSBzdGF0ZSBvZiBhIHN0YXRlIG1hY2hpbmUuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2Ygc3RhdGUuXG4gKi9cbmZ1bmN0aW9uIFN0YXRlIChuYW1lKSB7XG4gIHRoaXMubmFtZSA9IG5hbWU7XG4gIHRoaXMuaWQ7XG4gIHRoaXMubGlua3MgPSBbXTsgLy8gQWxsIG91dGJvdW5kIGNvbm5lY3Rpbmcgc3RhdGVzIGZyb20gdGhpcyBzdGF0ZVxuICB0aGlzLmFjdGlvbnMgPSBbXTsgLy8gQWxsIGFjdGlvbnMgYXNzaWduZWQgdG8gdGhpcyBzdGF0ZTtcbn1cblxuLyoqXG4gKiBUaGUgdW5pZGlyZWN0aW9uYWwgbGluayBiZXR3ZWVuIHR3byBzdGF0ZXMuXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBOYW1lIG9mIGV2ZW50IHRvIGxpc3RlbiBmb3IuXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RhdGUgLSBOYW1lIG9mIGV2ZW50IHRvIGxpbmsgdG8uXG4gKi9cbmZ1bmN0aW9uIExpbmsgKGV2ZW50LCBzdGF0ZSkge1xuICB0aGlzLmV2ZW50ID0gZXZlbnQ7XG4gIHRoaXMuc3RhdGVOYW1lID0gc3RhdGU7XG59XG5cbi8qKlxuICogR2VuZXJhbCBGU00gZXJyb3IgRXhjZXB0aW9uIGNsYXNzLlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBFcnJvciBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBGU01FcnJvciAodGV4dCkge1xuICB0aGlzLnRleHQgPSB0ZXh0O1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2ZzbS5qc1xuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiogR2VuZXJhbCB1dGlsaXR5IGZ1bmN0aW9ucyAqL1xuXG4vKipcbiAqIFByb21pc2UgYmFzZWQgZGVsYXkgdGltZXIuXG4gKiBAcGFyYW0ge2ludH0gbXMgLSBEZWxheSBpbiBtaWxpc2Vjb25kcy5cbiAqIEByZXR1cm4ge1Byb21pc2V9IC0gUHJvbWlzZSB3cmFwcGVkIHRpbWVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2xlZXAgKG1zKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSB1bmlxdWUgaWQge3N0cmluZ31cbiAqIEByZXR1cm4ge3N0cmluZ30gLSBhIHJhbmRvbSAxMiBjaGFyYWN0ZXIgaWQgc3RyaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZUlEICgpIHtcbiAgbGV0IHRleHQgPSBcIlwiO1xuICBjb25zdCBwb3NzaWJsZSA9IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODlcIjtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IDEyOyBpKyspXG4gICAgdGV4dCArPSBwb3NzaWJsZS5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcG9zc2libGUubGVuZ3RoKSk7XG5cbiAgcmV0dXJuIHRleHQ7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdXRpbGl0eS5qc1xuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgeyBBY3Rpb24sIHdhaXQsIHNlbmRFdmVudCB9IGZyb20gJy4vYWN0aW9uJztcbmltcG9ydCBGU00gZnJvbSAnLi9mc20nO1xuXG5leHBvcnRzLkZTTSA9IEZTTTtcbmV4cG9ydHMuQWN0aW9uID0gQWN0aW9uO1xuZXhwb3J0cy53YWl0ID0gd2FpdDtcbmV4cG9ydHMuc2VuZEV2ZW50ID0gc2VuZEV2ZW50O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IEZTTSBmcm9tICcuL2ZzbSc7XG5pbXBvcnQgeyBzbGVlcCwgbWFrZUlEIH0gZnJvbSAnLi91dGlsaXR5JztcblxuLyoqIEFjdGlvbiB0eXBlIGFuZCBwcmVtYWRlIGFjdGlvbnMgKi9cblxuLyoqXG4gKiBBY3Rpb25zIHBlcmZvcm1lZCBieSBhIHN0YXRlIG9uY2UgYWN0aXZhdGVkLlxuICogQWN0aW9ucyBtdXN0IGJlIGFzeW5jaHJvbm91cyBhbmQgcmV0dXJuIGEge2Jvb2x9IG9uIGNvbXBsZXRpb246IFxuICogIHRydWUgaWYgZmluaXNoZWQsIG9yIGZhbHNlIGlmIGl0IG11c3QgYmUgcmVldmFsdWF0ZWQuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIEFzeW5jaHJvbm91cyBmdW5jdGlvbiB0byBjYWxsIGR1cmluZyBhY3Rpb24gZXZhbHVhdGlvbi5cbiAqIEBwYXJhbSB7YXJncyp9IGFyZ3MgLSBBcmd1bWVudHMgdG8gcGFzcyB0byBjYWxsYmFjay5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFjdGlvbiAoY2FsbGJhY2ssIGFyZ3MgPSBudWxsKSB7XG4gIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgdGhpcy5hcmdzID0gYXJncztcbiAgdGhpcy5pZCA9IG1ha2VJRCgpO1xufVxuXG4vKiogQWN0aW9ucyAqL1xuXG4vKipcbiAqIERlbGF5IHRpbWVyIGFjdGlvbi5cbiAqIEBwYXJhbSB7aW50fSBtcyAtIERlbGF5IGluIG1pbGlzZWNvbmRzLlxuICogQHJldHVybiB7Ym9vbH1cbiAqL1xuZXhwb3J0IGNvbnN0IHdhaXQgPSBhc3luYyAobXMgPSAxMDAwKSA9PiB7XG4gIGNvbnN0IHNvbWV0aGluZyA9IGF3YWl0IHNsZWVwKG1zKTtcbiAgcmV0dXJuIHRydWVcbn1cblxuLyoqXG4gKiBEZWJ1Z2dpbmcgYWN0aW9uLlxuICogQHJldHVybiB7Ym9vbH1cbiAqL1xuZXhwb3J0IGNvbnN0IHJldHVybkZhbHNlID0gYXN5bmMgKCkgPT4ge1xuICByZXR1cm4gZmFsc2Vcbn1cblxuLyoqXG4gKiBTaW1wbGUgZXZlbnQgYnJvYWRjYXN0aW5nIGFjdGlvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCAtIEV2ZW50IHRvIGJyb2FkY2FzdC5cbiAqIEByZXR1cm4ge2Jvb2x9XG4gKi9cbmV4cG9ydCBjb25zdCBzZW5kRXZlbnQgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgRlNNLmJyb2FkY2FzdChldmVudCk7XG4gIHJldHVybiB0cnVlO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2FjdGlvbi5qc1xuLy8gbW9kdWxlIGlkID0gM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9