import { StoreAPI } from "@kanren/types";

export type ConstraintStore<S> = {
    substitution: S;
    count: number
}

const increment = <S>({ count, substitution }: ConstraintStore<S>): ConstraintStore<S> => ({
    count: count + 1,
    substitution
})

const empty = <S>(emptySubstitution: () => S): ConstraintStore<S> =>
    ({ substitution: emptySubstitution(), count: 0 });

const step = <S>(substitution: S | false, prevStore: ConstraintStore<S>): ConstraintStore<S> | undefined =>
    substitution ? ({ ...prevStore, substitution }) : undefined;

const getSubstitution = <S>(store: ConstraintStore<S>): S => store.substitution;
const getCount = <S>(store: ConstraintStore<S>): number => store.count;

const fresh = <S>(store: ConstraintStore<S>): [symbol, ConstraintStore<S>] => ([
    Symbol.for(`${store.count}`),
    increment(store)
]);

export const ConstraintStore = <S>(): StoreAPI<S, ConstraintStore<S>> => ({
    increment,
    empty,
    step,
    getSubstitution,
    fresh,
    getCount
});