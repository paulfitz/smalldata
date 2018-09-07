import {IExample, IOutput, IInput, ITheory} from './ITheory';

export class PastTheory implements ITheory {
  private _past = new Map<string, any>();

  public reset() {
    this._past.clear();
  }

  public async predict(inputs: IInput[]): Promise<IOutput[]> {
    return inputs.map(input => {
      const curr = String(input.value);
      const guess = this._past.get(curr);
      if (guess) { return {value: guess}; }
      return {value: "", abstain: true};
    });
  }

  public async train(examples: IExample[]): Promise<void> {
    for (const example of examples) {
      this._past.set(example.input.value,
                     example.output.value);
    }
  }  

  public async leak(examples: IExample[], validation: IExample[]): Promise<boolean> {
    return false;
  }

  public trainable(): boolean {
    return true;
  }

  public getName(): string {
    return "past";
  }
}

