-- Test 40: Segment Tree for range queries
inductive SegTree where | leaf : Nat → SegTree | node : Nat → SegTree → SegTree → SegTree

def segBuild : List Nat → SegTree
  | [] => SegTree.leaf 0
  | [x] => SegTree.leaf x
  | xs =>
    let mid := xs.length / 2
    let left := xs.take mid
    let right := xs.drop mid
    let ltree := segBuild left
    let rtree := segBuild right
    let lsum := match ltree with | SegTree.leaf v => v | SegTree.node s _ _ => s
    let rsum := match rtree with | SegTree.leaf v => v | SegTree.node s _ _ => s
    SegTree.node (lsum + rsum) ltree rtree

def segSum : SegTree → Nat → Nat → Nat → Nat → Nat
  | SegTree.leaf v, start, end, qstart, qend =>
    if qstart <= start && end <= qend then v else 0
  | SegTree.node total left right, start, end, qstart, qend =>
    if qend < start ∨ end < qstart then 0
    else if qstart <= start && end <= qend then total
    else
      let mid := (start + end) / 2
      segSum left start mid qstart qend + segSum right (mid + 1) end qstart qend

def segUpdate : SegTree → Nat → Nat → Nat → Nat → SegTree
  | SegTree.leaf _, start, end, idx, val =>
    if start = end then SegTree.leaf val else SegTree.leaf 0
  | SegTree.node _ left right, start, end, idx, val =>
    if idx < start ∨ idx > end then SegTree.node 0 left right
    else if start = end then SegTree.leaf val
    else
      let mid := (start + end) / 2
      if idx <= mid then
        let newLeft := segUpdate left start mid idx val
        let lv := match newLeft with | SegTree.leaf v => v | SegTree.node s _ _ => s
        let rv := match right with | SegTree.leaf v => v | SegTree.node s _ _ => s
        SegTree.node (lv + rv) newLeft right
      else
        let newRight := segUpdate right (mid + 1) end idx val
        let lv := match left with | SegTree.leaf v => v | SegTree.node s _ _ => s
        let rv := match newRight with | SegTree.leaf v => v | SegTree.node s _ _ => s
        SegTree.node (lv + rv) left newRight

def arr := [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
def tree := segBuild arr

def q1 := segSum tree 0 (arr.length - 1) 0 4
def q2 := segSum tree 0 (arr.length - 1) 2 7
def q3 := segSum tree 0 (arr.length - 1) 5 9
def q4 := segSum tree 0 (arr.length - 1) 0 9

def tree2 := segUpdate tree 0 (arr.length - 1) 3 100
def q5 := segSum tree2 0 (arr.length - 1) 2 4

def arr2 := List.range 20 |>.map (· + 1)
def tree3 := segBuild arr2
def q6 := segSum tree3 0 (arr2.length - 1) 0 19
def q7 := segSum tree3 0 (arr2.length - 1) 5 14

def x := q1 + q2 + q3 + q4 + q5 + q6 + q7
