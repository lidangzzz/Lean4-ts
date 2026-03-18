-- As-patterns
def headAndTail (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | h :: t => h + match t with
    | [] => 0
    | h2 :: _ => h2

def result := headAndTail [10, 20, 30]
