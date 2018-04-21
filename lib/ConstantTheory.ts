import {IExample, IOutput, IState, ITheory} from './ITheory';

export class ConstantTheory implements ITheory {
  private _value: string|null = null;

  public predict(state: IState): IOutput {
    if (this._value) { return {after: this._value}; }
    return {after: "", abstain: true};
  }

  public train(example: IExample): void {
    this._value = this._value || example.after.after;
  }  

  public getName(): string {
    return "constant";
  }
}

