-- Sum of a list
def sum (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | head :: tail => head + sum tail

def result := sum [1, 2, 3, 4, 5]
