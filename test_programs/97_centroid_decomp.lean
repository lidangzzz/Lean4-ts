-- Test 97: Centroid Decomposition
def findCentroid (n : Nat) (edges : List (Nat × Nat)) (root : Nat) (removed : Array Bool) : Nat :=
  let size := Array.mkArray n 0
  let rec dfs (u : Nat) (sz : Array Nat) : Array Nat :=
    if removed.get! u then sz
    else
      let children := edges.filter (fun (a, _) => a = u) |>.map snd |>.filter (!removed.get! ·)
      let newSz := children.foldl (fun acc v => dfs v acc) sz
      newSz.set! u (1 + (children.map (fun v => newSz.get! v)).sum)
  let sizes := dfs root size
  let total := sizes.get! root
  let rec find (u : Nat) : Nat :=
    let children := edges.filter (fun (a, _) => a = u) |>.map snd |>.filter (!removed.get! ·)
    let heavy := children.find? (fun v => sizes.get! v > total / 2)
    match heavy with
    | some v => find v
    | none => u
  find root

def centroidDecompose (n : Nat) (edges : List (Nat × Nat)) : List Nat :=
  let removed := Array.mkArray n false
  let rec decompose (remaining : List Nat) (rem : Array Bool) (centroids : List Nat) : List Nat :=
    match remaining with
    | [] => centroids.reverse
    | root :: rest =>
      if rem.get! root then decompose rest rem centroids
      else
        let c := findCentroid n edges root rem
        let newRem := rem.set! c true
        let children := edges.filter (fun (a, _) => a = c) |>.map snd
        decompose (children ++ rest) newRem (c :: centroids)
  decompose (List.range n) removed []

def edges := [(0, 1), (0, 2), (1, 3), (1, 4), (2, 5), (2, 6)]
def centroids := centroidDecompose 7 edges

def x := centroids.length + centroids.sum
