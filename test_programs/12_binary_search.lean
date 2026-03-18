-- Test 12: Binary search
def binarySearchAux : List Nat → Nat → Nat → Nat → Option Nat
  | _, _, _, 0 => none
  | arr, target, low, high =>
    let mid := low + (high - low) / 2
    match arr.get? mid with
    | none => none
    | some v =>
      if v == target then some mid
      else if v < target then binarySearchAux arr target (mid + 1) high
      else binarySearchAux arr target low mid

def binarySearch : List Nat → Nat → Option Nat
  | arr, target => binarySearchAux arr target 0 (length arr)

def sortedList := [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25]
def idx7 := match binarySearch sortedList 7 with | some i => i | none => 100
def idx15 := match binarySearch sortedList 15 with | some i => i | none => 100
def idx8 := match binarySearch sortedList 8 with | some i => i | none => 100
def idx1 := match binarySearch sortedList 1 with | some i => i | none => 100
def idx25 := match binarySearch sortedList 25 with | some i => i | none => 100
def x := idx7 + idx15 + idx8 + idx1 + idx25
