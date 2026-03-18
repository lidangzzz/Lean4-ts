-- Test 101: Binary Search Tree Operations
inductive BST where
  | leaf : BST
  | node : Int → BST → BST → BST

def bstEmpty : BST := BST.leaf

def bstInsert (t : BST) (x : Int) : BST :=
  match t with
  | BST.leaf => BST.node x BST.leaf BST.leaf
  | BST.node y l r =>
    if x < y then BST.node y (bstInsert l x) r
    else if x > y then BST.node y l (bstInsert r x)
    else BST.node y l r

def bstContains (t : BST) (x : Int) : Bool :=
  match t with
  | BST.leaf => false
  | BST.node y l r =>
    if x < y then bstContains l x
    else if x > y then bstContains r x
    else true

def bstSize (t : BST) : Nat :=
  match t with
  | BST.leaf => 0
  | BST.node _ l r => 1 + bstSize l + bstSize r

def bstHeight (t : BST) : Nat :=
  match t with
  | BST.leaf => 0
  | BST.node _ l r =>
    let hl := bstHeight l
    let hr := bstHeight r
    1 + (if hl > hr then hl else hr)

def bst1 := bstInsert (bstInsert (bstInsert (bstInsert (bstInsert bstEmpty 5) 3) 7) 1) 9

def c1 := bstContains bst1 5
def c2 := bstContains bst1 3
def c3 := bstContains bst1 10
def s1 := bstSize bst1
def h1 := bstHeight bst1

def x := (if c1 then 1 else 0) + (if c2 then 1 else 0) + (if c3 then 10 else 0) + s1 + h1
