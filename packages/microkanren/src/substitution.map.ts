import { HashMap, empty, set, get, has, HashMapStructure } from '@collectable/map';
import { Term, SubstitutionAPI } from "@kanren/types";
import { injectable } from 'inversify';

export type SubstitutionHashMap<T> = HashMapStructure<Term<T>, Term<T>>;

@injectable()
export class SubstitutionHashMapAPI<T> implements SubstitutionAPI<T, SubstitutionHashMap<T>> {
    add = set;
    empty = empty;
    walk = (term: Term<T>, substitution: HashMap.Instance<Term<T>, Term<T>>): Term<T> => {
        const next = typeof term === "symbol" && has(term, substitution);
        return next ? this.walk(get(term, substitution)!, substitution) : term;
    };
}