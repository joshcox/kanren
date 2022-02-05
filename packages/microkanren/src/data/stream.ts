import { Base } from "./base";
import { cons, empty, isCons, isEmpty, isList, List } from "./list";
import { NilKinds } from "./nil";
import { PairKinds } from "./pair";

export enum StreamKinds {
    Abort = 'abort',
    Future = 'future',
    Lazy = 'lazy'
}

export type Strem<A, K extends string = never> =
    List<A, StreamKinds | K> |
    AbortStream<A> |
    FutureStream<A> |
    Lazy<A, StreamKinds | K>;

export class Stream<A, K extends string = never> extends Base<StreamKinds | K> {
    constructor(kind: StreamKinds | K) {
        super(kind);
    }
}
export const isStream = <A>($: unknown): $ is Strem<A> =>
    isList($) || $ instanceof Stream;
export const stream = <A, K extends string = never>(items: A[]): Strem<A, K> =>
    items.reduce(($: Strem<A, K>, item) => cons<A, Strem<A, K>>(item, $), empty<K>());

/**
 * Signal a stoppage to whatever stream-processor exists.
 */
class AbortStream<A> extends Stream<A> {
    constructor(readonly error: Error) {
        super(StreamKinds.Abort);
    }
}
export const isAbort = <A>($: Strem<A>): $ is AbortStream<A> => $ instanceof AbortStream;
export const abort = <A>(error: Error) => new AbortStream<A>(error);

/**
 * Wrap a stream in a promise. To do this, pass in a promise that resolves to a stream.
 * The stream can be awaited at the discretion of the consumer by awaiting/thenning the promise.
 * To resolve the async stream is to _see_ it.
 */
class FutureStream<A> extends Stream<A> {
    constructor(readonly promise: Promise<Strem<A>>) {
        super(StreamKinds.Future);
    }
}
export const isFuture = <A>($: Strem<A>): $ is FutureStream<A> => $ instanceof FutureStream;
export const future = <A>(future$: Promise<Strem<A>>) => new FutureStream(future$);
export const see = <A>($: FutureStream<A>): Promise<Strem<A>> => $.promise;
export const mapFuture = <A>(future$: FutureStream<A>, fn: ($: Strem<A>) => Strem<A>): FutureStream<A> =>
    future(see(future$).then(fn).catch<AbortStream<A>>(abort))

/**
 * Wrap a stream in a laziness. To do this, pass in a function that returns a stream. 
 * The stream can be calculated at the discretion of the consumer by running the function.
 * To calculate the delayed stream is to _force_ it.
 */
class Lazy<A, K extends string = never> extends Stream<A> {
    constructor(readonly force: () => Strem<A, K>) {
        super(StreamKinds.Lazy);
    }
}
export const isLazy = <A, K extends string = never>($: Strem<A, K>): $ is Lazy<A, K> => $ instanceof Lazy;
export const lazy = <A, K extends string = never>(delay: () => Strem<A, K>) => new Lazy<A, K>(delay);
export const force = <A, K extends string = never>(delay: Lazy<A, K>): Strem<A, K> => delay.force();

function* iterate<A>($: Strem<A>): Generator<Promise<Strem<A>> | A, Error | null, Strem<A> | undefined> {
    if (isStream($)) {
        while (!(isEmpty($) || isAbort($))) {
            if (isCons<A, Strem<A>>($)) {
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

export const take = async <A>($: Strem<A>, predicate: (results: A[]) => boolean = () => false): Promise<A[]> => {
    const iterator = iterate($);

    const takeInner = async (results: A[], $?: Strem<A>): Promise<A[]> => {
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