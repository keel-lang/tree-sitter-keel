; Keywords — declarations
[
  "agent" "task" "interface" "type" "extern"
  "use" "from" "state" "on" "set"
] @keyword.declaration

; Keywords — control flow
[
  "if" "else" "when" "where"
  "for" "in"
  "try" "catch" "return"
] @keyword.control

; Keywords — operators/logic
["as" "and" "or" "not"] @keyword.operator

; Literals
(boolean_literal) @boolean
(none_literal)    @constant.builtin
(now_literal)     @constant.builtin

; Numbers
(integer_literal) @number
(float_literal)   @number.float
(duration_literal
  value: (integer_literal) @number
  unit: _ @number.unit)

; Strings
(string_literal)        @string
(triple_string_literal) @string
(string_escape)         @string.escape
(string_interpolation)  @string.special

; Comments
(comment) @comment

; Self
"self" @variable.builtin

; Wildcard
(wildcard_pattern) @constant.builtin

; Attributes
(attribute "@" @attribute.delimiter name: (identifier) @attribute)

; Declarations
(agent_declaration     name: (type_identifier) @type.definition)
(task_declaration      name: (identifier)      @function.definition)
(interface_declaration name: (type_identifier) @type.definition)
(type_declaration      name: (type_identifier) @type.definition)
(extern_declaration    name: (identifier)      @function.definition)
(on_handler            event: (identifier)     @function.special)

; Parameters
(param name: (identifier) @variable.parameter)

; State fields
(state_field name: (identifier) @variable.member)

; Prelude namespaces — highlight before dot
(postfix_expr
  (primary_expr (type_identifier) @namespace)
  ".")

; Type names
(type_identifier) @type
(primitive_type)  @type.builtin

; Function calls
(postfix_expr
  (primary_expr (identifier) @function.call)
  (call_suffix))

; Self field access
(postfix_expr
  (primary_expr "self" @variable.builtin)
  "."
  field: (identifier) @variable.member)

; Self assignment
(self_assignment field: (identifier) @variable.member)

; Identifiers
(identifier) @variable

; Operators
[
  "=>" "->" "|>" "??" "?." "!."
  "==" "!=" "<=" ">=" "<" ">"
  "+" "-" "*" "/" "%"
  "=" "!" "?"
] @operator
