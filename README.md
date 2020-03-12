# jqlite
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


## Rationale

It's designed as a stepping stone towards converting your project to pure vanilla JS. It's often quicker to replace jQuery-dependent code with jqlite-dependent code, instead of actually converting to vanilla JS.

By replacing jQuery with jqlite in your the codebase, it encourages developers to seek vanilla methods instead of further depending on jQuery in future work. It gets jQuery out, often without requiring a huge rewrite immediately.

Finally, the code for jqlite is a lot easier to understand than jQuery, so if you're looking for a "vanilla JS equivalent of jQuery's foo function", this might be a better starting point than diving into jQuery's code.

## How much of jQuery's API is supported?

* Basic chaining, so e.g. $$('.someClass').$filter(':visible').on('keypress', fn).val('foo') works.

* The following jQuery methods are supported: $filter, $each, parent, hide, show, css, removeClass, addClass, next, prev, val, $text, height, on, off, click, change, attr, removeAttr, prop, removeProp, trigger, fadeTo, fadeIn, fadeOut

* The following methods are also supported: $$.ready & $$(fn), $$.getJSON, $$.ajax - partially, 

## Caveats:

* each, filter, and text need to be prefixed with $ to avoid conflicts with native properties, i.e. $$(selector).$each
* Height: Returns a value for $(window).height and $(document).height but no guarantees it's the same as what jQuery would have returned.
* fadeOut just hides an element instead of fading.
* fadeIn/fadeTo don't support fade duration
* ajax support is very basic
* The object returned by jqlite is an augmented DOM element, i.e. $$('#foo') will have native DOM properties like .value and .setAttribute, as well as jQuery-esque methods like .val and .parent. This is so that you can start to re-introduce vanilla JS more easily, instead of having to jump through hoops to get to the DOM API.

## Implementation Tips:

1) Make a first-pass look over your code to ensure the only parts of jQuery you make use of are supported (get supported list by hitting $$([{}]) in the console)

2) replace all instances of $ with $$

3) Prefix .each, .filter, and .text with '$' for example $(...).$text(foo).

4) Test the heck out of it. $$ is not as complex or nuanced as jQuery, intentionally. It covers the happy path only.
