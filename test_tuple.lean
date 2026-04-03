-- Test 45: Union-Find (Disjoint Set Union)
def ufInit (n : Nat) : Array Nat := Array.replicate n 0 |>.mapIdx fun i _ => i

def pair : Nat × Nat := (1, 2)
def getFirst (p : Nat × Nat) : Nat :=
  let (a, b) := p
  a

#eval getFirst pair
