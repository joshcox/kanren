import { HashMap, empty, set, get, has, HashMapStructure } from '@collectable/map';
import { SubstitutionAPI, Term } from "@kanren/types";
import { injectable } from 'inversify';

export type SubstitutionHashMap = HashMapStructure<Term, Term>;

@injectable()
export class SubstitutionHashMapAPI implements SubstitutionAPI<SubstitutionHashMap> {
    add = set;
    empty = empty;
    walk = (term: Term, substitution: HashMap.Instance<Term, Term>): Term => {
        const next = typeof term === "symbol" && has(term, substitution);
        return next ? this.walk(get(term, substitution), substitution) : term;
    };
}