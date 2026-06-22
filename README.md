# tree-sitter-keel

[Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for the [Keel](https://keel-lang.dev) programming language. Enables syntax highlighting and navigation in Neovim, Helix, Zed, and any editor with Tree-sitter support.

## Usage

### Neovim (nvim-treesitter)

```lua
local parser_config = require('nvim-treesitter.parsers').get_parser_configs()
parser_config.keel = {
  install_info = {
    url = 'https://github.com/keel-lang/tree-sitter-keel',
    files = { 'src/parser.c' },
    branch = 'main',
  },
  filetype = 'keel',
}
```

Then run `:TSInstall keel`.

### Helix

Add to `~/.config/helix/languages.toml`:

```toml
[[language]]
name = "keel"
scope = "source.keel"
file-types = ["keel"]
roots = []
comment-token = "#"
grammar = "keel"

[[grammar]]
name = "keel"
source = { git = "https://github.com/keel-lang/tree-sitter-keel", rev = "main" }
```

Then run `hx --grammar build`.

### Zed

Add to your Zed extensions config — Zed picks up Tree-sitter grammars registered via the extension API.

## Development

```bash
npm install
npm run generate   # regenerates src/parser.c from grammar.js
npm test           # runs the corpus tests
```

Requires the [tree-sitter CLI](https://github.com/tree-sitter/tree-sitter/blob/master/cli/README.md).

## Grammar coverage

| Construct | Status |
|-----------|--------|
| `agent` declarations | ✓ |
| `task` declarations | ✓ |
| `type` (enum + struct) | ✓ |
| `interface` | ✓ |
| `impl ... for` blocks | ✓ |
| `extern` | ✓ |
| `use std/<name>` / `from` | ✓ |
| `state` blocks | ✓ |
| `on` event handlers | ✓ |
| `@attribute` expressions (incl. `@tools` guards) | ✓ |
| `if` / `else` | ✓ |
| `when` pattern matching | ✓ |
| `for` / `while` loops | ✓ |
| `try` / `catch`, `raise`, `break` / `continue` | ✓ |
| `test` / `setup` / `assert` blocks | ✓ |
| Generics (`task f[T]`, `type Pair[A, B]`, `list[T]`) | ✓ |
| `self` / variadic (`...`) / default params | ✓ |
| Destructuring (`{ a, b } =`) | ✓ |
| Enum-variant construction (`Action.page { ... }`) | ✓ |
| Lambda (`() => ...`) | ✓ |
| String interpolation (`{expr}`, `{expr:.2f}`) | ✓ |
| Triple-quoted strings | ✓ |
| Duration literals (`5.seconds`) | ✓ |
| Augmented assignment (`+=`), range (`..`) | ✓ |
| Null-safe access (`?.`, `??`) | ✓ |
| Pipeline (`\|>`) | ✓ |
| stdlib namespace highlighting (`ai`, `io`, `http`, …) | ✓ |

## Links

- [Language repository](https://github.com/keel-lang/keel)
- [Language documentation](https://keel-lang.dev/docs)
- [Issues](https://github.com/keel-lang/tree-sitter-keel/issues)
