-- Test 71: Line Segment Intersection (simplified)
def ccw (ax ay bx byy cx cy : Int) : Int :=
  (bx - ax) * (cy - ay) - (byy - ay) * (cx - ax)

def seg1 := ccw 0 0 10 10 0 10 10 0
def seg2 := ccw 0 0 10 10 0 5 5 10
def seg3 := ccw 0 0 10 10 20 20 30 30

def x := seg1 + seg2 + seg3
