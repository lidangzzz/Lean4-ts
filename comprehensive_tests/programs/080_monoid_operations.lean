-- Monoid type class (simulated)
def natAdd (a b : Nat) : Nat := a + b
def natZero : Nat := 0

def natMul (a b : Nat) : Nat := a * b
def natOne : Nat := 1

def sumList := List.foldl natAdd natZero
def prodList := List.foldl natMul natOne

def result := sumList [1, 2, 3, 4, 5]
