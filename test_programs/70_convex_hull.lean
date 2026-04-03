-- Test 70: Convex Hull (Graham Scan)
def cross (ox oy ax ay bx byy : Int) : Int :=
  (ax - ox) * (byy - oy) - (ay - oy) * (bx - ox)

def polarAngle (x y : Int) : Int := y * 1000 + x

partial def processStack (remaining : List (Int × Int)) (stack : List (Int × Int)) : List (Int × Int) :=
  match remaining with
  | [] => stack
  | p :: rest =>
    match stack with
    | [] => processStack rest [p]
    | [_] => processStack rest (p :: stack)
    | top :: second :: stackRest =>
      let c := cross second.1 second.2 top.1 top.2 p.1 p.2
      if c > 0 then processStack rest (p :: stack)
      else processStack remaining (second :: stackRest)

def grahamScan (points : List (Int × Int)) : List (Int × Int) :=
  let p0 := points.foldl (fun acc p =>
    if p.2 < acc.2 || (p.2 = acc.2 && p.1 < acc.1) then p else acc
  ) (points.head? |>.getD (0, 0))
  let sorted := points.filter (· ≠ p0) |>.toArray |>.qsort (fun a b =>
    let angleA := polarAngle (a.1 - p0.1) (a.2 - p0.2)
    let angleB := polarAngle (b.1 - p0.1) (b.2 - p0.2)
    angleA < angleB
  ) |>.toList
  p0 :: processStack sorted []

def hullArea (hull : List (Int × Int)) : Int :=
  let n := hull.length
  let rec compute (pts : List (Int × Int)) (acc : Int) : Int :=
    match pts with
    | [] => acc
    | [p] => acc
    | (x1, y1) :: (x2, y2) :: rest =>
      compute ((x2, y2) :: rest) (acc + x1 * y2 - x2 * y1)
  Int.natAbs (compute hull 0) / 2

def hullPerimeter (hull : List (Int × Int)) : Int :=
  let rec compute (pts : List (Int × Int)) (acc : Int) : Int :=
    match pts with
    | [] => acc
    | [p] => acc
    | (x1, y1) :: (x2, y2) :: rest =>
      let dx := x2 - x1
      let dy := y2 - y1
      compute ((x2, y2) :: rest) (acc + Int.natAbs dx + Int.natAbs dy)
  compute hull 0

def pts1 : List (Int × Int) := [(0, 0), (1, 1), (2, 2), (0, 2), (2, 0), (1, 0)]
def hull1 := grahamScan pts1
def h1c := hull1.length

def pts2 : List (Int × Int) := [(0, 0), (1, 0), (2, 0), (0, 1), (1, 1), (2, 1), (0, 2), (1, 2), (2, 2)]
def hull2 := grahamScan pts2
def h2c := hull2.length

def pts3 : List (Int × Int) := [(0, 0), (10, 0), (10, 10), (0, 10), (5, 5)]
def hull3 := grahamScan pts3
def h3c := hull3.length

def x := h1c + h2c + h3c
#eval x
