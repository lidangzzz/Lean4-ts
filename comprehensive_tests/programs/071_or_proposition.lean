-- Disjunction
inductive Or (p : Prop) (q : Prop) : Prop where
  | inl : p -> Or p q
  | inr : q -> Or p q

def orElim (h : Or true false) : Bool :=
  match h with
  | Or.inl _ => true
  | Or.inr _ => false

def result := if orElim Or.inl then 1 else 0
