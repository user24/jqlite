# jqlite
Supports some basics of the jQuery API without actually being jQuery.

Version 0.6

A barebones almost-drop-in replacement for jQuery that only supports a handful of very basic features.

Example:

````
$('.selector').css('color', 'red').parent().show();
````

can become
````
$$('.selector').css('color', 'red').parent().show();
````
and we can replace jQuery with jqlite, removing ~80 KB of code when minified.


Rationale: a lot of the time, you're only using 5% of jQuery. Why bother with the rest?

Real reason: it's often quicker to replace jQuery-dependent code with jqlite-dependent code, instead of actually converting to pure vanilla JS. Plus some of jQuery's helper methods are genuinely helpful and easier than vanilla JS. Also, the code for jqlite is a lot easier to understand than jQuery, so if you're looking for a "vanilla JS equivalent of jQuery's foo function", this might be a better starting point than diving into jQuery's code.

$$ supports basic chaining, so e.g. $$('.someClass').$filter(':visible').on('keypress', fn).val('foo') works.

Supported methods: parent, hide, show, css, removeClass, addClass, next, prev, val, $text, on, off, click, change, attr, removeAttr, prop, removeProp, trigger, fadeIn, fadeTo, fadeOut, getJSON, ajax (very partially)

Caveats:

each, filter, and text need to be prefixed with $ to avoid conflicts with native properties, i.e. $$(selector).$each
Height: Returns a value for $(window).height and $(document).height but no guarantees it's the same as what jQuery would have returned.
fadeOut just hides an element instead of fading.
fadeIn/fadeTo don't support fade duration
ajax support is very basic

Implementation Tips:

1) Make a first-pass look over your code to ensure the only parts of jQuery you make use of are supported (get supported list by hitting $$([{}]) in the console)

2) replace all instances of $ with $$

3) Prefix .each, .filter, and .text with '$' for example $(...).$text(foo).

4) Test the heck out of it. $$ is not as complex or nuanced as jQuery, intentionally. It covers the happy path only.
