-- Test 69: Maximum Flow (Ford-Fulkerson with DFS)
def bfsPath (n : Nat) (capacity : Array (Array Nat)) (flow : Array (Array Nat)) (src sink : Nat) : Option (List Nat) :=
  let visited := Array.mkArray n false |>.set! src true
  let parent := Array.mkArray n n
  let rec search (queue : List Nat) (vis : Array Bool) (par : Array Nat) : Array Nat :=
    match queue with
    | [] => par
    | u :: rest =>
      let neighbors := (List.range n).filter (fun v =>
        !vis.get! v && (capacity.get! u).get! v > (flow.get! u).get! v)
      if neighbors.isEmpty then search rest vis par
      else if neighbors.contains sink then
        par.set! sink u
      else
        let (vis', par') := neighbors.foldl (fun (vAcc, pAcc) v =>
          (vAcc.set! v true, pAcc.set! v u)
        ) (vis, par)
        search (rest ++ neighbors) vis' par'
  let parent' := search [src] visited parent
  if parent'.get! sink < n then
    let rec buildPath (current : Nat) (path : List Nat) : List Nat :=
      if current = src then src :: path
      else buildPath (parent'.get! current) (current :: path)
    some (buildPath sink [])
  else none

def minCapacity (path : List Nat) (capacity flow : Array (Array Nat)) : Nat :=
  match path with
  | [] => 0
  | [_] => 0
  | u :: v :: rest =>
    let cap := (capacity.get! u).get! v - (flow.get! u).get! v
    min cap (minCapacity (v :: rest) capacity flow)

def augmentFlow (path : List Nat) (amount : Nat) (flow : Array (Array Nat)) : Array (Array Nat) :=
  match path with
  | [] | [_] => flow
  | u :: v :: rest =>
    let fu := flow.get! u
    let fv := flow.get! v
    let fu' := fu.set! v (fu.get! v + amount)
    let fv' := fv.set! u (fv.get! u - amount)
    let flow' := flow.set! u fu'
    let flow'' := flow'.set! v fv'
    augmentFlow (v :: rest) amount flow''

def maxFlow (n : Nat) (capacity : Array (Array Nat)) (src sink : Nat) : Nat :=
  let zeroFlow := Array.mkArray n (Array.mkArray n 0)
  let rec findAugmenting (flow : Array (Array Nat)) (total : Nat) : Nat :=
    match bfsPath n capacity flow src sink with
    | some path =>
      let minCap := minCapacity path capacity flow
      if minCap = 0 then total
      else
        let flow' := augmentFlow path minCap flow
        findAugmenting flow' (total + minCap)
    | none => total
  findAugmenting zeroFlow 0

def cap1 : Array (Array Nat) := #[
  #[0, 10, 5, 0],
  #[0, 0, 15, 10],
  #[0, 0, 0, 10],
  #[0, 0, 0, 0]
]
def mf1 := maxFlow 4 cap1 0 3

def cap2 : Array (Array Nat) := #[
  #[0, 3, 2, 0, 0],
  #[0, 0, 5, 2, 0],
  #[0, 0, 0, 3, 0],
  #[0, 0, 0, 0, 4],
  #[0, 0, 0, 0, 0]
]
def mf2 := maxFlow 5 cap2 0 4

def x := mf1 + mf2
