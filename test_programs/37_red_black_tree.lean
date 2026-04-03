-- Test 37: Red-Black Tree implementation
inductive Color where | red | black

inductive RBTree where | leaf | node : Color → RBTree → Nat → RBTree → RBTree

def balance : RBTree → RBTree
  | RBTree.node .black (RBTree.node .red (RBTree.node .red a x b) y c) z d =>
    RBTree.node .red (RBTree.node .black a x b) y (RBTree.node .black c z d)
  | RBTree.node .black (RBTree.node .red a x (RBTree.node .red b y c)) z d =>
    RBTree.node .red (RBTree.node .black a x b) y (RBTree.node .black c z d)
  | RBTree.node .black a x (RBTree.node .red (RBTree.node .red b y c) z d) =>
    RBTree.node .red (RBTree.node .black a x b) y (RBTree.node .black c z d)
  | RBTree.node .black a x (RBTree.node .red b y (RBTree.node .red c z d)) =>
    RBTree.node .red (RBTree.node .black a x b) y (RBTree.node .black c z d)
  | t => t

def blacken : RBTree → RBTree
  | RBTree.node _ a x b => RBTree.node .black a x b
  | t => t

def rbInsert : RBTree → Nat → RBTree
  | RBTree.leaf, x => RBTree.node .red RBTree.leaf x RBTree.leaf
  | RBTree.node c a y b, x =>
    if x < y then balance (RBTree.node c (rbInsert a x) y b)
    else if x > y then balance (RBTree.node c a y (rbInsert b x))
    else RBTree.node c a y b

def rbHeight : RBTree → Nat
  | RBTree.leaf => 0
  | RBTree.node _ l _ r => 1 + max (rbHeight l) (rbHeight r)

def rbSize : RBTree → Nat
  | RBTree.leaf => 0
  | RBTree.node _ l _ r => 1 + rbSize l + rbSize r

def rbContains : RBTree → Nat → Bool
  | RBTree.leaf, _ => false
  | RBTree.node _ l v r, x =>
    if x < v then rbContains l x
    else if x > v then rbContains r x
    else true

def rbInorder : RBTree → List Nat
  | RBTree.leaf => []
  | RBTree.node _ l v r => rbInorder l ++ [v] ++ rbInorder r

def makeRBTree (xs : List Nat) : RBTree :=
  xs.foldl rbInsert RBTree.leaf

def tree1 := makeRBTree [5, 3, 7, 1, 9, 4, 6, 2, 8]
def h1 := rbHeight tree1
def s1 := rbSize tree1
def c1 := rbContains tree1 5
def c2 := rbContains tree1 10
def inorder1 := rbInorder tree1

def tree2 := makeRBTree [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
def h2 := rbHeight tree2
def inorder2 := rbInorder tree2

def x := h1 + s1 + (if c1 then 1 else 0) + (if c2 then 1 else 0) + h2 + inorder1.length + inorder2.length

#eval h1
#eval s1
#eval c1
#eval c2
#eval inorder1
#eval h2
#eval inorder2
#eval x
