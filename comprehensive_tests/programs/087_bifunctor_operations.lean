-- Bifunctor operations
def bimapEither (f : Nat -> Nat) (g : String -> String) (e : Either Nat String) : Either Nat String :=
  match e with
  | Either.left v => Either.left (f v)
  | Either.right v => Either.right (g v)

def double (x : Nat) : Nat := x * 2
def exclaim (s : String) : String := s ++ "!"

def myEither := Either.right "hello"
def result := match bimapEither double exclaim myEither with
  | Either.left _ => 0
  | Either.right s => s.length
