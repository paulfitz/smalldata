import {assert, use} from "chai";
import * as chaiAsPromised from "chai-as-promised";

import {addTheory, getMuse, IExample, IInput, IOutput,
        SimpleTheory, Transform} from '../lib/smalldata';

use(chaiAsPromised);

function eg(x: string, y: string): IExample[] {
  return [{
    input: {
      value: x
    },
    output: {
      value: y
    }
  }];
}

function inputs(examples: IExample[]): IInput[] {
  return examples.map(example => example.input);
}

function outputs(examples: IExample[]): IOutput[] {
  return examples.map(example => example.output);
}

describe("BasicMuse", () => {

  it("spots simple capitalization", () => {
    const bm = getMuse();
    bm.train(eg("hi", "HI"));
    bm.train(eg("there", "THERE"));
    const test = eg("you", "YOU");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
    assert.equal("upper", bm.getName());
  });

  it("spots simple lowercase", () => {
    const bm = getMuse();
    bm.train(eg("Hi", "hi"));
    bm.train(eg("THERE", "there"));
    const test = eg("YoU", "you");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots simple identity", () => {
    const bm = getMuse();
    bm.train(eg("hi", "hi"));
    bm.train(eg("there", "there"));
    const test = eg("you", "you");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots simple replacement", () => {
    const bm = getMuse();
    bm.train(eg("a", "apple"));
    bm.train(eg("b", "boat"));
    bm.train(eg("a", "apple"));
    bm.train(eg("a", "apple"));
    const test = eg("b", "boat");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots constant", () => {
    const bm = getMuse();
    bm.train(eg("a", "goo"));
    bm.train(eg("b", "goo"));
    const test = eg("c", "goo");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots title case", () => {
    const bm = getMuse();
    bm.train(eg("bob dole", "Bob Dole"));
    bm.train(eg("space monkey planet", "Space Monkey Planet"));
    const test = eg("for shame", "For Shame");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots initial capitalization", () => {
    const bm = getMuse();
    bm.train(eg("bob dole", "Bob dole"));
    bm.train(eg("space monkey planet", "Space monkey planet"));
    const test = eg("for shame", "For shame");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

});


describe("SuffixTool", () => {

  it("spots simple suffix", () => {
    const bm = getMuse();
    bm.train(eg("a", "a!"));
    bm.train(eg("b", "b!"));
    bm.train(eg("c", "c!"));
    const test = eg("d", "d!");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots capitalize plus suffix", () => {
    const bm = getMuse();
    bm.train(eg("a", "A!"));
    bm.train(eg("b", "B!"));
    bm.train(eg("c", "C!"));
    const test = eg("d", "D!");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

});

describe("PrefixTool", () => {

  it("spots simple prefix", () => {
    const bm = getMuse();
    bm.train(eg("a", "!a"));
    bm.train(eg("b", "!b"));
    bm.train(eg("c", "!c"));
    const test = eg("d", "!d");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots capitalize plus prefix", () => {
    const bm = getMuse();
    bm.train(eg("a", "!A"));
    bm.train(eg("b", "!B"));
    bm.train(eg("c", "!C"));
    const test = eg("d", "!D");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots capitalize plus prefix plus suffix", () => {
    const bm = getMuse();
    bm.train(eg("a", "(A)"));
    bm.train(eg("b", "(B)"));
    bm.train(eg("c", "(C)"));
    bm.train(eg("d", "(D)"));
    const test = eg("e", "(E)");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

});


describe("RemovalTool", () => {

  it("spots a dropped letter", () => {
    const bm = getMuse();
    bm.train(eg("aaaab", "aaaa"));
    bm.train(eg("aaba", "aaa"));
    bm.train(eg("ba", "a"));
    const test = eg("abab", "aa");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots a dropped letter among many", () => {
    const bm = getMuse();
    bm.train(eg("hello world", "helloworld"));
    bm.train(eg("free the space monkeys", "freethespacemonkeys"));
    bm.train(eg("sandwich", "sandwich"));
    const test = eg("    snack time    ", "snacktime");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots dropped letters and capitalization and suffix", () => {
    const bm = getMuse();
    bm.train(eg("hello world!", "hellwrld!"));
    bm.train(eg("free the space monkeys", "freethespacemnkeys!"));
    bm.train(eg("sandwich", "sandwich!"));
    const test = eg("pool time", "pltime!");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

});


describe("TrimTool", () => {

  it("spots trimming", () => {
    const bm = getMuse();
    bm.train(eg("  bob dole", "bob dole"));
    bm.train(eg("space monkey planet  ", "space monkey planet"));
    const test = eg("  for shame  ", "for shame");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots trimming with capitalization", () => {
    const bm = getMuse();
    bm.train(eg("  bob dole", "BOB DOLE"));
    bm.train(eg("space monkey planet  ", "SPACE MONKEY PLANET"));
    const test = eg("  for shame  ", "FOR SHAME");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

});


describe("FragmentTheory", () => {

  it("spots character replacement", () => {
    const bm = getMuse();
    bm.train(eg("aaaabbbb", "....----"));
    bm.train(eg("abababab", ".-.-.-.-"));
    bm.train(eg("aabb", "..--"));
    const test = eg("aaaab", "....-");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots single character replacement", () => {
    const bm = getMuse();
    bm.train(eg("grew", "gre!"));
    bm.train(eg("wild", "!ild"));
    bm.train(eg("wow", "!o!"));
    bm.train(eg("warm", "!arm"));
    const test = eg("beware", "be!are");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots single character replacement", () => {
    const bm = getMuse();
    bm.train(eg("grew", "gre!"));
    bm.train(eg("wild", "!ild"));
    bm.train(eg("wow", "!o!"));
    bm.train(eg("warm", "!arm"));
    const test = eg("beware", "be!are");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots single character replacement with capitalization", () => {
    const bm = getMuse();
    bm.train(eg("grew", "GRE!"));
    bm.train(eg("wild", "!ILD"));
    bm.train(eg("wow", "!O!"));
    bm.train(eg("warm", "!ARM"));
    const test = eg("beware", "BE!ARE");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });
});

describe("Transform", () => {

  it("uses examples correctly", () => {
    const tr = new Transform([
      ["tom smith ", "Tom Smith"],
      [" hans struden", "Hans Struden"],
      ["gold goldy", "Gold Goldy"],
    ]);
    const result = tr.apply(["  jeff thing ", "garden hose"]);
    assert.deepEqual(["Jeff Thing", "Garden Hose"], result);
  });

});


describe("types", () => {

  it("tolerates non-strings", () => {
    const tr = new Transform([
      ["tom! ", "tom"],
      ["g r e en!", "green"],
      [1, 1],
      [null, null],
    ]);
    const result = tr.apply(["  jeff thing! ", "garden hose"]);
    assert.deepEqual(["jeffthing", "gardenhose"], result);
  });
});


describe("addTheory", () => {

  it("can plugin extra theories", () => {

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
    const result = tr.apply([7149, "50123"]);
    assert.deepEqual(["zipcode 07149", "zipcode 50123"], result);
  });

});
