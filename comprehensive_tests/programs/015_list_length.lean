-- Length of a list
def length (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | _ :: tail => 1 + length tail

def mylist := [1, 2, 3, 4, 5]
def result := length mylist
