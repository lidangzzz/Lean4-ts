-- Drop first n elements
def drop (n : Nat) (xs : List Nat) : List Nat :=
  match n, xs with
  | 0, xs => xs
  | _, [] => []
  | n + 1, _ :: tail => drop n tail

def result := drop 3 [1, 2, 3, 4, 5]
