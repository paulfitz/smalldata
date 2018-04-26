import {getNestedMuse, IExample, IOutput, IInput, ITheory} from './ITheory';
import {ScoringMuse} from './ScoredTheory';

export interface ITransform {
  relevant(input: IInput): boolean;
  transform(input: IInput): Promise<IInput>;
}

export class FieldSelect implements ITransform {
  constructor(public fieldName: string) {
    //
  }
  public async transform(input: IInput): Promise<IInput> {
    return { value: input.value[this.fieldName], context: input.context };
  }
  public relevant(input: IInput): boolean {
    return typeof input.value === 'object';
  }
}

export class TransformTheory implements ITheory {
  public muse: ITheory|undefined = undefined;

  constructor(public transform: ITransform) {
    //
  }

  public async predict(inputs: IInput[]): Promise<IOutput[]> {
    if (!this.muse) {
      return inputs.map(i => ({ value: i.value, context: i.context }));
    }
    return this.muse.predict(await Promise.all(inputs.map(i => this.transform.transform(i))));
  }

  public async train(examples: IExample[]): Promise<void> {
    if (!this.muse) {
      for (const eg of examples) {
        if (this.transform.relevant(eg.input)) {
          this.muse = getNestedMuse();
          break;
        }
      }
      return;
    }
    await this.muse.train(await Promise.all(examples.map(async eg => ({
      input: await this.transform.transform(eg.input),
      output: eg.output
    }))));
  }

  public async leak(examples: IExample[], validation: IExample[]): Promise<boolean> {
    if (!this.muse) {
      for (const eg of examples) {
        if (this.transform.relevant(eg.input)) {
          this.muse = getNestedMuse();
          break;
        }
      }
      for (const eg of validation) {
        if (this.transform.relevant(eg.input)) {
          this.muse = getNestedMuse();
          break;
        }
      }
      return true;
    }
    return this.muse.leak(
      await Promise.all(examples.map(async eg => ({
        input: await this.transform.transform(eg.input),
        output: eg.output
      }))),
      await Promise.all(validation.map(async eg => ({
        input: await this.transform.transform(eg.input),
        output: eg.output
      }))));
  }

  public trainable(): boolean {
    return true;
  }

  public getName(): string {
    return "transform";
  }

  public reset(): void {
    if (this.muse) { this.muse.reset(); }
  }
}

export class DictTheory extends ScoringMuse {
  public fields = new Set<string>();
  public async leak(examples: IExample[], validation: IExample[]): Promise<boolean> {
    if (examples.length > 0) {
      if (typeof examples[0].input.value === 'object' && examples[0].input.value !== null) {
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
