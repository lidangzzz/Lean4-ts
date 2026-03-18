-- Product of a list
def product (xs : List Nat) : Nat :=
  match xs with
  | [] => 1
  | head :: tail => head * product tail

def result := product [1, 2, 3, 4, 5]
