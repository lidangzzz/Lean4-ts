-- Test 28: Memoization patterns (simulated)
def fibMemo : Nat → Nat
  | 0 => 0
  | 1 => 1
  | n + 2 => fibMemo n + fibMemo (n + 1)

def fibsMemoized : Nat → List Nat
  | 0 => []
  | n + 1 =>
    let prev := fibsMemoized n
    let newFib := fibMemo n
    prev ++ [newFib]

def first20 := fibsMemoized 20
def sum20 := first20.foldl (fun a b => a + b) 0

def x := sum20

-- Output results
#eval fibMemo 10
#eval first20
#eval sum20
#eval x
