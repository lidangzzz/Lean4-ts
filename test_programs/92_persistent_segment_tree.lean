-- Test 92: Persistent Segment Tree
inductive PSTNode where | leaf : Nat → PSTNode | node : Nat → PSTNode → PSTNode → PSTNode

def pstBuild (arr : List Nat) : PSTNode :=
  match arr with
  | [] => PSTNode.leaf 0
  | [x] => PSTNode.leaf x
  | xs =>
    let mid := xs.length / 2
    let left := pstBuild (xs.take mid)
    let right := pstBuild (xs.drop mid)
    let lv := match left with | PSTNode.leaf v => v | PSTNode.node v _ _ => v
    let rv := match right with | PSTNode.leaf v => v | PSTNode.node v _ _ => v
    PSTNode.node (lv + rv) left right

def pstUpdate (t : PSTNode) (idx val : Nat) (size : Nat) : PSTNode :=
  match t with
  | PSTNode.leaf _ => PSTNode.leaf val
  | PSTNode.node sum left right =>
    let mid := size / 2
    if idx < mid then
      let newLeft := pstUpdate left idx val mid
      let lv := match newLeft with | PSTNode.leaf v => v | PSTNode.node v _ _ => v
      let rv := match right with | PSTNode.leaf v => v | PSTNode.node v _ _ => v
      PSTNode.node (lv + rv) newLeft right
    else
      let newRight := pstUpdate right (idx - mid) val (size - mid)
      let lv := match left with | PSTNode.leaf v => v | PSTNode.node v _ _ => v
      let rv := match newRight with | PSTNode.leaf v => v | PSTNode.node v _ _ => v
      PSTNode.node (lv + rv) left newRight

def pstQuery (t : PSTNode) (l r ql qr : Nat) : Nat :=
  match t with
  | PSTNode.leaf v =>
    if ql <= l && r <= qr then v else 0
  | PSTNode.node sum left right =>
    if qr < l || r < ql then 0
    else if ql <= l && r <= qr then sum
    else
      let mid := (l + r) / 2
      pstQuery left l mid ql qr + pstQuery right (mid + 1) r ql qr

def arr := [1, 2, 3, 4, 5, 6, 7, 8]
def v0 := pstBuild arr
def v1 := pstUpdate v0 3 100 8
def v2 := pstUpdate v1 5 200 8

def q0 := pstQuery v0 0 7 0 7
def q1 := pstQuery v1 0 7 0 7
def q2 := pstQuery v2 0 7 0 7
def q3 := pstQuery v1 0 7 2 4
def q4 := pstQuery v2 0 7 4 6

def x := q0 + q1 + q2 + q3 + q4
