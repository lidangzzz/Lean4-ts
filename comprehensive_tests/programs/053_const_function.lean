-- Constant function
def const (x : Nat) (_ : Nat) : Nat := x

def always42 := const 42
def result := always42 100
