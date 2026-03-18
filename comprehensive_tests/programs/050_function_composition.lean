-- Function composition
def compose (f : Nat -> Nat) (g : Nat -> Nat) (x : Nat) : Nat :=
  f (g x)

def double (x : Nat) : Nat := x * 2
def inc (x : Nat) : Nat := x + 1

def doubleThenInc := compose inc double
def result := doubleThenInc 5
