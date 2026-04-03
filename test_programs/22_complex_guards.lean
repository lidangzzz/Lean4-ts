-- Test 22: Complex pattern guards
def classify : Nat → Nat → Nat → String
  | a, b, c => 
    if a == b && b == c then "all equal"
    else if a == b then "a equals b"
    else if b == c then "b equals c"
    else if a == c then "a equals c"
    else if a < b && b < c then "strictly increasing"
    else if a > b && b > c then "strictly decreasing"
    else if a + b == c then "a plus b equals c"
    else if a * b == c then "a times b equals c"
    else "no special relation"

def c1 := if classify 1 1 1 == "all equal" then 1 else 0
def c2 := if classify 1 2 3 == "strictly increasing" then 1 else 0
def c3 := if classify 3 2 1 == "strictly decreasing" then 1 else 0
def c4 := if classify 2 2 5 == "a equals b" then 1 else 0
def c5 := if classify 2 3 5 == "a plus b equals c" then 1 else 0
def c6 := if classify 2 3 6 == "a times b equals c" then 1 else 0
def x := c1 + c2 + c3 + c4 + c5 + c6

#eval classify 1 1 1
#eval classify 1 2 3
#eval classify 3 2 1
#eval classify 2 2 5
#eval classify 2 3 5
#eval classify 2 3 6
#eval x
