-- Pipeline-style function application
def pipe (x : Nat) (f : Nat -> Nat) : Nat := f x

def double (x : Nat) : Nat := x * 2
def inc (x : Nat) : Nat := x + 1
def square (x : Nat) : Nat := x * x

def result := 5 |> square |> double |> inc
where
  (|>) (x : Nat) (f : Nat -> Nat) : Nat := f x
