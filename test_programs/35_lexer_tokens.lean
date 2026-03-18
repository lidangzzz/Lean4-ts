-- Test 35: Token counting (simulated lexer)
inductive Token where
  | num : Nat → Token
  | ident : String → Token
  | plus : Token
  | minus : Token
  | times : Token
  | lparen : Token
  | rparen : Token

def tokenCount : List Token → Nat
  | [] => 0
  | _ :: t => 1 + tokenCount t

def countNums : List Token → Nat
  | [] => 0
  | Token.num _ :: t => 1 + countNums t
  | _ :: t => countNums t

def countIdents : List Token → Nat
  | [] => 0
  | Token.ident _ :: t => 1 + countIdents t
  | _ :: t => countIdents t

def tokens := [
  Token.num 42,
  Token.plus,
  Token.ident "x",
  Token.times,
  Token.lparen,
  Token.num 3,
  Token.minus,
  Token.ident "y",
  Token.rparen
]

def total := tokenCount tokens
def nums := countNums tokens
def idents := countIdents tokens
def x := total + nums + idents
