-- Dynamic programming style Fibonacci
def fibAux : Nat -> Nat -> Nat -> Nat -> Nat
  | 0, _, _, result => result
  | n + 1, prev2, prev1, _ => fibAux n prev1 (prev1 + prev2) prev1

def fibFast (n : Nat) : Nat :=
  if n == 0 then 0
  else if n == 1 then 1
  else fibAux (n - 1) 0 1 1

def result := fibFast 30
