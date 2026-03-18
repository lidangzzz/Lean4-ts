-- Test 53: HTML Builder DSL
inductive HtmlElement where
  | mk : String → List (String × String) → List HtmlElement → HtmlElement

def renderHtml : HtmlElement → String
  | HtmlElement.mk tag attrs children =>
    let attrStr := if attrs.isEmpty then ""
      else " " ++ String.intercalate " " (attrs.map fun (k, v) => k ++ "=\"" ++ v ++ "\"")
    let childStr := (children.map renderHtml).foldl (· ++ ·) ""
    "<" ++ tag ++ attrStr ++ ">" ++ childStr ++ "</" ++ tag ++ ">"

def text (s : String) : HtmlElement := HtmlElement.mk s [] []

def div (attrs : List (String × String)) (children : List HtmlElement) : HtmlElement :=
  HtmlElement.mk "div" attrs children

def span (attrs : List (String × String)) (children : List HtmlElement) : HtmlElement :=
  HtmlElement.mk "span" attrs children

def p (attrs : List (String × String)) (children : List HtmlElement) : HtmlElement :=
  HtmlElement.mk "p" attrs children

def a (href : String) (children : List HtmlElement) : HtmlElement :=
  HtmlElement.mk "a" [("href", href)] children

def ul (attrs : List (String × String)) (items : List HtmlElement) : HtmlElement :=
  HtmlElement.mk "ul" attrs items

def li (attrs : List (String × String)) (children : List HtmlElement) : HtmlElement :=
  HtmlElement.mk "li" attrs children

def table (attrs : List (String × String)) (rows : List HtmlElement) : HtmlElement :=
  HtmlElement.mk "table" attrs rows

def tr (attrs : List (String × String)) (cells : List HtmlElement) : HtmlElement :=
  HtmlElement.mk "tr" attrs cells

def td (attrs : List (String × String)) (content : List HtmlElement) : HtmlElement :=
  HtmlElement.mk "td" attrs content

def th (attrs : List (String × String)) (content : List HtmlElement) : HtmlElement :=
  HtmlElement.mk "th" attrs content

def countElements : HtmlElement → Nat
  | HtmlElement.mk _ _ children => 1 + (children.map countElements).sum

def page1 := div [("class", "container")] [
  p [] [text "Welcome to our site!"],
  ul [] [
    li [] [text "Item 1"],
    li [] [text "Item 2"],
    li [] [text "Item 3"]
  ],
  a "/about" [text "About Us"]
]

def page2 := table [("class", "data-table")] [
  tr [] [
    th [] [text "Name"],
    th [] [text "Age"],
    th [] [text "City"]
  ],
  tr [] [
    td [] [text "Alice"],
    td [] [text "30"],
    td [] [text "NYC"]
  ],
  tr [] [
    td [] [text "Bob"],
    td [] [text "25"],
    td [] [text "LA"]
  ]
]

def page3 := div [("id", "main")] [
  div [("class", "header")] [
    span [("class", "logo")] [text "LOGO"],
    span [("class", "nav")] [text "Home | About | Contact"]
  ],
  div [("class", "content")] [
    p [] [text "Main content here"],
    ul [] (List.range 5 |>.map (fun i => li [] [text ("Item " ++ toString i)]))
  ],
  div [("class", "footer")] [
    p [] [text "Copyright 2024"]
  ]
]

def html1 := renderHtml page1
def html2 := renderHtml page2
def html3 := renderHtml page3

def count1 := countElements page1
def count2 := countElements page2
def count3 := countElements page3

def x := count1 + count2 + count3 + html1.length + html2.length + html3.length

-- Output results
#eval s!"HTML 1 element count: {count1}"
#eval s!"HTML 2 element count: {count2}"
#eval s!"HTML 3 element count: {count3}"
#eval s!"HTML 1 length: {html1.length}"
#eval s!"HTML 2 length: {html2.length}"
#eval s!"HTML 3 length: {html3.length}"
#eval s!"Total x: {x}"
