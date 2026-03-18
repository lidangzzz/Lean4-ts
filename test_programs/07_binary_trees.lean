-- Test 7: Binary tree operations
inductive Tree where
  | leaf : Tree
  | node : Nat → Tree → Tree → Tree

def treeHeight : Tree → Nat
  | Tree.leaf => 0
  | Tree.node _ l r => 1 + max (treeHeight l) (treeHeight r)

def treeSize : Tree → Nat
  | Tree.leaf => 0
  | Tree.node _ l r => 1 + treeSize l + treeSize r

def treeSum : Tree → Nat
  | Tree.leaf => 0
  | Tree.node v l r => v + treeSum l + treeSum r

def treeFlatten : Tree → List Nat
  | Tree.leaf => []
  | Tree.node v l r => treeFlatten l ++ [v] ++ treeFlatten r

def treeInsert : Nat → Tree → Tree
  | n, Tree.leaf => Tree.node n Tree.leaf Tree.leaf
  | n, Tree.node v l r =>
    if n < v then Tree.node v (treeInsert n l) r
    else Tree.node v l (treeInsert n r)

def treeFromList : List Nat → Tree
  | [] => Tree.leaf
  | h :: t => treeInsert h (treeFromList t)

def testTree := treeFromList [5, 3, 7, 1, 9, 4, 6]
def h := treeHeight testTree
def s := treeSize testTree
def sum := treeSum testTree
def x := h + s + sum

#eval testTree
#eval h
#eval s
#eval sum
#eval x
