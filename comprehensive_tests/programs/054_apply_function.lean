-- Apply function
def apply (f : Nat -> Nat) (x : Nat) : Nat := f x

def double (x : Nat) : Nat := x * 2
def result := apply double 21
