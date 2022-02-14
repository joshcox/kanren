import 'reflect-metadata';
import { buildUnification } from "./unification";
import { Goal, Kanren, StoreAPI, StreamAPI, SubstitutionAPI, Term } from "@kanren/types";
import { inject, injectable } from "inversify";
import { Library } from "./constants";

@injectable()
export class MKanren<S, C, $> implements Kanren<S, C, $> {
    private unification: (t1: Term, t2: Term, substitution: false | S) => false | S;
    constructor(
        @inject(Library.Substitution) public substitution: SubstitutionAPI<S>,
        @inject(Library.Store) public store: StoreAPI<S, C>,
        @inject(Library.Stream) public stream: StreamAPI<C, $>
    ) {
        this.unification = buildUnification(this.substitution);
    }

    api = {
        substitution: this.substitution,
        store: this.store,
        stream: this.stream
    };

    unify = (u: Term, v: Term): Goal<C, $> =>
        (store) => this.stream.unit(
            this.store.step(
                this.unification(u, v, this.store.getSubstitution(store)),
                store
            )
        );

    callWithFresh = (f: (a: symbol) => Goal<C, $>): Goal<C, $> =>
        (store) => {
            const [lvar, newStore] = this.store.fresh(store);
            return f(lvar)(newStore);
        };

    delay = this.stream.delay;
    disj = (g1: Goal<C, $>, g2: Goal<C, $>): Goal<C, $> =>
        (state) => this.stream.plus(
            g1(state),
            g2(state)
        );

    conj = (g1: Goal<C, $>, g2: Goal<C, $>): Goal<C, $> =>
        (state) => this.stream.bind(g2, g1(state));

    call = (g: Goal<C, $>, store: C) => g(store);

    runner = (isDonePredicate: ($: C[]) => boolean) =>
        (goal: Goal<C, $>) =>
            this.stream.takeUntil(this.call(goal, this.store.empty()), isDonePredicate);

    run = (goal: Goal<C, $>, { numberOfSolutions }: { numberOfSolutions: number }) =>
        this.runner((results) => results.length >= numberOfSolutions)(goal);

    runWithFresh = (g: (a: symbol) => Goal<C, $>, opts: { numberOfSolutions: number }) =>
        this.run(this.callWithFresh(g), opts);

    runAll = this.runner(() => false)
}