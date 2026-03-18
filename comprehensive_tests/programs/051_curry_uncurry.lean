-- Curry and uncurry
def curry (f : Nat × Nat -> Nat) (x : Nat) (y : Nat) : Nat :=
  f (x, y)

def uncurry (f : Nat -> Nat -> Nat) (p : Nat × Nat) : Nat :=
  f p.1 p.2

def addPair (p : Nat × Nat) : Nat := p.1 + p.2
def addCurried := curry addPair

def result := addCurried 3 4
