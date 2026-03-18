-- Append two lists
def append (xs : List Nat) (ys : List Nat) : List Nat :=
  match xs with
  | [] => ys
  | head :: tail => head :: append tail ys

def result := append [1, 2, 3] [4, 5, 6]
