-- Test 19: Scan variations
def scanl : (Nat → Nat → Nat) → Nat → List Nat → List Nat
  | _, acc, [] => [acc]
  | f, acc, h :: t => acc :: scanl f (f acc h) t

def scanr : (Nat → Nat → Nat) → Nat → List Nat → List Nat
  | _, acc, [] => [acc]
  | f, acc, h :: t => 
    let rest := scanr f acc t
    match rest with
    | [] => [h]
    | h' :: _ => f h h' :: rest

def nums := [1, 2, 3, 4, 5]
def prefixSums := scanl (fun a b => a + b) 0 nums
def suffixSums := scanr (fun a b => a + b) 0 nums
def sumPrefix := List.foldl (fun a b => a + b) 0 prefixSums
def x := sumPrefix

#eval prefixSums
#eval suffixSums
#eval sumPrefix
#eval x
