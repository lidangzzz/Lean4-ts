-- Map a function over a tree
inductive Tree (α : Type) where
  | leaf : Tree α
  | node : α -> Tree α -> Tree α -> Tree α

def treeMap (f : Nat -> Nat) (t : Tree Nat) : Tree Nat :=
  match t with
  | Tree.leaf => Tree.leaf
  | Tree.node v left right => Tree.node (f v) (treeMap f left) (treeMap f right)

def double (x : Nat) : Nat := x * 2

def myTree := Tree.node 1 (Tree.node 2 Tree.leaf Tree.leaf) (Tree.node 3 Tree.leaf Tree.leaf)
def resultTree := treeMap double myTree
