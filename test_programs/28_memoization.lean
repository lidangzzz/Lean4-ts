-- Test 28: Memoization patterns (simulated)
def fibMemo : Nat → Nat
  | 0 => 0
  | 1 => 1
  | n => 
    let rec loop : Nat → Nat → Nat → Nat → Nat
      | _, _, _, 0 => 0
      | a, b, 1, _ => b
      | a, b, n, k => loop b (a + b) (n - 1) (k - 1)
    loop 0 1 n n

def fibsMemoized : Nat → List Nat
  | 0 => []
  | n + 1 => 
    let prev := fibsMemoized n
    let newFib := fibMemo n
    prev ++ [newFib]

def first20 := fibsMemoized 20
def sum20 := foldl (fun a b => a + b) 0 first20

def x := sum20
