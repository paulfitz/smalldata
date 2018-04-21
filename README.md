Guess data transformations.  Just a toy as yet.  See tests for transformations implemented.

```typescript
var transform = new smalldata.Transform([
      [" jane tzu", "Jane Tzu!"],
      ["tom smith ", "Tom Smith!"],
      ["mr pickle", "Mr Pickle!"],
    ]);
console.log(transform.apply(["  jeff thing ", "garden hose"]));
// shows "Jeff Thing!", "Garden Hose!"
```
