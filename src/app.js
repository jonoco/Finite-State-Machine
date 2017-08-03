class FSM {
	constructor(name = "FSM") {
		this.name = name;
		this.currentState; // The currently active state of the FSM
		this.states = [];	// All states within this SM
		this.id = FSM._makeID();
	}

	// Create and return a new state machine
	static create (name) {
		const fsm = new FSM(name);
		if (!FSM.stateMachines) FSM.stateMachines = [];
		FSM.stateMachines.push(fsm);
		fsm.initialize();
		return fsm;
	}

	// Send given event to all state machines
	static broadcast (event) {
		FSM.stateMachines.forEach(sm => {
			sm.receive(event);
		});
	}

	// Add a state
	// Returns a State
	add(name) {
		const state = new State(name);
		state.id = FSM._makeID();
		this.states.push(state);

		return state;
	}

	// Remove state from states array
	remove(name) {
			if (!this.stateExists(name)) throw new FSMError("No state found with this name: " + name)

			const filteredStates = this.states.filter(state => {
				if (state.name != name) return state;
			});
			this.states = filteredStates;
	}

	// Delete this state machine
	destroy () {
		const index = FSM.stateMachines.indexOf(this);
		const pre = FSM.stateMachines.slice(0, index);
		const post = FSM.stateMachines.slice(index+1);
		FSM.stateMachines = pre.concat(post);
	}

	// Check if state is in states array
	// Returns bool
	stateExists(name) {
		return this.states.some(state => {
				if (state.name == name) return state;
			});
	}

	// Check if a state contains a link to a given state
	linkExists(stateFrom, stateTo) {
		const fromState = this.find(stateFrom);
		const exists = fromState.links.some(link => {
				if (link.stateName == stateTo) return link;
		});

		return exists;
	}
	
	// Initialize the FSM
	initialize() {
		const state = this.add("State 1");
		this.currentState = state;
	}

	// Find a state by name
	// Returns a State or null
	find(name) {
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

	// Create a link between two states for a given event
	link(stateFrom, stateTo, event) {
		const link = new Link(event, stateTo);

		const fromState = this.find(stateFrom);
		fromState.links.push(link);
	}
	
	// Receive an event
	receive(event) {
		console.log("received event: " + event);

		const link = (this.currentState.links.filter(link => {
				if (link.event == event) return link;
		}));

		if (link.length > 0) this.changeState(link[0].stateName);
	}

	// Evaluates the current state, running all actions
	async evaluate () {
		console.log("evaluating state of machine " + this.name);

		const actions = this.currentState.actions;
		for (let i = 0; i < actions.length ; i++) {
			let action = actions[i];
			let count = 0;
			const limit = 10;
			let res;
			while (!res && count < limit) {
				res = await action.callback(action.args);
				count++;
				if (count == limit) {console.log("eval limit reached");}
			}
		}
	}

	// Change current state to given state by name
	changeState(stateName) {
		console.log("chaning state to " + stateName);

		const state = this.find(stateName);
		this.currentState = state;
	}

	// Change the name of the given state with the new name provided
	renameState(oldStateName, newStateName) {
		const state = this.find(oldStateName);
		state.name = newStateName;
	}

	// Adds an action to a given state
	addAction (stateName, action) {
		const state = this.find(stateName);
		state.actions.push(action);
	}

	// Create a unique id string
	static _makeID () {
	  let text = "";
	  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	  for (let i = 0; i < 12; i++)
	    text += possible.charAt(Math.floor(Math.random() * possible.length));

	  return text;
	}
}

// A discrete state of a state machine
function State (name) {
	this.name = name;
	this.id;
	
	// All outbound connecting states from this state
	this.links = [];
	
	// All actions assigned to this state;
	this.actions = [];
}

// The unidirectional link between two states
function Link (event, state) {
	this.event = event;
	this.stateName = state;
}
 
// 	Actions performed by a state once activated
// 	Actions should return a bool: true if finished, false if it must be reevaluated
	
function Action(callback, args = null) {
	this.callback = callback;
	this.args = args;
}

// General FSM error Exception class
function FSMError (text) {
	this.text = text;
}

// Actions

const waitForMe = async (ms = 1000) => {
	const something = await sleep(ms);
	console.log("done waiting");
	return true
}

const returnFalse = async () => {
	return false
}

const sendEvent = async (event) => {
	FSM.broadcast(event);
	return true;
}

// Utility for actions
function sleep (ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/// IMPLEMENTATION

fsm = FSM.create();

fsm.add('State 2');
fsm.link('State 1', 'State 2', 'go');
fsm.addAction('State 1', new Action(sendEvent, 'go'));
fsm.evaluate();
console.log(fsm);
