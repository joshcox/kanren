import { State, Variable } from "../src/microKanren";

describe("", () => {
    it("", () => {
        const lvar = new Variable();
        const s = new State().unify(lvar, "a");
        expect(s.store[0].left).toBe(lvar);
        expect(s.store[0].right).toBe("a");
    });
});