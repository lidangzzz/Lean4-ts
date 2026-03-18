-- Nested if expressions
def classify (n : Nat) : Nat :=
  if n < 3 then 0
  else if n < 7 then 1
  else if n < 10 then 2
  else 3

def result := classify 5
