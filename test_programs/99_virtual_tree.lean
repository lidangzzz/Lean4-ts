-- Test 99: Virtual Tree (for queries on subsets of nodes)
def buildVirtualTree (nodes : List Nat) (parent depth : Array Nat) : List (Nat × Nat) :=
  let sorted := nodes.toArray.qsort (fun a b => depth.get! a < depth.get! b) |>.toList
  let lca (a b : Nat) : Nat :=
    if depth.get! a < depth.get! b then lca b a
    else if a = b then a
    else lca (parent.get! a) b
  let rec build (remaining : List Nat) (edges : List (Nat × Nat)) : List (Nat × Nat) :=
    match remaining with
    | [] => edges
    | [x] => edges
    | a :: b :: rest =>
      let l := lca a b
      let newEdges := (l, a) :: (l, b) :: edges
      build (l :: rest) newEdges
  let virtualEdges := build sorted []
  virtualEdges

def parent := #[7, 0, 0, 1, 1, 2, 2, 7]
def depth := #[1, 2, 2, 3, 3, 3, 3, 0]

def nodes1 := [3, 4, 5, 6]
def vtree1 := buildVirtualTree nodes1 parent depth

def nodes2 := [1, 2, 3]
def vtree2 := buildVirtualTree nodes2 parent depth

def x := vtree1.length + vtree2.length + nodes1.sum + nodes2.sum
