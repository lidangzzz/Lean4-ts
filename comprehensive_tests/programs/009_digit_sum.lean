-- Sum of digits of a number
def digitSum (n : Nat) : Nat :=
  if n == 0 then 0
  else (n % 10) + digitSum (n / 10)

def result := digitSum 12345
