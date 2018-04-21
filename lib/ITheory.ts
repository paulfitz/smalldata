export interface IInput {
  value: any;
}

export interface IOutput {
  value: any;
  abstain?: boolean;
}

export interface IExample {
  input: IInput;
  output: IOutput;
}

export interface ITheory {
  predict(input: IInput): IOutput;
  train(example: IExample): void;
  getName(): string;
}

let museMaker: () => ITheory;
const theoryMakers: (() => ITheory)[] = [];

export function setMuseMaker(maker: () => ITheory) {
  museMaker = maker;
}

export function getNestedMuse(): ITheory {
  return museMaker();
}

export function addTheory(maker: () => ITheory) {
  theoryMakers.push(maker);
}

export function getTheoryPlugins(): (() => ITheory)[] {
  return theoryMakers;
}
