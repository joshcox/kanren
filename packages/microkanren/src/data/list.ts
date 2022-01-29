import { Pair, PairKinds, cons, isCons, isPair, Cons } from "./pair";
export { cons, isCons, Cons, car, cdr } from './pair';

export type ListTypes<A, K extends string = never> = List<A, K> | Pair<A, List<A, K>, ListKinds | K>;

enum ListOnlyKinds {
    Empty = 'empty',
}
export type ListKinds = PairKinds | ListOnlyKinds;

export class List<A, K extends string = never> extends Pair<A, List<A>, ListKinds | K> {
    constructor(kind: ListKinds | K) {
        super(kind);
    }
}
export const list = <A, K extends string = never>(items: A[]): List<A, K> =>
    items.reduce(($: List<A, K>, item) => cons(item, $), empty<A, K>());
export const isList = <A, K extends string = never>(ls: unknown): ls is List<A, K> =>
    isPair(ls) || ls instanceof List;

export class EmptyList<A, K extends string = never> extends List<A, K> {
    constructor(private _: Symbol = Symbol.for('mpt')) {
        super(ListOnlyKinds.Empty);
    }
}
export const isEmpty = <A, K extends string = never>($: List<A, K>): $ is EmptyList<A, K> => $ instanceof EmptyList;
export const empty = <A, K extends string = never>() => new EmptyList<A, K>();

export const length = <A, K extends string = never>(ls: ListTypes<A, K>): number => {
    if (isList(ls)) {
        if (isEmpty(ls)) return 0;
        else if (isCons<A, List<A, K>, ListKinds | K>(ls)) return 1 + length(ls.cdr);
        else throw new TypeError('list#length: unsupported type');
    }
    else throw new TypeError('list#length: unsupported type');
};

export const find = <A, K extends string = never>(ls: ListTypes<A, K>, pred: (item: A) => boolean): A | undefined => {
    if (isList(ls)) {
        if (isEmpty(ls)) return undefined;
        else if (isCons<A, List<A, K>, ListKinds | K>(ls)) {
            if (pred(ls.car)) return ls.car;
            else return find(ls.cdr, pred);
        }
        else throw new TypeError('list#find: unsupported type');
    }
    else throw new TypeError('list#find: unsupported type');
};