"use strict";

function FSM() {
	var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "FSM";

	this.name = name;

	// The currently active state of the FSM
	this.currentState;

	// All states within this SM
	this.states = [];

	// Add a state
	// Returns a State
	this.add = function (name) {
		state = new State(name);
		this.states.push(state);

		return state;
	};

	// Remove state from states array
	this.remove = function (name) {
		if (!this.stateExists(name)) throw new FSMError("No state found with this name: " + name);

		filteredStates = this.states.filter(function (state) {
			if (state.name != name) return state;
		});
		this.states = filteredStates;
	};

	// Check if state is in states array
	// Returns bool
	this.stateExists = function (name) {
		return this.states.some(function (state) {
			if (state.name == name) return state;
		});
	};

	// Check if a state contains a link to a given state
	this.linkExists = function (stateFrom, stateTo) {
		fromState = this.find(stateFrom);
		exists = fromState.links.some(function (link) {
			if (link.stateName == stateTo) return link;
		});

		return exists;
	};

	// Initialize the FSM
	this.initialize = function () {
		state = this.add("State 1");
		this.currentState = state;
	};

	// Find a state by name
	// Returns a State or null
	this.find = function (name) {
		foundState = this.states.filter(function (state) {
			if (state.name == name) return state;
		});

		if (foundState.length > 0) {
			return foundState[0];
		} else {
			throw new FSMError("No state found with this name: " + name);
			return null;
		}
	};

	// Create a link between two states for a given event
	this.link = function (stateFrom, stateTo, event) {
		link = new Link(event, stateTo);

		fromState = this.find(stateFrom);
		fromState.links.push(link);
	};

	// Receive an event
	this.receive = function (event) {
		link = this.currentState.links.filter(function (link) {
			if (link.event == event) return link;
		});

		if (link.length > 0) this.changeState(link[0].stateName);
	};

	// Evaluates the current state, running all actions
	this.evaluate = async function () {
		actions = this.currentState.actions;
		for (var i = 0; i < actions.length; i++) {
			action = actions[i];
			var count = 0;
			var limit = 10;
			var res = void 0;
			while (!res && count < limit) {
				res = await action.callback(action.args);
				count++;
				if (count == limit) {
					console.log("eval limit reached");
				}
			}
		}
	};

	// Change current state to given state by name
	this.changeState = function (stateName) {
		state = this.find(stateName);
		this.currentState = state;
	};

	// Change the name of the given state with the new name provided
	this.renameState = function (oldStateName, newStateName) {
		state = this.find(oldStateName);
		state.name = newStateName;
	};

	// Adds an action to a given state
	this.addAction = function (stateName, action) {
		state = this.find(stateName);
		state.actions.push(action);
	};
}

// A discrete state of a state machine
function State(name) {
	this.name = name;

	// All outbound connecting states from this state
	this.links = [];

	// All actions assigned to this state;
	this.actions = [];
}

// The unidirectional link between two states
function Link(event, state) {
	this.event = event;
	this.stateName = state;
}

// 	Actions performed by a state once activated
// 	Actions should return a bool: true if finished, false if it must be reevaluated
// 	TODO: limit reevaluation loop to 1000 tries

function Action(callback) {
	var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	this.callback = callback;
	this.args = args;
}

// General FSM error Exception class
function FSMError(text) {
	this.text = text;
}

// Actions

var waitForMe = async function waitForMe() {
	var ms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;

	var something = await sleep(ms);
	console.log("done waiting");
	return true;
};

async function returnFalse() {
	return false;
}

// Utility for actions
function sleep(ms) {
	return new Promise(function (resolve) {
		return setTimeout(resolve, ms);
	});
}

/// IMPLEMENTATION

fsm = new FSM();
fsm.initialize();

// fsm.add("fish");
// fsm.add("horse");
// fsm.link('fish', 'horse', 'on');
// fsm.link('State 1', 'fish', 'toFish');
// fsm.receive("on");
// console.log(fsm);
// fsm.receive("toFish");
// console.log(fsm);
// fsm.receive("on");

action = new Action(waitForMe, 10);
fsm.addAction("State 1", action);
fsm.addAction("State 1", new Action(returnFalse));
fsm.addAction("State 1", action);
console.log(fsm);
fsm.evaluate();
