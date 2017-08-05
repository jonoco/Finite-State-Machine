const { FSM, Action, wait, sendEvent } = require("./dist/fsm");

/** IMPLEMENTATION */

const fsm = FSM.create();

fsm.addState('State 1');
fsm.addState('State 2');
fsm.linkState('State 1', 'State 2', 'go');
fsm.addAction('State 1', new Action(wait, 1500));
fsm.addAction('State 1', new Action(sendEvent, 'go'));
fsm.addAction('State 1', new Action(wait, 1000));

const done = fsm.evaluate();
done.then(() => {console.log("eval complete")})