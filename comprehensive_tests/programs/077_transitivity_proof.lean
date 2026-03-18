-- Transitivity of less-than (computational)
def checkTrans (a b c : Nat) : Bool :=
  if a < b && b < c then a < c
  else true

def result := if checkTrans 1 2 3 then 1 else 0
