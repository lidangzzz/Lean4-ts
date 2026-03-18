-- Euclidean GCD algorithm
def gcd (a : Nat) (b : Nat) : Nat :=
  if b == 0 then a
  else gcd b (a % b)

def result := gcd 252 105
