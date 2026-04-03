-- Test 75: Quad Tree
inductive QuadTree where
  | leaf : List (Int × Int) → QuadTree
  | node : (Int × Int) → QuadTree → QuadTree → QuadTree → QuadTree → QuadTree

def quadCapacity := 4

def inBounds (pt : Int × Int) (center : Int × Int) (size : Int) (quadrant : Nat) : Bool :=
  let (cx, cy) := center
  let hs := size / 2
  match quadrant with
  | 0 => pt.1 >= cx && pt.1 < cx + hs && pt.2 >= cy && pt.2 < cy + hs
  | 1 => pt.1 >= cx - hs && pt.1 < cx && pt.2 >= cy && pt.2 < cy + hs
  | 2 => pt.1 >= cx - hs && pt.1 < cx && pt.2 >= cy - hs && pt.2 < cy
  | _ => pt.1 >= cx && pt.1 < cx + hs && pt.2 >= cy - hs && pt.2 < cy

partial def quadInsert (tree : QuadTree) (pt : Int × Int) (center : Int × Int) (size : Int) : QuadTree :=
  match tree with
  | QuadTree.leaf pts =>
    if pts.length < quadCapacity then
      QuadTree.leaf (pt :: pts)
    else
      let newPts := pt :: pts
      let hs := size / 2
      let nw := QuadTree.leaf []
      let ne := QuadTree.leaf []
      let sw := QuadTree.leaf []
      let se := QuadTree.leaf []
      let node := QuadTree.node center nw ne sw se
      newPts.foldl (fun t p =>
        quadInsert t p center size
      ) node
  | QuadTree.node c nw ne sw se =>
    let hs := size / 2
    let quadrant :=
      if pt.1 >= c.1 then
        if pt.2 >= c.2 then 0 else 3
      else
        if pt.2 >= c.2 then 1 else 2
    match quadrant with
    | 0 => QuadTree.node c (quadInsert nw pt (c.1 + hs, c.2 + hs) hs) ne sw se
    | 1 => QuadTree.node c nw (quadInsert ne pt (c.1 - hs, c.2 + hs) hs) sw se
    | 2 => QuadTree.node c nw ne (quadInsert sw pt (c.1 - hs, c.2 - hs) hs) se
    | _ => QuadTree.node c nw ne sw (quadInsert se pt (c.1 + hs, c.2 - hs) hs)

def quadRangeQuery (tree : QuadTree) (minPt maxPt : Int × Int) (center : Int × Int) (size : Int) : List (Int × Int) :=
  match tree with
  | QuadTree.leaf pts =>
    pts.filter (fun pt => pt.1 >= minPt.1 && pt.1 <= maxPt.1 && pt.2 >= minPt.2 && pt.2 <= maxPt.2)
  | QuadTree.node c nw ne sw se =>
    let hs := size / 2
    let resultsNW := quadRangeQuery nw minPt maxPt (c.1, c.2 + hs) hs
    let resultsNE := quadRangeQuery ne minPt maxPt (c.1 + hs, c.2 + hs) hs
    let resultsSW := quadRangeQuery sw minPt maxPt (c.1, c.2) hs
    let resultsSE := quadRangeQuery se minPt maxPt (c.1 + hs, c.2) hs
    resultsNW ++ resultsNE ++ resultsSW ++ resultsSE

def quadCount (tree : QuadTree) : Nat :=
  match tree with
  | QuadTree.leaf pts => pts.length
  | QuadTree.node _ nw ne sw se => quadCount nw + quadCount ne + quadCount sw + quadCount se

def quadDepth (tree : QuadTree) : Nat :=
  match tree with
  | QuadTree.leaf _ => 1
  | QuadTree.node _ nw ne sw se =>
    1 + max (max (quadDepth nw) (quadDepth ne)) (max (quadDepth sw) (quadDepth se))

def points : List (Int × Int) := [(2, 3), (5, 4), (9, 6), (4, 7), (8, 1), (7, 2), (6, 3), (1, 5)]
def qt := points.foldl (fun t p => quadInsert t p (5, 5) 10) (QuadTree.leaf [])

def count := quadCount qt
def depth := quadDepth qt
def rangeResult := quadRangeQuery qt (3, 2) (7, 5) (5, 5) 10

def x := count + depth + rangeResult.length
#eval x
