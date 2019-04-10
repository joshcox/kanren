import { List } from "immutable";
import { Term } from "./data/Term";

export interface ISubstitution { left: symbol; right: Term }

type Substitution = List<ISubstitution>;

/**
 * Follows an associative path to find what the input (`term`) is
 * equivalent to. When no substitution association is made, the result
 * is the input (`term`).
 */
const walk = (term: Term, substitution: Substitution): Term => {
    const pr = typeof term === "symbol" && substitution.find(({ left }) => left === term);
    return pr ? walk(pr.right, substitution) : term;
};

interface TermPredicate {
    (t1: Term, t2: Term): boolean;
}

export interface IBuildUnification {
    terms: Array<[TermPredicate, (unification: IUnification) => IUnification]>;
}

export interface IUnification {
    (t1: Term, t2: Term, substitution: Substitution | false): Substitution | false;
}

export const buildUnification = ({ terms }: IBuildUnification): IUnification => {
    const unification: IUnification = (t1, t2, substitution) => {
        if (substitution === false) return false;

        t1 = walk(t1, substitution);
        t2 = walk(t2, substitution);

        if (t1 === t2) return substitution;
        else if (typeof t1 === "symbol") return substitution.unshift({ left: t1, right: t2 });
        else if (typeof t2 === "symbol") return substitution.unshift({ left: t2, right: t1 });
        else {
            const [_ = undefined, unif = (() => (): false => false)] = terms.find(([pred]) => pred(t1, t2)) || [];
            return unif(unification)(t1, t2, substitution);
        }
    };

    return unification;
};