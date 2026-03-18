-- Pair (Tuple) operations
def fst (p : Nat × Nat) : Nat := p.1
def snd (p : Nat × Nat) : Nat := p.2

def swap (p : Nat × Nat) : Nat × Nat := (p.2, p.1)
def pairMap (f : Nat -> Nat) (p : Nat × Nat) : Nat × Nat := (f p.1, f p.2)

def myPair := (10, 20)
def result := fst (swap (pairMap (fun x => x * 2) myPair))
