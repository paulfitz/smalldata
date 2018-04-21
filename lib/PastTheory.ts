import {IExample, IOutput, IState, ITheory} from './ITheory';

export class PastTheory implements ITheory {
  private _past = new Map<string, string>();

  public predict(state: IState): IOutput {
    const curr = state.before;
    const guess = this._past.get(curr);
    if (guess) { return {after: guess}; }
    return {after: "", abstain: true};
  }

  public train(example: IExample): void {
    this._past.set(example.state.before,
                   example.after.after);
  }  

  public getName(): string {
    return "past";
  }
}

