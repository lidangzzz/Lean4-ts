-- Right fold
def foldr (f : Nat -> Nat -> Nat) (init : Nat) (xs : List Nat) : Nat :=
  match xs with
  | [] => init
  | head :: tail => f head (foldr f init tail)

def result := foldr (fun x acc => x + acc) 0 [1, 2, 3, 4, 5]
