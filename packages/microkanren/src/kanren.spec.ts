import { car, length } from "@kanren/data";
import { kanren, Goal, IState } from "./index";
import { Stream, unit } from "./search.stream";

const { unify, runAll, conj, disj, callWithFresh } = kanren();

const hasSolutions = (solutions: IState[]): boolean => solutions.length > 0;

describe("mk", () => {
    const succeed = (state: IState): Stream<IState> => unit.stream([state]);
    const fail = (_: IState): Stream<IState> => unit.stream([]);

    describe("scope goals", () => {
        describe("callWithFresh", () => {
            it("injects a new logic variable into the provided goal", async () => {
                const f = await runAll(callWithFresh((a) => unify(a, 5)));
                expect(hasSolutions(f)).toBeTruthy();
                expect(f.length).toBe(1);
                const solution1 = f[0];
                expect(solution1).toBeDefined();
                if (solution1) {
                    expect(solution1.count).toBe(1);
                    expect(length(solution1.substitution)).toBe(1);

                    const state1 = car(solution1.substitution);
                    expect(state1).toEqual({ left: Symbol.for(`${solution1.count - 1}`), right: 5 });
                }
            });

            it("does not affect the provided goal past injecting the logic variable", async () => {
                expect(hasSolutions(await runAll(callWithFresh((a) => succeed)))).toBeTruthy();
                expect(hasSolutions(await runAll(callWithFresh((a) => fail)))).toBeFalsy();
            });
        });
    });

    describe("aggregator goals", () => {
        describe("conj", () => {
            it("evaluates to the empty set when one, the other, or both goals do not succeed in the state", async () => {
                expect(hasSolutions(await runAll(conj(succeed, fail)))).toBeFalsy();
                expect(hasSolutions(await runAll(conj(fail, succeed)))).toBeFalsy();
                expect(hasSolutions(await runAll(conj(fail, fail)))).toBeFalsy();
            });

            it("evaluates to a non-empty set when both goals succeed in the state", async () => {
                expect(hasSolutions(await runAll(conj(succeed, succeed)))).toBeTruthy();
            });
        });

        describe("disj", () => {
            it("evaluated to a non-empty set when one, the other, or both goals succeed in the state", async () => {
                expect(hasSolutions(await runAll(disj(succeed, fail)))).toBeTruthy();
                expect(hasSolutions(await runAll(disj(succeed, succeed)))).toBeTruthy();
                expect(hasSolutions(await runAll(disj(succeed, succeed)))).toBeTruthy();
            });

            it("evaluates to the empty set when neither goal succeeds", async () => {
                expect(hasSolutions(await runAll(disj(fail, fail)))).toBeFalsy();
            });
        });
    });

    describe("constraint goals", () => {
        describe("unify", () => {
            const canUnifty = async (goal: Goal): Promise<boolean> => hasSolutions(await runAll(goal));

            describe("symbols (logic variables)", () => {
                it("can be unified with a symbol", async () => {
                    expect(await canUnifty(unify(Symbol("a"), Symbol("b")))).toBeTruthy();
                });
            });

            describe("array terms", () => {
                it("can be unified with a symbol", async () => {
                    expect(await canUnifty(unify([], Symbol("[]")))).toBeTruthy();
                    expect(await canUnifty(unify(Symbol("[]"), []))).toBeTruthy();
                    const lvar = Symbol("lvar");
                    expect(await canUnifty(conj(unify(lvar, [2]), unify(lvar, [2])))).toBeTruthy();
                });

                it("cannot be unified with a symbol that's been unified to another term", async () => {
                    const lvar = Symbol("lvar");
                    expect(await canUnifty(conj(unify(lvar, 1), unify(lvar, [2])))).toBeFalsy();
                    expect(await canUnifty(conj(unify(lvar, true), unify(lvar, [2])))).toBeFalsy();
                    expect(await canUnifty(conj(unify(lvar, false), unify(lvar, [2])))).toBeFalsy();
                    expect(await canUnifty(conj(unify(lvar, []), unify(lvar, [2])))).toBeFalsy();
                    expect(await canUnifty(conj(unify(lvar, ""), unify(lvar, [2])))).toBeFalsy();
                });

                it("can be unified with other arrays of the same known structure", async () => {
                    expect(await canUnifty(unify([], []))).toBeTruthy();
                    expect(await canUnifty(unify([1], [1]))).toBeTruthy();
                    expect(await canUnifty(unify([1, [2]], [1, [2]]))).toBeTruthy();
                    expect(await canUnifty(unify([Symbol("a")], [1]))).toBeTruthy();
                });

                it("cannot be unified with other arrays of different structures", async () => {
                    expect(await canUnifty(unify([], [1]))).toBeFalsy();
                    const lvar = Symbol("lvar");
                    expect(await canUnifty(conj(unify(lvar, 1), unify([lvar], [2])))).toBeFalsy();
                });
            });

            describe("number terms", () => {
                it("can be unified with a symbol", async () => {
                    expect(await canUnifty(unify(1, Symbol("1")))).toBeTruthy();
                    expect(await canUnifty(unify(Symbol("1"), 1))).toBeTruthy();
                    const lvar = Symbol("lvar");
                    expect(await canUnifty(conj(unify(lvar, 1), unify(lvar, 1)))).toBeTruthy();
                });

                it("cannot be unified with a symbol that's been unified to another term", async () => {
                    const lvar = Symbol("lvar");
                    expect(await canUnifty(conj(unify(lvar, 2), unify(lvar, 1)))).toBeFalsy();
                    expect(await canUnifty(conj(unify(lvar, true), unify(lvar, 1)))).toBeFalsy();
                    expect(await canUnifty(conj(unify(lvar, false), unify(lvar, 1)))).toBeFalsy();
                    expect(await canUnifty(conj(unify(lvar, []), unify(lvar, 1)))).toBeFalsy();
                    expect(await canUnifty(conj(unify(lvar, ""), unify(lvar, 1)))).toBeFalsy();
                });

                it("can be unified with other numbers of the same known structure", async () => {
                    expect(await canUnifty(unify(1, 1))).toBeTruthy();
                    expect(await canUnifty(unify(2, 2))).toBeTruthy();
                });

                it("cannot be unified with other numbers of different structures", async () => {
                    expect(await canUnifty(unify(1, 2))).toBeFalsy();
                    const lvar = Symbol("lvar");
                    expect(await canUnifty(conj(unify(lvar, 1), unify(lvar, 2)))).toBeFalsy();
                });
            });

            describe("boolean terms", () => {
                it("can be unified with a symbol", async () => {
                    expect(await canUnifty(unify(true, Symbol("true")))).toBeTruthy();
                    expect(await canUnifty(unify(Symbol("true"), true))).toBeTruthy();
                    const lvar = Symbol("lvar");
                    expect(await canUnifty(conj(unify(lvar, true), unify(lvar, true)))).toBeTruthy();
                });

                it("cannot be unified with a symbol that's been unified to another term", async () => {
                    const lvar = Symbol("lvar");
                    expect(await canUnifty(conj(unify(lvar, 2), unify(lvar, true)))).toBeFalsy();
                    expect(await canUnifty(conj(unify(lvar, false), unify(lvar, true)))).toBeFalsy();
                    expect(await canUnifty(conj(unify(lvar, []), unify(lvar, true)))).toBeFalsy();
                    expect(await canUnifty(conj(unify(lvar, ""), unify(lvar, true)))).toBeFalsy();
                });

                it("can be unified with other booleans of the same known structure", async () => {
                    expect(await canUnifty(unify(true, true))).toBeTruthy();
                    expect(await canUnifty(unify(false, false))).toBeTruthy();
                });

                it("cannot be unified with other booleans of different structures", async () => {
                    expect(await canUnifty(unify(true, false))).toBeFalsy();
                    const lvar = Symbol("lvar");
                    expect(await canUnifty(conj(unify(lvar, true), unify(lvar, false)))).toBeFalsy();
                });
            });

            describe("string terms", () => {
                it("can be unified with a symbol", async () => {
                    expect(await canUnifty(unify("", Symbol("")))).toBeTruthy();
                    expect(await canUnifty(unify(Symbol(""), ""))).toBeTruthy();
                    const lvar = Symbol("lvar");
                    expect(await canUnifty(conj(unify(lvar, ""), unify(lvar, "")))).toBeTruthy();
                });

                it("cannot be unified with a symbol that's been unified to another term", async () => {
                    const lvar = Symbol("lvar");
                    expect(await canUnifty(conj(unify(lvar, 2), unify(lvar, "")))).toBeFalsy();
                    expect(await canUnifty(conj(unify(lvar, false), unify(lvar, "")))).toBeFalsy();
                    expect(await canUnifty(conj(unify(lvar, []), unify(lvar, "")))).toBeFalsy();
                });

                it("can be unified with other strings of the same known structure", async () => {
                    expect(await canUnifty(unify("", ""))).toBeTruthy();
                    expect(await canUnifty(unify("a", "a"))).toBeTruthy();
                });

                it("cannot be unified with other strings of different structures", async () => {
                    expect(await canUnifty(unify("a", "b"))).toBeFalsy();
                    const lvar = Symbol("lvar");
                    expect(await canUnifty(conj(unify(lvar, "a"), unify(lvar, "b")))).toBeFalsy();
                });
            });
        });
    });
});