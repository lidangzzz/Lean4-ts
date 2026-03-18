-- Associativity of addition (computational)
def addAssoc (a b c : Nat) : Nat := (a + b) + c
def addAssoc' (a b c : Nat) : Nat := a + (b + c)

def checkAssoc (a b c : Nat) : Bool :=
  addAssoc a b c == addAssoc' a b c

def result := if checkAssoc 1 2 3 then 1 else 0
