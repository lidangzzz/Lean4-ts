-- Remove duplicates from sorted list
def dedup (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | [x] => [x]
  | x :: y :: rest =>
    if x == y then dedup (y :: rest)
    else x :: dedup (y :: rest)

def result := dedup [1, 1, 2, 2, 2, 3, 3, 4, 4, 4, 4, 5]
