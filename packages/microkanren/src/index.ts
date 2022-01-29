import { unification } from "./unification";
import { append, appendMap, take, takeAll, Stream } from "./data/Stream";
import { Term } from "./data/Term";
import { List } from "immutable";
import { IState } from "./data/State";
import { Goal } from "./data/Goal";

export { Term } from "./data/Term";

interface IRunOptions {
    state?: Partial<IState>;
}

export const kanren = () => {
    /**
     * A goal that performs [[unification]] over two [[Term]]s. When the two terms successfully unify,
     * this goal returns a mature [[Stream]] of one that contains the substitution store that the terms were
     * able to unify within. When the two terms do _not_ unify, this goal returns a mature empty [[Stream]].
     */
    const unify = (u: Term, v: Term): Goal =>
        ({ substitution: substitutionStore, count }) => {
            const newSubStore = unification(u, v, substitutionStore);
            return newSubStore ? List([{ substitution: newSubStore, count }]) : List();
        };

    /**
     * A goal that introduces a new, or "fresh", logic variable (represented here as `symbol`s)
     * to a function that, when given a `symbol`, returns a `Goal`.
     */
    const callWithFresh = (f: (a: symbol) => Goal): Goal =>
        ({ substitution, count }) =>
            f(Symbol.for(`${count}`))({ substitution, count: count + 1 });

    /**
     * Logical "or". This goal, when given two [[Goals]], aggregates states that are
     * successful in one, the other, or both [[Goal]]s.
     */
    const disj = (g1: Goal, g2: Goal): Goal =>
        (state) => append(g1(state), g2(state));

    /**
     * Logical "and". This goal, when given two [[Goals]], aggregates states that are
     * successful in both [[Goal]]s.
     */
    const conj = (g1: Goal, g2: Goal): Goal =>
        (state) => appendMap(g2, g1(state));

    /**
     * Call a [[Goal]] against an [[IState]]. Any properties within the [[IState]] that are omitted
     * will be given sane defaults.
     */
    const call = (g: Goal, state: Partial<IState>) => g({ count: 0, substitution: List(), ...state });

    const runner = (take: ($: Stream<IState>) => List<IState>) =>
        (goal: Goal, { state = {} }: IRunOptions = {}) =>
            take(call(goal, state))

    /**
     * Runs a [[Goal]], returning a maximum of `numberOfSolutions` successful states
     */
    const run = (goal: Goal, { numberOfSolutions, ...options }: IRunOptions & { numberOfSolutions: number }) =>
        runner(take(numberOfSolutions))(goal, options);

    /**
     * Runs a [[Goal]], returning all successful states
     */
    const runAll = runner(takeAll);

    return {
        unify,
        conj,
        disj,
        callWithFresh,
        run,
        runAll
    }
};
