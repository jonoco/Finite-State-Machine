// Import the finite state machine (FSM) object, Action, and any optional premade actions 
const { FSM, Action, sendEvent } = require("./dist/fsm");

// Create the state machines
const switchSM = FSM.create("Switch");
const handSM = FSM.create("Hand");

// Add states to the state machines
switchSM.addState('Off');
switchSM.addState('On');
handSM.addState('Flicking');

// Link states together
// Creates unidirectional link: Off -> On
switchSM.linkState('Off', 'On', 'flick on'); 

// Create a new Action
// All Actions must be Async Functions
const logMessage = async (msg) => {
    console.log(msg);
    return true;
}

// Add actions to the state machine's states
switchSM.addAction('On', new Action(logMessage, 'light on'));
handSM.addAction('Flicking', new Action(sendEvent, 'flick on'));

// Evaluate all state machines
const asyncLoop = async () => {
    for (let i = 0 ; i < 3 ; i++) {
        await FSM.evaluate();
        console.log('evaluation ' + i + ' complete');
    }
}
asyncLoop();