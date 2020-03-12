# jqlite
Supports some basics of the jQuery API without actually being jQuery

Version 0.6

A barebones replacement for jQuery that only supports a handful of very basic features.

$$ supports basic chaining, so e.g. $$('.someClass').$filter(':visible').on('keypress', fn).val('foo') works.

Supported methods: parent, hide, show, css, removeClass, addClass, next, prev, val, $text, on, off, click, change, attr, removeAttr, prop, removeProp, trigger, fadeIn, fadeTo, fadeOut, getJSON, ajax (very partially)

Caveats:

Height: Returns a value for $(window).height and $(document).height but no guarantees it's the same as what jQuery would have returned.
fadeOut just hides an element instead of fading.
fadeIn/fadeTo don't support fade duration
each, filter, and text need to be prefixed with $ to avoid conflicts with native properties, i.e. $$(selector).$each
ajax support is very basic

Implementation Tips:

1) Make a first-pass look over your code to ensure the only parts of jQuery you make use of are supported (get supported list by hitting $$([{}]) in the console)

2) replace all instances of $ with $$

3) Prefix .each, .filter, and .text with '$' for example $(...).$text(foo).

4) Test the heck out of it. $$ is not as complex or nuanced as jQuery, intentionally. It covers the happy path only.
