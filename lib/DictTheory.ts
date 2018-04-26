import {getNestedMuse, IExample, IOutput, IInput, ITheory} from './ITheory';
import {ScoringMuse} from './ScoredTheory';

export interface ITransform {
  transform(input: IInput): IInput;
}

export class FieldSelect implements ITransform {
  constructor(public fieldName: string) {
    //
  }
  public transform(input: IInput): IInput {
    return { value: input.value[this.fieldName] };
  }
}

export class TransformTheory implements ITheory {
  public muse = getNestedMuse();

  constructor(public transform: ITransform) {
    //
  }

  public predict(inputs: IInput[]): IOutput[] {
    return this.muse.predict(inputs.map(i => this.transform.transform(i)));
  }

  public train(examples: IExample[]): void {
    this.muse.train(examples.map(eg => ({
      input: this.transform.transform(eg.input),
      output: eg.output
    })));
  }

  public leak(examples: IExample[], validation: IExample[]): boolean {
    return this.muse.leak(
      examples.map(eg => ({
        input: this.transform.transform(eg.input),
        output: eg.output
      })),
      validation.map(eg => ({
        input: this.transform.transform(eg.input),
        output: eg.output
      })));
  }

  public trainable(): boolean {
    return true;
  }

  public getName(): string {
    return "transform";
  }

  public reset(): void {
    this.muse.reset();
  }
}

export class DictTheory extends ScoringMuse {
  public fields = new Set<string>();
  public leak(examples: IExample[], validation: IExample[]): boolean {
    if (examples.length > 0) {
      if (typeof examples[0].input.value === 'object') {
        const keys = Object.keys(examples[0].input.value);
        for (const key of keys) {
          if (this.fields.has(key)) { continue; }
          this.fields.add(key);
          this.addTheory(new TransformTheory(new FieldSelect(key)));
        }
      }
    }
    return super.leak(examples, validation);
  }
}
