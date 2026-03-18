-- Count leaves in a tree
inductive Tree (α : Type) where
  | leaf : Tree α
  | node : α -> Tree α -> Tree α -> Tree α

def countLeaves (t : Tree Nat) : Nat :=
  match t with
  | Tree.leaf => 1
  | Tree.node _ left right => countLeaves left + countLeaves right

def myTree := Tree.node 1 (Tree.node 2 Tree.leaf Tree.leaf) (Tree.node 3 Tree.leaf (Tree.node 4 Tree.leaf Tree.leaf))
def result := countLeaves myTree
