-- Test 5: Prime number operations
def isPrimeAux : Nat → Nat → Bool
  | _, 0 => false
  | _, 1 => true
  | n, d => if d * d > n then true else if n % d == 0 then false else isPrimeAux n (d + 1)

def isPrime : Nat → Bool
  | n => if n < 2 then false else isPrimeAux n 2

def countPrimesTo : Nat → Nat
  | 0 => 0
  | n => (if isPrime n then 1 else 0) + countPrimesTo (n - 1)

def nthPrime : Nat → Nat
  | 0 => 2
  | n => 
    let rec find : Nat → Nat → Nat
      | _, 0 => 2
      | c, k => if isPrime k then find (c - 1) (k + 1) else find c (k + 1)
    find (n + 1) 2

def p10 := nthPrime 10
def p25 := nthPrime 25
def count100 := countPrimesTo 100
def x := p10 + p25 + count100
