import { Kanren, Goal } from "@kanren/types";

type PreludeConfig<S, C, $> = {
    kanren: Kanren<S, C, $>;
    name: string;
}

export const prelude = <S, C, $>({ kanren, name }: PreludeConfig<S, C, $>) => {
    const { unify, runWithFresh, runAll, conj, disj, callWithFresh, delay, api } = kanren;
    const hasSolutions = (solutions: C[]): boolean => solutions.length > 0;

    describe(name, () => {
        const succeed = (state: C): $ => api.stream.unit(state);
        const fail = (_: C): $ => api.stream.unit();

        describe("scope goals", () => {
            describe("callWithFresh", () => {
                it("injects a new logic variable into the provided goal", async () => {
                    const f = await runAll(callWithFresh((a) => unify(a, 5)));
                    expect(hasSolutions(f)).toBeTruthy();
                    expect(f.length).toBe(1);
                    const solution1 = f[0];
                    expect(solution1).toBeDefined();
                    if (solution1) {
                        expect(api.store.getCount(solution1)).toBe(1);
                        expect(
                            api.substitution.walk(
                                Symbol.for(`${api.store.getCount(solution1) - 1}`),
                                api.store.getSubstitution(solution1)
                            )
                        ).toBe(5);
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
                const canUnify = async (goal: Goal<C, $>): Promise<boolean> => hasSolutions(await runAll(goal));

                describe("symbols (logic variables)", () => {
                    it("can be unified with a symbol", async () => {
                        expect(await canUnify(unify(Symbol("a"), Symbol("b")))).toBeTruthy();
                    });
                });

                describe("array terms", () => {
                    it("can be unified with a symbol", async () => {
                        expect(await canUnify(unify([], Symbol("[]")))).toBeTruthy();
                        expect(await canUnify(unify(Symbol("[]"), []))).toBeTruthy();
                        const lvar = Symbol("lvar");
                        expect(await canUnify(conj(unify(lvar, [2]), unify(lvar, [2])))).toBeTruthy();
                    });

                    it("cannot be unified with a symbol that's been unified to another term", async () => {
                        const lvar = Symbol("lvar");
                        expect(await canUnify(conj(unify(lvar, 1), unify(lvar, [2])))).toBeFalsy();
                        expect(await canUnify(conj(unify(lvar, true), unify(lvar, [2])))).toBeFalsy();
                        expect(await canUnify(conj(unify(lvar, false), unify(lvar, [2])))).toBeFalsy();
                        expect(await canUnify(conj(unify(lvar, []), unify(lvar, [2])))).toBeFalsy();
                        expect(await canUnify(conj(unify(lvar, ""), unify(lvar, [2])))).toBeFalsy();
                    });

                    it("can be unified with other arrays of the same known structure", async () => {
                        expect(await canUnify(unify([], []))).toBeTruthy();
                        expect(await canUnify(unify([1], [1]))).toBeTruthy();
                        expect(await canUnify(unify([1, [2]], [1, [2]]))).toBeTruthy();
                        expect(await canUnify(unify([Symbol("a")], [1]))).toBeTruthy();
                    });

                    it("cannot be unified with other arrays of different structures", async () => {
                        expect(await canUnify(unify([], [1]))).toBeFalsy();
                        const lvar = Symbol("lvar");
                        expect(await canUnify(conj(unify(lvar, 1), unify([lvar], [2])))).toBeFalsy();
                    });
                });

                describe("number terms", () => {
                    it("can be unified with a symbol", async () => {
                        expect(await canUnify(unify(1, Symbol("1")))).toBeTruthy();
                        expect(await canUnify(unify(Symbol("1"), 1))).toBeTruthy();
                        const lvar = Symbol("lvar");
                        expect(await canUnify(conj(unify(lvar, 1), unify(lvar, 1)))).toBeTruthy();
                    });

                    it("cannot be unified with a symbol that's been unified to another term", async () => {
                        const lvar = Symbol("lvar");
                        expect(await canUnify(conj(unify(lvar, 2), unify(lvar, 1)))).toBeFalsy();
                        expect(await canUnify(conj(unify(lvar, true), unify(lvar, 1)))).toBeFalsy();
                        expect(await canUnify(conj(unify(lvar, false), unify(lvar, 1)))).toBeFalsy();
                        expect(await canUnify(conj(unify(lvar, []), unify(lvar, 1)))).toBeFalsy();
                        expect(await canUnify(conj(unify(lvar, ""), unify(lvar, 1)))).toBeFalsy();
                    });

                    it("can be unified with other numbers of the same known structure", async () => {
                        expect(await canUnify(unify(1, 1))).toBeTruthy();
                        expect(await canUnify(unify(2, 2))).toBeTruthy();
                    });

                    it("cannot be unified with other numbers of different structures", async () => {
                        expect(await canUnify(unify(1, 2))).toBeFalsy();
                        const lvar = Symbol("lvar");
                        expect(await canUnify(conj(unify(lvar, 1), unify(lvar, 2)))).toBeFalsy();
                    });
                });

                describe("boolean terms", () => {
                    it("can be unified with a symbol", async () => {
                        expect(await canUnify(unify(true, Symbol("true")))).toBeTruthy();
                        expect(await canUnify(unify(Symbol("true"), true))).toBeTruthy();
                        const lvar = Symbol("lvar");
                        expect(await canUnify(conj(unify(lvar, true), unify(lvar, true)))).toBeTruthy();
                    });

                    it("cannot be unified with a symbol that's been unified to another term", async () => {
                        const lvar = Symbol("lvar");
                        expect(await canUnify(conj(unify(lvar, 2), unify(lvar, true)))).toBeFalsy();
                        expect(await canUnify(conj(unify(lvar, false), unify(lvar, true)))).toBeFalsy();
                        expect(await canUnify(conj(unify(lvar, []), unify(lvar, true)))).toBeFalsy();
                        expect(await canUnify(conj(unify(lvar, ""), unify(lvar, true)))).toBeFalsy();
                    });

                    it("can be unified with other booleans of the same known structure", async () => {
                        expect(await canUnify(unify(true, true))).toBeTruthy();
                        expect(await canUnify(unify(false, false))).toBeTruthy();
                    });

                    it("cannot be unified with other booleans of different structures", async () => {
                        expect(await canUnify(unify(true, false))).toBeFalsy();
                        const lvar = Symbol("lvar");
                        expect(await canUnify(conj(unify(lvar, true), unify(lvar, false)))).toBeFalsy();
                    });
                });

                describe("string terms", () => {
                    it("can be unified with a symbol", async () => {
                        expect(await canUnify(unify("", Symbol("")))).toBeTruthy();
                        expect(await canUnify(unify(Symbol(""), ""))).toBeTruthy();
                        const lvar = Symbol("lvar");
                        expect(await canUnify(conj(unify(lvar, ""), unify(lvar, "")))).toBeTruthy();
                    });

                    it("cannot be unified with a symbol that's been unified to another term", async () => {
                        const lvar = Symbol("lvar");
                        expect(await canUnify(conj(unify(lvar, 2), unify(lvar, "")))).toBeFalsy();
                        expect(await canUnify(conj(unify(lvar, false), unify(lvar, "")))).toBeFalsy();
                        expect(await canUnify(conj(unify(lvar, []), unify(lvar, "")))).toBeFalsy();
                    });

                    it("can be unified with other strings of the same known structure", async () => {
                        expect(await canUnify(unify("", ""))).toBeTruthy();
                        expect(await canUnify(unify("a", "a"))).toBeTruthy();
                    });

                    it("cannot be unified with other strings of different structures", async () => {
                        expect(await canUnify(unify("a", "b"))).toBeFalsy();
                        const lvar = Symbol("lvar");
                        expect(await canUnify(conj(unify(lvar, "a"), unify(lvar, "b")))).toBeFalsy();
                    });
                });
            });
        });

        describe("laziness", () => {
            const fives = (x: symbol): Goal<C, $> => disj(
                unify(x, 5),
                delay(() => fives(x))
            );
            const fours = (x: symbol): Goal<C, $> => delay(() => disj(
                unify(x, 4),
                fours(x)
            ));
            const fives2 = (x: symbol): Goal<C, $> => conj(
                unify(x, 5),
                delay(() => fives(x))
            );

            it('can lazily pull a stream', async () => {
                const fiveSolutions = await runWithFresh(fours, { numberOfSolutions: 5 });
                expect(fiveSolutions).toHaveLength(5);
                console.log(fiveSolutions);
                console.log(fiveSolutions.length);
            });

            it('can lazily pull a stream', async () => {
                const fiveSolutions = await runWithFresh(fives2, { numberOfSolutions: 5 });
                expect(fiveSolutions).toHaveLength(5);
                console.log(fiveSolutions);
                console.log(fiveSolutions.length);
            });
        });
    });
};