-- Conjunction
inductive And (p : Prop) (q : Prop) : Prop where
  | intro : p -> q -> And p q

def andElimLeft (h : And true true) : Bool := true
def result := if andElimLeft And.intro then 1 else 0
