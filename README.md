# Finitus
A flexible finite state machine.

[![Travis](https://img.shields.io/travis/jonoco/finitus.svg?style=flat-square)](https://travis-ci.org/jonoco/finitus)
[![GitHub release](https://img.shields.io/github/release/jonoco/finitus.svg)](https://github.com/jonoco/finitus)
[![license](https://img.shields.io/github/license/jonoco/finitus.svg)](https://github.com/jonoco/finitus)
[![npm](https://img.shields.io/npm/v/finitus.svg)](https://www.npmjs.com/package/finitus)

## Installation
Get the distribution package from npm:
```bash
npm install finitus
```

Or source material from git:
```javascript
git clone https://github.com/jonoco/finitus.git
```

## Useage

### Create the machines
Import the finite state machine (FSM) object, Action, and any optional premade actions.
```javascript
const { FSM, Action, sendEvent } = require("fsm");
```

Create the state machines.
```javascript
// Creation order will determine the order of evaluation
const switchSM = FSM.create("Switch");
const handSM = FSM.create("Hand");
```

Add states to the state machines.
```javascript
// The first state added to a machine will become the initial state
switchSM.addState('Off');
switchSM.addState('On');
handSM.addState('Flicking');
```

Link states together.
```javascript
// Creates unidirectional link: Off -> On
switchSM.linkState('Off', 'On', 'flick on'); 
```

Create a new Action.
```javascript
// All Actions must be Async Functions and return true on successful completion
const logMessage = async (msg) => {
    console.log(msg);
    return true;
}
```

Add actions to the state machine's states.
```javascript
switchSM.addAction('On', new Action(logMessage, 'light on'));
handSM.addAction('Flicking', new Action(sendEvent, 'flick on'));
```

### Evaluate all state machines.
Evaluating this particular state changes will take a maximum of three evaluation cycles. This can be done by chaining promises together, via an asynchronous loop, or using the built in looping method.

Chaining:
```javascript 
FSM.evaluate()
    .then(() => { 
        console.log('>> first evaluation complete');
        return FSM.evaluate(); 
    }).then(() => { 
        console.log('>> second evaluation complete'); 
        return FSM.evaluate();
    }).then(() => {
        console.log('>> third evaluation complete');
    });
```

Async loop:
```javascript
const asyncLoop = async () => {
    for (let i = 0 ; i < 3 ; i++) {
        await FSM.evaluate();
        console.log('evaluation ' + i + ' complete');
    }
}
asyncLoop();
```

Internal loop:
```javascript
FSM.evaluate(true); // Will loop continuously in 10 ms cycles.
```

### Expected output.

Using the Promise chaining method:
```
Switch: evaluating state of machine
Switch: current state is Off
Hand: evaluating state of machine
Hand: current state is Flicking
>> first evaluation complete
Switch: evaluating state of machine
Switch: current state is Off
Switch: received actionable event: flick on
Switch: changing state from Off to On
Hand: evaluating state of machine
Hand: current state is Flicking
>> second evaluation complete
Switch: evaluating state of machine
Switch: current state is On
light on
Hand: evaluating state of machine
Hand: current state is Flicking
>> third evaluation complete
```

## Lifecycle
- Evaluate ->  
- Check if state has not evaluated or is set to loop ->
    - State machine runs actions on current state ->
- State machine processes event queue ->
- Signal the evaluation is complete

## License
[MIT](../master/LICENSE)
