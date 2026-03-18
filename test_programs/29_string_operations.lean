-- Test 29: String operations
def stringLength : String → Nat
  | s => s.length

def stringAppend : String → String → String
  | s1, s2 => s1 ++ s2

def stringConcat : List String → String
  | [] => ""
  | [x] => x
  | h :: t => h ++ stringConcat t

def reverseString : String → String
  | s => 
    let rec rev : String → Nat → String
      | str, 0 => ""
      | str, n + 1 => 
        let char := str.get (n - 1)
        String.push (rev str n) char
    rev s s.length

def isPalindrome : String → Bool
  | s => s == reverseString s

def s1 := "hello"
def s2 := "world"
def s3 := stringAppend s1 s2
def s4 := reverseString "abc"
def s5 := if isPalindrome "racecar" then 1 else 0
def x := stringLength s3 + stringLength s4 + s5
