import {BasicMuse} from './BasicMuse';
import {getNestedMuse, IExample, ITheory, setMuseMaker} from './ITheory';

export * from './ITheory';
export {SimpleTheory} from './SimpleTheory';
export {ITransform, TransformTheory} from './DictTheory';

export function getMuse(): ITheory {
  setMuseMaker(() => new BasicMuse());
  return getNestedMuse();
}

export class Transform {
  private _muse = getMuse();
  private _train: Promise<void>;

  constructor(public examples: [any, any][]) {
    this._train = this._muse.train(examples.map(eg => ({
      input: {value: eg[0]},
      output: {value: eg[1]}
    })));
  }

  public async apply(inputs: any[]): Promise<any[]> {
    await this._train;
    const results = await this._muse.predict(inputs.map(input => ({value: input})));
    return results.map(x => x.value);
  }
}

export async function mainCore(examples: string[]): Promise<Array<[string, any]>> {
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
  await bm.train(trainingData);
  const results = await bm.predict(testData.map(value => ({value})));
  return testData.map((value, index) => [value, results[index].value] as [string, any]);
}

export function main() {
  const examples = process.argv.slice(2);
  if (examples.length === 0) {
    console.log("Usage:");
    console.log("  smalldata hi:HI there:THERE you:");
    console.log("  # result is YOU");
  }
  mainCore(examples).then(results => {
    for (const [key, val] of results) {
      console.log(`${key}:${val}`);
    }
  });
}
