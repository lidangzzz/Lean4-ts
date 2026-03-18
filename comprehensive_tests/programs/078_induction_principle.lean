-- Simulated induction
def sumTo : Nat -> Nat
  | 0 => 0
  | n + 1 => (n + 1) + sumTo n

-- sumTo n = n * (n + 1) / 2
def checkFormula (n : Nat) : Bool :=
  sumTo n == n * (n + 1) / 2

def result := if checkFormula 10 then 1 else 0
