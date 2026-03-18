-- Selection sort
def minimum (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | [x] => x
  | x :: xs' =>
    let m := minimum xs'
    if x <= m then x else m

def remove (x : Nat) (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | head :: tail =>
    if head == x then tail
    else head :: remove x tail

def selectionSort (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | _ =>
    let m := minimum xs
    m :: selectionSort (remove m xs)

def result := selectionSort [5, 2, 8, 1, 9, 3, 7, 4, 6]
