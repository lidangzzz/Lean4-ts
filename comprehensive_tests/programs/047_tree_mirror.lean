-- Mirror a tree
inductive Tree (α : Type) where
  | leaf : Tree α
  | node : α -> Tree α -> Tree α -> Tree α

def treeMirror (t : Tree Nat) : Tree Nat :=
  match t with
  | Tree.leaf => Tree.leaf
  | Tree.node v left right => Tree.node v (treeMirror right) (treeMirror left)

def myTree := Tree.node 1 (Tree.node 2 Tree.leaf Tree.leaf) (Tree.node 3 Tree.leaf Tree.leaf)
def result := treeMirror myTree
