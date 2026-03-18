-- Higher-order functions
def apply (f : Nat -> Nat -> (x : Nat) : Nat := f x

def compose (f : Nat -> Nat -> Nat) (g : Nat -> Nat -> Nat) (x : Nat) : Nat :=
  f ( g x
def inc := fun x => x + 1
def double := fun x => 2 * 2
def quadruple := fun x => double (double x)
def result := quadruple 5
