; Scopes
(agent_declaration) @scope
(task_declaration)  @scope
(block)             @scope
(lambda)            @scope

; Definitions
(task_declaration   name: (identifier)      @definition.function)
(agent_declaration  name: (type_identifier) @definition.type)
(param              name: (identifier)      @definition.parameter)
(assignment         target: (identifier)    @definition.var)
(state_field        name: (identifier)      @definition.field)

; References
(identifier)      @reference
(type_identifier) @reference
