-- Test 15: Dijkstra's shortest path (simplified)
-- Simple implementation

def minDist (dists : List (Nat × Nat)) (visited : List Nat) : Nat :=
  match dists with
  | [] => 999999
  | (v, d) :: t =>
    if visited.elem v then minDist t visited
    else min d (minDist t visited)

def findMinVertex (dists : List (Nat × Nat)) (visited : List Nat) : Nat :=
  match dists with
  | [] => 0
  | (v, d) :: t =>
    if visited.elem v then findMinVertex t visited
    else if d <= minDist dists visited then v
    else findMinVertex t visited

partial def dijkstraIter (dists : List (Nat × Nat)) (visited : List Nat) (edges : List (Nat × Nat × Nat)) (target : Nat) (iter : Nat) : Nat :=
  if iter == 0 then
    match dists.find? (fun p => p.1 == target) with
    | some (_, d) => d
    | none => 999999
  else
    let current := findMinVertex dists visited
    if visited.elem current then
      match dists.find? (fun p => p.1 == target) with
      | some (_, d) => d
      | none => 999999
    else
      let visited := current :: visited
      let currentDist :=
        match dists.find? (fun p => p.1 == current) with
        | some (_, d) => d
        | none => 999999
      let newDists := dists.map (fun p =>
        if p.1 == current then p
        else
          let edgeWeight :=
            match edges.find? (fun e => e.1 == current && e.2.1 == p.1) with
            | some (_, _, w) => w
            | none => 999999
          (p.1, min p.2 (currentDist + edgeWeight))
      )
      dijkstraIter newDists visited edges target (iter - 1)

def dijkstra (start : Nat) (target : Nat) (edges : List (Nat × Nat × Nat)) : Nat :=
  let initialDists := [(start, 0)]
  dijkstraIter initialDists [] edges target 10

def testEdges := [(1, 2, 10), (2, 3, 5), (1, 3, 20)]
def shortest := dijkstra 1 3 testEdges

-- Output results
#eval shortest
#eval dijkstra 1 2 testEdges
#eval dijkstra 2 3 testEdges
