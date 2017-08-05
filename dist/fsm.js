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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZmZkOWU5ZjZiMGIzYzhmZDQ0NTIiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ZzbS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbGl0eS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FjdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7OztBQzdEaUI7O0FBRWpCO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCLHFCQUFxQjtBQUNyQjtBQUNBLDRCQUE0QjtBQUM1Qjs7QUFFQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQSxhQUFhLE9BQU87QUFDcEIsY0FBYyxNQUFNO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7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VGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgZmZkOWU5ZjZiMGIzYzhmZDQ0NTIiLCJpbXBvcnQgeyBtYWtlSUQgfSBmcm9tICcuL3V0aWxpdHknO1xuXG4vKiogR2VuZXJhbGl6ZWQgZmluaXRlIHN0YXRlIG1hY2hpbmUgKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZTTSB7XG4gIGNvbnN0cnVjdG9yIChuYW1lID0gXCJGU01cIikge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5jdXJyZW50U3RhdGU7IC8vIFRoZSBjdXJyZW50bHkgYWN0aXZlIHN0YXRlIG9mIHRoZSBGU01cbiAgICB0aGlzLnN0YXRlcyA9IFtdOyAvLyBBbGwgc3RhdGVzIHdpdGhpbiB0aGlzIFNNXG4gICAgdGhpcy5pZCA9IG1ha2VJRCgpO1xuICAgIHRoaXMubG9nTWVzc2FnZXMgPSB0cnVlOyAvLyBMb2cgYWxsIGludGVybmFsIG1lc3NhZ2VzIHRvIGNvbnNvbGVcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuZCByZXR1cm5zIGEgbmV3IHN0YXRlIG1hY2hpbmVcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSBzdGF0ZSBtYWNoaW5lXG4gICAqL1xuICBzdGF0aWMgY3JlYXRlIChuYW1lKSB7XG4gICAgY29uc3QgZnNtID0gbmV3IEZTTShuYW1lKTtcbiAgICBpZiAoIUZTTS5zdGF0ZU1hY2hpbmVzKSBGU00uc3RhdGVNYWNoaW5lcyA9IFtdO1xuICAgIEZTTS5zdGF0ZU1hY2hpbmVzLnB1c2goZnNtKTtcbiAgICBcbiAgICByZXR1cm4gZnNtO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgZ2l2ZW4gZXZlbnQgdG8gYWxsIHN0YXRlIG1hY2hpbmVzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBFdmVudCB0byBicm9hZGNhc3QgdG8gRlNNcy5cbiAgICovXG4gIHN0YXRpYyBicm9hZGNhc3QgKGV2ZW50KSB7XG4gICAgRlNNLnN0YXRlTWFjaGluZXMuZm9yRWFjaChzbSA9PiB7XG4gICAgICBzbS5yZWNlaXZlKGV2ZW50KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBzdGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHN0YXRlIHRvIGNyZWF0ZS5cbiAgICogQHJldHVybiB7U3RhdGV9IEEgU3RhdGUgb2JqZWN0LlxuICAgKi9cbiAgYWRkU3RhdGUgKG5hbWUpIHtcbiAgICBjb25zdCBzdGF0ZSA9IG5ldyBTdGF0ZShuYW1lKTtcbiAgICBzdGF0ZS5pZCA9IG1ha2VJRCgpO1xuICAgIHRoaXMuc3RhdGVzLnB1c2goc3RhdGUpO1xuXG4gICAgaWYgKCF0aGlzLmN1cnJlbnRTdGF0ZSkgdGhpcy5jdXJyZW50U3RhdGUgPSBzdGF0ZTtcblxuICAgIHJldHVybiBzdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgc3RhdGUgZnJvbSBzdGF0ZXMgYXJyYXkuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiBzdGF0ZSB0byByZW1vdmUuXG4gICAqL1xuICByZW1vdmVTdGF0ZSAobmFtZSkge1xuICAgICAgaWYgKCF0aGlzLnN0YXRlRXhpc3RzKG5hbWUpKSB0aHJvdyBuZXcgRlNNRXJyb3IoXCJObyBzdGF0ZSBmb3VuZCB3aXRoIHRoaXMgbmFtZTogXCIgKyBuYW1lKVxuXG4gICAgICBjb25zdCBmaWx0ZXJlZFN0YXRlcyA9IHRoaXMuc3RhdGVzLmZpbHRlcihzdGF0ZSA9PiB7XG4gICAgICAgIGlmIChzdGF0ZS5uYW1lICE9IG5hbWUpIHJldHVybiBzdGF0ZTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5zdGF0ZXMgPSBmaWx0ZXJlZFN0YXRlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGUgdGhpcyBzdGF0ZSBtYWNoaW5lLlxuICAgKi9cbiAgZGVzdHJveSAoKSB7XG4gICAgY29uc3QgaW5kZXggPSBGU00uc3RhdGVNYWNoaW5lcy5pbmRleE9mKHRoaXMpO1xuICAgIGNvbnN0IHByZSA9IEZTTS5zdGF0ZU1hY2hpbmVzLnNsaWNlKDAsIGluZGV4KTtcbiAgICBjb25zdCBwb3N0ID0gRlNNLnN0YXRlTWFjaGluZXMuc2xpY2UoaW5kZXgrMSk7XG4gICAgRlNNLnN0YXRlTWFjaGluZXMgPSBwcmUuY29uY2F0KHBvc3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHN0YXRlIGlzIGluIHN0YXRlcyBhcnJheS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgc3RhdGUgdG8gY2hlY2sgZm9yLlxuICAgKiBAcmV0dXJuIHtib29sfVxuICAgKi9cbiAgc3RhdGVFeGlzdHMgKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZXMuc29tZShzdGF0ZSA9PiB7XG4gICAgICAgIGlmIChzdGF0ZS5uYW1lID09IG5hbWUpIHJldHVybiBzdGF0ZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGEgc3RhdGUgY29udGFpbnMgYSBsaW5rIHRvIGEgZ2l2ZW4gc3RhdGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZUZyb20gLSBUaGUgc3RhdGUgdG8gY2hlY2sgZm9yIGxpbmtzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVUbyAtIFRoZSBzdGF0ZSBiZWluZyBsaW5rZWQgdG8uXG4gICAqIEByZXR1cm4ge2Jvb2x9XG4gICAqL1xuICBsaW5rRXhpc3RzIChzdGF0ZUZyb20sIHN0YXRlVG8pIHtcbiAgICBjb25zdCBmcm9tU3RhdGUgPSB0aGlzLmZpbmRTdGF0ZShzdGF0ZUZyb20pO1xuICAgIGNvbnN0IGV4aXN0cyA9IGZyb21TdGF0ZS5saW5rcy5zb21lKHN0YXRlTGluayA9PiB7XG4gICAgICAgIGlmIChzdGF0ZUxpbmsuc3RhdGVOYW1lID09IHN0YXRlVG8pIHJldHVybiBzdGF0ZUxpbms7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZXhpc3RzO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgYSBzdGF0ZSBieSBuYW1lLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2Ygc3RhdGUgdG8gZmluZC5cbiAgICogQHJldHVybiB7U3RhdGV9IEEgU3RhdGUgb2JqZWN0LlxuICAgKi9cbiAgZmluZFN0YXRlIChuYW1lKSB7XG4gICAgY29uc3QgZm91bmRTdGF0ZSA9IHRoaXMuc3RhdGVzLmZpbHRlcihzdGF0ZSA9PiB7XG4gICAgICBpZiAoc3RhdGUubmFtZSA9PSBuYW1lKSByZXR1cm4gc3RhdGU7XG4gICAgfSk7XG5cbiAgICBpZiAoZm91bmRTdGF0ZS5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gZm91bmRTdGF0ZVswXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEZTTUVycm9yKFwiTm8gc3RhdGUgZm91bmQgd2l0aCB0aGlzIG5hbWU6IFwiICsgbmFtZSlcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGxpbmsgYmV0d2VlbiB0d28gc3RhdGVzIGZvciBhIGdpdmVuIGV2ZW50LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVGcm9tIC0gU3RhdGUgdG8gcmVnaXN0ZXIgbGluayBvbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlVG8gLSBTdGF0ZSB0byBsaW5rIHRvLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBFdmVudCB3aGljaCBleGVjdXRlcyB0aGUgbGluay5cbiAgICovXG4gIGxpbmtTdGF0ZSAoc3RhdGVGcm9tLCBzdGF0ZVRvLCBldmVudCkge1xuICAgIGNvbnN0IGxpbmsgPSBuZXcgTGluayhldmVudCwgc3RhdGVUbyk7XG5cbiAgICBjb25zdCBmcm9tU3RhdGUgPSB0aGlzLmZpbmRTdGF0ZShzdGF0ZUZyb20pO1xuICAgIGZyb21TdGF0ZS5saW5rcy5wdXNoKGxpbmspO1xuICB9XG4gIFxuICAvKipcbiAgICogUmVjZWl2ZSBhbiBldmVudC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50XG4gICAqL1xuICByZWNlaXZlIChldmVudCkge1xuICAgIHRoaXMubG9nKGByZWNlaXZlZCBldmVudDogJHtldmVudH1gKTtcblxuICAgIGNvbnN0IGxpbmtzID0gKHRoaXMuY3VycmVudFN0YXRlLmxpbmtzLmZpbHRlcihsaW5rID0+IHtcbiAgICAgICAgaWYgKGxpbmsuZXZlbnQgPT0gZXZlbnQpIHJldHVybiBsaW5rO1xuICAgIH0pKTtcblxuICAgIGlmIChsaW5rcy5sZW5ndGggPiAwKSB0aGlzLmNoYW5nZVN0YXRlKGxpbmtzWzBdLnN0YXRlTmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogRXZhbHVhdGVzIHN0YXRlIGJ5IHJ1bm5pbmcgYWxsIGFjdGlvbnMgb2YgY3VycmVudCBzdGF0ZSwgcmV0dXJuaW5nIHRydWUgd2hlbiBjb21wbGV0ZS5cbiAgICogQHJldHVybiB7Ym9vbH0gXG4gICAqL1xuICBhc3luYyBldmFsdWF0ZSAoKSB7XG4gICAgdGhpcy5sb2coYGV2YWx1YXRpbmcgc3RhdGUgb2YgbWFjaGluZWApO1xuICAgIFxuICAgIGlmICghdGhpcy5jdXJyZW50U3RhdGUpIHtcbiAgICAgIHRoaXMubG9nKGBjb250YWlucyBubyBjdXJyZW50IHN0YXRlYCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sb2coYGN1cnJlbnQgc3RhdGUgaXMgJHt0aGlzLmN1cnJlbnRTdGF0ZS5uYW1lfWApO1xuICAgIH1cblxuICAgIGNvbnN0IGFjdGlvbnMgPSB0aGlzLmN1cnJlbnRTdGF0ZS5hY3Rpb25zO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWN0aW9ucy5sZW5ndGggOyBpKyspIHtcbiAgICAgIGxldCBhY3Rpb24gPSBhY3Rpb25zW2ldO1xuICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgIGNvbnN0IGxpbWl0ID0gMTA7XG4gICAgICBsZXQgcmVzO1xuICAgICAgd2hpbGUgKCFyZXMgJiYgY291bnQgPCBsaW1pdCkge1xuICAgICAgICByZXMgPSBhd2FpdCBhY3Rpb24uY2FsbGJhY2soYWN0aW9uLmFyZ3MpO1xuICAgICAgICBjb3VudCsrO1xuICAgICAgICBpZiAoY291bnQgPT0gbGltaXQpIHt0aGlzLmxvZyhcInN0YXRlIGV2YWx1YXRpb24gbGltaXQgcmVhY2hlZFwiKTt9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlIGN1cnJlbnQgc3RhdGUgdG8gZ2l2ZW4gc3RhdGUgYnkgbmFtZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlTmFtZSAtIFN0YXRlIHRvIGNoYW5nZSB0by4gXG4gICAqL1xuICBjaGFuZ2VTdGF0ZSAoc3RhdGVOYW1lKSB7XG4gICAgdGhpcy5sb2coYGNoYW5naW5nIHN0YXRlIGZyb20gJHt0aGlzLmN1cnJlbnRTdGF0ZS5uYW1lfSB0byAke3N0YXRlTmFtZX1gKTtcblxuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5maW5kU3RhdGUoc3RhdGVOYW1lKTtcbiAgICB0aGlzLmN1cnJlbnRTdGF0ZSA9IHN0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIENoYW5nZSB0aGUgbmFtZSBvZiB0aGUgZ2l2ZW4gc3RhdGUgd2l0aCB0aGUgbmV3IG5hbWUgcHJvdmlkZWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZU5hbWUgLSBOYW1lIG9mIHN0YXRlIHRvIHJlbmFtZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5ld1N0YXRlTmFtZSAtIE5ldyBuYW1lIGZvciBzdGF0ZS5cbiAgICovXG4gIHJlbmFtZVN0YXRlIChzdGF0ZU5hbWUsIG5ld1N0YXRlTmFtZSkge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5maW5kU3RhdGUoc3RhdGVOYW1lKTtcbiAgICBzdGF0ZS5uYW1lID0gbmV3U3RhdGVOYW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYW4gYWN0aW9uIHRvIGEgZ2l2ZW4gc3RhdGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZU5hbWUgLSBOYW1lIG9mIHN0YXRlIHRvIGFkZCBhY3Rpb24gdG8uXG4gICAqIEBwYXJhbSB7QWN0aW9ufSBhY3Rpb24gLSBBY3Rpb24gdG8gYWRkLlxuICAgKi9cbiAgYWRkQWN0aW9uIChzdGF0ZU5hbWUsIGFjdGlvbikge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5maW5kU3RhdGUoc3RhdGVOYW1lKTtcbiAgICBzdGF0ZS5hY3Rpb25zLnB1c2goYWN0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmludHMgZm9ybWF0dGVkIG1lc3NhZ2UgdG8gY29uc29sZS5sb2cuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGV4dCBvZiBtZXNzYWdlIHRvIGxvZy5cbiAgICovXG4gIGxvZyAodGV4dCkge1xuICAgIGlmICh0aGlzLmxvZ01lc3NhZ2VzKSBjb25zb2xlLmxvZyhgJHt0aGlzLm5hbWV9OiAke3RleHR9YCk7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBBY3RpdmF0ZSBtZXNzYWdlIGxvZ2dpbmcuIERlZmF1bHQgaXMgdHJ1ZS5cbiAgICogQHBhcmFtIHtib29sfSBhY3RpdmUgLSBJZiB0cnVlIHdpbGwgbG9nIGFsbCBmc20gbWVzc2FnZXNcbiAgICovXG4gIGRlYnVnIChhY3RpdmUpIHtcbiAgICB0aGlzLmxvZ01lc3NhZ2VzID0gYWN0aXZlO1xuICB9XG59XG5cbi8qKlxuICogQSBkaXNjcmV0ZSBzdGF0ZSBvZiBhIHN0YXRlIG1hY2hpbmUuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2Ygc3RhdGUuXG4gKi9cbmZ1bmN0aW9uIFN0YXRlIChuYW1lKSB7XG4gIHRoaXMubmFtZSA9IG5hbWU7XG4gIHRoaXMuaWQ7XG4gIHRoaXMubGlua3MgPSBbXTsgLy8gQWxsIG91dGJvdW5kIGNvbm5lY3Rpbmcgc3RhdGVzIGZyb20gdGhpcyBzdGF0ZVxuICB0aGlzLmFjdGlvbnMgPSBbXTsgLy8gQWxsIGFjdGlvbnMgYXNzaWduZWQgdG8gdGhpcyBzdGF0ZTtcbn1cblxuLyoqXG4gKiBUaGUgdW5pZGlyZWN0aW9uYWwgbGluayBiZXR3ZWVuIHR3byBzdGF0ZXMuXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBOYW1lIG9mIGV2ZW50IHRvIGxpc3RlbiBmb3IuXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RhdGUgLSBOYW1lIG9mIGV2ZW50IHRvIGxpbmsgdG8uXG4gKi9cbmZ1bmN0aW9uIExpbmsgKGV2ZW50LCBzdGF0ZSkge1xuICB0aGlzLmV2ZW50ID0gZXZlbnQ7XG4gIHRoaXMuc3RhdGVOYW1lID0gc3RhdGU7XG59XG5cbi8qKlxuICogR2VuZXJhbCBGU00gZXJyb3IgRXhjZXB0aW9uIGNsYXNzLlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBFcnJvciBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBGU01FcnJvciAodGV4dCkge1xuICB0aGlzLnRleHQgPSB0ZXh0O1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2ZzbS5qc1xuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiogR2VuZXJhbCB1dGlsaXR5IGZ1bmN0aW9ucyAqL1xuXG4vKipcbiAqIFByb21pc2UgYmFzZWQgZGVsYXkgdGltZXIuXG4gKiBAcGFyYW0ge2ludH0gbXMgLSBEZWxheSBpbiBtaWxpc2Vjb25kcy5cbiAqIEByZXR1cm4ge1Byb21pc2V9IC0gUHJvbWlzZSB3cmFwcGVkIHRpbWVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2xlZXAgKG1zKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSB1bmlxdWUgaWQge3N0cmluZ31cbiAqIEByZXR1cm4ge3N0cmluZ30gLSBhIHJhbmRvbSAxMiBjaGFyYWN0ZXIgaWQgc3RyaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZUlEICgpIHtcbiAgbGV0IHRleHQgPSBcIlwiO1xuICBjb25zdCBwb3NzaWJsZSA9IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODlcIjtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IDEyOyBpKyspXG4gICAgdGV4dCArPSBwb3NzaWJsZS5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcG9zc2libGUubGVuZ3RoKSk7XG5cbiAgcmV0dXJuIHRleHQ7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdXRpbGl0eS5qc1xuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgeyBBY3Rpb24sIHdhaXQsIHNlbmRFdmVudCB9IGZyb20gJy4vYWN0aW9uJztcbmltcG9ydCBGU00gZnJvbSAnLi9mc20nO1xuXG5leHBvcnRzLkZTTSA9IEZTTTtcbmV4cG9ydHMuQWN0aW9uID0gQWN0aW9uO1xuZXhwb3J0cy53YWl0ID0gd2FpdDtcbmV4cG9ydHMuc2VuZEV2ZW50ID0gc2VuZEV2ZW50O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IEZTTSBmcm9tICcuL2ZzbSc7XG5pbXBvcnQgeyBzbGVlcCB9IGZyb20gJy4vdXRpbGl0eSc7XG5cbi8qKiBBY3Rpb24gdHlwZSBhbmQgcHJlbWFkZSBhY3Rpb25zICovXG5cbi8qKlxuICogQWN0aW9ucyBwZXJmb3JtZWQgYnkgYSBzdGF0ZSBvbmNlIGFjdGl2YXRlZC5cbiAqIEFjdGlvbnMgbXVzdCBiZSBhc3luY2hyb25vdXMgYW5kIHJldHVybiBhIHtib29sfSBvbiBjb21wbGV0aW9uOiBcbiAqICB0cnVlIGlmIGZpbmlzaGVkLCBvciBmYWxzZSBpZiBpdCBtdXN0IGJlIHJlZXZhbHVhdGVkLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBBc3luY2hyb25vdXMgZnVuY3Rpb24gdG8gY2FsbCBkdXJpbmcgYWN0aW9uIGV2YWx1YXRpb24uXG4gKiBAcGFyYW0ge2FyZ3MqfSBhcmdzIC0gQXJndW1lbnRzIHRvIHBhc3MgdG8gY2FsbGJhY2suXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBY3Rpb24gKGNhbGxiYWNrLCBhcmdzID0gbnVsbCkge1xuICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gIHRoaXMuYXJncyA9IGFyZ3M7XG59XG5cbi8qKiBBY3Rpb25zICovXG5cbi8qKlxuICogRGVsYXkgdGltZXIgYWN0aW9uLlxuICogQHBhcmFtIHtpbnR9IG1zIC0gRGVsYXkgaW4gbWlsaXNlY29uZHMuXG4gKiBAcmV0dXJuIHtib29sfVxuICovXG5leHBvcnQgY29uc3Qgd2FpdCA9IGFzeW5jIChtcyA9IDEwMDApID0+IHtcbiAgY29uc3Qgc29tZXRoaW5nID0gYXdhaXQgc2xlZXAobXMpO1xuICByZXR1cm4gdHJ1ZVxufVxuXG4vKipcbiAqIERlYnVnZ2luZyBhY3Rpb24uXG4gKiBAcmV0dXJuIHtib29sfVxuICovXG5leHBvcnQgY29uc3QgcmV0dXJuRmFsc2UgPSBhc3luYyAoKSA9PiB7XG4gIHJldHVybiBmYWxzZVxufVxuXG4vKipcbiAqIFNpbXBsZSBldmVudCBicm9hZGNhc3RpbmcgYWN0aW9uLlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IC0gRXZlbnQgdG8gYnJvYWRjYXN0LlxuICogQHJldHVybiB7Ym9vbH1cbiAqL1xuZXhwb3J0IGNvbnN0IHNlbmRFdmVudCA9IGFzeW5jIChldmVudCkgPT4ge1xuICBGU00uYnJvYWRjYXN0KGV2ZW50KTtcbiAgcmV0dXJuIHRydWU7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvYWN0aW9uLmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=