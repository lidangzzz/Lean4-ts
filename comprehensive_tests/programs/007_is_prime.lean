-- Simple primality test
def divides (d : Nat) (n : Nat) : Bool :=
  if d == 0 then false
  else n % d == 0

def isPrimeAux (n : Nat) (d : Nat) : Bool :=
  if d * d > n then true
  else if divides d n then false
  else isPrimeAux n (d + 1)

def isPrime (n : Nat) : Bool :=
  if n < 2 then false
  else isPrimeAux n 2

def result := if isPrime 97 then 1 else 0
