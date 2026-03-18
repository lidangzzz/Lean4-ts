-- Left fold
def foldl (f : Nat -> Nat -> Nat) (init : Nat) (xs : List Nat) : Nat :=
  match xs with
  | [] => init
  | head :: tail => foldl f (f init head) tail

def result := foldl (fun acc x => acc + x) 0 [1, 2, 3, 4, 5]
