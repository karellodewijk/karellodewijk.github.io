# canvas-webgl
A canvas2d api implementation using webgl and javascript

Currently it supports most features, but many of them have bugs. 

Canvas2D api examples:

http://karellodewijk.github.io/canvas-webgl/test/canvas_tests1.html

http://karellodewijk.github.io/canvas-webgl/test/canvas_tests2.html

http://karellodewijk.github.io/canvas-webgl/test/canvas_tests3.html

Test suites:

http://karellodewijk.github.io/canvas-webgl/CanvasMark/

http://karellodewijk.github.io/canvas-webgl/test_suite/tests/index.html

http://karellodewijk.github.io/canvas-webgl/perftest/

Caveats:

- Text rendering basically uses Canvas2D to render and then copies the result over to the webgl context, which is mostly an excercice in futility. But truly implementing text rendering in webgl would be a huge undertaking.
- Webgl can not put images with width or height larger than max texture size (typically 4096px) directly into a texture, so I use canvas2D to carve them up at a big performance hit.

Missing features:

- Hit regions except isPointInPath/isPointInStroke
- drawFocusIfNeeded, scrollPathIntoView
- Ellipse support in arcTo
- There is only 1 winding mode, which is whatever earcut does.

Used libraries:

Major ones are:
- https://github.com/deanm/css-color-parser-js to parse css color strings. 
- https://github.com/mapbox/earcut for triangulation.

There are some smaller bits, attribuited in the source code
