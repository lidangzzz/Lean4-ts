-- Substring operations
def takeString (n : Nat) (s : String) : String := s.take n
def dropString (n : Nat) (s : String) : String := s.drop n

def myString := "Hello, World!"
def result := (takeString 5 myString).length + (dropString 7 myString).length
