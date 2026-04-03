-- Test 26: Basic recursion schemes
def cata : (Nat → Nat → Nat) → Nat → Nat
  | f, 0 => f 0 0
  | f, n + 1 => f n (cata f n)

def ana : (Nat → Nat) → Nat → Nat → Nat
  | _, 0, x => x
  | f, n + 1, x => ana f n (f x)

def hylo : (Nat → Nat) → (Nat → Nat) → Nat → Nat → Nat
  | _, _, 0, x => x
  | f, g, n + 1, x => f (hylo f g n (g x))

def factStep := fun n => fun acc => if n == 0 then acc else n * acc
def factorial := cata factStep 5

def incStep := fun x => x + 1
def countUp := ana incStep 10 0

def x := factorial + countUp

#eval factorial
#eval countUp
#eval x
