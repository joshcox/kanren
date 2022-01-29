import { List } from "immutable";

/**
 * A function that returns either a list or a function that returns either a list
 * or a function that...
 *
 * You get the idea
 */
export interface Streamer<A> {
    (): List<A> | Streamer<A>;
}

/**
 * A Lazy List implementation - a stream can either be `lazy` or `mature`.
 * When the stream is lazy, it's a [[Streamer]]. When it's mature, it's an
 * actual `List`.  A stream that is lazy can become mature but a stream that
 * is mature cannot become lazy.
 */
export type Stream<A> = List<A> | Streamer<A>;

/**
 * Determine if a [[Stream]] is a function that needs to be pulled
 */
export const isLazy = <A>($: Stream<A>): $ is Streamer<A> => $ instanceof Function;

/**
 * Determines if a [[Stream]] is a List
 */
export const isMature = <A>($: Stream<A>): $ is List<A> => List.isList($);

/**
 * Appends one [[Stream]] onto another
 */
export const append = <A>($1: Stream<A>, $2: Stream<A>): Stream<A> => {
    if (isLazy($1)) return () => append($2, $1());
    if (List.isList($1) && $1.isEmpty()) return $2;

    const newList = append($1.shift(), $2);
    return (isLazy(newList))
        ? () => append<A>(List<A>([$1.get(0) as A]), newList)
        : newList.unshift($1.get(0) as A);
};

/**
 * Maps a [[Stream]]-returning function across the items of a [[Stream]], appending
 * each resulting stream.
 */
export const appendMap = <A>(g: (a: A) => Stream<A>, $: Stream<A>): Stream<A> => {
    if (isLazy($)) return () => appendMap(g, $());
    if (List.isList($) && $.isEmpty()) return $;
    return append(appendMap(g, $.shift()), g($.get(0) as A));
};

/**
 * Generate an iterator over a [[Stream]]. When the [[Stream]] is lazy, it'll apply
 * the [[Streamer]] function until the [[Stream]] becomes mature, whereupon
 * each element of the `List` will be yielded.
 */
function* puller<A>($: Stream<A>) {
    let stream = $;

    while (isLazy(stream)) {
        stream = stream();
    }

    while (isMature(stream) && !stream.isEmpty()) {
        yield stream.get(0);
        stream = stream.shift();
    }
}

export const takeUntil = <A>(fn: (results: List<A>, result: IteratorResult<A>) => boolean) =>
    ($: Stream<A>): List<A> => {
        const pull = puller($);
        let cont = true;
        let results = List<A>();
        let result = pull.next();
        while (cont && !result.done) {
            if (result.value) {
                results = results.push(result.value);
                result = pull.next();
                cont = fn(results, result as IteratorYieldResult<A>);
            }
        }
        return results;
    }

/**
 * Pull up to `n` values from a [[Stream]].
 *
 * NOTE: Can lead to an infinite loop
 */
export const take = <A>(n: number) => takeUntil<A>((results) => results.size === n);

/**
 * Pull all values from a [[Stream]].
 *
 * NOTE: Can lead to an infinite loop
 */
export const takeAll = <A>($: Stream<A>) => takeUntil<A>(() => true)($);