import {IExample, IOutput, IInput, ITheory} from './ITheory';

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
    const pred = this.theory.predict(example.input);
    if (pred.abstain) {
      return 0;
    } else {
      if (pred.value === example.output.value) {
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

  public predict(input: IInput): IOutput {
    let bestPred: IOutput|null = null;
    let bestScore = -1.0;
    for (const option of this._theories) {
      const pred = option.theory.predict(input);
      if (pred.abstain) { continue; }
      const score = option.getScore();
      if (score > bestScore) {
        bestScore = score;
        bestPred = pred;
      }
    }
    return bestPred || { value: "?", abstain: true };
  }
}

