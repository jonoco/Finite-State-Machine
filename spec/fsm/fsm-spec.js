const { FSM } = require("../../dist/fsm");

describe("Test FSM methods", function() {
  let fsm;

  beforeEach(function() {
    fsm = FSM.create();
  })

  it("should return an fsm object with a currentState.name of 'State 1'", function(done) {
    fsm.addState("State 1");

    expect(fsm.currentState.name).toEqual('State 1');
    done();
  });
});