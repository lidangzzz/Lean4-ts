-- Sum of all values in a tree
inductive Tree (α : Type) where
  | leaf : Tree α
  | node : α -> Tree α -> Tree α -> Tree α

def treeSum (t : Tree Nat) : Nat :=
  match t with
  | Tree.leaf => 0
  | Tree.node v left right => v + treeSum left + treeSum right

def myTree := Tree.node 10 (Tree.node 5 Tree.leaf Tree.leaf) (Tree.node 15 (Tree.node 3 Tree.leaf Tree.leaf) Tree.leaf)
def result := treeSum myTree
