-- Collatz conjecture sequence length
def collatzLen (n : Nat) : Nat :=
  if n <= 1 then 1
  else if n % 2 == 0 then 1 + collatzLen (n / 2)
  else 1 + collatzLen (3 * n + 1)

def result := collatzLen 27
