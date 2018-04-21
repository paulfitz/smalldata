import {IExample, IOutput, IInput, ITheory} from './ITheory';

export class SimpleTheory implements ITheory {
  constructor(public fn: (x: string) => string, public name: string) {
  }
  public predict(input: IInput): IOutput {
    return { value: this.fn(input.value) };
  }
  public train(example: IExample): void {
    //
  }
  public getName(): string {
    return this.name;
  }
}

