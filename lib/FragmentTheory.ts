import {getNestedMuse, IExample, IOutput, IState, ITheory} from './ITheory';

export class FragmentTheory implements ITheory {
  private _subTheory: ITheory | null = null;

  public constructor(private _window: number) {
  }

  public predict(state: IState): IOutput {
    if (!this._subTheory) {
      return { after: '', abstain: true };
    }
    const pre = state.before;
    const w = pre.length - this._window + 1;
    let result = "";
    let fail = false;
    for (let i=0; i<w; i++) {
      const pred = this._subTheory.predict({before: pre.substr(i, this._window)});
      if (pred.abstain || pred.after.length !== this._window) {
        fail = true;
        break;
      }
      if (i===w - 1) {
        result += pred.after;
      } else {
        result += pred.after.slice(0, 1);
      }
    }
    if (fail) {
      return { after: '', abstain: true };
    }
    return { after: result };
  }

  public train(example: IExample): void {
    const pre = example.state.before;
    const post = example.after.after;
    const w = Math.min(pre.length, post.length) - this._window;
    if (!this._subTheory) {
      this._subTheory = getNestedMuse();
    }
    for (let i=0; i<w; i++) {
      const eg = {
        state: {before: pre.substr(i, this._window)},
        after: {after: post.substr(i, this._window)}
      }
      this._subTheory.train(eg);
    }
  }

  public getName(): string {
    return "letter";
  }  
}

