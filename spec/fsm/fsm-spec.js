const { FSM, Action } = require("../../dist/fsm");

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

  it("should rename a state", function() {
    const name01 = "one";
    const name02 = "two";

    fsm.addState(name01);

    expect(fsm.currentState.name).toEqual(name01);
    fsm.renameState(name01, name02);
    expect(fsm.currentState.name).toEqual(name02);
  });

  it("should add an action to the fsm", function() {
    const name01 = "one";
    
    fsm.addState(name01);
    const id = fsm.addAction(name01, new Action(async () => {}));

    expect(fsm.actions[id]).toBeDefined();
  });

  it("should add an action to a state", function() {
    const name01 = "one";
    
    fsm.addState(name01);
    fsm.addAction(name01, new Action(async () => {}));

    expect(fsm.currentState.actions.length).toEqual(1);
  });  
});