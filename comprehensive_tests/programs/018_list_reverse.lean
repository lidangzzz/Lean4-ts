-- Reverse a list
def reverseAux (xs : List Nat) (acc : List Nat) : List Nat :=
  match xs with
  | [] => acc
  | head :: tail => reverseAux tail (head :: acc)

def reverse (xs : List Nat) : List Nat := reverseAux xs []

def result := reverse [1, 2, 3, 4, 5]
