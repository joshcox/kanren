export interface StoreAPI<S, C> {
    increment(store: C): C;
    empty(emptySubstitution: () => S): C;
    step(substitution: S | false, prevStore: C): C | undefined;
    getSubstitution(store: C): S;
    getCount(store: C): number;
    fresh(store: C): [symbol, C];
}