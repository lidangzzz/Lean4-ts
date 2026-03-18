-- Simple arithmetic tests that the current implementation should handle
def add (a : Nat) (b : Nat) : Nat :=
  if a <= 1 then 1 else a + b
def result := add a b
