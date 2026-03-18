-- Quicksort
def filter (p : Nat -> Bool) (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | head :: tail =>
    if p head then head :: filter p tail
    else filter p tail

def append (xs : List Nat) (ys : List Nat) : List Nat :=
  match xs with
  | [] => ys
  | head :: tail => head :: append tail ys

def quicksort (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | pivot :: rest =>
    let left := filter (fun x => x < pivot) rest
    let right := filter (fun x => x >= pivot) rest
    append (quicksort left) (pivot :: quicksort right)

def result := quicksort [5, 2, 8, 1, 9, 3, 7, 4, 6]
