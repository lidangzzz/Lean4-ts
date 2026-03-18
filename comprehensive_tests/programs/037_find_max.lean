-- Find maximum element
def max (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | [x] => x
  | x :: xs' =>
    let m := max xs'
    if x >= m then x else m

def result := max [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
