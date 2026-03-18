-- Test 57: SKI Combinator Calculus (simplified)
inductive SKITerm where
  | S : SKITerm
  | K : SKITerm
  | I : SKITerm
  | app : SKITerm → SKITerm → SKITerm

deriving BEq, Repr

def skiReduce : SKITerm → SKITerm
  | SKITerm.app SKITerm.I x => x
  | SKITerm.app (SKITerm.app SKITerm.K x) _ => x
  | SKITerm.app (SKITerm.app (SKITerm.app SKITerm.S x) y) z) =>
    SKITerm.app (SKITerm.app x z) (SKITerm.app y z)
  | t => t

def skiSize : SKITerm → Nat
  | SKITerm.S => 1
  | SKITerm.K => 1
  | SKITerm.I => 1
  | SKITerm.app f x => 1 + skiSize f + skiSize x

def skiDepth : SKITerm → Nat
  | SKITerm.S => 0
  | SKITerm.K => 1
  | SKITerm.I => 1
  | SKITerm.app f x => 1 + max (skiDepth f) (skiDepth x)

def term1 := SKITerm.app SKITerm.I SKITerm.S
def term2 := SKITerm.app (SKITerm.app SKITerm.K SKITerm.S) SKITerm.K
def term3 := SKITerm.app (SKITerm.app (SKITerm.app SKITerm.S SKITerm.K) SKITerm.I) SKITerm.S

def s1 := skiSize term1
def s2 := skiSize term2
def s3 := skiSize term3
def d1 := skiDepth term1
def d2 := skiDepth term2
def d3 := skiDepth term3

def x := s1 + s2 + s3 + d1 + d2 + d3
