import { IBuildUnification } from "./unification";
import { Term } from "./data/Term";

const { isArray } = Array;

export const array: IBuildUnification["terms"] = [
    [
        (t1, t2) => isArray(t1) && isArray(t2) && t1.length === 0 && t2.length === 0,
        (_) => (_1, _2, substitution) => substitution
    ],
    [
        (t1, t2) => isArray(t1) && isArray(t2),
        (unification) => (t1: Array<Term>, t2: Array<Term>, substitution) => unification(
            t1.slice(1, t1.length - 1),
            t2.slice(1, t2.length - 1),
            unification(t1[0], t2[0], substitution)
        )
    ]
]