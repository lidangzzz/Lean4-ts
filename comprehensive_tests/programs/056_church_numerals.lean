-- Church numerals
def churchZero (f : Nat -> Nat) (x : Nat) : Nat := x

def churchSucc (n : (Nat -> Nat) -> Nat -> Nat) (f : Nat -> Nat) (x : Nat) : Nat :=
  f (n f x)

def churchAdd (m n : (Nat -> Nat) -> Nat -> Nat) (f : Nat -> Nat) (x : Nat) : Nat :=
  m f (n f x)

def churchMul (m n : (Nat -> Nat) -> Nat -> Nat) (f : Nat -> Nat) (x : Nat) : Nat :=
  m (n f) x

def toNat (n : (Nat -> Nat) -> Nat -> Nat) : Nat :=
  n (fun x => x + 1) 0

def one := churchSucc churchZero
def two := churchSucc one
def three := churchSucc two

def six := churchMul two three
def result := toNat six
