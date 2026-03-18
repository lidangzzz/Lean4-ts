-- Test 11: Simple sort implementation using insertion sort
-- (Heapsort requires array mutation which is complex in Lean4)

def insertSorted : Nat → List Nat → List Nat
  | x, [] => [x]
  | x, h :: t => if x <= h then x :: h :: t else h :: insertSorted x t

def insertionSort : List Nat → List Nat
  | [] => []
  | h :: t => insertSorted h (insertionSort t)

def unsorted := [64, 34, 25, 12, 22, 11, 90, 1, 100, 55]
def sorted := insertionSort unsorted

-- Output results
#eval unsorted
#eval sorted
#eval insertionSort [3, 1, 4, 1, 5, 9, 2, 6]
#eval insertionSort [5, 4, 3, 2, 1]
