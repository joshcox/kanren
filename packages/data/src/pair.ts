import { Base } from "./base";

export enum PairKinds {
    Cons = 'Cons'
}
export class Pair<A, D, K extends string = never> extends Base<PairKinds | K> {
    constructor(kind: PairKinds | K) {
        super(kind);
    }
}
export const isPair = <A, D, K extends string = never>($: unknown): $ is Cons<A, D, K> =>
    $ instanceof Pair;

export class Cons<A, D, K extends string = never> extends Pair<A, D, K> {
    constructor(readonly car: A, readonly cdr: D) {
        super(PairKinds.Cons);
    }
}

export const isCons = <A, D, K extends string = never>($: unknown): $ is Cons<A, D, K> =>
    $ instanceof Cons;

export const cons = <A, D, K extends string = never>(head: A, tail: D): Pair<A, D, K> =>
    new Cons(head, tail);

export const car = <A, D, K extends string = never>(pr: Pair<A, D, K>): A => {
    if (isCons<A, D, K>(pr)) return pr.car;
    else throw new TypeError('pair#car: unsupported type');
};

export const cdr = <A, D, K extends string = never>(pr: Pair<A, D, K>): D => {
    if (isCons<A, D, K>(pr)) return pr.cdr;
    else throw new TypeError('pair#cdr: unsupported type');
};