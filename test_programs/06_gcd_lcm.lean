-- Test 6: GCD and LCM with extended operations
def gcd : Nat → Nat → Nat
  | a, 0 => a
  | a, b => gcd b (a % b)

def lcm : Nat → Nat → Nat
  | a, b => if a == 0 || b == 0 then 0 else (a / gcd a b) * b

def extendedGcd : Nat → Nat → Nat × Nat × Nat
  | a, 0 => (a, 1, 0)
  | a, b => 
    let (g, x, y) := extendedGcd b (a % b)
    (g, y, x - (a / b) * y)

def coprime (a b : Nat) : Bool := gcd a b == 1

def totientAux : Nat → Nat → Nat
  | _, 0 => 0
  | n, d => (if coprime n d then 1 else 0) + totientAux n (d - 1)

def totient (n : Nat) : Nat := totientAux n n

def g1 := gcd 48 18
def g2 := gcd 1071 462
def l1 := lcm 12 8
def l2 := lcm 21 6
def t10 := totient 10
def t36 := totient 36
def x := g1 + g2 + l1 + l2 + t10 + t36
