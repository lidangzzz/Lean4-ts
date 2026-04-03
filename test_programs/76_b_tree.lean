-- Test 76: B-Tree
inductive BTreeNode where
  | leaf : List Nat → BTreeNode
  | node : List Nat → List BTreeNode → BTreeNode

def btreeOrder := 3

partial def btreeSearch (tree : BTreeNode) (key : Nat) : Bool :=
  match tree with
  | BTreeNode.leaf keys => keys.contains key
  | BTreeNode.node keys children =>
    let rec findChild (ks : List Nat) (i : Nat) : Nat :=
      match ks with
      | [] => i
      | k :: rest =>
        if key < k then i else findChild rest (i + 1)
    let idx := findChild keys 0
    if h : idx < children.length then
      btreeSearch (children.get ⟨idx, h⟩) key
    else false

partial def btreeInsert (tree : BTreeNode) (key : Nat) : BTreeNode :=
  match tree with
  | BTreeNode.leaf keys =>
    let newKeys := (keys ++ [key]).toArray.qsort (· < ·) |>.toList
    if newKeys.length >= 2 * btreeOrder - 1 then
      let mid := newKeys.length / 2
      let leftKeys := newKeys.take mid
      let rightKeys := newKeys.drop (mid + 1)
      let midKey := newKeys.getD mid 0
      BTreeNode.node [midKey] [BTreeNode.leaf leftKeys, BTreeNode.leaf rightKeys]
    else
      BTreeNode.leaf newKeys
  | BTreeNode.node keys children =>
    let rec findIdx (ks : List Nat) (i : Nat) : Nat :=
      match ks with
      | [] => i
      | k :: rest => if key < k then i else findIdx rest (i + 1)
    let idx := findIdx keys 0
    if h : idx < children.length then
      let child := children.get ⟨idx, h⟩
      let newChild := btreeInsert child key
      let newChildren := children.take idx ++ [newChild] ++ children.drop (idx + 1)
      BTreeNode.node keys newChildren
    else tree

def btreeHeight : BTreeNode → Nat
  | BTreeNode.leaf _ => 1
  | BTreeNode.node _ children =>
    1 + (children.map btreeHeight).foldl max 0

def btreeSize : BTreeNode → Nat
  | BTreeNode.leaf keys => keys.length
  | BTreeNode.node keys children =>
    keys.length + (children.map btreeSize).sum

def btree1 := btreeInsert (BTreeNode.leaf []) 10
def btree2 := btreeInsert btree1 20
def btree3 := btreeInsert btree2 5
def btree4 := btreeInsert btree3 15
def btree5 := btreeInsert btree4 25

def keys := [10, 20, 5, 15, 25, 30, 3, 8, 12, 18, 22, 28]
def btree := keys.foldl btreeInsert (BTreeNode.leaf [])

def s1 := btreeSearch btree 10
def s2 := btreeSearch btree 25
def s3 := btreeSearch btree 100
def h := btreeHeight btree
def sz := btreeSize btree

def x := (if s1 then 1 else 0) + (if s2 then 1 else 0) + (if s3 then 1 else 0) + h + sz
#eval x
