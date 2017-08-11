import { makeID, sleep } from './utility';

/** Generalized finite state machine */
export default class FSM {
  constructor (name = "FSM") {
    this.name = name;
    this.currentState;        // The currently active state of the FSM
    this.states = [];         // All states within this state machine
    this.actions = {};        // All Actions useds within this state machine, keyed by id
    this.events = [];         // Event queue
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
      await sleep(10); // Wait 10 ms before looping
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
    state.id = makeID();
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