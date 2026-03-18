-- Fibonacci with accumulator (tail-recursive style)
def fibAux : Nat -> Nat -> Nat -> Nat
  | 0, a, _ => a
  | n + 1, a, b => fibAux n b (a + b)

def fib (n : Nat) : Nat := fibAux n 0 1

def result := fib 20
