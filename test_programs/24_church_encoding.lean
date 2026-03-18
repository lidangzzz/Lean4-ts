-- Test 24: Church encoding style
def churchZero := fun _ => fun x => x
def churchSucc := fun n => fun f => fun x => f (n f x)
def churchAdd := fun m => fun n => fun f => fun x => m f (n f x)
def churchMult := fun m => fun n => fun f => m (n f)
def churchToInt := fun n => n (fun x => x + 1) 0

def c0 := churchZero
def c1 := churchSucc c0
def c2 := churchSucc c1
def c3 := churchSucc c2
def c5 := churchAdd c2 c3
def c6 := churchMult c2 c3

def n1 := churchToInt c1
def n2 := churchToInt c2
def n5 := churchToInt c5
def n6 := churchToInt c6
def x := n1 + n2 + n5 + n6
