-- Pattern matching with dependent types (simplified)
inductive Vect (α : Type) : Nat -> Type where
  | nil : Vect α 0
  | cons : α -> Vect α n -> Vect α (n + 1)

def vectLength (v : Vect Nat n) : Nat := n

def myVect := Vect.cons 1 (Vect.cons 2 (Vect.cons 3 Vect.nil))
def result := vectLength myVect
