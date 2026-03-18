-- Equality
inductive Eq (a : Nat) : Nat -> Prop where
  | refl : Eq a a

def eqRefl : Eq 5 5 := Eq.refl
def result := 5
