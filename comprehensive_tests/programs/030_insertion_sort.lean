-- Insertion sort
def insert (x : Nat) (xs : List Nat) : List Nat :=
  match xs with
  | [] => [x]
  | head :: tail =>
    if x <= head then x :: xs
    else head :: insert x tail

def insertionSort (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | head :: tail => insert head (insertionSort tail)

def result := insertionSort [5, 2, 8, 1, 9, 3, 7, 4, 6]
