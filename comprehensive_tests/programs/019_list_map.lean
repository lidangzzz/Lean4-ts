-- Map a function over a list
def map (f : Nat -> Nat) (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | head :: tail => f head :: map f tail

def double (x : Nat) : Nat := x * 2

def result := map double [1, 2, 3, 4, 5]
