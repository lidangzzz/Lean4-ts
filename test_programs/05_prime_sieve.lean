-- Test 5: Prime number operations
partial def isPrimeAux (n : Nat) (d : Nat) : Bool :=
  if d == 0 then false
  else if d == 1 then true
  else if d * d > n then true
  else if n % d == 0 then false
  else isPrimeAux n (d + 1)

def isPrime (n : Nat) : Bool :=
  if n < 2 then false else isPrimeAux n 2

def countPrimesTo : Nat → Nat
  | 0 => 0
  | n + 1 => (if isPrime (n + 1) then 1 else 0) + countPrimesTo n

partial def nthPrimeAux (c : Nat) (k : Nat) : Nat :=
  if c == 0 then k
  else if isPrime k then nthPrimeAux (c - 1) (k + 1)
  else nthPrimeAux c (k + 1)

def nthPrime (n : Nat) : Nat := nthPrimeAux (n + 1) 2

def p10 := nthPrime 10
def p25 := nthPrime 25
def count100 := countPrimesTo 100
def x := p10 + p25 + count100

-- Output results
#eval isPrime 7
#eval isPrime 10
#eval isPrime 17
#eval countPrimesTo 10
#eval countPrimesTo 100
#eval nthPrime 0
#eval nthPrime 1
#eval nthPrime 5
#eval nthPrime 10
#eval nthPrime 25
#eval p10
#eval p25
#eval count100
#eval x
