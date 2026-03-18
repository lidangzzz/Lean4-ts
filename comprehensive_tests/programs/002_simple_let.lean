-- Simple let expressions
def x := let y := 5 in y + 1
def z := let a := 1 in let b := a + b in a + b
def result := z
