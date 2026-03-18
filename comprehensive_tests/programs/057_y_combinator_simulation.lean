-- Simulated Y combinator using recursion
def fix (f : (Nat -> Nat) -> Nat -> Nat) (x : Nat) : Nat :=
  f (fix f) x

def factGen (rec : Nat -> Nat) (n : Nat) : Nat :=
  if n <= 1 then 1 else n * rec (n - 1)

def factorial := fix factGen

def result := factorial 5
