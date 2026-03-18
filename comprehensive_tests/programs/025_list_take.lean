-- Take first n elements
def take (n : Nat) (xs : List Nat) : List Nat :=
  match n, xs with
  | 0, _ => []
  | _, [] => []
  | n + 1, head :: tail => head :: take n tail

def result := take 3 [1, 2, 3, 4, 5]
