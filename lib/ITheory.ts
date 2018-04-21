export interface IInput {
  value: string;
}

export interface IOutput {
  value: string;
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

export function setMuseMaker(maker: () => ITheory) {
  museMaker = maker;
}

export function getNestedMuse(): ITheory {
  return museMaker();
}

