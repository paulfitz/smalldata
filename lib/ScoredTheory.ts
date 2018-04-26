import {getProfiler, IExample, IOutput, IInput, ITheory} from './ITheory';
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
  public score(example: IExample) {
    const [pred] = this.theory.predict([example.input]);
    if (pred.abstain) {
      return 0;
    } else {
      if (String(pred.value) === String(example.output.value)) {
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

  public incrementalScore(option: ScoredTheory, examples: IExample[]) {
    for (let i=0; i<examples.length; i++) {
      const trainingData = examples.slice(0, i);
      option.theory.reset();
      if (i > 0) {
        option.theory.train(trainingData);
      }
      option.score(examples[i]);
    }
    option.theory.reset();
    option.theory.train(examples);
  }

  public leaveOneOutScore(option: ScoredTheory, examples: IExample[]) {
    for (let i=0; i<examples.length; i++) {
      const trainingData = examples.slice(0, i).concat(examples.slice(i + 1)); 
      option.theory.reset();
      if (!option.theory.leak(trainingData, [examples[i]])) {
        option.theory.train(trainingData);
      }
      option.score(examples[i]);
    }
    option.theory.reset();
    option.theory.train(examples);
  }

  public splitScore(option: ScoredTheory, examples: IExample[], nsplits: number) {
    const n = examples.length;
    const egs = shuffle(examples).map((val, idx) => [val, Math.floor(nsplits * idx / n)] as
                                      [IExample, number]);
    for (let s=0; s<nsplits; s++) {
      const trainingData = egs.filter(([val, key]) => key !== s).map(([val, key]) => val);
      const validationData = egs.filter(([val, key]) => key === s).map(([val, key]) => val);
      option.theory.reset();
      if (!option.theory.leak(trainingData, validationData)) {
        option.theory.train(trainingData);
      }
      for (const eg of validationData) {
        option.score(eg);
      }
    }
    option.theory.reset();
    option.theory.train(examples);
  }

  public train(examples: IExample[]) {
    for (const option of this._theories) {
      if (option.theory.trainable()) {
        getProfiler().countTrains(option.theory);
        if (examples.length < 15) {
          this.leaveOneOutScore(option, examples);
        } else {
          this.splitScore(option, examples, 5);
        }
      } else {
        examples.forEach(eg => option.score(eg));
      }
    }
  }

  public leak(examples: IExample[], validation: IExample[]): boolean {
    this.train(examples.concat(validation));
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

  public predict(inputs: IInput[]): IOutput[] {
    return inputs.map(input => {
      let bestPred: IOutput|null = null;
      let bestScore = -1.0;
      for (const option of this._theories) {
        const [pred] = option.theory.predict([input]);
        if (pred.abstain) { continue; }
        const score = option.getScore();
        if (score > bestScore) {
          bestScore = score;
          bestPred = pred;
        }
      }
      return bestPred || { value: "?", abstain: true };
    });
  }

  public trainable(): boolean {
    return true;
  }
}

