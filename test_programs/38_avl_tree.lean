-- Test 38: AVL Tree implementation
inductive AVLTree where | leaf | node : Nat -> AVLTree -> Nat -> AVLTree -> AVLTree

def avlHeight : AVLTree -> Nat
  | AVLTree.leaf => 0
  | AVLTree.node h _ _ _ => h

def avlNode (l : AVLTree) (v : Nat) (r : AVLTree) : AVLTree :=
  AVLTree.node (1 + max (avlHeight l) (avlHeight r)) l v r

def avlBalance : AVLTree -> Int
  | AVLTree.leaf => 0
  | AVLTree.node _ l _ r => Int.ofNat (avlHeight l) - Int.ofNat (avlHeight r)

def rotateLeft : AVLTree -> AVLTree
  | AVLTree.node _ a x (AVLTree.node _ b y c) => avlNode (avlNode a x b) y c
  | t => t

def rotateRight : AVLTree -> AVLTree
  | AVLTree.node _ (AVLTree.node _ a x b) y c => avlNode a x (avlNode b y c)
  | t => t

def rebalance (l : AVLTree) (v : Nat) (r : AVLTree) : AVLTree :=
  let bal := Int.ofNat (avlHeight l) - Int.ofNat (avlHeight r)
  if bal > 1 then
    match l with
    | AVLTree.node _ ll lv lr =>
      if avlHeight ll >= avlHeight lr then
        rotateRight (avlNode ll lv (avlNode lr v r))
      else
        match lr with
        | AVLTree.node _ lrl lrv lrr =>
          rotateRight (avlNode (avlNode ll lv lrl) lrv (avlNode lrr v r))
        | _ => avlNode l v r
    | _ => avlNode l v r
  else if bal < -1 then
    match r with
    | AVLTree.node _ rl rv rr =>
      if avlHeight rr >= avlHeight rl then
        rotateLeft (avlNode (avlNode l v rl) rv rr)
      else
        match rl with
        | AVLTree.node _ rll rlv rlr =>
          rotateLeft (avlNode (avlNode l v rll) rlv (avlNode rlr rv rr))
        | _ => avlNode l v r
    | _ => avlNode l v r
  else avlNode l v r

def avlInsert : AVLTree -> Nat -> AVLTree
  | AVLTree.leaf, x => avlNode AVLTree.leaf x AVLTree.leaf
  | AVLTree.node _ l v r, x =>
    if x < v then rebalance (avlInsert l x) v r
    else if x > v then rebalance l v (avlInsert r x)
    else AVLTree.node (avlHeight l) l v r

def avlContains : AVLTree -> Nat -> Bool
  | AVLTree.leaf, _ => false
  | AVLTree.node _ l v r, x =>
    if x < v then avlContains l x
    else if x > v then avlContains r x
    else true

def avlMin : AVLTree -> Option Nat
  | AVLTree.leaf => none
  | AVLTree.node _ AVLTree.leaf v _ => some v
  | AVLTree.node _ l _ _ => avlMin l

def avlMax : AVLTree -> Option Nat
  | AVLTree.leaf => none
  | AVLTree.node _ _ v AVLTree.leaf => some v
  | AVLTree.node _ _ _ r => avlMax r

def makeAVL (xs : List Nat) : AVLTree :=
  xs.foldl avlInsert AVLTree.leaf

def avl1 := makeAVL [5, 3, 7, 1, 9, 4, 6, 2, 8]
def h1 := avlHeight avl1
def c1 := avlContains avl1 5
def c2 := avlContains avl1 10
def min1 := avlMin avl1
def max1 := avlMax avl1

def avl2 := makeAVL (List.range 100)
def h2 := avlHeight avl2
def min2 := avlMin avl2
def max2 := avlMax avl2

def x := h1 + (if c1 then 1 else 0) + (if c2 then 1 else 0) + h2 +
         (match min1 with | some n => n | none => 0) +
         (match max1 with | some n => n | none => 0)

-- Output results
#eval h1
#eval c1
#eval c2
#eval min1
#eval max1
#eval h2
#eval min2
#eval max2
#eval x
