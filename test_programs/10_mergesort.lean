-- Test 10: Mergesort implementation
-- Using standard library functions for proper termination proofs

def merge : List Nat → List Nat → List Nat
  | [], l => l
  | l, [] => l
  | h1 :: t1, h2 :: t2 =>
    if h1 <= h2 then h1 :: merge t1 (h2 :: t2)
    else h2 :: merge (h1 :: t1) t2

def mergesort : List Nat → List Nat
  | [] => []
  | [x] => [x]
  | a :: b :: t =>
    let l := a :: b :: t
    let mid := l.length / 2
    let left := l.take mid
    let right := l.drop mid
    merge (mergesort left) (mergesort right)
termination_by l => l.length
decreasing_by
  all_goals
    simp only [List.length_take, List.length_drop, List.length]
    omega

def testList := [38, 27, 43, 3, 9, 82, 10, 1, 100, 50]
def sorted := mergesort testList
def sumSorted := match sorted with
  | [] => 0
  | _ =>
    let rec sum : List Nat → Nat
      | [] => 0
      | x :: xs => x + sum xs
    sum sorted
def x := sumSorted
