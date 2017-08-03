import {
    callWithEmptyState,
    callWithFresh,
    conj,
    disj,
    unify
} from "./index";

const test1 = () => callWithEmptyState(
    conj(
        callWithFresh(a => unify(a, "seven")),
        callWithFresh(b => disj(
            unify(b, "five"),
            unify(b, "six")
        ))
    )
);

console.log(test1());
