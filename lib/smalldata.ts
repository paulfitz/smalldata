
export class Transform {
  private _muse = getMuse();

  constructor(public examples: [any, any][]) {
    for (const eg of examples) {
      this._muse.train({
        state: {before: "" + eg[0]},
        after: {after: "" + eg[1]}
      });
    }
  }

  public apply(inputs: any[]): any[] {
    return inputs.map(input => this._muse.predict({before: "" + input}).after);
  }
}

export function getMuse() {
  return new BasicMuse();
}

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

class SimpleTheory implements ITheory {
  constructor(public fn: (x: string) => string, public name: string) {
  }
  public predict(state: IState): IOutput {
    return { after: this.fn(state.before) };
  }
  public train(example: IExample): void {
    //
  }
  public getName(): string {
    return this.name;
  }
}

class PastTheory implements ITheory {
  private _past = new Map<string, string>();

  public predict(state: IState): IOutput {
    const curr = state.before;
    const guess = this._past.get(curr);
    if (guess) { return {after: guess}; }
    return {after: "", abstain: true};
  }

  public train(example: IExample): void {
    this._past.set(example.state.before,
                   example.after.after);
  }  

  public getName(): string {
    return "past";
  }
}

class ConstantTheory implements ITheory {
  private _value: string|null = null;

  public predict(state: IState): IOutput {
    if (this._value) { return {after: this._value}; }
    return {after: "", abstain: true};
  }

  public train(example: IExample): void {
    this._value = this._value || example.after.after;
  }  

  public getName(): string {
    return "constant";
  }
}

enum PatternState {
  NotFound = 0,
  Found,
  Changed
};

interface IPattern {
  forward(output: IOutput): IOutput;
  reverse(example: IExample): IExample;
  derive(data: IExample[]): PatternState;
}

class SuffixTool {
  public suffix: string = "";
  constructor() {
    //
  }

  public forward(output: IOutput): IOutput {
    return {
      after: output.after + this.suffix
    };
  }

  public reverse(example: IExample): IExample {
    return {
      state: example.state,
      after: {
        after: example.after.after.split(this.suffix)[0]
      }
    };
  }

  public derive(data: IExample[]): PatternState {
    if (data.length < 2 ) {
      return PatternState.NotFound;
    }
    let suffix = data[0].after.after;
    let minLen = suffix.length;
    while (suffix.length > 0) {
      let fail = false;
      for (let i=0; i<data.length; i++) {
        const str = data[i].after.after;
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

class PrefixTool {
  public prefix: string = "";
  constructor() {
    //
  }

  public forward(output: IOutput): IOutput {
    return {
      after: this.prefix + output.after
    };
  }

  public reverse(example: IExample): IExample {
    return {
      state: example.state,
      after: {
        after: example.after.after.split(this.prefix)[1] || ""
      }
    };
  }

  public derive(data: IExample[]): PatternState {
    if (data.length < 2 ) {
      return PatternState.NotFound;
    }
    let prefix = data[0].after.after;
    let minLen = prefix.length;
    while (prefix.length > 0) {
      let fail = false;
      for (let i=0; i<data.length; i++) {
        const str = data[i].after.after;
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

class RemovalTool {
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
    return { after: this.strip(output.after) };
  }

  public reverse(example: IExample): IExample {
    return {
      state: {before: this.strip(example.state.before)},
      after: example.after
    };
  }

  public derive(data: IExample[]): PatternState {
    if (data.length < 1 ) {
      return PatternState.NotFound;
    }
    const left = new Set<string>();
    const right = new Set<string>();
    for (let i=0; i<data.length; i++) {
      const pre = data[i].state.before;
      const post = data[i].after.after;
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

class TrimTool {
  constructor() {
    //
  }

  public strip(str: string): string {
    return str.trim();
  }

  public forward(output: IOutput): IOutput {
    return { after: this.strip(output.after) };
  }

  public reverse(example: IExample): IExample {
    return {
      state: {before: this.strip(example.state.before)},
      after: example.after
    };
  }

  public derive(data: IExample[]): PatternState {
    if (data.length < 1 ) {
      return PatternState.NotFound;
    }
    let ct = 0;
    for (let i=0; i<data.length; i++) {
      const pre = data[i].state.before;
      const post = data[i].after.after;
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

class PatternTheory implements ITheory {
  private _data = new Array<IExample>();
  private _subTheory: ITheory | null = null;

  public constructor(private _tool: IPattern) {
  }

  public predict(state: IState): IOutput {
    const success = this._tool.derive(this._data);
    if (!success) {
      return {after: "", abstain: true};
    }
    if (success === PatternState.Changed || !this._subTheory) {
      this._subTheory = getMuse();
      for (const eg of this._data) {
        this._subTheory.train(this._tool.reverse(eg));
      }
    }
    const part = this._subTheory.predict(state);
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

class FragmentTheory implements ITheory {
  private _subTheory: ITheory | null = null;

  public constructor(private _window: number) {
  }

  public predict(state: IState): IOutput {
    if (!this._subTheory) {
      return { after: '', abstain: true };
    }
    const pre = state.before;
    const w = pre.length - this._window + 1;
    let result = "";
    let fail = false;
    for (let i=0; i<w; i++) {
      const pred = this._subTheory.predict({before: pre.substr(i, this._window)});
      if (pred.abstain || pred.after.length !== this._window) {
        fail = true;
        break;
      }
      if (i===w - 1) {
        result += pred.after;
      } else {
        result += pred.after.slice(0, 1);
      }
    }
    if (fail) {
      return { after: '', abstain: true };
    }
    return { after: result };
  }

  public train(example: IExample): void {
    const pre = example.state.before;
    const post = example.after.after;
    const w = Math.min(pre.length, post.length) - this._window;
    if (!this._subTheory) {
      this._subTheory = getMuse();
    }
    for (let i=0; i<w; i++) {
      const eg = {
        state: {before: pre.substr(i, this._window)},
        after: {after: post.substr(i, this._window)}
      }
      this._subTheory.train(eg);
    }
  }

  public getName(): string {
    return "letter";
  }  
}

class ScoredTheory {
  private _hits: number;
  private _misses: number;
  public constructor(public theory: ITheory) {
    this._hits = this._misses = 0;
  }
  public getScore(): number {
    return this._hits / Math.max(this._hits + this._misses, 1);
  }
  public score(example: IExample) {
    const pred = this.theory.predict(example.state);
    if (pred.abstain) {
      return 0;
    } else {
      if (pred.after === example.after.after) {
        this._hits++;
      } else {
        this._misses++;
      }
    }
    return this.getScore();
  }
}

export class ScoringMuse implements ITheory {
  private _theories = new Array<ScoredTheory>();

  public addTheory(theory: ITheory) {
    this._theories.push(new ScoredTheory(theory));
  }

  public train(example: IExample) {
    for (const option of this._theories) {
      option.score(example);
      option.theory.train(example);
    }
  }

  public getName() {
    const theory = this.getBestTheory();
    return theory ? theory.getName() : "muse";
  }

  public getBestTheory() {
    let best: ScoredTheory|null = null;
    let bestScore = -1.0;
    for (const option of this._theories) {
      const score = option.getScore();
      if (score > bestScore) {
        bestScore = score;
        best = option;
      }
    }
    return best ? best.theory : null;
  }

  public predict(state: IState): IOutput {
    let bestPred: IOutput|null = null;
    let bestScore = -1.0;
    for (const option of this._theories) {
      const pred = option.theory.predict(state);
      if (pred.abstain) { continue; }
      const score = option.getScore();
      if (score > bestScore) {
        bestScore = score;
        bestPred = pred;
      }
    }
    return bestPred || { after: "?", abstain: true };
  }
}

function titleCase(str: string) {
  return str.replace(/\w\S*/g, 
                     function(txt){
                       return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                     });
}

function capAtStart(str: string) {
  return str.replace(/^\w/, function (chr) {
    return chr.toUpperCase();
  });
}

export class BasicMuse extends ScoringMuse {
  public constructor() {
    super();
    this.addTheory(new SimpleTheory(x => x, "identity"));
    this.addTheory(new SimpleTheory(x => x.toUpperCase(), "upper"));
    this.addTheory(new SimpleTheory(x => x.toLowerCase(), "lower"));
    this.addTheory(new SimpleTheory(x => titleCase(x), "title"));
    this.addTheory(new SimpleTheory(x => capAtStart(x), "capAtStart"));
    this.addTheory(new PastTheory());
    this.addTheory(new ConstantTheory());
    this.addTheory(new PatternTheory(new SuffixTool()));
    this.addTheory(new PatternTheory(new PrefixTool()));
    this.addTheory(new PatternTheory(new RemovalTool()));
    this.addTheory(new PatternTheory(new TrimTool()));
    this.addTheory(new FragmentTheory(1));
  }
}

export function main() {
  const examples = process.argv.slice(2);
  const bm = new BasicMuse();
  if (examples.length === 0) {
    console.log("Usage:");
    console.log("  smalldata hi:HI there:THERE you:");
    console.log("  # result is YOU");
  }
  for (const example of examples) {
    const parts = example.split(':', 2);
    if (parts[1]) {
      bm.train({state: {before: parts[0]}, after: {after: parts[1]}});
    } else {
      console.log(parts[0], ':', bm.predict({before: parts[0]}).after);
    }
  }
}
