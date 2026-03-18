-- Test 9: Quicksort implementation
def filter : (Nat → Bool) → List Nat → List Nat
  | _, [] => []
  | p, h :: t => if p h then h :: filter p t else filter p t

def quicksort : List Nat → List Nat
  | [] => []
  | h :: t => 
    let left := filter (fun x => x < h) t
    let right := filter (fun x => x >= h) t
    quicksort left ++ [h] ++ quicksort right

def unsorted := [64, 34, 25, 12, 22, 11, 90, 1, 100, 55]
def sorted := quicksort unsorted
def sumSorted := match sorted with
  | [] => 0
  | h :: t => 
    let rec sum : List Nat → Nat
      | [] => 0
      | x :: xs => x + sum xs
    sum sorted
def x := sumSorted
