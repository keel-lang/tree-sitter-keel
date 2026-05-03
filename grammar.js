/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'keel',

  extras: ($) => [/\s/, $.comment],

  word: ($) => $.identifier,

  conflicts: ($) => [
    [$.primary_expr, $.self_assignment],
    [$._literal, $.duration_literal],
    [$.enum_variant, $._type],
    [$.block, $.map_literal],
    [$.enum_variant],
    [$.primary_expr, $._type],
    [$.lambda, $.primary_expr],
  ],

  rules: {
    source_file: ($) => repeat($._top_level),

    _top_level: ($) =>
      choice(
        $.agent_declaration,
        $.task_declaration,
        $.type_declaration,
        $.interface_declaration,
        $.extern_declaration,
        $.use_statement,
        $.run_statement,
        $._statement,
      ),

    // ── Declarations ──────────────────────────────────────────────────

    agent_declaration: ($) =>
      seq(
        'agent',
        field('name', $.type_identifier),
        '{',
        repeat($._agent_item),
        '}',
      ),

    _agent_item: ($) =>
      choice(
        $.attribute,
        $.state_block,
        $.task_declaration,
        $.on_handler,
      ),

    state_block: ($) =>
      seq('state', '{', repeat($.state_field), '}'),

    state_field: ($) =>
      seq(
        field('name', $.identifier),
        ':',
        field('type', $._type),
        optional(seq('=', field('default', $._expr))),
      ),

    on_handler: ($) =>
      seq(
        'on',
        field('event', $.identifier),
        optional(seq('(', optional($.param_list), ')')),
        field('body', $.block),
      ),

    attribute: ($) =>
      seq(
        '@',
        field('name', $.identifier),
        optional($._attribute_body),
      ),

    _attribute_body: ($) =>
      choice(
        $.block,
        $._expr,
      ),

    task_declaration: ($) =>
      seq(
        'task',
        field('name', $.identifier),
        '(',
        optional($.param_list),
        ')',
        optional(seq('->', field('return_type', $._type))),
        field('body', $.block),
      ),

    type_declaration: ($) =>
      seq(
        'type',
        field('name', $.type_identifier),
        '=',
        choice(
          field('enum', $.enum_definition),
          field('alias', $._type),
        ),
      ),

    enum_definition: ($) =>
      seq($.enum_variant, repeat1(seq('|', $.enum_variant))),

    enum_variant: ($) =>
      seq(
        field('name', $.type_identifier),
        optional(seq('{', repeat($.state_field), '}')),
      ),

    interface_declaration: ($) =>
      seq(
        'interface',
        field('name', $.type_identifier),
        '{',
        repeat($.task_signature),
        '}',
      ),

    task_signature: ($) =>
      seq(
        'task',
        field('name', $.identifier),
        '(',
        optional($.param_list),
        ')',
        optional(seq('->', field('return_type', $._type))),
      ),

    extern_declaration: ($) =>
      seq(
        'extern',
        'task',
        field('name', $.identifier),
        '(',
        optional($.param_list),
        ')',
        '->',
        field('return_type', $._type),
        'from',
        field('source', $.string_literal),
      ),

    use_statement: ($) =>
      seq(
        'use',
        choice(
          field('path', $.string_literal),
          seq(field('name', $.identifier), 'from', field('path', $.string_literal)),
          seq(field('name', $.identifier), repeat1(seq('/', $.identifier))),
        ),
      ),

    run_statement: ($) =>
      seq('run', '(', field('agent', $.type_identifier), ')'),

    param_list: ($) => commaSep1($.param),

    param: ($) =>
      seq(
        field('name', $.identifier),
        ':',
        field('type', $._type),
      ),

    // ── Types ─────────────────────────────────────────────────────────

    _type: ($) =>
      choice(
        $.primitive_type,
        $.nullable_type,
        $.list_type,
        $.map_type,
        $.set_type,
        $.type_identifier,
      ),

    primitive_type: (_) =>
      choice('str', 'int', 'float', 'bool', 'duration', 'datetime', 'dynamic'),

    nullable_type: ($) => seq($._type, '?'),

    list_type: ($) => seq('[', $._type, ']'),

    map_type: ($) => seq('map', '[', $._type, ',', $._type, ']'),

    set_type: ($) => seq('set', '[', $._type, ']'),

    // ── Block & Statements ────────────────────────────────────────────

    block: ($) => seq('{', repeat($._statement), '}'),

    _statement: ($) =>
      choice(
        $.assignment,
        $.self_assignment,
        $.return_statement,
        $.for_statement,
        $.try_statement,
        $.expr_statement,
      ),

    assignment: ($) =>
      seq(
        field('target', $.identifier),
        optional(seq(':', field('type', $._type))),
        '=',
        field('value', $._expr),
      ),

    self_assignment: ($) =>
      seq('self', '.', field('field', $.identifier), '=', field('value', $._expr)),

    return_statement: ($) => seq('return', $._expr),

    for_statement: ($) =>
      seq(
        'for',
        field('binding', choice($.identifier, $.destructure_pattern)),
        'in',
        field('iterable', $._expr),
        optional(seq('where', field('guard', $._expr))),
        field('body', $.block),
      ),

    try_statement: ($) =>
      seq('try', $.block, repeat1($.catch_clause)),

    catch_clause: ($) =>
      seq(
        'catch',
        field('name', $.identifier),
        ':',
        field('type', $._type),
        $.block,
      ),

    expr_statement: ($) => $._expr,

    // ── Expressions ───────────────────────────────────────────────────

    _expr: ($) =>
      choice(
        $.binary_expr,
        $.unary_expr,
        $.postfix_expr,
        $.if_expr,
        $.when_expr,
        $.try_expr,
        $.lambda,
        $.primary_expr,
      ),

    binary_expr: ($) =>
      choice(
        prec.left(1,  seq($._expr, 'or',                              $._expr)),
        prec.left(2,  seq($._expr, 'and',                             $._expr)),
        prec.left(3,  seq($._expr, choice('==', '!=', '<', '>', '<=', '>='), $._expr)),
        prec.left(4,  seq($._expr, choice('+', '-'),                  $._expr)),
        prec.left(5,  seq($._expr, choice('*', '/', '%'),             $._expr)),
        prec.left(6,  seq($._expr, '??',                              $._expr)),
        prec.left(7,  seq($._expr, '|>',                              $._expr)),
      ),

    unary_expr: ($) =>
      prec(8, seq(choice('-', 'not'), $._expr)),

    postfix_expr: ($) =>
      choice(
        prec.left(9, seq($._expr, '.', field('field', choice($.identifier, $.integer_literal)))),
        prec.left(9, seq($._expr, '?.', field('field', $.identifier))),
        prec.left(9, seq($._expr, '!.', field('field', $.identifier))),
        prec.left(9, seq($._expr, '!',)),
        prec.left(9, seq($._expr, $.call_suffix)),
        prec.left(9, seq($._expr, '[', $._expr, ']')),
        prec.left(9, seq($._expr, 'as', $._type)),
      ),

    call_suffix: ($) =>
      seq('(', optional($.arg_list), ')'),

    arg_list: ($) => commaSep1($.arg),

    arg: ($) =>
      choice(
        seq(field('name', $.identifier), ':', field('value', $._expr)),
        field('value', $._expr),
      ),

    if_expr: ($) =>
      seq(
        'if',
        field('condition', $._expr),
        field('then', $.block),
        optional(seq('else', field('else', choice($.if_expr, $.block)))),
      ),

    when_expr: ($) =>
      seq(
        'when',
        field('subject', $._expr),
        '{',
        repeat1($.when_arm),
        '}',
      ),

    when_arm: ($) =>
      seq(
        commaSep1($._pattern),
        optional(seq('where', field('guard', $._expr))),
        '=>',
        field('body', choice($._expr, $.block)),
      ),

    _pattern: ($) =>
      choice(
        $.variant_pattern,
        $.struct_pattern,
        $.wildcard_pattern,
        $.identifier,
        $._literal,
      ),

    variant_pattern: ($) =>
      seq(
        field('variant', $.type_identifier),
        optional(seq('{', commaSep1(seq($.identifier, ':', $.identifier)), '}')),
      ),

    struct_pattern: ($) =>
      seq('{', commaSep1(seq($.identifier, optional(seq(':', $.identifier)))), '}'),

    wildcard_pattern: (_) => '_',

    destructure_pattern: ($) =>
      choice(
        seq('{', commaSep1($.identifier), '}'),
        seq('(', commaSep1($.identifier), ')'),
      ),

    try_expr: ($) =>
      seq('try', $._expr),

    lambda: ($) =>
      choice(
        seq(field('param', $.identifier), '=>', field('body', choice($._expr, $.block))),
        seq(
          '(',
          optional($.param_list),
          ')',
          '=>',
          field('body', choice($._expr, $.block)),
        ),
      ),

    primary_expr: ($) =>
      choice(
        $._literal,
        $.identifier,
        $.type_identifier,
        'self',
        $.list_literal,
        $.map_literal,
        $.set_literal,
        $.tuple_literal,
        seq('(', $._expr, ')'),
      ),

    // ── Literals ──────────────────────────────────────────────────────

    _literal: ($) =>
      choice(
        $.string_literal,
        $.triple_string_literal,
        $.duration_literal,
        $.float_literal,
        $.integer_literal,
        $.boolean_literal,
        $.none_literal,
        $.now_literal,
      ),

    string_literal: ($) =>
      seq(
        '"',
        repeat(choice($.string_escape, $.string_interpolation, $.string_content)),
        '"',
      ),

    triple_string_literal: ($) =>
      seq(
        '"""',
        repeat(choice($.string_escape, $.string_interpolation, $.triple_string_content)),
        '"""',
      ),

    string_content: (_) => /[^"\\{]+/,

    triple_string_content: (_) => /[^"\\{]+|"{1,2}/,

    string_escape: (_) => /\\[ntr\\"{}]/,

    string_interpolation: ($) =>
      seq('{', $._expr, '}'),

    duration_literal: ($) =>
      seq(
        field('value', $.integer_literal),
        '.',
        field('unit', choice('seconds', 'minutes', 'hours', 'days', 'weeks')),
      ),

    float_literal: (_) => /[0-9]+\.[0-9]+/,

    integer_literal: (_) => /[0-9]+/,

    boolean_literal: (_) => choice('true', 'false'),

    none_literal: (_) => 'none',

    now_literal: (_) => 'now',

    list_literal: ($) => seq('[', optional(commaSep1($._expr)), ']'),

    map_literal: ($) =>
      seq('{', optional(commaSep1($.map_entry)), '}'),

    map_entry: ($) =>
      seq(field('key', choice($.identifier, $.string_literal)), ':', field('value', $._expr)),

    set_literal: ($) =>
      seq('set', '{', optional(commaSep1($._expr)), '}'),

    tuple_literal: ($) =>
      seq('(', $._expr, ',', commaSep1($._expr), ')'),

    // ── Identifiers ───────────────────────────────────────────────────

    identifier: (_) => /[a-z_][a-zA-Z0-9_]*/,

    type_identifier: (_) => /[A-Z][a-zA-Z0-9_]*/,

    // ── Comments ──────────────────────────────────────────────────────

    comment: (_) => /#.*/,
  },
});

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)), optional(','));
}
