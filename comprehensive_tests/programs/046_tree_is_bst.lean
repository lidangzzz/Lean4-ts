-- Check if tree is a binary search tree
inductive Tree (α : Type) where
  | leaf : Tree α
  | node : α -> Tree α -> Tree α -> Tree α

def isBstAux (t : Tree Nat) (lo : Nat) (hi : Nat) : Bool :=
  match t with
  | Tree.leaf => true
  | Tree.node v left right =>
    v >= lo && v <= hi && isBstAux left lo (v - 1) && isBstAux right (v + 1) hi

def isBst (t : Tree Nat) : Bool := isBstAux t 0 1000

def goodTree := Tree.node 5 (Tree.node 3 Tree.leaf Tree.leaf) (Tree.node 7 Tree.leaf Tree.leaf)
def result := if isBst goodTree then 1 else 0
