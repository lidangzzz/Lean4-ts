-- String reverse
def reverseAux (s : String) (acc : String) : String :=
  if s.length == 0 then acc
  else reverseAux (s.drop 1) (s.get 0 :: acc)

def reverse (s : String) : String := reverseAux s ""

def result := reverse "hello".length
