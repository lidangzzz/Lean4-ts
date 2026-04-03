-- Test 25: State machine simulation
inductive State where
  | start : State
  | processing : State
  | done : State
  | error : State

def transition : State → Nat → State
  | State.start, 0 => State.processing
  | State.start, _ => State.error
  | State.processing, n => if n > 0 && n < 10 then State.processing else if n == 10 then State.done else State.error
  | State.done, _ => State.done
  | State.error, _ => State.error

def runMachine : State → List Nat → State
  | s, [] => s
  | s, h :: t => runMachine (transition s h) t

def run1 := runMachine State.start [0, 1, 2, 3, 10]
def run2 := runMachine State.start [0, 5, 15]
def run3 := runMachine State.start [1, 2, 3]
def count := (match run1 with | State.done => 1 | _ => 0) + (match run2 with | State.error => 1 | _ => 0) + (match run3 with | State.error => 1 | _ => 0)
def x := count

#eval run1
#eval run2
#eval run3
#eval count
#eval x
