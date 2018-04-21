import {BasicMuse} from './BasicMuse';
import {getNestedMuse, ITheory, setMuseMaker} from './ITheory';

export function getMuse(): ITheory {
  setMuseMaker(() => new BasicMuse());
  return getNestedMuse();
}

export class Transform {
  private _muse = getMuse();

  constructor(public examples: [any, any][]) {
    for (const eg of examples) {
      this._muse.train({
        input: {value: "" + eg[0]},
        output: {value: "" + eg[1]}
      });
    }
  }

  public apply(inputs: any[]): any[] {
    return inputs.map(input => this._muse.predict({value: "" + input}).value);
  }
}

export function main() {
  const examples = process.argv.slice(2);
  const bm = getMuse();
  if (examples.length === 0) {
    console.log("Usage:");
    console.log("  smalldata hi:HI there:THERE you:");
    console.log("  # result is YOU");
  }
  for (const example of examples) {
    const parts = example.split(':', 2);
    if (parts[1]) {
      bm.train({input: {value: parts[0]}, output: {value: parts[1]}});
    } else {
      console.log(parts[0], ':', bm.predict({value: parts[0]}).value);
    }
  }
}
