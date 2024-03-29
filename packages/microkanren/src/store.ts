import { LVar, StoreAPI, SubstitutionAPI, TermAPI } from "@kanren/types";
import { inject, injectable } from "inversify";
import { Library } from "./constants";

export type ConstraintStore<S> = {
    substitution: S;
    count: number
}

@injectable()
export class CStore<T, S> implements StoreAPI<S, ConstraintStore<S>> {
    constructor(
        @inject(Library.Substitution) private substitution: SubstitutionAPI<T, S>,
        @inject(Library.Term) private term: TermAPI<T>
    ) { }

    empty = (): ConstraintStore<S> => ({
        substitution: this.substitution.empty(),
        count: 0
    });

    increment = (store: ConstraintStore<S>): ConstraintStore<S> => ({
        substitution: store.substitution,
        count: store.count + 1
    });

    step = (substitution: false | S, prevStore: ConstraintStore<S>): ConstraintStore<S> | undefined =>
        substitution ? { ...prevStore, substitution } : undefined;

    fresh = (store: ConstraintStore<S>): [LVar, ConstraintStore<S>] =>
        ([this.term.lvar(store.count), this.increment(store)]);

    getSubstitution = (store: ConstraintStore<S>): S => store.substitution;

    getCount = (store: ConstraintStore<S>): number => store.count;
}