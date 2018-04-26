import {assert, use} from "chai";
import * as chaiAsPromised from "chai-as-promised";

import {addTheory, getMuse, IExample, IInput, IOutput, mainCore, resetTheories,
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

function val(units: Array<{value: any}>) {
  return units.map(unit => unit.value);
}

beforeEach(() => {
  resetTheories();
});

describe("BasicMuse", () => {

  it("spots simple capitalization", async () => {
    const bm = getMuse();
    await bm.train(egs([["hi", "HI"],
                        ["there", "THERE"]]));
    const test = eg("you", "YOU");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
    assert.equal("upper", bm.getName());
  });
  
  it("spots simple lowercase", async () => {
    const bm = getMuse();
    await bm.train(egs([["Hi", "hi"],
                        ["THERE", "there"]]));
    const test = eg("YoU", "you");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
  });

  it("spots simple identity", async () => {
    const bm = getMuse();
    await bm.train(egs([["hi", "hi"],
                        ["there", "there"]]));
    const test = eg("you", "you");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
  });

  it("spots simple replacement", async () => {
    const bm = getMuse();
    await bm.train(egs([["a", "apple"],
                        ["b", "boat"],
                        ["a", "apple"]]));
    const test = eg("b", "boat");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
  });

  it("spots constant", async () => {
    const bm = getMuse();
    await bm.train(egs([["a", "goo"],
                        ["b", "goo"]]));
    const test = eg("c", "goo");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
  });

  it("spots title case", async () => {
    const bm = getMuse();
    await bm.train(egs([["bob dole", "Bob Dole"],
                        ["space monkey planet", "Space Monkey Planet"]]));
    const test = eg("for shame", "For Shame");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
  });

  it("spots initial capitalization", async () => {
    const bm = getMuse();
    await bm.train(egs([["bob dole", "Bob dole"],
                        ["space monkey planet", "Space monkey planet"]]));
    const test = eg("for shame", "For shame");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
  });

});


describe("SuffixTool", () => {

  it("spots simple suffix", async () => {
    const bm = getMuse();
    await bm.train(egs([["a", "a!"],
                        ["b", "b!"],
                        ["c", "c!"]]));
    const test = eg("d", "d!");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
  });

  it("spots capitalize plus suffix", async () => {
    const bm = getMuse();
    await bm.train(egs([["a", "A!"],
                        ["b", "B!"],
                        ["c", "C!"]]));
    const test = eg("d", "D!");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
  });

  it("spots simple suffix quickly", async () => {
    const results = await mainCore(["hi:hi.", "you:"]);
    assert.deepEqual(results, [["you", "you."]]);
  });

  it("spots suffix plus capitalization quickly", async () => {
    const results = await mainCore(["hi:Hi.", "you:"]);
    assert.deepEqual(results, [["you", "You."]]);
  });

});

describe("PrefixTool", () => {

  it("spots simple prefix", async () => {
    const bm = getMuse();
    await bm.train(egs([["a", "!a"],
                        ["b", "!b"],
                        ["c", "!c"]]));
    const test = eg("d", "!d");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
  });

  it("spots capitalize plus prefix", async () => {
    const bm = getMuse();
    await bm.train(egs([["a", "!A"],
                        ["b", "!B"],
                        ["c", "!C"]]));
    const test = eg("d", "!D");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
  });

  it("spots capitalize plus prefix plus suffix", async () => {
    const bm = getMuse();
    await bm.train(egs([["a", "(A)"],
                        ["b", "(B)"],
                        ["c", "(C)"],
                        ["d", "(D)"]]));
    const test = eg("e", "(E)");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
  });

  it("spots simple prefix quickly", async () => {
    const results = await mainCore(["hi:=hi", "you:"]);
    assert.deepEqual(results, [["you", "=you"]]);
  });

  it("spots prefix plus capitalization quickly", async () => {
    const results = await mainCore(["hi:=Hi", "you:"]);
    assert.deepEqual(results, [["you", "=You"]]);
  });

});


describe("RemovalTool", () => {

  it("spots a dropped letter", async () => {
    const bm = getMuse();
    await bm.train(egs([["aaaab", "aaaa"],
                        ["aaba", "aaa"],
                        ["ba", "a"]]));
    const test = eg("abab", "aa");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
  });

  it("spots a dropped letter among many", async () => {
    const bm = getMuse();
    await bm.train(egs([["hello world", "helloworld"],
                        ["free the space monkeys", "freethespacemonkeys"],
                        ["sandwich", "sandwich"]]));
    const test = eg("    snack time    ", "snacktime");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
  });

  it("spots dropped letters and capitalization and suffix", async () => {
    const bm = getMuse();
    await bm.train(egs([["hello world!", "hellwrld!"],
                        ["sandwich", "sandwich!"]]));
    const test = eg("pool time", "pltime!");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
  });

});


describe("TrimTool", () => {

  it("spots trimming", async () => {
    const bm = getMuse();
    await bm.train(egs([["  bob dole", "bob dole"],
                        ["space monkey planet  ", "space monkey planet"]]));
    const test = eg("  for shame  ", "for shame");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
  });

  it("spots trimming with capitalization", async () => {
    const bm = getMuse();
    await bm.train(egs([["  bob dole", "BOB DOLE"],
                        ["space monkey planet  ", "SPACE MONKEY PLANET"]]));
    const test = eg("  for shame  ", "FOR SHAME");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
  });

});


describe("FragmentTheory", () => {

  it("spots character replacement", async () => {
    const bm = getMuse();
    await bm.train(egs([["aaaabbbb", "....----"],
                        ["aabb", "..--"]]));
    const test = eg("aaaab", "....-");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
  });

  it("spots single character replacement", async () => {
    const bm = getMuse();
    await bm.train(egs([["grew", "gre!"],
                        ["wild", "!ild"],
                        ["wow", "!o!"],
                        ["warm", "!arm"]]));
    const test = eg("beware", "be!are");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
  });

  it("spots single character replacement", async () => {
    const bm = getMuse();
    await bm.train(egs([["grew", "gre!"],
                        ["wow", "!o!"],
                        ["warm", "!arm"]]));
    const test = eg("beware", "be!are");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
  });

  it("spots single character replacement with capitalization", async () => {
    const bm = getMuse();
    await bm.train(egs([["grew", "GRE!"],
                        ["wow", "!O!"],
                        ["warm", "!ARM"]]));
    const test = eg("beware", "BE!ARE");
    const pred = await bm.predict(inputs(test));
    assert.deepEqual(val(outputs(test)), val(pred));
  });
});

describe("Transform", () => {

  it("uses examples correctly", async () => {
    const tr = new Transform([
      ["tom smith ", "Tom Smith"],
      [" hans struden", "Hans Struden"],
      ["gold goldy", "Gold Goldy"],
    ]);
    const result = await tr.apply(["  jeff thing ", "garden hose"]);
    assert.deepEqual(["Jeff Thing", "Garden Hose"], result);
  });

});


describe("types", () => {

  it("tolerates non-strings", async () => {
    const tr = new Transform([
      ["tom! ", "tom"],
      ["g r e en!", "green"],
      [1, 1],
      [null, null],
    ]);
    const result = await tr.apply(["  jeff thing! ", "garden hose"]);
    assert.deepEqual(["jeffthing", "gardenhose"], result);
  });
});


describe("lists", () => {
  it("can select from a dict", async () => {
    const tr = new Transform([
      [{a: "hi", b: "there"}, "hi"],
      [{a: "high", b: "five"}, "high"],
    ]);
    assert.deepEqual(await tr.apply([{a: "say", b: "cheese"}]),
                     ["say"]);
  })

  it("can select from a dict and transform a bit", async () => {
    const tr = new Transform([
      [{a: "hi", b: "there"}, "there!"],
      [{a: "high", b: "five"}, "five!"],
    ]);
    assert.deepEqual(await tr.apply([{a: "say", b: "cheese"}]),
                     ["cheese!"]);
  })
});


describe("addTheory", () => {

  it("can plugin extra theories", async () => {

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
    const result = await tr.apply([7149, "50123"]);
    assert.deepEqual(["zipcode 07149", "zipcode 50123"], result);
  });

});


describe("Command Line", () => {

  it("can do capitalization no sweat", async () => {
    const results = await mainCore(["hi:HI", "you:"]);
    assert.deepEqual(results, [["you", "YOU"]]);
  });

  it("can do other capitalization no sweat", async () => {
    const results = await mainCore(["hi:Hi", "you:"]);
    assert.deepEqual(results, [["you", "You"]]);
  });

  it("can do capitalization plus prefix suffix with a little sweat", async () => {
    const results = await mainCore(["hi:...Hi!!!", "you:...You!!!", "green:"]);
    assert.deepEqual(results, [["green", "...Green!!!"]]);
  });

  it("can do space monkey example in README", async () => {
    const results = await mainCore(["space:[SPACE]", "monkey:[MONKEY]", "dream:", "frog:"]);
    assert.deepEqual(results, [["dream", "[DREAM]"], ["frog", "[FROG]"]]);
  });

});
