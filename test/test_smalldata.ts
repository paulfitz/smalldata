import {assert, use} from "chai";
import * as chaiAsPromised from "chai-as-promised";

import {BasicMuse, IExample, Transform} from '../lib/smalldata';

use(chaiAsPromised);

function eg(x: string, y: string): IExample {
  return {
    state: {
      before: x
    },
    after: {
      after: y
    }
  };
}

describe("BasicMuse", () => {

  it("spots simple capitalization", () => {
    const bm = new BasicMuse();
    bm.train(eg("hi", "HI"));
    bm.train(eg("there", "THERE"));
    const test = eg("you", "YOU");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
    assert.equal("upper", bm.getName());
  });

  it("spots simple lowercase", () => {
    const bm = new BasicMuse();
    bm.train(eg("Hi", "hi"));
    bm.train(eg("THERE", "there"));
    const test = eg("YoU", "you");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
  });

  it("spots simple identity", () => {
    const bm = new BasicMuse();
    bm.train(eg("hi", "hi"));
    bm.train(eg("there", "there"));
    const test = eg("you", "you");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
  });

  it("spots simple replacement", () => {
    const bm = new BasicMuse();
    bm.train(eg("a", "apple"));
    bm.train(eg("b", "boat"));
    bm.train(eg("a", "apple"));
    bm.train(eg("a", "apple"));
    const test = eg("b", "boat");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
  });

  it("spots constant", () => {
    const bm = new BasicMuse();
    bm.train(eg("a", "goo"));
    bm.train(eg("b", "goo"));
    const test = eg("c", "goo");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
  });

  it("spots title case", () => {
    const bm = new BasicMuse();
    bm.train(eg("bob dole", "Bob Dole"));
    bm.train(eg("space monkey planet", "Space Monkey Planet"));
    const test = eg("for shame", "For Shame");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
  });

  it("spots initial capitalization", () => {
    const bm = new BasicMuse();
    bm.train(eg("bob dole", "Bob dole"));
    bm.train(eg("space monkey planet", "Space monkey planet"));
    const test = eg("for shame", "For shame");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
  });

});


describe("SuffixTool", () => {

  it("spots simple suffix", () => {
    const bm = new BasicMuse();
    bm.train(eg("a", "a!"));
    bm.train(eg("b", "b!"));
    bm.train(eg("c", "c!"));
    const test = eg("d", "d!");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
  });

  it("spots capitalize plus suffix", () => {
    const bm = new BasicMuse();
    bm.train(eg("a", "A!"));
    bm.train(eg("b", "B!"));
    bm.train(eg("c", "C!"));
    const test = eg("d", "D!");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
  });

});

describe("PrefixTool", () => {

  it("spots simple prefix", () => {
    const bm = new BasicMuse();
    bm.train(eg("a", "!a"));
    bm.train(eg("b", "!b"));
    bm.train(eg("c", "!c"));
    const test = eg("d", "!d");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
  });

  it("spots capitalize plus prefix", () => {
    const bm = new BasicMuse();
    bm.train(eg("a", "!A"));
    bm.train(eg("b", "!B"));
    bm.train(eg("c", "!C"));
    const test = eg("d", "!D");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
  });

  it("spots capitalize plus prefix plus suffix", () => {
    const bm = new BasicMuse();
    bm.train(eg("a", "(A)"));
    bm.train(eg("b", "(B)"));
    bm.train(eg("c", "(C)"));
    bm.train(eg("d", "(D)"));
    const test = eg("e", "(E)");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
  });

});


describe("RemovalTool", () => {

  it("spots a dropped letter", () => {
    const bm = new BasicMuse();
    bm.train(eg("aaaab", "aaaa"));
    bm.train(eg("aaba", "aaa"));
    bm.train(eg("ba", "a"));
    const test = eg("abab", "aa");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
  });

  it("spots a dropped letter among many", () => {
    const bm = new BasicMuse();
    bm.train(eg("hello world", "helloworld"));
    bm.train(eg("free the space monkeys", "freethespacemonkeys"));
    bm.train(eg("sandwich", "sandwich"));
    const test = eg("    snack time    ", "snacktime");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
  });

  it("spots dropped letters and capitalization and suffix", () => {
    const bm = new BasicMuse();
    bm.train(eg("hello world!", "hellwrld!"));
    bm.train(eg("free the space monkeys", "freethespacemnkeys!"));
    bm.train(eg("sandwich", "sandwich!"));
    const test = eg("pool time", "pltime!");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
  });

});


describe("TrimTool", () => {

  it("spots trimming", () => {
    const bm = new BasicMuse();
    bm.train(eg("  bob dole", "bob dole"));
    bm.train(eg("space monkey planet  ", "space monkey planet"));
    const test = eg("  for shame  ", "for shame");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
  });

  it("spots trimming with capitalization", () => {
    const bm = new BasicMuse();
    bm.train(eg("  bob dole", "BOB DOLE"));
    bm.train(eg("space monkey planet  ", "SPACE MONKEY PLANET"));
    const test = eg("  for shame  ", "FOR SHAME");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
  });

});


describe("FragmentTheory", () => {

  it("spots character replacement", () => {
    const bm = new BasicMuse();
    bm.train(eg("aaaabbbb", "....----"));
    bm.train(eg("abababab", ".-.-.-.-"));
    bm.train(eg("aabb", "..--"));
    const test = eg("aaaab", "....-");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
  });

  it("spots single character replacement", () => {
    const bm = new BasicMuse();
    bm.train(eg("grew", "gre!"));
    bm.train(eg("wild", "!ild"));
    bm.train(eg("wow", "!o!"));
    bm.train(eg("warm", "!arm"));
    const test = eg("beware", "be!are");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
  });

  it("spots single character replacement", () => {
    const bm = new BasicMuse();
    bm.train(eg("grew", "gre!"));
    bm.train(eg("wild", "!ild"));
    bm.train(eg("wow", "!o!"));
    bm.train(eg("warm", "!arm"));
    const test = eg("beware", "be!are");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
  });

  it("spots single character replacement with capitalization", () => {
    const bm = new BasicMuse();
    bm.train(eg("grew", "GRE!"));
    bm.train(eg("wild", "!ILD"));
    bm.train(eg("wow", "!O!"));
    bm.train(eg("warm", "!ARM"));
    const test = eg("beware", "BE!ARE");
    const pred = bm.predict(test.state);
    assert.deepEqual(test.after, pred);
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
