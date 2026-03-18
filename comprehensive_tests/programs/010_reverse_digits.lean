-- Reverse the digits of a number
def reverseAux (n : Nat) (acc : Nat) : Nat :=
  if n == 0 then acc
  else reverseAux (n / 10) (acc * 10 + n % 10)

def reverse (n : Nat) : Nat := reverseAux n 0

def result := reverse 12345
