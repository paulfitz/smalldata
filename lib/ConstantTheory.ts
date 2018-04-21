import {IExample, IOutput, IInput, ITheory} from './ITheory';

export class ConstantTheory implements ITheory {
  private _value: string|null = null;

  public predict(input: IInput): IOutput {
    if (this._value) { return {value: this._value}; }
    return {value: "", abstain: true};
  }

  public train(example: IExample): void {
    this._value = this._value || example.output.value;
  }  

  public getName(): string {
    return "constant";
  }
}

