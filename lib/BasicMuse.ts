import {ScoringMuse} from './ScoredTheory';
import {SimpleTheory} from './SimpleTheory';
import {PastTheory} from './PastTheory';
import {ConstantTheory} from './ConstantTheory';
import {FragmentTheory} from './FragmentTheory';
import {PatternTheory, PrefixTool, RemovalTool,
        SuffixTool, TrimTool} from './PatternTheory';

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
    this.addTheory(new SimpleTheory(x => String(x).toUpperCase(), "upper"));
    this.addTheory(new SimpleTheory(x => String(x).toLowerCase(), "lower"));
    this.addTheory(new SimpleTheory(x => titleCase(String(x)), "title"));
    this.addTheory(new SimpleTheory(x => capAtStart(String(x)), "capAtStart"));
    this.addTheory(new PastTheory());
    this.addTheory(new ConstantTheory());
    this.addTheory(new PatternTheory(new SuffixTool()));
    this.addTheory(new PatternTheory(new PrefixTool()));
    this.addTheory(new PatternTheory(new RemovalTool()));
    this.addTheory(new PatternTheory(new TrimTool()));
    this.addTheory(new FragmentTheory(1));
  }
}

