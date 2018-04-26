import {IExample, IOutput, IInput, ITheory} from './ITheory';

export class SimpleTheory implements ITheory {
  constructor(public fn: (x: any) => any, public name: string) {
  }
  public async predict(inputs: IInput[]): Promise<IOutput[]> {
    return inputs.map(input => ({ value: this.fn(input.value), context: input.context }));
  }
  public async train(example: IExample[]): Promise<void> {
    //
  }
  public async leak(examples: IExample[], validation: IExample[]): Promise<boolean> {
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

