-- Test 46: RSA Encryption/Decryption simulation
partial def modPow (base exp mod : Nat) : Nat :=
  if exp = 0 then 1
  else if exp % 2 = 0 then modPow (base * base % mod) (exp / 2) mod
  else base * modPow (base * base % mod) (exp / 2) mod % mod

partial def gcd (a b : Nat) : Nat :=
  if b = 0 then a else gcd b (a % b)

-- Simple modular inverse using brute force (works for small numbers)
partial def modInverse (a m : Nat) : Nat :=
  let rec find (x : Nat) : Nat :=
    if x >= m then 0  -- No inverse found
    else if (a * x) % m = 1 then x
    else find (x + 1)
  find 1

partial def isPrimeCheck (n d : Nat) : Bool :=
  if d * d > n then true
  else if n % d = 0 then false
  else isPrimeCheck n (d + 2)

def isPrime (n : Nat) : Bool :=
  if n < 2 then false
  else if n = 2 then true
  else if n % 2 = 0 then false
  else isPrimeCheck n 3

partial def nextPrime (n : Nat) : Nat :=
  if isPrime n then n else nextPrime (n + 1)

def p := nextPrime 61
def q := nextPrime 53
def n := p * q
def phi := (p - 1) * (q - 1)

partial def findE (phi : Nat) (start : Nat) : Nat :=
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

-- Output results
#eval s!"p: {p}"
#eval s!"q: {q}"
#eval s!"n: {n}"
#eval s!"phi: {phi}"
#eval s!"e: {e}"
#eval s!"d: {d}"
#eval s!"Message: {message}"
#eval s!"Encrypted: {encrypted}"
#eval s!"Decrypted: {decrypted}"
#eval s!"Message2: {message2}"
#eval s!"Encrypted2: {encrypted2}"
#eval s!"Decrypted2: {decrypted2}"
#eval s!"Message3: {message3}"
#eval s!"Encrypted3: {encrypted3}"
#eval s!"Decrypted3: {decrypted3}"
#eval s!"Success: {success}"
#eval s!"Total x: {x}"
