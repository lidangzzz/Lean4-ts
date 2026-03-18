-- Test 29: String operations
def stringLength (s : String) : Nat := s.length

def stringAppend (s1 : String) (s2 : String) : String := s1 ++ s2

def stringConcat : List String → String
  | [] => ""
  | [x] => x
  | h :: t => h ++ stringConcat t

def reverseString (s : String) : String :=
  let chars := s.toList
  let reversed := chars.reverse
  String.mk reversed

def isPalindrome (s : String) : Bool := s == reverseString s

def s1 := "hello"
def s2 := "world"
def s3 := stringAppend s1 s2
def s4 := reverseString "abc"
def s5 := if isPalindrome "racecar" then 1 else 0
def x := stringLength s3 + stringLength s4 + s5

-- Output results
#eval stringLength s1
#eval stringLength s2
#eval s3
#eval s4
#eval s5
#eval x
