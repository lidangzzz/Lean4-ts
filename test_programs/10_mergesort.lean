-- Test 10: Mergesort implementation
def take : Nat → List Nat → List Nat
  | 0, _ => []
  | _, [] => []
  | n + 1, h :: t => h :: take n t

def drop : Nat → List Nat → List Nat
  | 0, l => l
  | _, [] => []
  | n + 1, _ :: t => drop n t

def length : List Nat → Nat
  | [] => 0
  | _ :: t => 1 + length t

def merge : List Nat → List Nat → List Nat
  | [], l => l
  | l, [] => l
  | h1 :: t1, h2 :: t2 =>
    if h1 <= h2 then h1 :: merge t1 (h2 :: t2)
    else h2 :: merge (h1 :: t1) t2

def mergesort : List Nat → List Nat
  | [] => []
  | [x] => [x]
  | l =>
    let mid := length l / 2
    let left := take mid l
    let right := drop mid l
    merge (mergesort left) (mergesort right)

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
