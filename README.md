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

Extensible.  You can add your own theories that will be used when data justifies them.
They will combine with existing theories.

```typescript
import {addTheory, Transform} from 'smalldata';

function zipifyUnitedStates(x: any) {
  const s = String(x);
  return "00000".substr(0, 5 - s.length) + s;
}
addTheory(() => new SimpleTheory(zipifyUnitedStates, 'zip-us'));

const tr = new Transform([
 ["02139", "zipcode 02139"],
 [2138, "zipcode 02138"],
 ["29123", "zipcode 29123"],
 ["10000", "zipcode 10000"],
]);
const result = tr.apply([7149]);
assert.deepEqual(["zipcode 07149"], result);
```
