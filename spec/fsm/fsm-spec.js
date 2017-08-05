const { FSM } = require("../../dist/fsm");

describe("Test FSM object", function() {
  let fsm;

  beforeEach(function() {
    // Clear all state machines and create a fresh one
    if (FSM.hasOwnProperty('stateMachines')) {
      FSM.stateMachines.forEach(sm => {
        sm.destroy();
      });
    }

    fsm = FSM.create();
    fsm.debug(false);
  });

  it("should return an fsm object with a currentState.name of 'State 1'", function() {
    fsm.addState("State 1");

    expect(fsm.currentState.name).toEqual('State 1');
  });

  it("should contain 2 states", function() {
    fsm.addState("one");
    fsm.addState("two");

    expect(fsm.states.length).toEqual(2);
  });

  it("should change from one state to another", function(done) {
    const state01 = "one";
    const state02 = "two";
    const event = "go";

    fsm.addState(state01);
    fsm.addState(state02);
    fsm.linkState(state01, state02, event);
    
    expect(fsm.currentState.name).toEqual(state01);
    FSM.broadcast(event);
    expect(fsm.currentState.name).toEqual(state02);

    done();
  });
});