-- Foldable operations
def foldLeft (f : Nat -> Nat -> Nat) (init : Nat) (xs : List Nat) : Nat :=
  match xs with
  | [] => init
  | h :: t => foldLeft f (f init h) t

def sumList := foldLeft (fun a b => a + b) 0
def prodList := foldLeft (fun a b => a * b) 1

def result := sumList [1, 2, 3, 4, 5] + prodList [1, 2, 3]
