-- Commutativity of addition (computational)
def addComm (a b : Nat) : Nat := a + b
def addComm' (a b : Nat) : Nat := b + a

def checkComm (a b : Nat) : Bool :=
  addComm a b == addComm' a b

def result := if checkComm 5 3 then 1 else 0
