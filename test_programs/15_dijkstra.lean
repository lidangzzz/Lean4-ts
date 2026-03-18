-- Test 15: Dijkstra's shortest path (simplified)
def minDistance : List (Nat × Nat) → Nat → Nat
  | [], _ => 999999
  | (v, d) :: t, visited =>
    if visited.contains v then minDistance t visited
    else min d (minDistance t visited)

def dijkstra : Nat → Nat → List (Nat × Nat × Nat) → Nat
  | _, _, [] => 999999
  | start, end, edges =>
    let rec loop : List (Nat × Nat) → Nat → List (Nat × Nat) → Nat
      | dists, 0, _ => 
        match dists.find? (fun p => p.1 == end) with
        | some (_, d) => d
        | none => 999999
      | dists, iter, visited =>
        let minD := minDistance dists visited
        let current := 
          match dists.find? (fun p => p.2 == minD && !visited.contains p.1) with
          | some (v, _) => v
          | none => 0
        let visited := current :: visited
        let newDists := dists.map (fun p =>
          if p.1 == current then (p.1, p.2)
          else
            let edgeDist := 
              match edges.find? (fun e => e.1 == current && e.2.1 == p.1) with
              | some (_, _, w) => w
              | none => 999999
            (p.1, min p.2 (minD + edgeDist)))
        loop newDists (iter - 1) visited
    let initialDists := [(start, 0)]
    loop initialDists 10 []
def x := 0
