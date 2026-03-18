-- Basic list operations using built-in list support
-- Length using simple match
def len (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | y :: ys => 1 + len ys

def sum (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | y :: ys => y + sum ys
def result := len [1, 2, 3, 4, 5]
`, '"5');
