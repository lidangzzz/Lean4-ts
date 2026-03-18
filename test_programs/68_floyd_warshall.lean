-- Test 68: Floyd-Warshall Algorithm (All Pairs Shortest Path)
def floydWarshall (n : Nat) (edges : List (Nat × Nat × Nat)) : Array (Array Nat) :=
  let inf := 1000000
  let init := Array.mkArray n (Array.mkArray n inf)
  let init' := (List.range n).foldl (fun acc i => acc.set! i (acc.get! i |>.set! i 0)) init
  let withEdges := edges.foldl (fun acc (u, v, w) => acc.set! u (acc.get! u |>.set! v w)) init'
  let rec loopK (k : Nat) (dist : Array (Array Nat)) : Array (Array Nat) :=
    if k >= n then dist
    else
      let newDist := (List.range n).foldl (fun acc1 i =>
        acc1.set! i ((List.range n).foldl (fun acc2 j =>
          let dij := (acc2.get! i).get! j
          let dik := (dist.get! i).get! k
          let dkj := (dist.get! k).get! j
          if dik + dkj < dij then acc2.set! i ((acc2.get! i).set! j (dik + dkj))
          else acc2
        ) acc1)
      ) dist
      loopK (k + 1) newDist
  loopK 0 withEdges

def getDist (dist : Array (Array Nat)) (i j : Nat) : Nat :=
  (dist.get! i).get! j

def edges1 := [(0, 1, 3), (0, 2, 8), (1, 2, 2), (2, 3, 1), (1, 3, 5)]
def fw1 := floydWarshall 4 edges1
def d1_01 := getDist fw1 0 1
def d1_02 := getDist fw1 0 2
def d1_03 := getDist fw1 0 3
def d1_13 := getDist fw1 1 3

def edges2 := [
  (0, 1, 5), (0, 2, 10), (1, 2, 3),
  (1, 3, 2), (2, 3, 1)
]
def fw2 := floydWarshall 4 edges2
def d2_03 := getDist fw2 0 3
def d2_13 := getDist fw2 1 3
def d2_23 := getDist fw2 2 3

def edges3 := [
  (0, 1, 1), (1, 2, 1), (2, 3, 1), (3, 4, 1)
]
def fw3 := floydWarshall 5 edges3
def d3_04 := getDist fw3 0 4
def d3_14 := getDist fw3 1 4
def d3_24 := getDist fw3 2 4

def x := d1_01 + d1_02 + d1_03 + d1_13 + d2_03 + d2_13 + d2_23 + d3_04 + d3_14 + d3_24
