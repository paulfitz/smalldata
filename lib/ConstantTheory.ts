import {IExample, IOutput, IInput, ITheory} from './ITheory';

export class ConstantTheory implements ITheory {
  private _value: any|null = null;

  public predict(inputs: IInput[]): IOutput[] {
    return inputs.map(input => {
      if (this._value) { return {value: this._value}; }
      return {value: "", abstain: true};
    });
  }

  public train(examples: IExample[]): void {
    for (const example of examples) {
      this._value = this._value || example.output.value;
    }
  }

  public trainable(): boolean {
    return true;
  }

  public reset() {
    this._value = null;
  }

  public getName(): string {
    return "constant";
  }
}
