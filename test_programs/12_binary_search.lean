-- Test 12: Binary search (simplified)
partial def binarySearchAux (arr : List Nat) (target : Nat) (low : Nat) (high : Nat) : Option Nat :=
  if low >= high then none
  else
    let mid := (low + high) / 2
    let v := arr.getD mid 0
    if v == target then some mid
    else if v < target then binarySearchAux arr target (mid + 1) high
    else binarySearchAux arr target low mid

def binarySearch (arr : List Nat) (target : Nat) : Option Nat :=
  binarySearchAux arr target 0 arr.length

def sortedList := [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25]
def idx7 := match binarySearch sortedList 7 with | some i => i | none => 100
def idx15 := match binarySearch sortedList 15 with | some i => i | none => 100
def idx8 := match binarySearch sortedList 8 with | some i => i | none => 100
def idx1 := match binarySearch sortedList 1 with | some i => i | none => 100
def idx25 := match binarySearch sortedList 25 with | some i => i | none => 100
def x := idx7 + idx15 + idx8 + idx1 + idx25

-- Output results
#eval binarySearch sortedList 7
#eval binarySearch sortedList 15
#eval binarySearch sortedList 8
#eval binarySearch sortedList 1
#eval binarySearch sortedList 25
#eval idx7
#eval idx15
#eval idx8
#eval idx1
#eval idx25
#eval x
