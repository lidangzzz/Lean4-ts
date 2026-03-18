-- Binary tree height
inductive Tree (α : Type) where
  | leaf : Tree α
  | node : α -> Tree α -> Tree α -> Tree α

def treeHeight (t : Tree Nat) : Nat :=
  match t with
  | Tree.leaf => 0
  | Tree.node _ left right =>
    let lh := treeHeight left
    let rh := treeHeight right
    1 + (if lh >= rh then lh else rh)

def myTree := Tree.node 1 (Tree.node 2 (Tree.node 4 Tree.leaf Tree.leaf) Tree.leaf) (Tree.node 3 Tree.leaf Tree.leaf)
def result := treeHeight myTree
