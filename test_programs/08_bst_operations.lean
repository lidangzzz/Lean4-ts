-- Test 8: BST search and operations
inductive BST where
  | leaf : BST
  | node : Nat → BST → BST → BST

def bstContains : Nat → BST → Bool
  | _, BST.leaf => false
  | n, BST.node v l r => 
    if n == v then true
    else if n < v then bstContains n l
    else bstContains n r

def bstMin : BST → Option Nat
  | BST.leaf => none
  | BST.node v BST.leaf _ => some v
  | BST.node _ l _ => bstMin l

def bstMax : BST → Option Nat
  | BST.leaf => none
  | BST.node v _ BST.leaf => some v
  | BST.node _ _ r => bstMax r

def bstInsert : Nat → BST → BST
  | n, BST.leaf => BST.node n BST.leaf BST.leaf
  | n, BST.node v l r =>
    if n < v then BST.node v (bstInsert n l) r
    else if n > v then BST.node v l (bstInsert n r)
    else BST.node v l r

def bstFromList : List Nat → BST
  | [] => BST.leaf
  | h :: t => bstInsert h (bstFromList t)

def myBst := bstFromList [50, 30, 70, 20, 40, 60, 80]
def has30 := if bstContains 30 myBst then 1 else 0
def has25 := if bstContains 25 myBst then 1 else 0
def minVal := match bstMin myBst with | some v => v | none => 0
def maxVal := match bstMax myBst with | some v => v | none => 0
def x := has30 + has25 + minVal + maxVal
