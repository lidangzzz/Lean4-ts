-- Test 24: Church encoding style
def churchZero (f : Nat → Nat) (x : Nat) : Nat := x
def churchSucc (n : (Nat → Nat) → Nat → Nat) (f : Nat → Nat) (x : Nat) : Nat := f (n f x)
def churchAdd (m : (Nat → Nat) → Nat → Nat) (n : (Nat → Nat) → Nat → Nat) (f : Nat → Nat) (x : Nat) : Nat := m f (n f x)
def churchMult (m : (Nat → Nat) → Nat → Nat) (n : (Nat → Nat) → Nat → Nat) (f : Nat → Nat) : Nat → Nat := m (n f)
def churchToInt (n : (Nat → Nat) → Nat → Nat) : Nat := n (fun x => x + 1) 0

def c0 := churchZero
def c1 := churchSucc c0
def c2 := churchSucc c1
def c3 := churchSucc c2
def c5 := churchAdd c2 c3
def c6 := churchMult c2 c3

def n1 := churchToInt c1
def n2 := churchToInt c2
def n5 := churchToInt c5
def n6 := churchToInt c6
def x := n1 + n2 + n5 + n6

-- Output results
#eval n1
#eval n2
#eval n5
#eval n6
#eval x
