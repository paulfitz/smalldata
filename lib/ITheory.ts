import {Profile} from './Profile';

export type Context = {[key: string]: any};

export interface IInput {
  value: any;
  context?: Context;
}

export interface IOutput {
  value: any;
  abstain?: boolean;
  context?: Context;
}

export interface IExample {
  input: IInput;
  output: IOutput;
}

export interface ITheory {
  predict(inputs: IInput[]): Promise<IOutput[]>;
  train(examples: IExample[]): Promise<void>;
  leak(examples: IExample[], validation: IExample[]): Promise<boolean>;
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

export function resetTheories() {
  theoryMakers.length = 0;
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
