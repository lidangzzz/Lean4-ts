-- Bubble sort (single pass)
def bubble (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | [x] => [x]
  | x :: y :: rest =>
    if x <= y then x :: bubble (y :: rest)
    else y :: bubble (x :: rest)

def bubbleSort (n : Nat) (xs : List Nat) : List Nat :=
  match n with
  | 0 => xs
  | n + 1 => bubbleSort n (bubble xs)

def result := bubbleSort 10 [5, 2, 8, 1, 9, 3, 7, 4, 6]
