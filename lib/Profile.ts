import {ITheory} from './ITheory';

export class Profile {
  private _calls = new Map<string, number>();
  public countTrains(theory: ITheory) {
    const name = theory.getName();
    this._calls.set(name, 1 + (this._calls.get(name) || 0));
  }
  public show() {
    const results = [...this._calls.entries()].sort((a, b) => a[1] - b[1]);
    console.log(results);
  }
}
