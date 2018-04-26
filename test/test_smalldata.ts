import {assert, use} from "chai";
import * as chaiAsPromised from "chai-as-promised";

import {addTheory, getMuse, IExample, IInput, IOutput, mainCore,
  SimpleTheory, Transform, getProfiler} from '../lib/smalldata';

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

function egs(examples: Array<[any, any]>): IExample[] {
  return examples.map(([x, y]) => ({
    input: {
      value: x
    },
    output: {
      value: y
    }
  }));
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
    bm.train(egs([["hi", "HI"],
                  ["there", "THERE"]]));
    const test = eg("you", "YOU");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
    assert.equal("upper", bm.getName());
  });

  it("spots simple lowercase", () => {
    const bm = getMuse();
    bm.train(egs([["Hi", "hi"],
                  ["THERE", "there"]]));
    const test = eg("YoU", "you");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots simple identity", () => {
    const bm = getMuse();
    bm.train(egs([["hi", "hi"],
                  ["there", "there"]]));
    const test = eg("you", "you");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots simple replacement", () => {
    const bm = getMuse();
    bm.train(egs([["a", "apple"],
                  ["b", "boat"],
                  ["a", "apple"]]));
    const test = eg("b", "boat");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots constant", () => {
    const bm = getMuse();
    bm.train(egs([["a", "goo"],
                  ["b", "goo"]]));
    const test = eg("c", "goo");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots title case", () => {
    const bm = getMuse();
    bm.train(egs([["bob dole", "Bob Dole"],
                  ["space monkey planet", "Space Monkey Planet"]]));
    const test = eg("for shame", "For Shame");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots initial capitalization", () => {
    const bm = getMuse();
    bm.train(egs([["bob dole", "Bob dole"],
                  ["space monkey planet", "Space monkey planet"]]));
    const test = eg("for shame", "For shame");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

});


describe("SuffixTool", () => {

  it("spots simple suffix", () => {
    const bm = getMuse();
    bm.train(egs([["a", "a!"],
                  ["b", "b!"],
                  ["c", "c!"]]));
    const test = eg("d", "d!");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots capitalize plus suffix", () => {
    const bm = getMuse();
    bm.train(egs([["a", "A!"],
                  ["b", "B!"],
                  ["c", "C!"]]));
    const test = eg("d", "D!");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots simple suffix quickly", () => {
    const results = mainCore(["hi:hi.", "you:"]);
    assert.deepEqual(results, [["you", "you."]]);
  });

  it("spots suffix plus capitalization quickly", () => {
    const results = mainCore(["hi:Hi.", "you:"]);
    assert.deepEqual(results, [["you", "You."]]);
  });

});

describe("PrefixTool", () => {

  it("spots simple prefix", () => {
    const bm = getMuse();
    bm.train(egs([["a", "!a"],
                  ["b", "!b"],
                  ["c", "!c"]]));
    const test = eg("d", "!d");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots capitalize plus prefix", () => {
    const bm = getMuse();
    bm.train(egs([["a", "!A"],
                  ["b", "!B"],
                  ["c", "!C"]]));
    const test = eg("d", "!D");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots capitalize plus prefix plus suffix", () => {
    const bm = getMuse();
    bm.train(egs([["a", "(A)"],
                  ["b", "(B)"],
                  ["c", "(C)"],
                  ["d", "(D)"]]));
    const test = eg("e", "(E)");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots simple prefix quickly", () => {
    const results = mainCore(["hi:=hi", "you:"]);
    assert.deepEqual(results, [["you", "=you"]]);
  });

  it("spots prefix plus capitalization quickly", () => {
    const results = mainCore(["hi:=Hi", "you:"]);
    assert.deepEqual(results, [["you", "=You"]]);
  });

});


describe("RemovalTool", () => {

  it("spots a dropped letter", () => {
    const bm = getMuse();
    bm.train(egs([["aaaab", "aaaa"],
                  ["aaba", "aaa"],
                  ["ba", "a"]]));
    const test = eg("abab", "aa");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots a dropped letter among many", () => {
    const bm = getMuse();
    bm.train(egs([["hello world", "helloworld"],
                  ["free the space monkeys", "freethespacemonkeys"],
                  ["sandwich", "sandwich"]]));
    const test = eg("    snack time    ", "snacktime");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots dropped letters and capitalization and suffix", () => {
    const bm = getMuse();
    bm.train(egs([["hello world!", "hellwrld!"],
                  ["sandwich", "sandwich!"]]));
    const test = eg("pool time", "pltime!");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

});


describe("TrimTool", () => {

  it("spots trimming", () => {
    const bm = getMuse();
    bm.train(egs([["  bob dole", "bob dole"],
                  ["space monkey planet  ", "space monkey planet"]]));
    const test = eg("  for shame  ", "for shame");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots trimming with capitalization", () => {
    const bm = getMuse();
    bm.train(egs([["  bob dole", "BOB DOLE"],
                  ["space monkey planet  ", "SPACE MONKEY PLANET"]]));
    const test = eg("  for shame  ", "FOR SHAME");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

});


describe("FragmentTheory", () => {

  it("spots character replacement", () => {
    const bm = getMuse();
    bm.train(egs([["aaaabbbb", "....----"],
                  ["aabb", "..--"]]));
    const test = eg("aaaab", "....-");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots single character replacement", () => {
    const bm = getMuse();
    bm.train(egs([["grew", "gre!"],
                  ["wild", "!ild"],
                  ["wow", "!o!"],
                  ["warm", "!arm"]]));
    const test = eg("beware", "be!are");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots single character replacement", () => {
    const bm = getMuse();
    bm.train(egs([["grew", "gre!"],
                  ["wow", "!o!"],
                  ["warm", "!arm"]]));
    const test = eg("beware", "be!are");
    const pred = bm.predict(inputs(test));
    assert.deepEqual(outputs(test), pred);
  });

  it("spots single character replacement with capitalization", () => {
    const bm = getMuse();
    bm.train(egs([["grew", "GRE!"],
                  ["wow", "!O!"],
                  ["warm", "!ARM"]]));
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


describe("Command Line", () => {

  it("can do capitalization no sweat", () => {
    const results = mainCore(["hi:HI", "you:"]);
    assert.deepEqual(results, [["you", "YOU"]]);
  });

  it("can do other capitalization no sweat", () => {
    const results = mainCore(["hi:Hi", "you:"]);
    assert.deepEqual(results, [["you", "You"]]);
  });

  it("can do capitalization plus prefix suffix with a little sweat", () => {
    const results = mainCore(["hi:...Hi!!!", "you:...You!!!", "green:"]);
    assert.deepEqual(results, [["green", "...Green!!!"]]);
  });

  it("can do space monkey example in README", () => {
    const results = mainCore(["space:[SPACE]", "monkey:[MONKEY]", "dream:", "frog:"]);
    assert.deepEqual(results, [["dream", "[DREAM]"], ["frog", "[FROG]"]]);
  });

});
