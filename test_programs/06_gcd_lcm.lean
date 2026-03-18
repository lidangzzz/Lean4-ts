-- Test 6: GCD and LCM with extended operations
partial def gcd : Nat → Nat → Nat
  | a, 0 => a
  | a, b => gcd b (a % b)

def lcm : Nat → Nat → Nat
  | a, b => if a == 0 || b == 0 then 0 else (a / gcd a b) * b

partial def extendedGcd : Nat → Nat → Nat × Nat × Nat
  | a, 0 => (a, 1, 0)
  | a, b =>
    let (g, x, y) := extendedGcd b (a % b)
    (g, y, x - (a / b) * y)

def coprime (a b : Nat) : Bool := gcd a b == 1

def totientAux : Nat → Nat → Nat
  | _, 0 => 0
  | n, d + 1 => (if coprime n (d + 1) then 1 else 0) + totientAux n d

def totient (n : Nat) : Nat := totientAux n n

def g1 := gcd 48 18
def g2 := gcd 1071 462
def l1 := lcm 12 8
def l2 := lcm 21 6
def t10 := totient 10
def t36 := totient 36
def x := g1 + g2 + l1 + l2 + t10 + t36

-- Output results
#eval gcd 48 18
#eval gcd 1071 462
#eval lcm 12 8
#eval lcm 21 6
#eval extendedGcd 35 15
#eval coprime 14 15
#eval coprime 12 18
#eval totient 10
#eval totient 36
#eval g1
#eval g2
#eval l1
#eval l2
#eval t10
#eval t36
#eval x
