-- Tail recursion
def sumToAux (n : Nat) (acc : Nat) : Nat :=
  match n with
  | 0 => acc
  | n + 1 => sumToAux n (acc + n + 1)

def sumTo (n : Nat) : Nat := sumToAux n 0

def result := sumTo 100
