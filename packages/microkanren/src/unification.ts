import { SubstitutionAPI, Term } from "@kanren/types";

export const buildUnification = <S>({ walk, add }: SubstitutionAPI<S>) => {
    const unification = (t1: Term, t2: Term, substitution: S | false): S | false => {
        // you cannot unify terms in a broken substitution
        if (substitution === false) return false;

        t1 = walk(t1, substitution);
        t2 = walk(t2, substitution);

        // strictly equal terms unify
        if (t1 === t2) return substitution;
        // symbols unify to any other term
        else if (typeof t1 === "symbol") return add(t1, t2, substitution);
        else if (typeof t2 === "symbol") return add(t2, t1, substitution);
        // empty arrays unify
        else if (Array.isArray(t1) && Array.isArray(t2) && t1.length === 0 && t2.length === 0) return substitution;
        // arrays unify every element in both arrays unify with a matching element in the other array
        else if (Array.isArray(t1) && Array.isArray(t2) && t1.length === t2.length) return unification(
            t1.slice(1, t1.length - 1),
            t2.slice(1, t2.length - 1),
            unification(t1[0], t2[0], substitution));
        else return false;
    };

    return unification;
};