import { buildUnification } from "./unification";
import { Term } from "./term";
import * as search from "./search.stream";
import { SubstitutionAPI } from "./substitution/interface";

export { Term } from "./term";

/**
 * A set of constraints that represents a solution to a model.
 */
export type State<S> = { substitution: S, count: number };

/**
 * A Goal is a function that takes in [[IConstraints]] and returns a [[Stream]]
 * of [[IConstraints]] that represent success states
 */
export type Goal<S> = (constraints: State<S>) => search.Stream<S>;

export type KanrenConfig<S> = {
    substitutionAPI: SubstitutionAPI<S>;
};

type RunnerConfig<State> = { state?: Partial<State> };
type RunConfig<State> = RunnerConfig<State> & { numberOfSolutions: number };

export type Kanren<S> = {
    unify(u: Term, v: Term): Goal<S>;
    callWithFresh(f: (a: symbol) => Goal<S>): Goal<S>;
    disj(g1: Goal<S>, g2: Goal<S>): Goal<S>;
    conj(g1: Goal<S>, g2: Goal<S>): Goal<S>;
    call(g: Goal<S>, state: State<S>): search.Stream<State<S>>;
    run(goal: Goal<S>, config: RunConfig<State<S>>): Promise<State<S>[]>;
    runAll(goal: Goal<S>, config?: RunnerConfig<State<S>>): Promise<State<S>[]>;
    api: {
        substitution: SubstitutionAPI<S>;
    }
};

export const kanren = <Subst>({ substitutionAPI }: KanrenConfig<Subst>): Kanren<Subst> => {
    
    type IState = State<Subst>;


    type IGoal = Goal<Subst>;

    const unification = buildUnification(substitutionAPI);

    /**
     * A goal that performs [[unification]] over two [[Term]]s. When the two terms successfully unify,
     * this goal returns a mature [[Stream]] of one that contains the substitution store that the terms were
     * able to unify within. When the two terms do _not_ unify, this goal returns a mature empty [[Stream]].
     */
    const unify = (u: Term, v: Term): IGoal =>
        ({ substitution, count }) => {
            const newSub = unification(u, v, substitution);
            return search.unit.stream(newSub ? [{ substitution: newSub, count }] : []);
        };

    /**
     * A goal that introduces a new, or "fresh", logic variable (represented here as `symbol`s)
     * to a function that, when given a `symbol`, returns a `Goal`.
     */
    const callWithFresh = (f: (a: symbol) => IGoal): IGoal =>
        ({ substitution, count }) =>
            f(Symbol.for(`${count}`))({ substitution, count: count + 1 });

    /**
     * Logical "or". This goal, when given two [[Goals]], aggregates states that are
     * successful in one, the other, or both [[Goal]]s.
     */
    const disj = (g1: IGoal, g2: IGoal): IGoal =>
        (state) => search.plus(g1(state), g2(state));

    /**
     * Logical "and". This goal, when given two [[Goals]], aggregates states that are
     * successful in both [[Goal]]s.
     */
    const conj = (g1: IGoal, g2: IGoal): IGoal =>
        (state) => search.bind(g2, g1(state));

    /**
     * Call a [[Goal]] against an [[IState]]. Any properties within the [[IState]] that are omitted
     * will be given sane defaults.
     */
    const call = (g: IGoal, state: Partial<IState>) =>
        g({ count: 0, substitution: substitutionAPI.empty(), ...state });


    const runner = (isDonePredicate: ($: IState[]) => boolean) =>
        (goal: IGoal, { state }: RunnerConfig<IState> = {}) =>
            search.takeUntil(call(goal, state ?? {}), isDonePredicate);

    /**
     * Runs a [[Goal]], returning a maximum of `numberOfSolutions` successful states
     */
    const run = (goal: IGoal, { numberOfSolutions, ...options }: RunConfig<IState>) =>
        runner((results) => results.length >= numberOfSolutions)(goal, options);

    /**
     * Runs a [[Goal]], returning all successful states
     */
    const runAll = runner(() => false);

    return {
        unify,
        conj,
        disj,
        call,
        callWithFresh,
        run,
        runAll,
        api: {
            substitution: substitutionAPI
        }
    }
};
