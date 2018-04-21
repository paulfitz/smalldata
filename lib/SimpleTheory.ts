import {IExample, IOutput, IState, ITheory} from './ITheory';

export class SimpleTheory implements ITheory {
  constructor(public fn: (x: string) => string, public name: string) {
  }
  public predict(state: IState): IOutput {
    return { after: this.fn(state.before) };
  }
  public train(example: IExample): void {
    //
  }
  public getName(): string {
    return this.name;
  }
}

