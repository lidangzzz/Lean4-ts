-- Concatenate a list of lists
def concat (xss : List (List Nat)) : List Nat :=
  match xss with
  | [] => []
  | head :: tail => append head (concat tail)
where
  append (xs : List Nat) (ys : List Nat) : List Nat :=
    match xs with
    | [] => ys
    | h :: t => h :: append t ys

def result := concat [[1, 2], [3, 4], [5, 6]]
