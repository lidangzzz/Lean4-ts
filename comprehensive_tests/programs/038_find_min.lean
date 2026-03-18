-- Find minimum element
def min (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | [x] => x
  | x :: xs' =>
    let m := min xs'
    if x <= m then x else m

def result := min [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
