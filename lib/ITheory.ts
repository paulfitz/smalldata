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
  predict(inputs: IInput[]): IOutput[];
  train(examples: IExample[]): void;
  leak(examples: IExample[], validation: IExample[]): boolean;
  trainable(): boolean;
  getName(): string;
  reset(): void;
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
