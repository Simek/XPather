# XPather

Chrome extension for XPaths operations done the right way. Get it from [Chrome Web Store](https://chrome.google.com/webstore/detail/xpather/gabekepgockchhemajjahpchlnkadiac).

### Features

- evaluating XPath (using [jQuery XPath](http://github.com/jfirebaugh/jquery-xpath)), so forget about not working expressions
- matched nodes content preview in sidebar
- functions and attributes shortcuts
- scroll viewport to selected node

### Keyboard shortcuts

`Alt+X`: toggle XPather

`Alt+Shift`: toggle XPather Sidebar (when XPather is active)

`Ctrl+Spacebar`: expand shortcut

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