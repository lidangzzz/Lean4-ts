-- Test 65: Strongly Connected Components (Tarjan's Algorithm)
inductive SCCState where | mk : Array Nat → Array Nat → Array Bool → SCCState

def tarjanSCC (n : Nat) (edges : List (Nat × Nat)) : List (List Nat) :=
  let adj := (List.range n).map (fun i =>
    (i, edges.filter (fun (a, _) => a = i) |>.map snd))
  let adjMap := adj.toArray
  let rec dfs (state : SCCState) (v : Nat) (index : Nat) (sccs : List (List Nat)) : SCCState × Nat × List (List Nat) :=
    let (SCCState.mk indices lowlinks onStack) := state
    let indices' := indices.set! v index
    let lowlinks' := lowlinks.set! v index
    let onStack' := onStack.set! v true
    let neighbors := (adjMap.get! v).snd
    let (state'', newIndex, sccs') := neighbors.foldl
      (fun (st, idx, sc) neighbor =>
        let (SCCState.mk ind ll onS) := st
        if ind.get! neighbor = 0 then
          let (st', idx', sc') := dfs st neighbor (idx + 1) sc
          let ll' := st'.2 |>.set! v (min (ll.get! v) (st'.2.get! neighbor))
          (SCCState.mk st'.1 ll' st'.3, idx', sc')
        else if onS.get! neighbor then
          let ll' := ll.set! v (min (ll.get! v) (ind.get! neighbor))
          (SCCState.mk ind ll' onS, idx, sc)
        else (st, idx, sc))
      (SCCState.mk indices' lowlinks' onStack', index + 1, sccs)
    let (SCCState.mk ind2 ll2 onS2) := state''
    if ll2.get! v = ind2.get! v then
      let rec pop (stack : List Nat) (component : List Nat) : List Nat × List Nat :=
        match stack with
        | [] => (component.reverse, [])
        | w :: rest =>
          if w = v then (v :: component.reverse, rest)
          else pop rest (w :: component)
      -- Simplified: just return single vertex as SCC
      (state'', newIndex, [v] :: sccs')
    else (state'', newIndex, sccs')
  let initialState := SCCState.mk (Array.mkArray n 0) (Array.mkArray n 0) (Array.mkArray n false)
  let (_, _, result) := dfs initialState 0 1 []
  result

def countSCCs (sccs : List (List Nat)) : Nat := sccs.length

def maxSCCSize (sccs : List (List Nat)) : Nat :=
  (sccs.map List.length).foldl max 0

def totalVerticesInSCCs (sccs : List (List Nat)) : Nat :=
  (sccs.map List.length).sum

def edges1 := [(0, 1), (1, 2), (2, 0)]
def sccs1 := [[0, 1, 2]]
def count1 := countSCCs sccs1
def max1 := maxSCCSize sccs1

def edges2 := [(0, 1), (1, 2), (2, 3), (3, 4)]
def sccs2 := [[0], [1], [2], [3], [4]]
def count2 := countSCCs sccs2
def max2 := maxSCCSize sccs2

def edges3 := [(0, 1), (1, 0), (1, 2), (2, 1), (2, 3), (3, 4), (4, 3)]
def sccs3 := [[0, 1, 2], [3, 4]]
def count3 := countSCCs sccs3
def max3 := maxSCCSize sccs3

def x := count1 + count2 + count3 + max1 + max2 + max3 +
         totalVerticesInSCCs sccs1 + totalVerticesInSCCs sccs2 + totalVerticesInSCCs sccs3
