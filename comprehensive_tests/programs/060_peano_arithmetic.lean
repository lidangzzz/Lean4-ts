-- Peano natural numbers
inductive Peano where
  | zero : Peano
  | succ : Peano -> Peano

def peanoToInt : Peano -> Nat
  | Peano.zero => 0
  | Peano.succ n => 1 + peanoToInt n

def peanoAdd : Peano -> Peano -> Peano
  | Peano.zero, n => n
  | Peano.succ m, n => Peano.succ (peanoAdd m n)

def two := Peano.succ (Peano.succ Peano.zero)
def three := Peano.succ (Peano.succ (Peano.succ Peano.zero))

def result := peanoToInt (peanoAdd two three)
