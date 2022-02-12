export interface Store<S> {
    substitution: S;
    count: number;
}

export interface StoreAPI<S, C extends Store<S>> {
    bump({ count, substitution }: C): C;
    empty(emptySubstitution: () => S): C;
    step(substitution: S | false, prevStore: C): C | undefined;
}