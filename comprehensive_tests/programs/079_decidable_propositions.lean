-- Decidable propositions
def isEven (n : Nat) : Bool := n % 2 == 0
def isOdd (n : Nat) : Bool := !isEven n

def evenOrOdd (n : Nat) : Bool :=
  isEven n || isOdd n

def result := if evenOrOdd 7 then 1 else 0
