import { conj, disj, callWithFresh, unify, run, runAll, Term } from "./mk";


// const iota = (n: number): Goal =>
//     callWithFresh(b => disj(
//         unify(b, 1),
//         (c: IConstraints) => () => iota(n + 1)(c)
//     ));

// const iotaExample = (): Goal =>
//     conj(callWithFresh(a => unify(a, "seven")), iota(0));

// const simple = () => callWithEmptyState(
//     conj(
//         callWithFresh(a => unify(a, "seven")),
//         callWithFresh(b => disj(
//             unify(b, "five"),
//             unify(b, "six")
//         ))
//     )
// );

// const prettyPrint = (n: number, solutions: Stream<IConstraints>) => {
//     // debugger;
//     return take(n)(solutions)
//         .map(({ substitutionStore, count }, solutionIndex) => {
//             // debugger;
//             return ({
//                 solutionNumber: solutionIndex + 1,
//                 substitution: substitutionStore
//                     .map(({ left, right }) => `${left.toString()}: ${right.toString()}`)
//                     .join("\n\t\t"),
//                 count: `${count}`
//             });
//         })
//         .forEach(({ solutionNumber, substitution, count }) => {
//             console.log(`Solution #${solutionNumber}:`);
//             console.log(`\tNumber of LVars: ${count}`);
//             console.log(`\tSubstitution Store:\n\t\t${substitution}`);
//         });
// };

// prettyPrint(5, simple);
// prettyPrint(5, callWithEmptyState(iotaExample()));

describe("mk", () => {
    describe("core", () => {
        describe("unify", () => {
            const doesItUnify = (t1: Term, t2: Term): boolean => !runAll({ goal: unify(t1, t2) }).isEmpty()

            it("does not unify unlike terms", () => {
                expect(doesItUnify(1, 2)).toBeFalsy();
                expect(doesItUnify("a", "b")).toBeFalsy();
                expect(doesItUnify([1], [])).toBeFalsy();
                expect(doesItUnify(true, false)).toBeFalsy();
            });

            it("unifies like terms in an empty substitution", () => {
                expect(doesItUnify(1, 1)).toBeTruthy();
                expect(doesItUnify("a", "a")).toBeTruthy();
                expect(doesItUnify(true, true)).toBeTruthy();
                expect(doesItUnify([], [])).toBeTruthy();
                expect(doesItUnify([1], [1])).toBeTruthy();
                expect(doesItUnify([[1]], [[1]])).toBeTruthy();
            });

            it("unifies symbols with anything in an empty state", () => {
                expect(doesItUnify(Symbol("a"), Symbol("b"))).toBeTruthy();
                expect(doesItUnify(Symbol("a"), 1)).toBeTruthy();
                expect(doesItUnify(Symbol("a"), "2")).toBeTruthy();
                expect(doesItUnify(Symbol("a"), true)).toBeTruthy();
                expect(doesItUnify(Symbol("a"), [])).toBeTruthy();
            });

            it("does not unify symbols to any new terms, except symbols", () => {
                const testSymbol = Symbol("testSymbol");

                const doesItUnifyInState = (right: Term) => (t1: Term, t2: Term): boolean => !runAll({
                    goal: unify(t1, t2),
                    constraints: { substitutionStore: [{ left: testSymbol, right }], count: 1 }
                }).isEmpty();

                const doesItUnifyWith1 = doesItUnifyInState(1);

                expect(doesItUnifyWith1(testSymbol, Symbol("b"))).toBeTruthy();

                expect(doesItUnifyWith1(testSymbol, 2)).toBeFalsy();
                expect(doesItUnifyWith1(testSymbol, "2")).toBeFalsy();
                expect(doesItUnifyWith1(testSymbol, true)).toBeFalsy();
                expect(doesItUnifyWith1(testSymbol, [])).toBeFalsy();
            });
        });

        xdescribe("conj", () => {

        });
    });

});