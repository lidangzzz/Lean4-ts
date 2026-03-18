-- Existential
inductive Exists (p : Nat -> Prop) : Prop where
  | intro : (x : Nat) -> p x -> Exists p

def existsNat := Exists.intro 42
def result := 42
