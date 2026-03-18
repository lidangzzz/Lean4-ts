-- Ackermann function - a deeply recursive mathematical function
def ack : Nat -> Nat -> Nat
  | 0, n => n + 1
  | m + 1, 0 => ack m 1
  | m + 1, n + 1 => ack m (ack (m + 1) n)

def result := ack 3 4
