-- Check if a list is sorted
def isSorted (xs : List Nat) : Bool :=
  match xs with
  | [] => true
  | [_] => true
  | x :: y :: rest =>
    if x <= y then isSorted (y :: rest)
    else false

def result := if isSorted [1, 2, 3, 4, 5] then 1 else 0
