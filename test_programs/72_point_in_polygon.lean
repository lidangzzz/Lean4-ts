-- Test 72: Point in Polygon (Ray Casting)
def pointInPolygon (px py : Int) (polygon : List (Int × Int)) : Bool :=
  let n := polygon.length
  let rec check (i : Nat) (inside : Bool) : Bool :=
    if i >= n then inside
    else
      let (xi, yi) := polygon.get! i
      let (xj, yj) := polygon.get! ((i + 1) % n)
      let crosses :=
        ((yi > py) ≠ (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi) + xi)
      check (i + 1) (if crosses then !inside else inside)
  check 0 false

def polygonArea (polygon : List (Int × Int)) : Int :=
  let n := polygon.length
  let rec compute (i : Nat) (area : Int) : Int :=
    if i >= n then (area.abs + 1) / 2
    else
      let (xi, yi) := polygon.get! i
      let (xj, yj) := polygon.get! ((i + 1) % n)
      compute (i + 1) (area + xi * yj - xj * yi)
  compute 0 0

def polygonCentroid (polygon : List (Int × Int)) : (Int × Int) :=
  let n := polygon.length
  let rec compute (i : Nat) (cx cy : Int) : (Int × Int) :=
    if i >= n then (cx / n, cy / n)
    else
      let (xi, yi) := polygon.get! i
      let (xj, yj) := polygon.get! ((i + 1) % n)
      let cross := xi * yj - xj * yi
      compute (i + 1) (cx + (xi + xj) * cross) (cy + (yi + yj) * cross)
  compute 0 0 0

def poly1 := [(0, 0), (10, 0), (10, 10), (0, 10)]
def in1_1 := pointInPolygon 5 5 poly1
def in1_2 := pointInPolygon 15 5 poly1
def in1_3 := pointInPolygon 0 0 poly1

def poly2 := [(0, 0), (5, 10), (10, 0), (5, 5)]
def in2_1 := pointInPolygon 5 5 poly2
def in2_2 := pointInPolygon 3 3 poly2
def area2 := polygonArea poly2

def poly3 := [(0, 0), (2, 1), (4, 0), (4, 2), (3, 4), (1, 4), (0, 2)]
def in3_1 := pointInPolygon 2 2 poly3
def in3_2 := pointInPolygon 5 5 poly3
def area3 := polygonArea poly3

def x := (if in1_1 then 1 else 0) + (if in1_2 then 1 else 0) + (if in1_3 then 1 else 0) +
         (if in2_1 then 1 else 0) + (if in2_2 then 1 else 0) +
         (if in3_1 then 1 else 0) + (if in3_2 then 1 else 0) +
         area2.toNat + area3.toNat
