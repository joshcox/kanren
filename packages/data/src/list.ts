import { Empty, NilKinds, NilTypes } from "./nil";
import { empty, isEmpty } from './nil';
import { Pair, PairKinds, cons, isCons, isPair, Cons, cdr } from "./pair";
export { cons, isCons, Cons, car, cdr } from './pair';
export { empty, isEmpty } from './nil';

export type List<A, K extends string = never> =
    Empty<K> |
    Pair<A, List<A, NilKinds | K>, NilKinds | K>;

export const list = <A, K extends string = never>(items: A[]): List<A, K> =>
    items.reduce(($: List<A, K>, item) => cons<A, List<A, K>, K>(item, $), empty<K>());

/**
 * Not technically correct. Should also recur down the structure and check
 * that it terminates in an empty list. That sucks, though. I need to find
 * a better way to represent/wrap/mix information about lists inside the Pair
 * or something - maybe some symbol map? idk
 */
export const isList = <A, K extends string = never>(ls: unknown): ls is List<A, K> =>
    isEmpty(ls) || isPair(ls);

export const length = <A, K extends string = never>(ls: List<A, K>): number => {
    if (isList(ls)) {
        if (isEmpty(ls)) return 0;
        else if (isCons<A, List<A, K>, K>(ls)) return 1 + length(ls.cdr);
        else throw new TypeError('list#length: unsupported type');
    }
    else throw new TypeError('list#length: unsupported type');
};

export const find = <A, K extends string = never>(ls: List<A, K>, pred: (item: A) => boolean): A | undefined => {
    if (isList(ls)) {
        if (isEmpty(ls)) return undefined;
        else if (isCons<A, List<A, K>, K>(ls)) {
            if (pred(ls.car)) return ls.car;
            else return find(ls.cdr, pred);
        }
        else throw new TypeError('list#find: unsupported type');
    }
    else throw new TypeError('list#find: unsupported type');
};