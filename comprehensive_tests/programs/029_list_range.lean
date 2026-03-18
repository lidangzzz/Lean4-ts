-- Generate range [0, n)
def range (n : Nat) : List Nat :=
  let aux : Nat -> List Nat -> List Nat
    | 0, acc => acc
    | n + 1, acc => aux n (n :: acc)
  aux n []

def result := range 5
