import {IExample, IOutput, IInput, ITheory} from './ITheory';

export class SimpleTheory implements ITheory {
  constructor(public fn: (x: any) => any, public name: string) {
  }
  public predict(inputs: IInput[]): IOutput[] {
    return inputs.map(input => ({ value: this.fn(input.value) }));
  }
  public train(example: IExample[]): void {
    //
  }
  public leak(examples: IExample[], validation: IExample[]): boolean {
    return false;
  }
  public reset() {
    //
  }
  public trainable(): boolean {
    return false;
  }
  public getName(): string {
    return this.name;
  }
}

