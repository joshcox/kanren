import { Store, StoreAPI } from "./interface";

interface StoreConstraint<S> extends Store<S> { }

export const ConstraintStore = <S>(): StoreAPI<S, StoreConstraint<S>> => ({
    bump: ({ count, substitution }: StoreConstraint<S>): StoreConstraint<S> => ({
        count: count + 1,
        substitution
    }),
    empty: (emptySubstitution: () => S): StoreConstraint<S> =>
        ({ substitution: emptySubstitution(), count: 0 }),
    step: (substitution: S | false, prevStore: StoreConstraint<S>): StoreConstraint<S> | undefined =>
        substitution ? ({ ...prevStore, substitution }) : undefined
});