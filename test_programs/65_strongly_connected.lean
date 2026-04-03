-- Test 65: Strongly Connected Components (simplified)
def buildGraph (edges : List (Nat × Nat)) (n : Nat) : List (List Nat) :=
  let adj := List.range n |>.map fun i =>
    edges.filter (fun (a, _) => a = i) |>.map (fun (_, b) => b)
  adj

partial def dfs (visited : List Nat) (node : Nat) (adj : List (List Nat)) (component : List Nat) : List Nat :=
  if visited.contains node then component
  else
    let neighbors := adj.getD node []
    let newComponent := node :: component
    neighbors.foldl (fun comp n => dfs (node :: visited) n adj comp) newComponent

def findSCCs (n : Nat) (edges : List (Nat × Nat)) : List (List Nat) :=
  let adj := buildGraph edges n
  let visited := []
  List.range n |>.foldl (fun comps i =>
    if visited.contains i then comps
    else
      let component := dfs visited i adj []
      component :: comps
  ) []

def edges1 := [(0, 1), (1, 2), (2, 0), (3, 4), (4, 3)]
def sccs1 := findSCCs 5 edges1

def count1 := sccs1.length

def edges2 := [(0, 1), (1, 2), (2, 3), (3, 4)]
def sccs2 := findSCCs 5 edges2

def count2 := sccs2.length

def x := count1 + count2
#eval x
