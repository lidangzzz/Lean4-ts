-- Get elements at a specific level
inductive Tree (α : Type) where
  | leaf : Tree α
  | node : α -> Tree α -> Tree α -> Tree α

def append (xs : List Nat) (ys : List Nat) : List Nat :=
  match xs with
  | [] => ys
  | h :: t => h :: append t ys

def getLevel (t : Tree Nat) (level : Nat) : List Nat :=
  match t, level with
  | Tree.leaf, _ => []
  | Tree.node v _ _, 0 => [v]
  | Tree.node _ left right, n + 1 =>
    append (getLevel left n) (getLevel right n)

def myTree := Tree.node 1 (Tree.node 2 (Tree.node 4 Tree.leaf Tree.leaf) (Tree.node 5 Tree.leaf Tree.leaf)) (Tree.node 3 Tree.leaf Tree.leaf)
def result := getLevel myTree 2
