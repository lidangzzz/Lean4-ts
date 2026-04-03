-- Test 67: Bellman-Ford Algorithm (Simplified)
inductive WEdge where | mk : Nat → Nat → Int → WEdge

def getDist (dists : List Int) (i : Nat) : Int :=
  match dists with
 | [] => 1000000
  | h :: t =>
    match i with
    | 0 => h
    | n + 1 => getDist t n

def setDist (dists : List Int) (i : Nat) (v : Int) : List Int :=
  match dists with
  | [] => []
  | h :: t =>
    match i with
    | 0 => v :: t
    | n + 1 => h :: setDist t n v

def makeDists (n : Nat) : List Int :=
  match n with
  | 0 => []
  | m + 1 => 1000000 :: makeDists m

def relaxEdge (edges : List WEdge) (d : List Int) : List Int :=
  match edges with
  | [] => d
  | WEdge.mk u v w :: rest =>
    let du := getDist d u
    let dv := getDist d v
    let d' := if du + w < dv then setDist d v (du + w) else d
    relaxEdge rest d'

def relaxN (n : Nat) (edges : List WEdge) (d : List Int) : List Int :=
  match n with
  | 0 => d
  | m + 1 => relaxN m edges (relaxEdge edges d)

def bellmanFord (n : Nat) (edges : List WEdge) (src : Nat) : List Int :=
  let dist := setDist (makeDists n) src 0
  relaxN (n - 1) edges dist

def hasNegCycle (edges : List WEdge) (d : List Int) : Bool :=
  match edges with
  | [] => false
  | WEdge.mk u v w :: rest =>
    let du := getDist d u
    let dv := getDist d v
    if du + w < dv then true else hasNegCycle rest d

def edges1 := [
  WEdge.mk 0 1 4, WEdge.mk 0 2 5,
  WEdge.mk 1 2 (-3), WEdge.mk 2 3 2
]

def dist1 := bellmanFord 4 edges1 0
def d1_0 := getDist dist1 0
def d1_1 := getDist dist1 1
def d1_2 := getDist dist1 2
def d1_3 := getDist dist1 3
def nc1 := hasNegCycle edges1 dist1

def edges2 := [
  WEdge.mk 0 1 1, WEdge.mk 1 2 (-1),
  WEdge.mk 2 3 (-1), WEdge.mk 3 1 (-1)
]

def dist2 := bellmanFord 4 edges2 0
def nc2 := hasNegCycle edges2 dist2

def x := (if d1_0 >= 0 then d1_0.toNat else 0) +
         (if d1_1 >= 0 then d1_1.toNat else 0) +
         (if d1_2 >= 0 then d1_2.toNat else 0) +
         (if d1_3 >= 0 then d1_3.toNat else 0) +
         (if nc1 then 1 else 0) + (if nc2 then 1 else 0)

#eval s!"Dist1: {dist1}"
#eval s!"d1_0: {d1_0}, d1_1: {d1_1}, d1_2: {d1_2}, d1_3: {d1_3}"
#eval s!"Negative cycle 1: {nc1}"
#eval s!"Dist2: {dist2}"
#eval s!"Negative cycle 2: {nc2}"
#eval s!"Total x: {x}"
