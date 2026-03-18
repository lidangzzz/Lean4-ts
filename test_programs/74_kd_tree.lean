-- Test 74: K-D Tree (2D)
inductive KDTree where | leaf | node : (Int × Int) → Bool → KDTree → KDTree → KDTree

def kdInsert (tree : KDTree) (pt : Int × Int) (depth : Nat) : KDTree :=
  match tree with
  | KDTree.leaf => KDTree.node pt (depth % 2 = 0) KDTree.leaf KDTree.leaf
  | KDTree.node currPt axis left right =>
    let newAxis := depth % 2 = 0
    let cmp :=
      if newAxis then pt.1 < currPt.1 else pt.2 < currPt.2
    if cmp then
      KDTree.node currPt axis (kdInsert left pt (depth + 1)) right
    else
      KDTree.node currPt axis left (kdInsert right pt (depth + 1))

def kdSearchNearest (tree : KDTree) (target : Int × Int) : Option (Int × Int) :=
  let dist (p1 p2 : Int × Int) : Int :=
    (p1.1 - p2.1) * (p1.1 - p2.1) + (p1.2 - p2.2) * (p1.2 - p2.2)
  let rec search (t : KDTree) (best : Option (Int × Int)) : Option (Int × Int) :=
    match t with
    | KDTree.leaf => best
    | KDTree.node pt _ left right =>
      let newBest :=
        match best with
        | none => some pt
        | some b =>
          if dist pt target < dist b target then some pt else some b
      let bestFromLeft := search left newBest
      let bestFromRight := search right bestFromLeft
      bestFromRight
  search tree none

def kdRangeSearch (tree : KDTree) (minPt maxPt : Int × Int) : List (Int × Int) :=
  let rec search (t : KDTree) : List (Int × Int) :=
    match t with
    | KDTree.leaf => []
    | KDTree.node pt _ left right =>
      let inRange :=
        pt.1 >= minPt.1 && pt.1 <= maxPt.1 &&
        pt.2 >= minPt.2 && pt.2 <= maxPt.2
      let leftResults := search left
      let rightResults := search right
      (if inRange then [pt] else []) ++ leftResults ++ rightResults
  search tree

def kdCount (tree : KDTree) : Nat :=
  match tree with
  | KDTree.leaf => 0
  | KDTree.node _ _ left right => 1 + kdCount left + kdCount right

def points := [(2, 3), (5, 4), (9, 6), (4, 7), (8, 1), (7, 2)]
def kdTree := points.foldl (fun t p => kdInsert t p 0) KDTree.leaf

def nearest := kdSearchNearest kdTree (6, 3)
def rangeResult := kdRangeSearch kdTree (4, 2) (8, 6)
def count := kdCount kdTree

def nearestDist := match nearest with
  | some (x, y) => (x - 6) * (x - 6) + (y - 3) * (y - 3)
  | none => 0

def x := count + rangeResult.length + nearestDist.toNat
