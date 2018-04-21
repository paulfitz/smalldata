export interface IState {
  before: string;
}

export interface IOutput {
  after: string;
  abstain?: boolean;
}

export interface IExample {
  state: IState;
  after: IOutput;
}

export interface ITheory {
  predict(state: IState): IOutput;
  train(example: IExample): void;
  getName(): string;
}

let museMaker: () => ITheory;

export function setMuseMaker(maker: () => ITheory) {
  museMaker = maker;
}

export function getNestedMuse(): ITheory {
  return museMaker();
}

