-- Flatten tree to list (in-order traversal)
inductive Tree (α : Type) where
  | leaf : Tree α
  | node : α -> Tree α -> Tree α -> Tree α

def append (xs : List Nat) (ys : List Nat) : List Nat :=
  match xs with
  | [] => ys
  | h :: t => h :: append t ys

def treeFlatten (t : Tree Nat) : List Nat :=
  match t with
  | Tree.leaf => []
  | Tree.node v left right =>
    append (treeFlatten left) (v :: treeFlatten right)

def myTree := Tree.node 2 (Tree.node 1 Tree.leaf Tree.leaf) (Tree.node 3 Tree.leaf Tree.leaf)
def result := treeFlatten myTree
