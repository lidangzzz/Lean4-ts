-- Check if element is in tree
inductive Tree (α : Type) where
  | leaf : Tree α
  | node : α -> Tree α -> Tree α -> Tree α

def treeMember (x : Nat) (t : Tree Nat) : Bool :=
  match t with
  | Tree.leaf => false
  | Tree.node v left right =>
    if v == x then true
    else treeMember x left || treeMember x right

def myTree := Tree.node 5 (Tree.node 3 (Tree.node 1 Tree.leaf Tree.leaf) (Tree.node 4 Tree.leaf Tree.leaf)) (Tree.node 8 Tree.leaf Tree.leaf)
def result := if treeMember 4 myTree then 1 else 0
