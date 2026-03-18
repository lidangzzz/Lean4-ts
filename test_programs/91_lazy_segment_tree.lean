-- Test 91: Lazy Segment Tree (Range Update)
inductive LazySegTree where
  | leaf : Nat → LazySegTree
  | node : Nat → Nat → Nat → LazySegTree → LazySegTree → LazySegTree

def lazySegBuild (arr : List Nat) : LazySegTree :=
  match arr with
  | [] => LazySegTree.leaf 0
  | [x] => LazySegTree.leaf x
  | xs =>
    let mid := xs.length / 2
    let left := lazySegBuild (xs.take mid)
    let right := lazySegBuild (xs.drop mid)
    let lv := match left with | LazySegTree.leaf v => v | LazySegTree.node v _ _ _ _ => v
    let rv := match right with | LazySegTree.leaf v => v | LazySegTree.node v _ _ _ _ => v
    LazySegTree.node (lv + rv) 0 0 left right

def lazySegQuery (t : LazySegTree) (l r ql qr : Nat) : Nat :=
  match t with
  | LazySegTree.leaf v =>
    if ql <= l && r <= qr then v else 0
  | LazySegTree.node sum _ _ left right =>
    if qr < l || r < ql then 0
    else if ql <= l && r <= qr then sum
    else
      let mid := (l + r) / 2
      lazySegQuery left l mid ql qr + lazySegQuery right (mid + 1) r ql qr

def lazySegUpdate (t : LazySegTree) (l r ul ur val : Nat) : LazySegTree :=
  match t with
  | LazySegTree.leaf v =>
    if ul <= l && r <= ur then LazySegTree.leaf (v + val)
    else t
  | LazySegTree.node sum lazy len left right =>
    if ur < l || r < ul then t
    else if ul <= l && r <= ur then
      LazySegTree.node (sum + val * len) lazy len left right
    else
      let mid := (l + r) / 2
      let newLeft := lazySegUpdate left l mid ul ur val
      let newRight := lazySegUpdate right (mid + 1) r ul ur val
      let lv := match newLeft with | LazySegTree.leaf v => v | LazySegTree.node v _ _ _ _ => v
      let rv := match newRight with | LazySegTree.leaf v => v | LazySegTree.node v _ _ _ _ => v
      LazySegTree.node (lv + rv) lazy len newLeft newRight

def arr := [1, 2, 3, 4, 5, 6, 7, 8]
def tree := lazySegBuild arr

def q1 := lazySegQuery tree 0 7 0 3
def q2 := lazySegQuery tree 0 7 4 7

def tree2 := lazySegUpdate tree 0 7 2 5 10
def q3 := lazySegQuery tree2 0 7 2 5
def q4 := lazySegQuery tree2 0 7 0 7

def x := q1 + q2 + q3 + q4
