import { makeID } from './utility';

/** Generalized finite state machine */
export default class FSM {
  constructor (name = "FSM") {
    this.name = name;
    this.currentState;        // The currently active state of the FSM
    this.states = [];         // All states within this state machine
    this.actions = {};        // All Actions useds within this state machine, keyed by id
    this.id = makeID();       // Unique 12 character string id
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
    state.id = makeID();
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