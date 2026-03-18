-- Semigroup operations
def stringAppend (s1 : String) (s2 : String) : String :=
  s1 ++ s2

def concatStrings (xs : List String) : String :=
  match xs with
  | [] => ""
  | h :: t => stringAppend h (concatStrings t)

def result := concatStrings ["Hello", ", ", "World", "!"]
