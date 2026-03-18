-- Complex list pattern matching
def describeList (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | [x] => x
  | [x, y] => x + y
  | x :: y :: z :: _ => x + y + z

def result := describeList [1, 2, 3, 4, 5]
