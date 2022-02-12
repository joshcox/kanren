import { buildUnification } from "./unification";
import { Term } from "./term";
import { SubstitutionAPI } from "./substitution/interface";
import { StreamAPI } from "./stream/interface";
import { StoreAPI } from "./store/interface";

export { Term } from "./term";

/**
 * A Goal is a function that takes in [[IConstraints]] and returns a [[Stream]]
 * of [[IConstraints]] that represent success states
 */
export type Goal<C, $> = (store: C) => $;

export type KanrenConfig<S, C, $> = {
    substitutionAPI: SubstitutionAPI<S>;
    storeAPI: StoreAPI<S, C>;
    streamAPI: StreamAPI<C, $>;
};

export type Kanren<S, C, $> = {
    unify(u: Term, v: Term): Goal<C, $>;
    callWithFresh(f: (a: symbol) => Goal<C, $>): Goal<C, $>;
    disj(g1: Goal<C, $>, g2: Goal<C, $>): Goal<C, $>;
    conj(g1: Goal<C, $>, g2: Goal<C, $>): Goal<C, $>;
    call(g: Goal<C, $>, state: C): $;
    run(goal: Goal<C, $>, config: { numberOfSolutions: number }): Promise<C[]>;
    runAll(goal: Goal<C, $>): Promise<C[]>;
    api: {
        substitution: SubstitutionAPI<S>;
        store: StoreAPI<S, C>;
        stream: StreamAPI<C, $>;
    }
};

export const kanren = <S, C, $>({
    substitutionAPI,
    storeAPI,
    streamAPI,
}: KanrenConfig<S, C, $>): Kanren<S, C, $> => {
    type G = Goal<C, $>;
    const unification = buildUnification(substitutionAPI);

    /**
     * A goal that performs [[unification]] over two [[Term]]s. When the two terms successfully unify,
     * this goal returns a mature [[Stream]] of one that contains the substitution store that the terms were
     * able to unify within. When the two terms do _not_ unify, this goal returns a mature empty [[Stream]].
     */
    const unify = (u: Term, v: Term): G =>
        (store) => streamAPI.unit(
            storeAPI.step(unification(u, v, storeAPI.getSubstitution(store)), store)
        );

    /**
     * A goal that introduces a new, or "fresh", logic variable (represented here as `symbol`s)
     * to a function that, when given a `symbol`, returns a `Goal`.
     */
    const callWithFresh = (f: (a: symbol) => G): G =>
        (store) => {
            const [lvar, newStore] = storeAPI.fresh(store);
            return f(lvar)(newStore)
        };

    /**
     * Logical "or". This goal, when given two [[Goals]], aggregates states that are
     * successful in one, the other, or both [[Goal]]s.
     */
    const disj = (g1: G, g2: G): G =>
        (state) => streamAPI.plus(g1(state), g2(state));

    /**
     * Logical "and". This goal, when given two [[Goals]], aggregates states that are
     * successful in both [[Goal]]s.
     */
    const conj = (g1: G, g2: G): G =>
        (state) => streamAPI.bind(g2, g1(state));

    /**
     * Call a [[Goal]] against an [[State<Subst>]]. Any properties within the [[State<Subst>]] that are omitted
     * will be given sane defaults.
     */
    const call = (g: G, store: C) => g(store);

    const runner = (isDonePredicate: ($: C[]) => boolean) =>
        (goal: G) =>
            streamAPI.takeUntil(call(goal, storeAPI.empty(substitutionAPI.empty)), isDonePredicate);

    /**
     * Runs a [[Goal]], returning a maximum of `numberOfSolutions` successful states
     */
    const run = (goal: G, { numberOfSolutions }: { numberOfSolutions: number }) =>
        runner((results) => results.length >= numberOfSolutions)(goal);

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
            substitution: substitutionAPI,
            stream: streamAPI,
            store: storeAPI
        }
    }
};
