# Finitus
A flexible finite state machine.

[![Travis](https://img.shields.io/travis/rust-lang/rust.svg?style=flat-square)](https://travis-ci.org/jonoco/finitus)

## Lifecycle
- Evaluate ->  
- Check if state has not evaluated or is set to loop ->
    - State machine runs actions on current state ->
- State machine processes event queue ->
- Signal the evaluation is complete