-- Test 45: Union-Find (Disjoint Set Union)
def ufInit (n : Nat) : Array Nat := Array.replicate n 0 |>.mapIdx fun i _ => i

partial def ufFind (uf : Array Nat) (x : Nat) : Nat :=
  if uf.getD x x = x then x
  else
    let root := ufFind uf (uf.getD x x)
    root

partial def ufFindPath (uf : Array Nat) (x : Nat) : Nat × Array Nat :=
  if uf.getD x x = x then (x, uf)
  else
    let (root, uf') := ufFindPath uf (uf.getD x x)
    (root, uf'.set! x root)

partial def ufUnion (uf : Array Nat) (x y : Nat) : Array Nat :=
  let (rootX, uf1) := ufFindPath uf x
  let (rootY, uf2) := ufFindPath uf1 y
  if rootX = rootY then uf2
  else uf2.set! rootX rootY

def ufConnected (uf : Array Nat) (x y : Nat) : Bool :=
  ufFind uf x = ufFind uf y

def ufCountSets (uf : Array Nat) : Nat :=
  (List.range uf.size).filter (fun i => uf.getD i i = i) |>.length

def uf1 := ufInit 10

def uf2 := ufUnion uf1 1 2
def uf3 := ufUnion uf2 2 3
def uf4 := ufUnion uf3 4 5
def uf5 := ufUnion uf4 6 7
def uf6 := ufUnion uf5 5 6
def uf7 := ufUnion uf6 3 7

def c1 := ufConnected uf7 1 2
def c2 := ufConnected uf7 1 3
def c3 := ufConnected uf7 1 7
def c4 := ufConnected uf7 4 6
def c5 := ufConnected uf7 0 1
def c6 := ufConnected uf7 8 9

def sets := ufCountSets uf7

def uf8 := ufUnion uf7 8 9
def sets2 := ufCountSets uf8
def c7 := ufConnected uf8 8 9

def x := (if c1 then 1 else 0) + (if c2 then 1 else 0) + (if c3 then 1 else 0) +
         (if c4 then 1 else 0) + (if c5 then 1 else 0) + (if c6 then 1 else 0) +
         (if c7 then 1 else 0) + sets + sets2

-- Output results
#eval s!"1-2 connected: {c1}"
#eval s!"1-3 connected: {c2}"
#eval s!"1-7 connected: {c3}"
#eval s!"4-6 connected: {c4}"
#eval s!"0-1 connected: {c5}"
#eval s!"8-9 connected: {c6}"
#eval s!"8-9 after union: {c7}"
#eval s!"Sets before union: {sets}"
#eval s!"Sets after union: {sets2}"
#eval s!"Total x: {x}"
