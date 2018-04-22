import {IExample, IOutput, IInput, ITheory} from './ITheory';

export class SimpleTheory implements ITheory {
  constructor(public fn: (x: string) => string, public name: string) {
  }
  public predict(inputs: IInput[]): IOutput[] {
    return inputs.map(input => ({ value: this.fn(input.value) }));
  }
  public train(example: IExample[]): void {
    //
  }
  public trainable(): boolean {
    return false;
  }
  public getName(): string {
    return this.name;
  }
}

