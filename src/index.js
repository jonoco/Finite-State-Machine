import { Action, wait, sendEvent } from './action';
import FSM from './fsm';

/** IMPLEMENTATION */

const fsm = FSM.create();

fsm.add('State 2');
fsm.linkState('State 1', 'State 2', 'go');
fsm.addAction('State 1', new Action(wait, 2000));
fsm.addAction('State 1', new Action(sendEvent, 'go'));

const done = fsm.evaluate();
done.then(() => {console.log("eval complete")})
