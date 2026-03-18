-- Test 88: Treap (Tree + Heap)
inductive Treap where | leaf | node : Nat → Nat → Treap → Treap → Treap

def treapPriority := 31

def treapRotateRight : Treap → Treap
  | Treap.node x px (Treap.node y py a b) c =>
    if py > px then Treap.node y py a (Treap.node x px b c)
    else Treap.node x px (Treap.node y py a b) c
  | t => t

def treapRotateLeft : Treap → Treap
  | Treap.node x px a (Treap.node y py b c) =>
    if py > px then Treap.node y py (Treap.node x px a b) c
    else Treap.node x px a (Treap.node y py b c)
  | t => t

def treapInsert (t : Treap) (key priority : Nat) : Treap :=
  match t with
  | Treap.leaf => Treap.node key priority Treap.leaf Treap.leaf
  | Treap.node k p left right =>
    if key < k then
      let newLeft := treapInsert left key priority
      treapRotateRight (Treap.node k p newLeft right)
    else if key > k then
      let newRight := treapInsert right key priority
      treapRotateLeft (Treap.node k p left newRight)
    else t

def treapSearch (t : Treap) (key : Nat) : Bool :=
  match t with
  | Treap.leaf => false
  | Treap.node k _ left right =>
    if key < k then treapSearch left key
    else if key > k then treapSearch right key
    else true

def treapHeight : Treap → Nat
  | Treap.leaf => 0
  | Treap.node _ _ left right =>
    1 + max (treapHeight left) (treapHeight right)

def treapSize : Treap → Nat
  | Treap.leaf => 0
  | Treap.node _ _ left right =>
    1 + treapSize left + treapSize right

def priorities := [50, 30, 70, 20, 40, 60, 80]
def keys := [5, 3, 7, 1, 4, 6, 8, 2]
def treap := keys.zip priorities |>.foldl (fun t (k, p) => treapInsert t k p) Treap.leaf

def s1 := treapSearch treap 5
def s2 := treapSearch treap 3
def s3 := treapSearch treap 10
def h := treapHeight treap
def sz := treapSize treap

def x := (if s1 then 1 else 0) + (if s2 then 1 else 0) + (if s3 then 1 else 0) + h + sz
