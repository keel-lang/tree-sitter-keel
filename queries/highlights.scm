; Highlight precedence is LAST-WINS: when two patterns capture the same node,
; the one defined later in this file takes effect. So the generic catch-alls
; (identifier → variable, type_identifier → type) come FIRST, and the specific
; semantic captures (namespaces, calls, members, declarations) come LATER so
; they override.

; ── Generic catch-alls (least specific — must come first) ─────────────
(identifier)      @variable
(type_identifier) @type
(primitive_type)  @type.builtin

; ── Keywords (distinct tokens — never collide with the captures above) ─
[
  "agent" "task" "interface" "impl" "type" "extern"
  "use" "from" "state" "on" "set"
] @keyword.declaration

[
  "if" "else" "when" "where"
  "for" "while" "in"
  "try" "catch" "return" "raise"
] @keyword.control

(break_statement)    @keyword.control
(continue_statement) @keyword.control

["as" "and" "or" "not"] @keyword.operator

; Contextual test words (§9.5) — not reserved, but highlighted in test position
["test" "setup" "assert"] @keyword

; ── Literals ──────────────────────────────────────────────────────────
(boolean_literal) @boolean
(none_literal)    @constant.builtin
(wildcard_pattern) @constant.builtin

(integer_literal) @number
(float_literal)   @number.float
(duration_literal
  value: (integer_literal) @number
  unit: _ @number.unit)

(string_literal)        @string
(triple_string_literal) @string
(string_escape)         @string.escape
(string_interpolation)  @string.special
(format_spec)           @string.special.symbol

(comment) @comment

; ── Operators ─────────────────────────────────────────────────────────
[
  "=>" "->" "|>" "??" "?." "!."
  "==" "!=" "<=" ">=" "<" ">"
  "+" "-" "*" "/" "%"
  "=" "!" "?"
  "+=" "-=" "*=" "/=" "%="
  ".."
] @operator

; ── Specific identifier roles (more specific — come later, win over @variable) ─

; Function calls
(postfix_expr
  (primary_expr (identifier) @function.call)
  (call_suffix))

; Built-in free functions / agent verbs (§3.3) — defined AFTER function.call
; so they win on shared call nodes like run(…) / min(…) / typeof(…)
((postfix_expr
   (primary_expr (identifier) @function.builtin)
   (call_suffix))
 (#match? @function.builtin "^(run|stop|send|delegate|broadcast|min|max|typeof)$"))

; stdlib namespaces — lowercase module identifiers used before a dot
((postfix_expr
   (primary_expr (identifier) @module)
   ".")
 (#match? @module "^(ai|async|cache|control|crypto|csv|db|email|env|file|http|io|json|log|math|memory|random|schedule|search|shell|testing|time|uuid)$"))

; Parameters
(param name: (identifier) @variable.parameter)
(lambda_param name: (identifier) @variable.parameter)

; State / struct fields
(state_field name: (identifier) @variable.member)

; Self field access
(postfix_expr
  (primary_expr "self" @variable.builtin)
  "."
  field: (identifier) @variable.member)

; Self assignment
(self_assignment field: (identifier) @variable.member)

; Attributes
(attribute "@" @attribute.delimiter name: (identifier) @attribute)

; Declarations (most specific — define names, win over @type / @variable)
(agent_declaration     name: (type_identifier) @type.definition)
(task_declaration      name: (identifier)      @function.definition)
(interface_declaration name: (type_identifier) @type.definition)
(impl_declaration      interface: (type_identifier) @type)
(impl_declaration      type: (type_identifier)      @type.definition)
(type_declaration      name: (type_identifier) @type.definition)
(extern_declaration    name: (identifier)      @function.definition)
(on_handler            event: (identifier)     @function.special)

; Self
"self" @variable.builtin
