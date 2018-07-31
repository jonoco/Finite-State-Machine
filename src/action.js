import FSM from './fsm';
import { sleep, makeID } from './utility';

/** Action type and premade actions */

/**
 * Actions performed by a state once activated.
 * Actions must be asynchronous and return a {bool} on completion: 
 *  true if finished, or false if it must be reevaluated.
 * @param {AsyncFunction} callback - Asynchronous function to call during action evaluation.
 * @param {args*} args - Arguments to pass to callback.
 */
export class Action {
  constructor (callback, ...args) {
    this.callback = callback;
    this.args = args;
    this.id;
    this.evaluated = false;
    this.loop; // Indicates whether action should be evaluated once or repeatedly
  }

  /**
   * Creates and returns a unique id string.
   * @return {string} A 12 character string id.
   */
  createID () {
    this.id = makeID();
    return this.id;
  }
}

/** Actions */

/**
 * Delay timer action.
 * @param {int} ms - Delay in miliseconds.
 * @return {bool}
 */
export const wait = async (ms = 1000) => {
  const something = await sleep(ms);
  return true
}

/**
 * Debugging action.
 * @return {bool}
 */
export const returnFalse = async () => {
  return false
}

/**
 * Simple event broadcasting action.
 * @param {string} event - Event to broadcast.
 * @param {FSM} only - Send message to specific state machine.
 * @return {bool}
 */
export const sendEvent = async (event, only = null) => {
  FSM.broadcast(event, only);
  return true;
}