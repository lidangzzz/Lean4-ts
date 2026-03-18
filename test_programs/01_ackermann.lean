-- Test 1: Ackermann function (deeply nested recursion)
def ackermann : Nat → Nat → Nat
  | 0, n => n + 1
  | m + 1, 0 => ackermann m 1
  | m + 1, n + 1 => ackermann m (ackermann (m + 1) n)

def ack3_3 := ackermann 3 3
def ack3_4 := ackermann 3 4
def ack2_5 := ackermann 2 5
def x := ack3_3 + ack3_4 + ack2_5
