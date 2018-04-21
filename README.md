[![Build Status](https://travis-ci.org/paulfitz/smalldata.svg?branch=master)](https://travis-ci.org/paulfitz/smalldata)
[![npm version](https://badge.fury.io/js/smalldata.svg)](https://badge.fury.io/js/smalldata)

Guess data transformations.  Just a toy as yet.  See tests for transformations implemented.

```typescript
var smalldata = require("smalldata");
var transform = new smalldata.Transform([
      [" jane tzu", "Jane Tzu!"],
      ["tom smith ", "Tom Smith!"],
      ["mr pickle", "Mr Pickle!"],
    ]);
console.log(transform.apply(["  jeff thing ", "garden hose"]));
// shows "Jeff Thing!", "Garden Hose!"
```
