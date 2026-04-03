-- Test 34: Stack machine interpreter
inductive Instr where
  | push : Nat → Instr
  | add : Instr
  | mul : Instr
  | sub : Instr
  | dup : Instr
  | swap : Instr

def exec : Instr → List Nat → List Nat
  | Instr.push n, stack => n :: stack
  | Instr.add, h1 :: h2 :: t => (h1 + h2) :: t
  | Instr.mul, h1 :: h2 :: t => (h1 * h2) :: t
  | Instr.sub, h1 :: h2 :: t => (if h2 >= h1 then h2 - h1 else 0) :: t
  | Instr.dup, h :: t => h :: h :: t
  | Instr.swap, h1 :: h2 :: t => h2 :: h1 :: t
  | _, stack => stack

def run : List Instr → List Nat → List Nat
  | [], stack => stack
  | instr :: instrs, stack => run instrs (exec instr stack)

def program := [
  Instr.push 3,
  Instr.push 4,
  Instr.push 5,
  Instr.mul,
  Instr.add,
  Instr.dup
]

def result := run program []
def sum := List.foldl (fun a b => a + b) 0 result
def x := sum

#eval result
#eval sum
#eval x
