-- Mutual recursion
def isEven : Nat -> Bool
  | 0 => true
  | n + 1 => isOdd n

def isOdd : Nat -> Bool
  | 0 => false
  | n + 1 => isEven n

def result := if isEven 100 && isOdd 99 then 1 else 0
