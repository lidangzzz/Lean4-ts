-- nth Catalan number
def fact (n : Nat) : Nat :=
  if n <= 1 then 1 else n * fact (n - 1)

def choose (n : Nat) (k : Nat) : Nat :=
  if k > n then 0
  else fact n / (fact k * fact (n - k))

def catalan (n : Nat) : Nat :=
  choose (2 * n) n / (n + 1)

def result := catalan 7
