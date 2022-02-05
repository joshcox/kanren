import { List } from "@kanren/data";
import { Term } from "./data/term";
export interface ISubstitution {
    left: symbol;
    right: Term;
}
declare type Substitution = List<ISubstitution>;
export declare const unification: (t1: Term, t2: Term, substitution: Substitution | false) => Substitution | false;
export {};
