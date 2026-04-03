-- Test 68: Floyd-Warshall Algorithm (All Pairs Shortest Path)
-- Simplified version using list of lists

def getMatrix (mat : List (List Nat)) (i j : Nat) : Nat :=
  match mat[i]? with
  | some row => match row[j]? with
    | some v => v
    | none => 1000000
  | none => 1000000

def setMatrix (mat : List (List Nat)) (i j v : Nat) : List (List Nat) :=
  mat.mapIdx fun k row =>
    if k = i then
      row.mapIdx fun m val =>
        if m = j then v else val
    else row

partial def floydWarshall (n : Nat) (edges : List (Nat × Nat × Nat)) : List (List Nat) :=
  let inf := 1000000
  let init := List.replicate n (List.replicate n inf)
  let init' := (List.range n).foldl (fun acc i => setMatrix acc i i 0) init
  let withEdges := edges.foldl (fun acc (u, v, w) => setMatrix acc u v w) init'
  let rec loopK (k : Nat) (dist : List (List Nat)) : List (List Nat) :=
    if k >= n then dist
    else
      let newDist := (List.range n).foldl (fun acc1 i =>
        (List.range n).foldl (fun acc2 j =>
          let dij := getMatrix acc2 i j
          let dik := getMatrix dist i k
          let dkj := getMatrix dist k j
          if dik + dkj < dij then setMatrix acc2 i j (dik + dkj)
          else acc2
        ) acc1
      ) dist
      loopK (k + 1) newDist
  loopK 0 withEdges

def edges1 := [(0, 1, 3), (0, 2, 8), (1, 2, 2), (2, 3, 1), (1, 3, 5)]
def fw1 := floydWarshall 4 edges1
def d1_01 := getMatrix fw1 0 1
def d1_02 := getMatrix fw1 0 2
def d1_03 := getMatrix fw1 0 3
def d1_13 := getMatrix fw1 1 3

def edges2 := [
  (0, 1, 5), (0, 2, 10), (1, 2, 3),
  (1, 3, 2), (2, 3, 1)
]
def fw2 := floydWarshall 4 edges2
def d2_03 := getMatrix fw2 0 3
def d2_13 := getMatrix fw2 1 3
def d2_23 := getMatrix fw2 2 3

def edges3 := [
  (0, 1, 1), (1, 2, 1), (2, 3, 1), (3, 4, 1)
]
def fw3 := floydWarshall 5 edges3
def d3_04 := getMatrix fw3 0 4
def d3_14 := getMatrix fw3 1 4
def d3_24 := getMatrix fw3 2 4

def x := d1_01 + d1_02 + d1_03 + d1_13 + d2_03 + d2_13 + d2_23 + d3_04 + d3_14 + d3_24

#eval s!"Floyd-Warshall 1 distances: 0->1={d1_01}, 0->2={d1_02}, 0->3={d1_03}, 1->3={d1_13}"
#eval s!"Floyd-Warshall 2 distances: 0->3={d2_03}, 1->3={d2_13}, 2->3={d2_23}"
#eval s!"Floyd-Warshall 3 distances: 0->4={d3_04}, 1->4={d3_14}, 2->4={d3_24}"
#eval s!"Total x: {x}"
