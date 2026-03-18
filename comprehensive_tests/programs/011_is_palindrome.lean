-- Check if a number is a palindrome
def reverseAux (n : Nat) (acc : Nat) : Nat :=
  if n == 0 then acc
  else reverseAux (n / 10) (acc * 10 + n % 10)

def isPalindrome (n : Nat) : Bool :=
  n == reverseAux n 0

def result := if isPalindrome 12321 then 1 else 0
