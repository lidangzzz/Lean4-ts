-- Test 66: Minimum Spanning Tree (Kruskal's Algorithm)
inductive Edge where | mk : Nat → Nat → Nat → Edge

def edgeFrom : Edge → Nat | Edge.mk f _ _ => f
def edgeTo : Edge → Nat | Edge.mk _ t _ => t
def edgeWeight : Edge → Nat | Edge.mk _ _ w => w

partial def findParent (parent : List Nat) (x : Nat) : Nat :=
  if x < parent.length then
    let p := parent.getD x x
    if p = x then x else findParent parent p
  else x

partial def unionParent (parent : List Nat) (x y : Nat) : List Nat :=
  if x < parent.length && y < parent.length then
    let px := findParent parent x
    let py := findParent parent y
    if px ≠ py then parent.set px py else parent
  else parent

partial def kruskalMST (n : Nat) (edges : List Edge) : List Edge :=
  let sorted := edges.toArray.qsort (fun a b => edgeWeight a < edgeWeight b) |>.toList
  let parent := List.range n
  let rec process (remaining : List Edge) (parent : List Nat) (mst : List Edge) : List Edge :=
    match remaining with
    | [] => mst.reverse
    | e :: rest =>
      let u := edgeFrom e
      let v := edgeTo e
      let pu := findParent parent u
      let pv := findParent parent v
      if pu ≠ pv then
        process rest (unionParent parent pu pv) (e :: mst)
      else
        process rest parent mst
  process sorted parent []

def mstWeight (mst : List Edge) : Nat :=
  (mst.map edgeWeight).sum

def mstEdgeCount (mst : List Edge) : Nat := mst.length

def edges1 := [
  Edge.mk 0 1 4, Edge.mk 0 2 3, Edge.mk 1 2 1,
  Edge.mk 1 3 2, Edge.mk 2 3 4
]
def mst1 := kruskalMST 4 edges1
def w1 := mstWeight mst1
def c1 := mstEdgeCount mst1

def edges2 := [
  Edge.mk 0 1 10, Edge.mk 0 2 6, Edge.mk 0 3 5,
  Edge.mk 1 3 15, Edge.mk 2 3 4
]
def mst2 := kruskalMST 4 edges2
def w2 := mstWeight mst2
def c2 := mstEdgeCount mst2

def x := w1 + c1 + w2 + c2
#eval x
