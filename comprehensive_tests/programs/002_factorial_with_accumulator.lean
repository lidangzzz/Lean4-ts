-- Factorial with tail recursion
def factAux : Nat -> Nat -> Nat
  | 0, acc => acc
  | n + 1, acc => factAux n (acc * (n + 1))

def factorial (n : Nat) : Nat := factAux n 1

def result := factorial 10
