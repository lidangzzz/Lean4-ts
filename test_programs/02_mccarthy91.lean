-- Test 2: McCarthy 91 function
partial def mccarthy91 : Nat → Nat
  | n => if n > 100 then n - 10 else mccarthy91 (mccarthy91 (n + 11))

def m91_87 := mccarthy91 87
def m91_100 := mccarthy91 100
def m91_101 := mccarthy91 101
def m91_50 := mccarthy91 50
def x := m91_87 + m91_100 + m91_101 + m91_50

#eval m91_87
#eval m91_100
#eval m91_101
#eval m91_50
#eval x
