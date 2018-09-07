import {flatten, getNestedMuse, IExample, IOutput, IInput, ITheory} from './ITheory';

export class FragmentTheory implements ITheory {
  private _subTheory: ITheory | null = null;

  public constructor(private _window: number) {
  }

  public async predict(inputs: IInput[]): Promise<IOutput[]> {
    const results: IOutput[] = [];
    for (const input of inputs) {
      if (!this._subTheory) {
        results.push({ value: '', abstain: true });
        continue;
      }
      const pre = flatten(input.value);
      const w = pre.length - this._window + 1;
      let result = "";
      let fail = false;
      for (let i=0; i<w; i++) {
        const [pred] = await this._subTheory.predict([{value: pre.substr(i, this._window)}]);
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
        results.push({ value: '', abstain: true });
      } else {
        results.push({ value: result, context: input.context });
      }
    }
    return results;
  }

  public async train(examples: IExample[]): Promise<void> {
    const nestedExamples: IExample[] = [];
    for (const example of examples) {
      const pre = flatten(example.input.value);
      const post = flatten(example.output.value);
      if (pre.length !== post.length) return;
      const w = Math.min(pre.length, post.length) - this._window;
      for (let i=0; i<w; i++) {
        const eg = {
          input: {value: pre.substr(i, this._window),
                  context: Object.assign(example.input.context || {}, {fragmented: true})},
          output: {value: post.substr(i, this._window)}
        }
        nestedExamples.push(eg);
      }
    }
    if (nestedExamples.length > 0) {
      if (!this._subTheory) {
        this._subTheory = getNestedMuse();
      }
      await this._subTheory.train(nestedExamples);
    }
  }

  public async leak(examples: IExample[], validation: IExample[]): Promise<boolean> {
    return false;
  }

  public trainable(): boolean {
    return true;
  }

  public reset() {
    if (this._subTheory) {
      this._subTheory.reset();
    }
  }

  public getName(): string {
    return "letter";
  }  
}

