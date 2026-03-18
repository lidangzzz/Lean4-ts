-- Test 13: Graph DFS traversal
inductive Graph where
  | mk : List (Nat × List Nat) → Graph

def neighbors : Graph → Nat → List Nat
  | Graph.mk adj, v => 
    match adj.find? (fun p => p.1 == v) with
    | some (_, ns) => ns
    | none => []

def dfsAux : Graph → Nat → List Nat → List Nat
  | g, v, visited =>
    if visited.contains v then visited
    else
      let visited := v :: visited
      let ns := neighbors g v
      let rec visitNeighbors : List Nat → List Nat → List Nat
        | [], vis => vis
        | h :: t, vis => visitNeighbors t (dfsAux g h vis)
      visitNeighbors ns visited

def dfs : Graph → Nat → List Nat
  | g, start => dfsAux g start []

def testGraph := Graph.mk [(1, [2, 3]), (2, [4, 5]), (3, [6]), (4, []), (5, []), (6, [])]
def traversal := dfs testGraph 1
def count := length traversal
def x := count
