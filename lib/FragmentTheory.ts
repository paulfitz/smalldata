import {getNestedMuse, IExample, IOutput, IInput, ITheory} from './ITheory';

export class FragmentTheory implements ITheory {
  private _subTheory: ITheory | null = null;

  public constructor(private _window: number) {
  }

  public predict(inputs: IInput[]): IOutput[] {
    return inputs.map(input => {
      if (!this._subTheory) {
        return { value: '', abstain: true };
      }
      const pre = String(input.value);
      const w = pre.length - this._window + 1;
      let result = "";
      let fail = false;
      for (let i=0; i<w; i++) {
        const [pred] = this._subTheory.predict([{value: pre.substr(i, this._window)}]);
        if (pred.abstain || pred.value.length !== this._window) {
          fail = true;
          break;
        }
        if (i===w - 1) {
          result += pred.value;
        } else {
          result += pred.value.slice(0, 1);
        }
      }
      if (fail) {
        return { value: '', abstain: true };
      }
      return { value: result };
    });
  }

  public train(examples: IExample[]): void {
    for (const example of examples) {
      const pre = String(example.input.value);
      const post = String(example.output.value);
      const w = Math.min(pre.length, post.length) - this._window;
      if (!this._subTheory) {
        this._subTheory = getNestedMuse();
      }
      for (let i=0; i<w; i++) {
        const eg = {
          input: {value: pre.substr(i, this._window)},
          output: {value: post.substr(i, this._window)}
        }
        this._subTheory.train([eg]);
      }
    }
  }

  public trainable(): boolean {
    return true;
  }

  public getName(): string {
    return "letter";
  }  
}

