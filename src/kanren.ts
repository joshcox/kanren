import { buildUnification } from "./unification";
import { append, appendMap, take, takeAll, Stream } from "./data/Stream";
import { Term } from "./data/Term";
import { List } from "immutable";
import { IState } from "./data/State";
import { Goal } from "./data/Goal";

export { Term } from "./data/Term";

interface IRunOptions {
    goal: Goal;
    state?: Partial<IState>;
}

interface IBuildKanren {

}

interface IKanren {
    callWithFresh(f: (a: symbol) => Goal): Goal;
    conj(g1: Goal, g2: Goal): Goal;
    disj(g1: Goal, g2: Goal): Goal;
    unify(u: Term, v: Term): Goal;
    run(opts: IRunOptions & { numberOfSolutions: number }): List<IState>;
    runAll(opts: IRunOptions): List<IState>;
}

/**
 * Initialize a kanren library. The library can be accessed as properties on the resulting object.
 *
 * ## Example
 * ```typescript
 * const { unify, runAll, conj, disj, callWithFresh } = kanren();
 * runAll(unify(1, 1));
 * ```
 */
export const kanren = ({ }: IBuildKanren): IKanren => {

    const call = (g: Goal, state: Partial<IState>) => g({ count: 0, substitution: List(), ...state });

    const runner = (take: ($: Stream<IState>) => List<IState>) =>
        ({ goal, state = {} }: IRunOptions) =>
            take(call(goal, state));

    const unification = buildUnification({});

    return {
        callWithFresh: (f) => ({ substitution, count }) => f(Symbol.for(`${count}`))({ substitution, count: count + 1 }),
        conj: (g1, g2) => (state) => appendMap(g2, g1(state)),
        disj: (g1, g2) => (state) => append(g1(state), g2(state)),
        unify: (u, v) => ({ substitution, count }) => {
            const newSubStore = unification(u, v, substitution);
            return newSubStore ? List([{ substitution: newSubStore, count }]) : List();
        },
        run: ({ numberOfSolutions, ...options }) => runner(take(numberOfSolutions))(options),
        runAll: runner(takeAll)
    };
}
