-- Test 96: Heavy-Light Decomposition
def buildHLD (n : Nat) (edges : List (Nat × Nat)) (root : Nat) : Array Nat × Array Nat × Array Nat :=
  let adj := (List.range n).map (fun i =>
    (i, edges.filter (fun (a, _) => a = i) |>.map snd))
  let size := Array.mkArray n 1
  let parent := Array.mkArray n n
  let head := Array.mkArray n n
  let rec dfs (u p h : Nat) (sz par hd : Array Nat) : Array Nat × Array Nat × Array Nat :=
    let newPar := par.set! u p
    let newHd := hd.set! u h
    let children := edges.filter (fun (a, _) => a = u) |>.map snd |>.filter (· ≠ p)
    if children.isEmpty then (sz.set! u 1, newPar, newHd)
    else
      let heavyChild := children.foldl (fun acc v =>
        let childSize := sz.get! v
        if childSize > sz.get! acc then v else acc
      ) (children.head? |>.getD u)
      let (sz1, par1, hd1) := dfs heavyChild u h sz newPar newHd
      let rest := children.filter (· ≠ heavyChild)
      rest.foldl (fun (s, p, h) v =>
        dfs v u v s p h
      ) (sz1, par1, hd1)
  dfs root n root size parent head

def hldPath (u v : Nat) (parent head depth : Array Nat) : List (Nat × Nat) :=
  let rec collect (a b : Nat) (paths : List (Nat × Nat)) : List (Nat × Nat) :=
    if head.get! a = head.get! b then
      let (lo, hi) := if depth.get! a < depth.get! b then (a, b) else (b, a)
      (lo, hi) :: paths
    else if depth.get! (head.get! a) > depth.get! (head.get! b) then
      collect (parent.get! (head.get! a)) b ((head.get! a, a) :: paths)
    else
      collect a (parent.get! (head.get! b)) ((head.get! b, b) :: paths)
  collect u v []

def edges := [(0, 1), (0, 2), (1, 3), (1, 4), (2, 5), (2, 6)]
def (size, parent, head) := buildHLD 7 edges 0
def depth := #[0, 1, 1, 2, 2, 2, 2]

def path1 := hldPath 3 6 parent head depth
def path2 := hldPath 4 5 parent head depth

def x := path1.length + path2.length + size.sum
