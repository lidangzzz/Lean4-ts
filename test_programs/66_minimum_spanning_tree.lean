-- Test 66: Minimum Spanning Tree (Kruskal's Algorithm)
inductive Edge where | mk : Nat → Nat → Nat → Edge

def edgeFrom : Edge → Nat | Edge.mk f _ _ => f
def edgeTo : Edge → Nat | Edge.mk _ t _ => t
def edgeWeight : Edge → Nat | Edge.mk _ _ w => w

def kruskalMST (n : Nat) (edges : List Edge) : List Edge :=
  let sorted := edges.toArray.qsort (fun a b => edgeWeight a < edgeWeight b) |>.toList
  let parent := Array.mkArray n 0 |>.mapIdx fun i _ => i
  let rec find (p : Array Nat) (x : Nat) : Nat :=
    if p.get! x = x then x else find p (p.get! x)
  let rec union (p : Array Nat) (x y : Nat) : Array Nat :=
    let px := find p x
    let py := find p y
    if px ≠ py then p.set! px py else p
  let rec process (remaining : List Edge) (parent : Array Nat) (mst : List Edge) : List Edge :=
    match remaining with
    | [] => mst.reverse
    | e :: rest =>
      let u := edgeFrom e
      let v := edgeTo e
      let pu := find parent u
      let pv := find parent v
      if pu ≠ pv then
        process rest (union parent u v) (e :: mst)
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

def edges3 := [
  Edge.mk 0 1 2, Edge.mk 1 2 3, Edge.mk 2 3 4,
  Edge.mk 3 4 5, Edge.mk 4 0 1, Edge.mk 0 2 7
]
def mst3 := kruskalMST 5 edges3
def w3 := mstWeight mst3
def c3 := mstEdgeCount mst3

def x := w1 + w2 + w3 + c1 + c2 + c3
