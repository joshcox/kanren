import { cons, empty, isCons, isEmpty, isList, List, ListKinds, ListTypes } from "./list";

enum StreamOnlyTypes {
    Abort = 'abort',
    Future = 'future'
}
export type StreamTypes<A, K extends string = never> = ListTypes<A, K> | Stream<A>;

export type StreamKinds = StreamOnlyTypes | ListKinds;

export class Stream<A> extends List<A, StreamOnlyTypes> {
    constructor(kind: ListKinds | StreamOnlyTypes) {
        super(kind);
    }
}
export const isStream = <A>($: StreamTypes<A>): $ is Stream<A> =>
    isList($) || $ instanceof Stream;
export const stream = <A>(items: A[]): Stream<A> =>
    items.reduce(($: Stream<A>, item) => cons(item, $), empty<A>());

/**
 * Signal a stoppage to whatever stream-processor exists.
 */
class AbortStream<A> extends Stream<A> {
    constructor(readonly error: Error) {
        super(StreamOnlyTypes.Abort);
    }
}
export const isAbort = <A>($: Stream<A>): $ is AbortStream<A> => $ instanceof AbortStream;
export const abort = <A>(error: Error) => new AbortStream<A>(error);

/**
 * Wrap a stream in a promise. To do this, pass in a promise that resolves to a stream.
 * The stream can be awaited at the discretion of the consumer by awaiting/thenning the promise.
 * To resolve the async stream is to _see_ it.
 */
class FutureStream<A> extends Stream<A> {
    constructor(readonly promise: Promise<Stream<A>>) {
        super(StreamOnlyTypes.Future);
    }
}
export const isFuture = <A>($: Stream<A>): $ is FutureStream<A> => $ instanceof FutureStream;
export const future = <A>(future$: Promise<Stream<A>>) => new FutureStream(future$);
export const see = <A>($: FutureStream<A>): Promise<Stream<A>> => $.promise;
export const mapFuture = <A>(future$: FutureStream<A>, fn: ($: Stream<A>) => Stream<A>): FutureStream<A> =>
    future(see(future$).then(fn).catch<AbortStream<A>>(abort))

/**
 * Wrap a stream in a laziness. To do this, pass in a function that returns a stream. 
 * The stream can be calculated at the discretion of the consumer by running the function.
 * To calculate the delayed stream is to _force_ it.
 */
class Lazy<A, $ extends Stream<A>> extends Stream<A> {
    constructor(readonly force: () => $) {
        super(StreamOnlyTypes.Future);
    }
}
export const isLazy = <A, S extends Stream<A>>($: Stream<A>): $ is Lazy<A, S> => $ instanceof Lazy;
export const lazy = <A, S extends Stream<A>>(delay: () => S) => new Lazy<A, S>(delay);
export const force = <A, S extends Stream<A>>(delay: Lazy<A, S>): Stream<A> => delay.force();

function* iterate<A>($: Stream<A>): Generator<Promise<Stream<A>> | A, Error | null, Stream<A> | undefined> {
    if (isStream($)) {
        while (!(isEmpty($) || isAbort($))) {
            if (isCons<A, Stream<A>, StreamKinds>($)) {
                yield $.car;
                $ = $.cdr;
            } else if (isLazy($)) {
                $ = force($);
            } else if (isFuture($)) {
                const continueStream = yield $.promise;
                if (continueStream) $ = continueStream;
                else throw new Error('stream#iterate: expected a continue stream from consumer after awaiting promise');
            } else {
                return new TypeError('stream#iterate: unsupported stream type');;
            }
        }

        if (isAbort($)) {
            return $.error;
        }

        return null;
    }
    else throw new Error('stream#iterate: input stream is not a stream');
}

export const take = async <A>($: Stream<A>, predicate: (results: A[]) => boolean = () => false): Promise<A[]> => {
    const iterator = iterate($);

    const takeInner = async (results: A[], $?: Stream<A>): Promise<A[]> => {
        if (predicate(results)) return results;
        const result = iterator.next($);
        if (result.value instanceof Error) throw result.value;
        else if (result.done) return results;
        else if (result.value instanceof Promise) return takeInner(results, await result.value);
        else return takeInner([...results, result.value]);
    };

    return await takeInner([]);
};

export { cons, empty, isCons, isEmpty } from './list';