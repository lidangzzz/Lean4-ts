-- Test 95: Lowest Common Ancestor (Binary Lifting)
def buildParent (n : Nat) (edges : List (Nat × Nat)) (root : Nat) : Array Nat :=
  let parent := Array.mkArray n n
  let rec dfs (u p : Nat) (par : Array Nat) : Array Nat :=
    let newPar := par.set! u p
    let children := edges.filter (fun (a, _) => a = u) |>.map snd
    children.foldl (fun acc v => dfs v u acc) newPar
  dfs root n parent

def buildBinaryLifting (parent : Array Nat) (logN : Nat) : Array (Array Nat) :=
  let n := parent.size
  let up := Array.mkArray n (Array.mkArray (logN + 1) n)
  let up1 := (List.range n).foldl (fun acc i =>
    acc.set! i ((acc.get! i).set! 0 (parent.get! i))
  ) up
  (List.range (logN)).foldl (fun acc j =>
    (List.range n).foldl (fun acc2 i =>
      let mid := (acc2.get! i).get! j
      let val := if mid < n then (acc2.get! mid).get! j else n
      acc2.set! i ((acc2.get! i).set! (j + 1) val)
    ) acc
  ) up1

def lcaQuery (up : Array (Array Nat)) (depth : Array Nat) (u v : Nat) : Nat :=
  let n := up.size
  let logN := (up.get! 0).size - 1
  let rec lift (node k : Nat) : Nat :=
    if k = 0 then node
    else lift (up.get! node |>.get! (k - 1)) (k - 1)
  let (u', v') :=
    if depth.get! u < depth.get! v then (v, u)
    else (u, v)
  let diff := depth.get! u' - depth.get! v'
  let u'' := lift u' diff
  if u'' = v' then u''
  else
    let rec find (i : Nat) (ua va : Nat) : Nat :=
      if i < 0 then up.get! ua |>.get! 0
      else if up.get! ua |>.get! i ≠ up.get! va |>.get! i then
        find (i - 1) (up.get! ua |>.get! i) (up.get! va |>.get! i)
      else find (i - 1) ua va
    find logN u'' v'

def edges := [(0, 1), (0, 2), (1, 3), (1, 4), (2, 5), (2, 6)]
def parent := buildParent 7 edges 0
def depth := #[0, 1, 1, 2, 2, 2, 2]
def up := buildBinaryLifting parent 2

def lca1 := lcaQuery up depth 3 4
def lca2 := lcaQuery up depth 5 6
def lca3 := lcaQuery up depth 3 6

def x := lca1 + lca2 + lca3
