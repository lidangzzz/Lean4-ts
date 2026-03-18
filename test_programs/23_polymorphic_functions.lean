-- Test 23: Polymorphic-style functions
def idNat (x : Nat) : Nat := x
def constNat (x : Nat) (_ : Nat) : Nat := x
def flipNat (f : Nat → Nat → Nat) (x : Nat) (y : Nat) : Nat := f y x

def applyTwice : (Nat → Nat) → Nat → Nat
  | f, x => f (f x)

def applyN : Nat → (Nat → Nat) → Nat → Nat
  | 0, _, x => x
  | n + 1, f, x => f (applyN n f x)

def inc (x : Nat) : Nat := x + 1

def r1 := idNat 42
def r2 := constNat 5 100
def r3 := flipNat (fun x => fun y => x - y) 10 3
def r4 := applyTwice inc 0
def r5 := applyN 10 inc 0
def x := r1 + r2 + r3 + r4 + r5

-- Output results
#eval r1
#eval r2
#eval r3
#eval r4
#eval r5
#eval x
