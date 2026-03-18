-- Test 98: Euler Tour Tree
def eulerTour (n : Nat) (edges : List (Nat × Nat)) (root : Nat) : List Nat :=
  let adj := (List.range n).map (fun i =>
    (i, edges.filter (fun (a, _) => a = i) |>.map snd))
  let rec tour (u : Nat) (visited : Array Bool) (path : List Nat) : List Nat × Array Bool :=
    if visited.get! u then (path, visited)
    else
      let newVisited := visited.set! u true
      let children := edges.filter (fun (a, _) => a = u) |>.map snd
      let (childPath, finalVisited) := children.foldl
        (fun (p, v) child =>
          let (cp, cv) := tour child v p
          if cv.get! child then (u :: cp, cv) else (cp, cv)
        )
        (u :: path, newVisited)
      (childPath, finalVisited)
  let (result, _) := tour root (Array.mkArray n false) []
  result.reverse

def eulerTourIn : List Nat → List (Nat × Nat)
  | [] => []
  | [x] => [(x, 0)]
  | h :: t =>
    let rest := eulerTourIn t
    match rest with
    | [] => [(h, 0)]
    | (last, time) :: rest' =>
      (h, time + 1) :: (last, time + 2) :: rest'

def edges := [(0, 1), (0, 2), (1, 3), (1, 4), (2, 5), (2, 6)]
def tour := eulerTour 7 edges 0

def x := tour.length + tour.sum
