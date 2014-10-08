# XPather

Chrome extension for XPaths operations done the right way. Get it from [Chrome Web Store](https://chrome.google.com/webstore/detail/xpather/gabekepgockchhemajjahpchlnkadiac).

### Features

- evaluating XPath on current document (using [jQuery XPath](https://github.com/ilinsky/jquery-xpath))
- evaluating XPath 2.0 queries and expresions
- matched nodes content preview in sidebar
- functions and attributes shortcuts
- scroll viewport to selected node

### Keyboard shortcuts

<kbd>Alt+X</kbd> - toggle XPather

<kbd>Alt+Shift</kbd> - toggle XPather Sidebar (when XPather is active)

<kbd>Ctrl+Spacebar</kbd> or <kbd>Cmd+Spacebar</kbd> - expand shortcut

### Available shortcuts
Shortcut | XPath function
--- | --- | ---
`co` | contains()
`sw` | starts-with()
`ew` | ends-with()
`uc` | upper-case()
`lc` | lower-case()
`no` | not()

Shortcut | HTML tag
--- | --- | ---
`d` | div
`s` | span

Shortcut | HTML attribute
--- | --- | ---
`@c` | class
`@h` | href
`@i` | id
`@s` | style
`@t` | title
