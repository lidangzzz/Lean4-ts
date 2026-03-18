-- LCM using GCD
def gcd (a : Nat) (b : Nat) : Nat :=
  if b == 0 then a else gcd b (a % b)

def lcm (a : Nat) (b : Nat) : Nat :=
  if a == 0 || b == 0 then 0
  else (a / gcd a b) * b

def result := lcm 21 6
