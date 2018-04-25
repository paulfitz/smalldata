import {getNestedMuse, IExample, IOutput, IInput, ITheory} from './ITheory';

export enum PatternState {
  NotFound = 0,
  Found,
  Changed
};

export interface IPattern {
  forward(output: IOutput): IOutput;
  reverse(example: IExample): IExample;
  derive(data: IExample[]): PatternState;
}

export class SuffixTool {
  public suffix: string = "";

  public forward(output: IOutput): IOutput {
    return {
      value: String(output.value) + this.suffix
    };
  }

  public reverse(example: IExample): IExample {
    let v = String(example.output.value);
    const i = v.lastIndexOf(this.suffix);
    if (i >= 0) { v = v.substr(0, i); }
    return {
      input: example.input,
      output: {
        value: v
      }
    };
  }

  public derive(data: IExample[]): PatternState {
    if (data.length < 1) {
      return PatternState.NotFound;
    }
    if (this.deriveIO(data) === PatternState.Found) {
      return PatternState.Found;
    }
    let suffix = String(data[0].output.value);
    let minLen = suffix.length;
    while (suffix.length > 0) {
      let fail = false;
      for (let i=0; i<data.length; i++) {
        const str = String(data[i].output.value);
        if (str.length < minLen) {
          minLen = str.length;
        }
        if (str.length < suffix.length) {
          fail = true;
          break;
        }
        if (str.substr(str.length - suffix.length) !== suffix) {
          fail = true;
          break;
        }
      }
      if (!fail) {
        break;
      }
      suffix = suffix.substr(1);
    }
    if (suffix.length === 0 || suffix.length === minLen) {
      return PatternState.NotFound;
    }
    const result = (this.suffix === suffix) ? PatternState.Found : PatternState.Changed;
    this.suffix = suffix;
    return result;
  }

  public deriveIO(data: IExample[]): PatternState {
    if (data.length < 1) {
      return PatternState.NotFound;
    }
    const pre = String(data[0].input.value);
    const post = String(data[0].output.value);
    if (pre.length >= post.length) {
      return PatternState.NotFound;
    }
    const suffix = post.substr(pre.length);
    for (let i=0; i<data.length; i++) {
      const ipre = String(data[i].input.value).toLowerCase();
      const ipost = String(data[i].output.value).toLowerCase();
      if (ipost !== ipre + suffix) {
        return PatternState.NotFound;
      }
    }
    this.suffix = suffix;
    return PatternState.Found;
  }
}

export class PrefixTool {
  public prefix: string = "";

  public forward(output: IOutput): IOutput {
    return {
      value: this.prefix + String(output.value)
    };
  }

  public reverse(example: IExample): IExample {
    let v = String(example.output.value);
    const i = v.indexOf(this.prefix);
    if (i === 0) { v = v.substr(this.prefix.length); }
    return {
      input: example.input,
      output: {
        value: v
      }
    };
  }

  public derive(data: IExample[]): PatternState {
    if (data.length < 1) {
      return PatternState.NotFound;
    }
    if (this.deriveIO(data) === PatternState.Found) {
      return PatternState.Found;
    }
    let prefix = String(data[0].output.value);
    let minLen = prefix.length;
    while (prefix.length > 0) {
      let fail = false;
      for (let i=0; i<data.length; i++) {
        const str = String(data[i].output.value);
        if (str.length < minLen) {
          minLen = str.length;
        }
        if (str.length < prefix.length) {
          fail = true;
          break;
        }
        if (str.substr(0, prefix.length) !== prefix) {
          fail = true;
          break;
        }
      }
      if (!fail) {
        break;
      }
      prefix = prefix.substr(0, prefix.length - 1);
    }
    if (prefix.length === 0 || prefix.length === minLen) {
      return PatternState.NotFound;
    }
    const result = (this.prefix === prefix) ? PatternState.Found : PatternState.Changed;
    this.prefix = prefix;
    return result;
  }

  public deriveIO(data: IExample[]): PatternState {
    if (data.length < 1) {
      return PatternState.NotFound;
    }
    const pre = String(data[0].input.value);
    const post = String(data[0].output.value);
    if (pre.length >= post.length) {
      return PatternState.NotFound;
    }
    const prefix = post.substr(0, post.length - pre.length);
    for (let i=0; i<data.length; i++) {
      const ipre = String(data[i].input.value).toLowerCase();
      const ipost = String(data[i].output.value).toLowerCase();
      if (ipost !== prefix + ipre) {
        return PatternState.NotFound;
      }
    }
    this.prefix = prefix;
    return PatternState.Found;
  }
}

export class RemovalTool {
  public dead = new Set<string>();

  public strip(str: string): string {
    let result = "";
    for (const ch of str) {
      if (!this.dead.has(ch.toLowerCase())) { result += ch; }
    }
    return result;
  }

  public forward(output: IOutput): IOutput {
    return { value: this.strip(String(output.value)) };
  }

  public reverse(example: IExample): IExample {
    return {
      input: {value: this.strip(String(example.input.value))},
      output: example.output
    };
  }

  public derive(data: IExample[]): PatternState {
    if (data.length < 1) {
      return PatternState.NotFound;
    }
    const left = new Set<string>();
    const right = new Set<string>();
    for (let i=0; i<data.length; i++) {
      const pre = String(data[i].input.value).toLowerCase();
      const post = String(data[i].output.value).toLowerCase();
      if (pre.length === post.length) { continue; }
      if (post.length === 0) { continue; }
      for (const ch of pre) { left.add(ch); }
      for (const ch of post) { right.add(ch); }
    }
    const dead = new Set<string>([...left].filter(x => !right.has(x)));
    if (dead.size === 0) {
      return PatternState.NotFound;
    }
    const result = (dead === this.dead) ? PatternState.Found : PatternState.Changed;
    this.dead = dead;
    return result;
  }
}

export class TrimTool {

  public strip(str: string): string {
    return str.trim();
  }

  public forward(output: IOutput): IOutput {
    return { value: this.strip(String(output.value)) };
  }

  public reverse(example: IExample): IExample {
    return {
      input: {value: this.strip(String(example.input.value))},
      output: example.output
    };
  }

  public derive(data: IExample[]): PatternState {
    if (data.length < 1) {
      return PatternState.NotFound;
    }
    let ct = 0;
    for (let i=0; i<data.length; i++) {
      const pre = String(data[i].input.value);
      const post = String(data[i].output.value);
      if (pre.length === 0) { continue; }
      if (pre.charAt(0) === ' ' && ((post.charAt(0) || ' ') !== ' ')) {
        ct++;
      }
      if (pre.charAt(pre.length - 1) === ' ' && ((post.charAt(post.length - 1) || ' ') !== ' ')) {
        ct++;
      }
    }
    if (ct === 0) {
      return PatternState.NotFound;
    }
    return PatternState.Found;
  }
}

export class PatternTheory implements ITheory {
  private _subTheory: ITheory | null = null;

  public constructor(private _tool: IPattern) {
  }

  public reset() {
    this._subTheory = null;
  }

  public predict(inputs: IInput[]): IOutput[] {
    return inputs.map(input => {
      if (!this._subTheory) {
        return {value: "", abstain: true};
      }
      const [part] = this._subTheory.predict([input]);
      return this._tool.forward(part);
    });
  }

  public train(examples: IExample[]): void {
    const success = this._tool.derive(examples);
    if (success !== PatternState.NotFound) {
      this._subTheory = getNestedMuse();
      this._subTheory.train(examples.map(eg => this._tool.reverse(eg)));
    }
  }

  public leak(examples: IExample[], validation: IExample[]): boolean {
    const success = this._tool.derive(examples.concat(validation));
    if (success !== PatternState.NotFound) {
      this._subTheory = getNestedMuse();
      this._subTheory.leak(examples.map(eg => this._tool.reverse(eg)),
                           validation.map(eg => this._tool.reverse(eg)));
    }
    return true;
  }

  public trainable(): boolean {
    return true;
  }

  public getName(): string {
    return "pattern";
  }
}

