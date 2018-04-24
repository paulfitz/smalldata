import {BasicMuse} from './BasicMuse';
import {getNestedMuse, IExample, ITheory, setMuseMaker} from './ITheory';

export * from './ITheory';
export {SimpleTheory} from './SimpleTheory';

export function getMuse(): ITheory {
  setMuseMaker(() => new BasicMuse());
  return getNestedMuse();
}

export class Transform {
  private _muse = getMuse();

  constructor(public examples: [any, any][]) {
    this._muse.train(examples.map(eg => ({
      input: {value: eg[0]},
      output: {value: eg[1]}
    })));
  }

  public apply(inputs: any[]): any[] {
    return this._muse.predict(inputs.map(input => ({value: "" + input}))).map(x => x.value);
  }
}

export function mainCore(examples: string[]) {
  const results = new Array<[string, string]>();
  const trainingData = new Array<IExample>();
  const testData = new Array<string>();
  for (const example of examples) {
    const parts = example.split(':', 2);
    if (parts[1]) {
      trainingData.push({input: {value: parts[0]}, output: {value: parts[1]}});
    } else {
      testData.push(parts[0]);
    }
  }
  const bm = getMuse();
  bm.train(trainingData);
  for (const test of testData) {
      results.push([test, bm.predict([{value: test}])[0].value]);
  }
  return results;
}

export function main() {
  const examples = process.argv.slice(2);
  if (examples.length === 0) {
    console.log("Usage:");
    console.log("  smalldata hi:HI there:THERE you:");
    console.log("  # result is YOU");
  }
  const results = mainCore(examples);
  for (const [key, val] of results) {
    console.log(`${key}:${val}`);
  }
}
