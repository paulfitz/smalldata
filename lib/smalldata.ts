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
        state: {before: "" + eg[0]},
        after: {after: "" + eg[1]}
      });
    }
  }

  public apply(inputs: any[]): any[] {
    return inputs.map(input => this._muse.predict({before: "" + input}).after);
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
      bm.train({state: {before: parts[0]}, after: {after: parts[1]}});
    } else {
      console.log(parts[0], ':', bm.predict({before: parts[0]}).after);
    }
  }
}
