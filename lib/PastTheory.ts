import {IExample, IOutput, IInput, ITheory} from './ITheory';

export class PastTheory implements ITheory {
  private _past = new Map<string, string>();

  public predict(input: IInput): IOutput {
    const curr = input.value;
    const guess = this._past.get(curr);
    if (guess) { return {value: guess}; }
    return {value: "", abstain: true};
  }

  public train(example: IExample): void {
    this._past.set(example.input.value,
                   example.output.value);
  }  

  public getName(): string {
    return "past";
  }
}

