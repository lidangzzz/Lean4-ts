-- Merge sort
def merge (xs : List Nat) (ys : List Nat) : List Nat :=
  match xs, ys with
  | [], ys => ys
  | xs, [] => xs
  | x :: xs', y :: ys' =>
    if x <= y then x :: merge xs' ys
    else y :: merge xs ys'

def split (xs : List Nat) : (List Nat × List Nat) :=
  match xs with
  | [] => ([], [])
  | [x] => ([x], [])
  | x :: y :: rest =>
    let (left, right) := split rest
    (x :: left, y :: right)

def mergeSort (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | [x] => [x]
  | _ =>
    let (left, right) := split xs
    merge (mergeSort left) (mergeSort right)

def result := mergeSort [5, 2, 8, 1, 9, 3, 7, 4, 6]
