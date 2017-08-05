import FSM from './fsm';
import { sleep, makeID } from './utility';

/** Action type and premade actions */

/**
 * Actions performed by a state once activated.
 * Actions must be asynchronous and return a {bool} on completion: 
 *  true if finished, or false if it must be reevaluated.
 * @param {function} callback - Asynchronous function to call during action evaluation.
 * @param {args*} args - Arguments to pass to callback.
 */
export function Action (callback, args = null) {
  this.callback = callback;
  this.args = args;
  this.id = makeID();
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
 * @return {bool}
 */
export const sendEvent = async (event) => {
  FSM.broadcast(event);
  return true;
}