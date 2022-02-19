import 'reflect-metadata';
import { buildUnification } from "./unification";
import { Goal, Kanren, LVar, StoreAPI, StreamAPI, SubstitutionAPI, TermAPI } from "@kanren/types";
import { inject, injectable } from "inversify";
import { Library } from "./constants";

@injectable()
export class MKanren<T, S, C, $> implements Kanren<T, S, C, $> {
    private unification: (t1: T, t2: T, substitution: false | S) => false | S;
    constructor(
        @inject(Library.Substitution) public substitution: SubstitutionAPI<T, S>,
        @inject(Library.Store) public store: StoreAPI<S, C>,
        @inject(Library.Stream) public stream: StreamAPI<C, $>,
        @inject(Library.Term) public term: TermAPI<T>
    ) {
        this.unification = buildUnification<T, S>(this.substitution);
    }

    api = {
        substitution: this.substitution,
        store: this.store,
        stream: this.stream,
        term: this.term
    };

    unify = (u: T, v: T): Goal<C, $> =>
        (store) => this.stream.unit(
            this.store.step(
                this.unification(u, v, this.store.getSubstitution(store)),
                store
            )
        );

    callWithFresh = (f: (a: LVar) => Goal<C, $>): Goal<C, $> =>
        (store) => {
            const [lvar, newStore] = this.store.fresh(store);
            return f(lvar)(newStore);
        };

    delay = this.stream.delay;
    
    disj = (g1: Goal<C, $>, g2: Goal<C, $>): Goal<C, $> =>
        (state) => this.stream.plus(g1(state), g2(state));

    conj = (g1: Goal<C, $>, g2: Goal<C, $>): Goal<C, $> =>
        (state) => this.stream.bind(g2, g1(state));

    call = (g: Goal<C, $>, store: C) => g(store);

    runner = (isDonePredicate: ($: C[]) => boolean) =>
        (goal: Goal<C, $>) =>
            this.stream.takeUntil(this.call(goal, this.store.empty()), isDonePredicate);

    run = (goal: Goal<C, $>, { numberOfSolutions }: { numberOfSolutions: number }) =>
        this.runner((results) => results.length >= numberOfSolutions)(goal);

    runWithFresh = (g: (a: LVar) => Goal<C, $>, opts: { numberOfSolutions: number }) =>
        this.run(this.callWithFresh(g), opts);

    runAll = this.runner(() => false)
}