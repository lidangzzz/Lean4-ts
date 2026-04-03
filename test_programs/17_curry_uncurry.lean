-- Test 17: Currying and uncurrying
def curry : (Nat × Nat → Nat) → Nat → Nat → Nat
  | f, x, y => f (x, y)

def uncurry : (Nat → Nat → Nat) → Nat × Nat → Nat
  | f, (x, y) => f x y

def addPair : Nat × Nat → Nat
  | (x, y) => x + y

def addCurried : Nat → Nat → Nat
  | x, y => x + y

def curriedAdd := curry addPair
def uncurriedAdd := uncurry addCurried

def r1 := curriedAdd 3 4
def r2 := uncurriedAdd (5, 6)
def r3 := curry (fun p => p.1 * p.2) 7 8
def x := r1 + r2 + r3

#eval r1
#eval r2
#eval r3
#eval x
