-- Filter a list
def filter (p : Nat -> Bool) (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | head :: tail =>
    if p head then head :: filter p tail
    else filter p tail

def isEven (x : Nat) : Bool := x % 2 == 0

def result := filter isEven [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
