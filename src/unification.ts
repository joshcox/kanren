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

interface IBuildUnification {

}

interface IUnification {
    (t1: Term, t2: Term, substitution: Substitution | false): Substitution | false;
}

export const buildUnification = ({}: IBuildUnification): IUnification => {
    const unification: IUnification = (t1, t2, substitution) => {
        if (substitution === false) return false;

        t1 = walk(t1, substitution);
        t2 = walk(t2, substitution);

        if (t1 === t2) return substitution;
        else if (typeof t1 === "symbol") return substitution.unshift({ left: t1, right: t2 });
        else if (typeof t2 === "symbol") return substitution.unshift({ left: t2, right: t1 });
        else if (Array.isArray(t1) && Array.isArray(t2) && t1.length === 0 && t2.length === 0) return substitution;
        else if (Array.isArray(t1) && Array.isArray(t2)) return unification(
            t1.slice(1, t1.length - 1),
            t2.slice(1, t2.length - 1),
            unification(t1[0], t2[0], substitution));
        else return false;
    };

    return unification;
};