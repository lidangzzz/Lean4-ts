-- Fast exponentiation by squaring
def power (base : Nat) (exp : Nat) : Nat :=
  if exp == 0 then 1
  else if exp % 2 == 0 then
    let half := power base (exp / 2)
    half * half
  else
    base * power base (exp - 1)

def result := power 2 15
