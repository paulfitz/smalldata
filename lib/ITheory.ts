import {Profile} from './Profile';

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
const profiler = new Profile();

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

export function getProfiler() {
  return profiler;
}

export function flatten(x: any): string {
  if (typeof x === 'string') {
    return x;
  }
  if (typeof x === 'number' || x === null || typeof x === 'undefined') {
    return String(x);
  }
  return JSON.stringify(x);
}
