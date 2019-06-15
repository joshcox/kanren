import { kanren } from "./kanren";
import { IState } from "./data/State";
import { List } from "immutable";
import { Goal } from "./data/Goal";
import { Stream } from "./data/Stream";

const { unify, runAll, conj, disj, callWithFresh } = kanren();

const hasSolutions = (solutions: List<IState>): boolean => !solutions.isEmpty();

describe("mk", () => {
    const succeed = (state: IState): Stream<IState> => List<IState>([state]);
    const fail = (_: IState): Stream<IState> => List<IState>([]);

    describe("scope goals", () => {
        describe("callWithFresh", () => {
            it("injects a new logic variable into the provided goal", () => {
                const f = runAll(callWithFresh((a) => unify(a, 5)) );
                expect(hasSolutions(f)).toBeTruthy();
                expect(f.size).toBe(1);
                const solution1 = f.get(0);
                expect(solution1.count).toBe(1);
                expect(solution1.substitution.size).toBe(1);
                const state1 = solution1.substitution.get(0);
                expect(state1).toEqual({ left: Symbol.for(`${solution1.count - 1}`), right: 5 });
            });

            it("does not affect the provided goal past injecting the logic variable", () => {
                expect(hasSolutions(runAll(callWithFresh((a) => succeed) ))).toBeTruthy();
                expect(hasSolutions(runAll(callWithFresh((a) => fail) ))).toBeFalsy();
            });
        });
    });

    describe("aggregator goals", () => {
        describe("conj", () => {
            it("evaluates to the empty set when one, the other, or both goals do not succeed in the state", () => {
                expect(hasSolutions(runAll(conj(succeed, fail) ))).toBeFalsy();
                expect(hasSolutions(runAll(conj(fail, succeed) ))).toBeFalsy();
                expect(hasSolutions(runAll(conj(fail, fail) ))).toBeFalsy();
            });

            it("evaluates to a non-empty set when both goals succeed in the state", () => {
                expect(hasSolutions(runAll(conj(succeed, succeed) ))).toBeTruthy();
            });
        });

        describe("disj", () => {
            it("evaluated to a non-empty set when one, the other, or both goals succeed in the state", () => {
                expect(hasSolutions(runAll(disj(succeed, fail) ))).toBeTruthy();
                expect(hasSolutions(runAll(disj(succeed, succeed) ))).toBeTruthy();
                expect(hasSolutions(runAll(disj(succeed, succeed) ))).toBeTruthy();
            });

            it("evaluates to the empty set when neither goal succeeds", () => {
                expect(hasSolutions(runAll(disj(fail, fail) ))).toBeFalsy();
            });
        });
    });

    describe("constraint goals", () => {
        describe("unify", () => {
            const canUnify = (goal: Goal): boolean => hasSolutions(runAll(goal));

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