-- Test 3: Collatz sequence length
partial def collatzLen : Nat → Nat
  | 0 => 0
  | 1 => 1
  | n => if n % 2 == 0 then 1 + collatzLen (n / 2) else 1 + collatzLen (3 * n + 1)

def c7 := collatzLen 7
def c27 := collatzLen 27
def c97 := collatzLen 97
def c871 := collatzLen 871
def x := c7 + c27 + c97 + c871
