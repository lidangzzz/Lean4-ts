-- Simulated view patterns using helper functions
def isEven (n : Nat) : Bool := n % 2 == 0

def classify (n : Nat) : Nat :=
  if isEven n then
    if n == 0 then 0 else 1
  else
    if n == 1 then 2 else 3

def result := classify 42
