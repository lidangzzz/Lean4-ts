-- Test 46: RSA Encryption/Decryption simulation
def modPow (base exp mod : Nat) : Nat :=
  let rec loop (b e acc : Nat) : Nat :=
    if e = 0 then acc
    else if e % 2 = 0 then loop (b * b % mod) (e / 2) acc
    else loop (b * b % mod) (e / 2) (acc * b % mod)
  loop base exp 1

def gcd (a b : Nat) : Nat :=
  if b = 0 then a else gcd b (a % b)

def modInverse (a m : Nat) : Nat :=
  let rec extendedGcd (x y : Nat) : Nat × Nat × Nat :=
    if y = 0 then (x, 1, 0)
    else
      let (g, s, t) := extendedGcd y (x % y)
      (g, t, s - (x / y) * t)
  let (g, inv, _) := extendedGcd a m
  if g = 1 then (inv % m + m) % m else 0

def isPrime (n : Nat) : Bool :=
  if n < 2 then false
  else if n = 2 then true
  else if n % 2 = 0 then false
  else
    let rec check (d : Nat) : Bool :=
      if d * d > n then true
      else if n % d = 0 then false
      else check (d + 2)
    check 3

def nextPrime (n : Nat) : Nat :=
  if isPrime n then n else nextPrime (n + 1)

def p := nextPrime 61
def q := nextPrime 53
def n := p * q
def phi := (p - 1) * (q - 1)

def findE (phi : Nat) (start : Nat) : Nat :=
  if gcd start phi = 1 then start
  else findE phi (start + 1)

def e := findE phi 3
def d := modInverse e phi

def rsaEncrypt (m : Nat) : Nat := modPow m e n
def rsaDecrypt (c : Nat) : Nat := modPow c d n

def message := 42
def encrypted := rsaEncrypt message
def decrypted := rsaDecrypt encrypted

def message2 := 123
def encrypted2 := rsaEncrypt message2
def decrypted2 := rsaDecrypt encrypted2

def message3 := 999
def encrypted3 := rsaEncrypt message3
def decrypted3 := rsaDecrypt encrypted3

def success := (message = decrypted) && (message2 = decrypted2) && (message3 = decrypted3)

def x := (if success then 100 else 0) + p + q + n + e + message + decrypted
