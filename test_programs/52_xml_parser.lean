-- Test 52: XML Parser (simplified)
inductive XmlNode where
  | text : String → XmlNode
  | element : String → List (String × String) → List XmlNode → XmlNode

def xmlFormat : XmlNode → String
  | XmlNode.text s => s
  | XmlNode.element tag attrs children =>
    let attrStr := if attrs.isEmpty then ""
      else " " ++ String.intercalate " " (attrs.map fun (k, v) => k ++ "=\"" ++ v ++ "\"")
    let childStr := (children.map xmlFormat).foldl (· ++ ·) ""
    "<" ++ tag ++ attrStr ++ ">" ++ childStr ++ "</" ++ tag ++ ">"

def xmlDepth : XmlNode → Nat
  | XmlNode.text _ => 0
  | XmlNode.element _ _ children => 1 + (children.map xmlDepth).foldl max 0

def xmlCountNodes : XmlNode → Nat
  | XmlNode.text _ => 1
  | XmlNode.element _ _ children => 1 + (children.map xmlCountNodes).sum

def xmlCountElements : XmlNode → Nat
  | XmlNode.text _ => 0
  | XmlNode.element _ _ children => 1 + (children.map xmlCountElements).sum

def xmlFindAttr : XmlNode → String → Option String
  | XmlNode.text _, _ => none
  | XmlNode.element _ attrs _, name =>
    attrs.find? (fun (k, _) => k = name) |>.map (·.snd)

def xml1 := XmlNode.element "root" [] [
  XmlNode.text "Hello, ",
  XmlNode.element "b" [] [XmlNode.text "World"],
  XmlNode.text "!"
]

def xml2 := XmlNode.element "html" [] [
  XmlNode.element "head" [] [
    XmlNode.element "title" [] [XmlNode.text "Page Title"]
  ],
  XmlNode.element "body" [("class", "main")] [
    XmlNode.element "div" [("id", "content")] [
      XmlNode.element "p" [] [XmlNode.text "Paragraph 1"],
      XmlNode.element "p" [] [XmlNode.text "Paragraph 2"]
    ]
  ]
]

def xml3 := XmlNode.element "catalog" [] [
  XmlNode.element "book" [("id", "1")] [
    XmlNode.element "title" [] [XmlNode.text "Book One"],
    XmlNode.element "author" [] [XmlNode.text "Author A"],
    XmlNode.element "price" [] [XmlNode.text "29.99"]
  ],
  XmlNode.element "book" [("id", "2")] [
    XmlNode.element "title" [] [XmlNode.text "Book Two"],
    XmlNode.element "author" [] [XmlNode.text "Author B"],
    XmlNode.element "price" [] [XmlNode.text "39.99"]
  ]
]

def s1 := xmlFormat xml1
def s2 := xmlFormat xml2
def s3 := xmlFormat xml3

def d1 := xmlDepth xml1
def d2 := xmlDepth xml2
def d3 := xmlDepth xml3

def n1 := xmlCountNodes xml1
def n2 := xmlCountNodes xml2
def n3 := xmlCountNodes xml3

def e1 := xmlCountElements xml1
def e2 := xmlCountElements xml2
def e3 := xmlCountElements xml3

def attr := xmlFindAttr xml2 "class"

def x := d1 + d2 + d3 + n1 + n2 + n3 + e1 + e2 + e3 + (match attr with | some "main" => 1 | _ => 0)

-- Output results
#eval s!"XML 1: {s1}"
#eval s!"Depth 1: {d1}, Depth 2: {d2}, Depth 3: {d3}"
#eval s!"Nodes 1: {n1}, Nodes 2: {n2}, Nodes 3: {n3}"
#eval s!"Elements 1: {e1}, Elements 2: {e2}, Elements 3: {e3}"
#eval s!"Found attr 'class': {attr}"
#eval s!"Total x: {x}"
