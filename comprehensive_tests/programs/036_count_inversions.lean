-- Count inversions in a list
def countInv (x : Nat) (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | head :: tail =>
    if x > head then 1 + countInv x tail
    else countInv x tail

def countInversions (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | head :: tail => countInv head tail + countInversions tail

def result := countInversions [3, 1, 4, 1, 5, 9, 2, 6]
