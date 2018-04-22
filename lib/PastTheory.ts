import {IExample, IOutput, IInput, ITheory} from './ITheory';

export class PastTheory implements ITheory {
  private _past = new Map<string, any>();

  public predict(inputs: IInput[]): IOutput[] {
    return inputs.map(input => {
      const curr = String(input.value);
      const guess = this._past.get(curr);
      if (guess) { return {value: guess}; }
      return {value: "", abstain: true};
    });
  }

  public train(examples: IExample[]): void {
    for (const example of examples) {
      this._past.set(example.input.value,
                     example.output.value);
    }
  }  

  public trainable(): boolean {
    return true;
  }

  public getName(): string {
    return "past";
  }
}

