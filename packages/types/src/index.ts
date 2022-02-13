 export type Term = boolean | undefined | null | number | string | symbol | Array<any>;

export interface SubstitutionAPI<S> {
    walk(term: Term, substitution: S): Term;
    add(left: Term, right: Term, substitution: S): S;
    empty(): S;
}

export interface StoreAPI<S, C> {
    increment(store: C): C;
    empty(emptySubstitution: () => S): C;
    step(substitution: S | false, prevStore: C): C | undefined;
    getSubstitution(store: C): S;
    getCount(store: C): number;
    fresh(store: C): [symbol, C];
}

export interface StreamAPI<A, $> {
    unit(state?: A): $;
    plus(stream1: $, stream2: $): $;
    bind(fn: (store: A) => $, stream: $): $;
    takeUntil(stream: $, isDonePredicate: ($: A[]) => boolean): Promise<A[]>;
    delay(fn: Goal<A, $>): Goal<A, $>;
}

 export type Goal<C, $> = (store: C) => $;

 export type KanrenConfig<S, C, $> = {
     substitutionAPI: SubstitutionAPI<S>;
     storeAPI: StoreAPI<S, C>;
     streamAPI: StreamAPI<C, $>;
 };

 type Micro<T, C, $, G> = {
    unify(u: Term, v: Term): G;
    callWithFresh(f: (a: symbol) => G): G;
    disj(g1: G, g2: G): G;
    conj(g1: G, g2: G): G;
    call(g: G, state: C): $;
    run(goal: G, config: { numberOfSolutions: number }): Promise<C[]>;
    runAll(goal: G): Promise<C[]>;
 }
 
 export type Kanren<S, C, $> = {
     unify(u: Term, v: Term): Goal<C, $>;
     callWithFresh(f: (a: symbol) => Goal<C, $>): Goal<C, $>;
     disj(g1: Goal<C, $>, g2: Goal<C, $>): Goal<C, $>;
     conj(g1: Goal<C, $>, g2: Goal<C, $>): Goal<C, $>;
     call(g: Goal<C, $>, state: C): $;
     delay(g: Goal<C, $>): Goal<C, $>;
     run(goal: Goal<C, $>, config: { numberOfSolutions: number }): Promise<C[]>;
     runAll(goal: Goal<C, $>): Promise<C[]>;
     api: {
         substitution: SubstitutionAPI<S>;
         store: StoreAPI<S, C>;
         stream: StreamAPI<C, $>;
     }
 };