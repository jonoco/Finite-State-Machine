"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** Generalized finite state machine */

var FSM = (function () {
  function FSM() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "FSM";

    _classCallCheck(this, FSM);

    this.name = name;
    this.currentState; // The currently active state of the FSM
    this.states = []; // All states within this SM
    this.id = makeID();
  }

  /**
   * Creates and returns a new state machine
   * @param {string} name - Name of the state machine
   */

  _createClass(FSM, [{
    key: "add",

    /**
     * Add a state.
     * @param {string} name - Name of state to create.
     * @return {State} A State object.
     */
    value: function add(name) {
      var state = new State(name);
      state.id = makeID();
      this.states.push(state);

      return state;
    }

    /**
     * Remove state from states array.
     * @param {string} name - Name of state to remove.
     */

  }, {
    key: "remove",
    value: function remove(name) {
      if (!this.stateExists(name)) throw new FSMError("No state found with this name: " + name);

      var filteredStates = this.states.filter(function (state) {
        if (state.name != name) return state;
      });
      this.states = filteredStates;
    }

    /**
     * Delete this state machine.
     */

  }, {
    key: "destroy",
    value: function destroy() {
      var index = FSM.stateMachines.indexOf(this);
      var pre = FSM.stateMachines.slice(0, index);
      var post = FSM.stateMachines.slice(index + 1);
      FSM.stateMachines = pre.concat(post);
    }

    /**
     * Check if state is in states array.
     * @param {string} name - The name of the state to check for.
     * @return {bool}
     */

  }, {
    key: "stateExists",
    value: function stateExists(name) {
      return this.states.some(function (state) {
        if (state.name == name) return state;
      });
    }

    /**
     * Check if a state contains a link to a given state.
     * @param {string} stateFrom - The state to check for links.
     * @param {string} stateTo - The state being linked to.
     * @return {bool}
     */

  }, {
    key: "linkExists",
    value: function linkExists(stateFrom, stateTo) {
      var fromState = this.find(stateFrom);
      var exists = fromState.links.some(function (stateLink) {
        if (stateLink.stateName == stateTo) return stateLink;
      });

      return exists;
    }

    /**
     * Initializes the FSM, creating a default starting state.
     */

  }, {
    key: "initialize",
    value: function initialize() {
      var state = this.add("State 1");
      this.currentState = state;
    }

    /**
     * Find a state by name.
     * @param {string} name - Name of state to find.
     * @return {State} A State object.
     */

  }, {
    key: "find",
    value: function find(name) {
      var foundState = this.states.filter(function (state) {
        if (state.name == name) return state;
      });

      if (foundState.length > 0) {
        return foundState[0];
      } else {
        throw new FSMError("No state found with this name: " + name);
        return null;
      }
    }

    /**
     * Create a link between two states for a given event.
     * @param {string} stateFrom - State to register link on.
     * @param {string} stateTo - State to link to.
     * @param {string} event - Event which executes the link.
     */

  }, {
    key: "linkState",
    value: function linkState(stateFrom, stateTo, event) {
      var link = new Link(event, stateTo);

      var fromState = this.find(stateFrom);
      fromState.links.push(link);
    }

    /**
     * Receive an event.
     * @param {string} event
     */

  }, {
    key: "receive",
    value: function receive(event) {
      console.log("received event: " + event);

      var links = this.currentState.links.filter(function (link) {
        if (link.event == event) return link;
      });

      if (links.length > 0) this.changeState(links[0].stateName);
    }

    /**
     * Evaluates state by running all actions of current state, returning true when complete.
     * @return {bool} 
     */

  }, {
    key: "evaluate",
    value: async function evaluate() {
      console.log("evaluating state of machine " + this.name);

      var actions = this.currentState.actions;
      for (var i = 0; i < actions.length; i++) {
        var action = actions[i];
        var count = 0;
        var limit = 10;
        var res = undefined;
        while (!res && count < limit) {
          res = await action.callback(action.args);
          count++;
          if (count == limit) {
            console.log("eval limit reached");
          }
        }
      }

      return true;
    }

    /**
     * Change current state to given state by name.
     * @param {string} stateName - State to change to. 
     */

  }, {
    key: "changeState",
    value: function changeState(stateName) {
      console.log(this.name + ": changing state to " + stateName);

      var state = this.find(stateName);
      this.currentState = state;
    }

    /**
     * Change the name of the given state with the new name provided.
     * @param {string} stateName - Name of state to rename.
     * @param {string} newStateName - New name for state.
     */

  }, {
    key: "renameState",
    value: function renameState(stateName, newStateName) {
      var state = this.find(stateName);
      state.name = newStateName;
    }

    /**
     * Adds an action to a given state.
     * @param {string} stateName - Name of state to add action to.
     * @param {Action} action - Action to add.
     */

  }, {
    key: "addAction",
    value: function addAction(stateName, action) {
      var state = this.find(stateName);
      state.actions.push(action);
    }

    /**
     * Prints formatted message to console.log.
     * @param {string} text - Text of message to log.
     */

  }, {
    key: "log",
    value: function log(text) {
      console.log(this.name + ": " + text);
    }
  }], [{
    key: "create",
    value: function create(name) {
      var fsm = new FSM(name);
      if (!FSM.stateMachines) FSM.stateMachines = [];
      FSM.stateMachines.push(fsm);
      fsm.initialize();
      return fsm;
    }

    /**
     * Send given event to all state machines.
     * @param {string} event - Event to broadcast to FSMs.
     */

  }, {
    key: "broadcast",
    value: function broadcast(event) {
      FSM.stateMachines.forEach(function (sm) {
        sm.receive(event);
      });
    }
  }]);

  return FSM;
})();

/**
 * A discrete state of a state machine.
 * @param {string} name - Name of state.
 */

function State(name) {
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
function Link(event, state) {
  this.event = event;
  this.stateName = state;
}

/**
 * Actions performed by a state once activated.
 * Actions should return a {bool}: true if finished, false if it must be reevaluated.
 * @param {function} callback - Asynchronise function to call during action evaluation.
 * @param {args*} args - Arguments to pass to callback.
 */
function Action(callback) {
  var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  this.callback = callback;
  this.args = args;
}

/**
 * General FSM error Exception class.
 * @param {string} text - Error message.
 */
function FSMError(text) {
  this.text = text;
}

/// Actions

/**
 * Delay timer action.
 * @param {int} ms - Delay in miliseconds.
 * @return {bool}
 */
var wait = async function wait() {
  var ms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;

  var something = await sleep(ms);
  console.log("done waiting");
  return true;
};

/**
 * Debugging action.
 * @return {bool}
 */
var returnFalse = async function returnFalse() {
  return false;
};

/**
 * Simple event broadcasting action.
 * @param {string} event - Event to broadcast.
 * @return {bool}
 */
var sendEvent = async function sendEvent(event) {
  FSM.broadcast(event);
  return true;
};

/// Utility functions

/**
 * Promise based delay timer.
 * @param {int} ms - Delay in miliseconds.
 * @return {Promise} - Promise wrapped timer.
 */
function sleep(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
}

/**
 * Create a unique id {string}
 * @return {string} - a random 12 character id string.
 */
function makeID() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 12; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }return text;
}

/// IMPLEMENTATION

var fsm = FSM.create();

fsm.add('State 2');
fsm.linkState('State 1', 'State 2', 'go');
fsm.addAction('State 1', new Action(wait, 2000));
fsm.addAction('State 1', new Action(sendEvent, 'go'));

var done = fsm.evaluate();
done.then(function () {
  console.log("eval complete");
});
