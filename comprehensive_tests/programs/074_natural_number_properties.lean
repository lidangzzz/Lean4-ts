-- Properties of natural numbers
def addZero (n : Nat) : Nat := n + 0
def addSucc (n m : Nat) : Nat := n + (m + 1)

def zeroAdd (n : Nat) : Nat := 0 + n

def result := addZero 5 + zeroAdd 3
