-- Replicate element n times
def replicate (n : Nat) (x : Nat) : List Nat :=
  match n with
  | 0 => []
  | n + 1 => x :: replicate n x

def result := replicate 5 42
