import {flatten, getProfiler, IExample, IOutput, IInput, ITheory} from './ITheory';
import {shuffle} from 'lodash';

export class ScoredTheory {
  private _hits: number;
  private _misses: number;
  public constructor(public theory: ITheory) {
    this._hits = this._misses = 0;
  }
  public getScore(): number {
    return this._hits / Math.max(this._hits + this._misses, 1);
  }
  public getStats() {
    return [this.getScore(), this._hits, this._misses];
  }
  public async score(example: IExample) {
    const [pred] = await this.theory.predict([example.input]);
    if (pred.abstain) {
      return 0;
    } else {
      if (flatten(pred.value) === flatten(example.output.value)) {
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

  public async leaveOneOutScore(option: ScoredTheory, examples: IExample[]) {
    for (let i=0; i<examples.length; i++) {
      const trainingData = examples.slice(0, i).concat(examples.slice(i + 1)); 
      option.theory.reset();
      if (!await option.theory.leak(trainingData, [examples[i]])) {
        await option.theory.train(trainingData);
      }
      await option.score(examples[i]);
    }
    option.theory.reset();
    await option.theory.train(examples);
  }

  public async splitScore(option: ScoredTheory, examples: IExample[], nsplits: number) {
    const n = examples.length;
    const egs = shuffle(examples).map((val, idx) => [val, Math.floor(nsplits * idx / n)] as
                                      [IExample, number]);
    for (let s=0; s<nsplits; s++) {
      const trainingData = egs.filter(([val, key]) => key !== s).map(([val, key]) => val);
      const validationData = egs.filter(([val, key]) => key === s).map(([val, key]) => val);
      option.theory.reset();
      if (!await option.theory.leak(trainingData, validationData)) {
        await option.theory.train(trainingData);
      }
      for (const eg of validationData) {
        await option.score(eg);
      }
    }
    option.theory.reset();
    await option.theory.train(examples);
  }

  public async train(examples: IExample[]) {
    for (const option of this._theories) {
      getProfiler().countTrains(option.theory);
      if (option.theory.trainable()) {
        if (examples.length < 15) {
          await this.leaveOneOutScore(option, examples);
        } else {
          await this.splitScore(option, examples, 5);
        }
      } else {
        for (const eg of examples) {
          await option.score(eg);
        }
      }
    }
  }

  public async leak(examples: IExample[], validation: IExample[]): Promise<boolean> {
    await this.train(examples.concat(validation));
    return true;
  }

  public reset() {
    for (const option of this._theories) {
      option.theory.reset();
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

  public showScores() {
    for (const option of this._theories) {
      console.log(option.theory.getName(), option.getStats());
    }
  }

  public async predict(inputs: IInput[]): Promise<IOutput[]> {
    const results: IOutput[] = [];
    for (const input of inputs) {
      let bestPred: IOutput|null = null;
      let bestScore = -1.0;
      for (const option of this._theories) {
        const [pred] = await option.theory.predict([input]);
        if (pred.abstain) { continue; }
        const score = option.getScore();
        if (score > bestScore) {
          bestScore = score;
          bestPred = pred;
        }
      }
      results.push(bestPred || { value: "?", abstain: true });
    }
    return results;
  }

  public trainable(): boolean {
    return true;
  }
}

