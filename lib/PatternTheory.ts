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
  constructor() {
    //
  }

  public forward(output: IOutput): IOutput {
    return {
      value: output.value + this.suffix
    };
  }

  public reverse(example: IExample): IExample {
    return {
      input: example.input,
      output: {
        value: example.output.value.split(this.suffix)[0]
      }
    };
  }

  public derive(data: IExample[]): PatternState {
    if (data.length < 2 ) {
      return PatternState.NotFound;
    }
    let suffix = data[0].output.value;
    let minLen = suffix.length;
    while (suffix.length > 0) {
      let fail = false;
      for (let i=0; i<data.length; i++) {
        const str = data[i].output.value;
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
}

export class PrefixTool {
  public prefix: string = "";
  constructor() {
    //
  }

  public forward(output: IOutput): IOutput {
    return {
      value: this.prefix + output.value
    };
  }

  public reverse(example: IExample): IExample {
    return {
      input: example.input,
      output: {
        value: example.output.value.split(this.prefix)[1] || ""
      }
    };
  }

  public derive(data: IExample[]): PatternState {
    if (data.length < 2 ) {
      return PatternState.NotFound;
    }
    let prefix = data[0].output.value;
    let minLen = prefix.length;
    while (prefix.length > 0) {
      let fail = false;
      for (let i=0; i<data.length; i++) {
        const str = data[i].output.value;
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
}

export class RemovalTool {
  public dead = new Set<string>();
  constructor() {
    //
  }

  public strip(str: string): string {
    let result = "";
    for (const ch of str) {
      if (!this.dead.has(ch)) { result += ch; }
    }
    return result;
  }

  public forward(output: IOutput): IOutput {
    return { value: this.strip(output.value) };
  }

  public reverse(example: IExample): IExample {
    return {
      input: {value: this.strip(example.input.value)},
      output: example.output
    };
  }

  public derive(data: IExample[]): PatternState {
    if (data.length < 1 ) {
      return PatternState.NotFound;
    }
    const left = new Set<string>();
    const right = new Set<string>();
    for (let i=0; i<data.length; i++) {
      const pre = data[i].input.value;
      const post = data[i].output.value;
      for (const ch of pre) { left.add(ch.toUpperCase()); left.add(ch.toLowerCase()); }
      for (const ch of post) { right.add(ch.toUpperCase()); right.add(ch.toLowerCase()); }
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
  constructor() {
    //
  }

  public strip(str: string): string {
    return str.trim();
  }

  public forward(output: IOutput): IOutput {
    return { value: this.strip(output.value) };
  }

  public reverse(example: IExample): IExample {
    return {
      input: {value: this.strip(example.input.value)},
      output: example.output
    };
  }

  public derive(data: IExample[]): PatternState {
    if (data.length < 1 ) {
      return PatternState.NotFound;
    }
    let ct = 0;
    for (let i=0; i<data.length; i++) {
      const pre = data[i].input.value;
      const post = data[i].output.value;
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
  private _data = new Array<IExample>();
  private _subTheory: ITheory | null = null;

  public constructor(private _tool: IPattern) {
  }

  public predict(input: IInput): IOutput {
    const success = this._tool.derive(this._data);
    if (!success) {
      return {value: "", abstain: true};
    }
    if (success === PatternState.Changed || !this._subTheory) {
      this._subTheory = getNestedMuse();
      for (const eg of this._data) {
        this._subTheory.train(this._tool.reverse(eg));
      }
    }
    const part = this._subTheory.predict(input);
    return this._tool.forward(part);
  }

  public train(example: IExample): void {
    this._data.push(example);
    if (this._subTheory) {
      this._subTheory.train(this._tool.reverse(example));
    }
  }

  public getName(): string {
    return "pattern";
  }
}

