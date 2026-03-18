-- Binary tree size
inductive Tree (α : Type) where
  | leaf : Tree α
  | node : α -> Tree α -> Tree α -> Tree α

def treeSize (t : Tree Nat) : Nat :=
  match t with
  | Tree.leaf => 0
  | Tree.node _ left right => 1 + treeSize left + treeSize right

def myTree := Tree.node 1 (Tree.node 2 Tree.leaf Tree.leaf) (Tree.node 3 Tree.leaf Tree.leaf)
def result := treeSize myTree
