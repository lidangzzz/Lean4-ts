-- Either type (Sum type)
inductive Either (α : Type) (β : Type) where
  | left : α -> Either α β
  | right : β -> Either α β

def eitherMap (f : Nat -> Nat) (e : Either Nat Nat) : Either Nat Nat :=
  match e with
  | Either.left v => Either.left (f v)
  | Either.right v => Either.right (f v)

def eitherFold (e : Either Nat Nat) : Nat :=
  match e with
  | Either.left v => v
  | Either.right v => v * 2

def myEither := Either.right 21
def result := eitherFold (eitherMap (fun x => x + 1) myEither)
