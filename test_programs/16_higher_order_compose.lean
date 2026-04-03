-- Test 16: Higher-order function composition
def compose : (Nat → Nat) → (Nat → Nat) → Nat → Nat
  | f, g, x => f (g x)

def compose3 : (Nat → Nat) → (Nat → Nat) → (Nat → Nat) → Nat → Nat
  | f, g, h, x => f (g (h x))

def pipe : Nat → List (Nat → Nat) → Nat
  | x, [] => x
  | x, f :: fs => pipe (f x) fs

def inc (x : Nat) : Nat := x + 1
def double (x : Nat) : Nat := x * 2
def square (x : Nat) : Nat := x * x
def dec (x : Nat) : Nat := x - 1

def composed1 := compose inc double 5
def composed2 := compose3 inc double square 3
def piped := pipe 5 [inc, double, square, inc]
def x := composed1 + composed2 + piped

#eval composed1
#eval composed2
#eval piped
#eval x
