-- Divide and conquer (maximum subarray sum - simplified)
def max (a b : Nat) : Nat := if a >= b then a else b

def maxSumAux (xs : List Nat) (currentMax : Nat) (globalMax : Nat) : Nat :=
  match xs with
  | [] => globalMax
  | h :: t =>
    let newCurrent := max h (currentMax + h)
    let newGlobal := max globalMax newCurrent
    maxSumAux t newCurrent newGlobal

def maxSubarraySum (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | h :: t => maxSumAux t h h

def result := maxSubarraySum [1, 2, 3, 4, 5]
