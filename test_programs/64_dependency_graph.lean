-- Test 64: Dependency Graph and Topological Sort
inductive Graph where | mk : List (Nat × Nat) → Graph

def graphEdges : Graph → List (Nat × Nat) | Graph.mk edges => edges

def graphNodes (g : Graph) : List Nat :=
  let edges := graphEdges g
  let nodes := edges.foldl (fun acc (a, b) => a :: b :: acc) []
  nodes.eraseDups

def graphAdj (g : Graph) (node : Nat) : List Nat :=
  (graphEdges g).filter (fun (a, _) => a = node) |>.map (·.2)

def graphPredecessors (g : Graph) (node : Nat) : List Nat :=
  (graphEdges g).filter (fun (_, b) => b = node) |>.map (·.1)

def graphInDegree (g : Graph) (node : Nat) : Nat :=
  graphPredecessors g node |>.length

partial def topoSort (g : Graph) : List Nat :=
  let nodes := graphNodes g
  let inDegrees := nodes.map (fun n => (n, graphInDegree g n))
  let rec sort (remaining : List (Nat × Nat)) (sorted : List Nat) (queue : List Nat) : List Nat :=
    match queue with
    | [] => sorted.reverse
    | n :: rest =>
      let newRemaining := remaining.filter (fun (node, _) => node ≠ n)
      let sorted' := n :: sorted
      let adj := graphAdj g n
      let newQueue := rest ++ (adj.filter (fun a =>
        let currentDeg := ((remaining.find? (fun (node, _) => node = a)).getD (a, 0)).2
        currentDeg = 1))
      sort newRemaining sorted' newQueue
  let startQueue := inDegrees.filter (fun (_, deg) => deg = 0) |>.map (·.1)
  sort inDegrees [] startQueue

def hasCycle (g : Graph) : Bool :=
  (topoSort g).length < (graphNodes g).length

def graph1 := Graph.mk [(1, 2), (2, 3), (3, 4), (4, 5)]
def topo1 := topoSort graph1
def cycle1 := hasCycle graph1

def graph2 := Graph.mk [(1, 2), (1, 3), (2, 4), (3, 4), (4, 5)]
def topo2 := topoSort graph2
def cycle2 := hasCycle graph2

def graph3 := Graph.mk [(1, 2), (2, 3), (3, 1)]
def topo3 := topoSort graph3
def cycle3 := hasCycle graph3

def graph4 := Graph.mk [
  (1, 2), (1, 3), (2, 4), (2, 5), (3, 6), (3, 7),
  (4, 8), (5, 8), (6, 8), (7, 8)
]
def topo4 := topoSort graph4
def cycle4 := hasCycle graph4

def x := topo1.length + topo2.length + topo3.length + topo4.length +
         (if cycle1 then 1 else 0) + (if cycle2 then 1 else 0) +
         (if cycle3 then 1 else 0) + (if cycle4 then 1 else 0)

#eval s!"Graph1 topo: {topo1}"
#eval s!"Graph1 has cycle: {cycle1}"
#eval s!"Graph2 topo: {topo2}"
#eval s!"Graph2 has cycle: {cycle2}"
#eval s!"Graph3 topo: {topo3}"
#eval s!"Graph3 has cycle: {cycle3}"
#eval s!"Graph4 topo: {topo4}"
#eval s!"Graph4 has cycle: {cycle4}"
#eval s!"Total x: {x}"
