import { Readable } from "stream";

export type LVar = symbol;
export type BaseTerms = LVar | boolean | null | number | string | Array<any>;
export type Term<T> = BaseTerms | T;

export interface TermAPI<T> {
    lvar(i: number): LVar;
}

export interface SubstitutionAPI<T, S> {
    walk(term: Term<T>, substitution: S): Term<T>;
    add(left: Term<T>, right: Term<T>, substitution: S): S;
    empty(): S;
}

export interface StoreAPI<S, C> {
    increment(store: C): C;
    empty(): C;
    step(substitution: S | false, prevStore: C): C | undefined;
    getSubstitution(store: C): S;
    getCount(store: C): number;
    fresh(store: C): [LVar, C];
}

export interface StreamAPI<A, $> {
    // unit : a -> $
    unit(a?: A): $;
    // delay : (() -> a -> $) -> a -> $
    delay(fn: () => (a: A) => $): (a: A) => $;
    // plus : $ -> $ -> $
    plus($1: $, $2: $): $;
    // bind : (a -> $) -> $ -> $
    bind(fn: (store: A) => $, stream: $): $;
    // pull : $ -> [a, $]
    pull($: $): [A, $];
    // take : $ -> Readable a
    take($: $): Readable;
    // takeUntil : $ -> ([a] -> boolean) -> Promise [a]
    takeUntil($: $, pred: ($: A[]) => boolean): Promise<A[]>;
}

export type Goal<C, $> = (store: C) => $;

export type Kanren<T, S, C, $> = {
    unify(u: Term<T>, v: Term<T>): Goal<C, $>;
    callWithFresh(f: (a: LVar) => Goal<C, $>): Goal<C, $>;
    disj(g1: Goal<C, $>, g2: Goal<C, $>): Goal<C, $>;
    conj(g1: Goal<C, $>, g2: Goal<C, $>): Goal<C, $>;
    call(g: Goal<C, $>, state: C): $;
    delay(g: () => Goal<C, $>): Goal<C, $>;
    run(goal: Goal<C, $>, config: { numberOfSolutions: number }): Promise<C[]>;
    runAll(goal: Goal<C, $>): Promise<C[]>;
    runWithFresh: (g: (a: LVar) => Goal<C, $>, { numberOfSolutions }: {
        numberOfSolutions: number;
    }) => Promise<C[]>
    api: {
        substitution: SubstitutionAPI<T, S>;
        store: StoreAPI<S, C>;
        stream: StreamAPI<C, $>;
        term: TermAPI<T>;
    }
};