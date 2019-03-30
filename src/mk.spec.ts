import { unify, runAll, conj, disj } from "./mk";
import { IState } from "./data/constraints";
import { List } from "immutable";
import { Goal } from "./data/Goal";
import { Stream } from "./data/Stream";

const hasSolutions = (solutions: List<IState>): boolean => !solutions.isEmpty();

describe("mk", () => {
    describe("core", () => {
        describe("aggregator goals", () => {
            const succeed = (state: IState): Stream<IState> => List<IState>([state]);
            const fail = (_: IState): Stream<IState> => List<IState>([]);

            describe("conj", () => {
                it("evaluates to the empty set when one, the other, or both goals do not succeed in the state", () => {
                    expect(hasSolutions(runAll({ goal: conj(succeed, fail) }))).toBeFalsy();
                    expect(hasSolutions(runAll({ goal: conj(fail, succeed) }))).toBeFalsy();
                    expect(hasSolutions(runAll({ goal: conj(fail, fail) }))).toBeFalsy();
                });

                it("evaluates to a non-empty set when both goals succeed in the state", () => {
                    expect(hasSolutions(runAll({ goal: conj(succeed, succeed) }))).toBeTruthy();
                });
            });

            describe("disj", () => {
                it("evaluated to a non-empty set when one, the other, or both goals succeed in the state", () => {
                    expect(hasSolutions(runAll({ goal: disj(succeed, fail) }))).toBeTruthy();
                    expect(hasSolutions(runAll({ goal: disj(succeed, succeed) }))).toBeTruthy();
                    expect(hasSolutions(runAll({ goal: disj(succeed, succeed) }))).toBeTruthy();
                });

                it("evaluates to the empty set when neither goal succeeds", () => {
                    expect(hasSolutions(runAll({ goal: disj(fail, fail) }))).toBeFalsy();
                });
            });
        });

        describe("constraint goals", () => {
            describe("unify", () => {
                const canUnify = (goal: Goal): boolean => hasSolutions(runAll({ goal }));

                describe("symbols (logic variables)", () => {
                    it("can be unified with a symbol", () => {
                        expect(canUnify(unify(Symbol("a"), Symbol("b")))).toBeTruthy();
                    });
                });

                describe("array terms", () => {
                    it("can be unified with a symbol", () => {
                        expect(canUnify(unify([], Symbol("[]")))).toBeTruthy();
                        expect(canUnify(unify(Symbol("[]"), []))).toBeTruthy();
                        const lvar = Symbol("lvar");
                        expect(canUnify(conj(unify(lvar, [2]), unify(lvar, [2])))).toBeTruthy();
                    });

                    it("cannot be unified with a symbol that's been unified to another term", () => {
                        const lvar = Symbol("lvar");
                        expect(canUnify(conj(unify(lvar, 1), unify(lvar, [2])))).toBeFalsy();
                        expect(canUnify(conj(unify(lvar, true), unify(lvar, [2])))).toBeFalsy();
                        expect(canUnify(conj(unify(lvar, false), unify(lvar, [2])))).toBeFalsy();
                        expect(canUnify(conj(unify(lvar, []), unify(lvar, [2])))).toBeFalsy();
                        expect(canUnify(conj(unify(lvar, ""), unify(lvar, [2])))).toBeFalsy();
                    });

                    it("can be unified with other arrays of the same known structure", () => {
                        expect(canUnify(unify([], []))).toBeTruthy();
                        expect(canUnify(unify([1], [1]))).toBeTruthy();
                        expect(canUnify(unify([1, [2]], [1, [2]]))).toBeTruthy();
                        expect(canUnify(unify([Symbol("a")], [1]))).toBeTruthy();
                    });

                    it("cannot be unified with other arrays of different structures", () => {
                        expect(canUnify(unify([], [1]))).toBeFalsy();
                        const lvar = Symbol("lvar");
                        expect(canUnify(conj(unify(lvar, 1), unify([lvar], [2])))).toBeFalsy();
                    });
                });

                describe("number terms", () => {
                    it("can be unified with a symbol", () => {
                        expect(canUnify(unify(1, Symbol("1")))).toBeTruthy();
                        expect(canUnify(unify(Symbol("1"), 1))).toBeTruthy();
                        const lvar = Symbol("lvar");
                        expect(canUnify(conj(unify(lvar, 1), unify(lvar, 1)))).toBeTruthy();
                    });

                    it("cannot be unified with a symbol that's been unified to another term", () => {
                        const lvar = Symbol("lvar");
                        expect(canUnify(conj(unify(lvar, 2), unify(lvar, 1)))).toBeFalsy();
                        expect(canUnify(conj(unify(lvar, true), unify(lvar, 1)))).toBeFalsy();
                        expect(canUnify(conj(unify(lvar, false), unify(lvar, 1)))).toBeFalsy();
                        expect(canUnify(conj(unify(lvar, []), unify(lvar, 1)))).toBeFalsy();
                        expect(canUnify(conj(unify(lvar, ""), unify(lvar, 1)))).toBeFalsy();
                    });

                    it("can be unified with other numbers of the same known structure", () => {
                        expect(canUnify(unify(1, 1))).toBeTruthy();
                        expect(canUnify(unify(2, 2))).toBeTruthy();
                    });

                    it("cannot be unified with other numbers of different structures", () => {
                        expect(canUnify(unify(1, 2))).toBeFalsy();
                        const lvar = Symbol("lvar");
                        expect(canUnify(conj(unify(lvar, 1), unify(lvar, 2)))).toBeFalsy();
                    });
                });

                describe("boolean terms", () => {
                    it("can be unified with a symbol", () => {
                        expect(canUnify(unify(true, Symbol("true")))).toBeTruthy();
                        expect(canUnify(unify(Symbol("true"), true))).toBeTruthy();
                        const lvar = Symbol("lvar");
                        expect(canUnify(conj(unify(lvar, true), unify(lvar, true)))).toBeTruthy();
                    });

                    it("cannot be unified with a symbol that's been unified to another term", () => {
                        const lvar = Symbol("lvar");
                        expect(canUnify(conj(unify(lvar, 2), unify(lvar, true)))).toBeFalsy();
                        expect(canUnify(conj(unify(lvar, false), unify(lvar, true)))).toBeFalsy();
                        expect(canUnify(conj(unify(lvar, []), unify(lvar, true)))).toBeFalsy();
                        expect(canUnify(conj(unify(lvar, ""), unify(lvar, true)))).toBeFalsy();
                    });

                    it("can be unified with other booleans of the same known structure", () => {
                        expect(canUnify(unify(true, true))).toBeTruthy();
                        expect(canUnify(unify(false, false))).toBeTruthy();
                    });

                    it("cannot be unified with other booleans of different structures", () => {
                        expect(canUnify(unify(true, false))).toBeFalsy();
                        const lvar = Symbol("lvar");
                        expect(canUnify(conj(unify(lvar, true), unify(lvar, false)))).toBeFalsy();
                    });
                });

                describe("string terms", () => {
                    it("can be unified with a symbol", () => {
                        expect(canUnify(unify("", Symbol("")))).toBeTruthy();
                        expect(canUnify(unify(Symbol(""), ""))).toBeTruthy();
                        const lvar = Symbol("lvar");
                        expect(canUnify(conj(unify(lvar, ""), unify(lvar, "")))).toBeTruthy();
                    });

                    it("cannot be unified with a symbol that's been unified to another term", () => {
                        const lvar = Symbol("lvar");
                        expect(canUnify(conj(unify(lvar, 2), unify(lvar, "")))).toBeFalsy();
                        expect(canUnify(conj(unify(lvar, false), unify(lvar, "")))).toBeFalsy();
                        expect(canUnify(conj(unify(lvar, []), unify(lvar, "")))).toBeFalsy();
                    });

                    it("can be unified with other strings of the same known structure", () => {
                        expect(canUnify(unify("", ""))).toBeTruthy();
                        expect(canUnify(unify("a", "a"))).toBeTruthy();
                    });

                    it("cannot be unified with other strings of different structures", () => {
                        expect(canUnify(unify("a", "b"))).toBeFalsy();
                        const lvar = Symbol("lvar");
                        expect(canUnify(conj(unify(lvar, "a"), unify(lvar, "b")))).toBeFalsy();
                    });
                });
            });
        });
    });
});