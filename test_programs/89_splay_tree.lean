-- Test 89: Splay Tree
inductive SplayTree where | leaf | node : Nat → SplayTree → SplayTree → SplayTree

def splayRotateRight : SplayTree → SplayTree
  | SplayTree.node x (SplayTree.node y a b) c => SplayTree.node y a (SplayTree.node x b c)
  | t => t

def splayRotateLeft : SplayTree → SplayTree
  | SplayTree.node x a (SplayTree.node y b c) => SplayTree.node y (SplayTree.node x a b) c
  | t => t

def splayInsert (t : SplayTree) (key : Nat) : SplayTree :=
  match t with
  | SplayTree.leaf => SplayTree.node key SplayTree.leaf SplayTree.leaf
  | SplayTree.node k left right =>
    if key < k then
      match left with
      | SplayTree.leaf => SplayTree.node key SplayTree.leaf (SplayTree.node k left right)
      | SplayTree.node lk ll lr =>
        if key < lk then
          splayRotateRight (SplayTree.node k (splayInsert ll key) right)
        else if key > lk then
          SplayTree.node k (SplayTree.node lk ll (splayInsert lr key)) right
        else
          splayRotateRight (SplayTree.node k left right)
    else if key > k then
      match right with
      | SplayTree.leaf => SplayTree.node key (SplayTree.node k left right) SplayTree.leaf
      | SplayTree.node rk rl rr =>
        if key < rk then
          SplayTree.node k left (SplayTree.node rk (splayInsert rl key) rr)
        else if key > rk then
          splayRotateLeft (SplayTree.node k left (splayInsert rr key))
        else
          splayRotateLeft (SplayTree.node k left right)
    else t

def splaySearch (t : SplayTree) (key : Nat) : Bool :=
  match t with
  | SplayTree.leaf => false
  | SplayTree.node k left right =>
    if key < k then splaySearch left key
    else if key > k then splaySearch right key
    else true

def splayHeight : SplayTree → Nat
  | SplayTree.leaf => 0
  | SplayTree.node _ left right =>
    1 + max (splayHeight left) (splayHeight right)

def splaySize : SplayTree → Nat
  | SplayTree.leaf => 0
  | SplayTree.node _ left right =>
    1 + splaySize left + splaySize right

def keys := [5, 3, 7, 1, 9, 4, 6, 2, 8]
def splay := keys.foldl splayInsert SplayTree.leaf

def s1 := splaySearch splay 5
def s2 := splaySearch splay 10
def h := splayHeight splay
def sz := splaySize splay

def x := (if s1 then 1 else 0) + (if s2 then 1 else 0) + h + sz
