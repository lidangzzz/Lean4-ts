-- Get nth element (0-indexed)
def nth (n : Nat) (xs : List Nat) : Nat :=
  match n, xs with
  | 0, head :: _ => head
  | n + 1, _ :: tail => nth n tail
  | _, [] => 0

def result := nth 2 [10, 20, 30, 40, 50]
