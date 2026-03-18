-- Find the nth prime number
def divides (d : Nat) (n : Nat) : Bool :=
  if d == 0 then false else n % d == 0

def isPrimeAux (n : Nat) (d : Nat) : Bool :=
  if d * d > n then true
  else if divides d n then false
  else isPrimeAux n (d + 1)

def isPrime (n : Nat) : Bool :=
  if n < 2 then false else isPrimeAux n 2

def nextPrime (n : Nat) : Nat :=
  if isPrime (n + 1) then n + 1
  else nextPrime (n + 1)

def nthPrimeAux (count : Nat) (current : Nat) : Nat :=
  if count == 0 then current
  else nthPrimeAux (count - 1) (nextPrime current)

def nthPrime (n : Nat) : Nat := nthPrimeAux n 1

def result := nthPrime 10
