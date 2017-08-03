import {
    callWithEmptyState,
    callWithFresh,
    conj,
    disj,
    unify
} from "../src/microKanren";

const test1 = () => callWithEmptyState(
    conj(
        callWithFresh(a => unify(a, "seven")),
        callWithFresh(b => disj(
            unify(b, "five"),
            unify(b, "six")
        ))
    )
);

describe("microKanren", () => {
    it("true is true", () => {
        expect(true).toBeTruthy()
    });
});