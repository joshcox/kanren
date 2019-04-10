import { unification } from "./unification";
import { append, appendMap, take, takeAll, Stream } from "./data/Stream";
import { Term } from "./data/Term";
import { List } from "immutable";
import { IState } from "./data/State";
import { Goal } from "./data/Goal";

export { Term } from "./data/Term";

/**
 * Initialize a kanren library. The library can be accessed as properties on the resulting object.
 *
 * ## Example
 * ```typescript
 * const { unify, runAll, conj, disj, callWithFresh } = kanren();
 * runAll(unify(1, 1));
 * ```
 */
export const kanren = () => {
    // unify goal
    const unify = (u: Term, v: Term): Goal =>
        ({ substitution: substitutionStore, count }) => {
            const newSubStore = unification(u, v, substitutionStore);
            return newSubStore ? List([{ substitution: newSubStore, count }]) : List();
        };

    // fresh logic variable goal
    const callWithFresh = (f: (a: symbol) => Goal): Goal =>
        ({ substitution, count }) =>
            f(Symbol.for(`${count}`))({ substitution, count: count + 1 });

    // disjunction/or goal
    const disj = (g1: Goal, g2: Goal): Goal =>
        (state) => append(g1(state), g2(state));

    // conjunction/and goal
    const conj = (g1: Goal, g2: Goal): Goal =>
        (state) => appendMap(g2, g1(state));

    // Run a goal against
    const call = (g: Goal, state: Partial<IState>) => g({ count: 0, substitution: List(), ...state });

    interface IRunOptions {
        goal: Goal;
        state?: Partial<IState>;
    }

    const runner = (take: ($: Stream<IState>) => List<IState>) =>
        ({ goal, state = {} }: IRunOptions) =>
            take(call(goal, state))

    const run = ({ numberOfSolutions, ...options }: IRunOptions & { numberOfSolutions: number }) =>
        runner(take(numberOfSolutions))(options);

    const runAll = runner(takeAll);

    return {
        unify,
        callWithFresh,
        disj,
        conj,
        run,
        runAll
    };
}
