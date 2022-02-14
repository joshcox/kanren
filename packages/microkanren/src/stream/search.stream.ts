import { StreamAPI } from "@kanren/types";
import { injectable } from "inversify";
import { Readable } from "stream";

class Empty<A> extends Readable {
    constructor() {
        super({
            read() {
                this.destroy();
            }
        });
    }
}

class Cons<A> extends Readable {
    constructor(private a: A[], private $: Stream<A> = new Empty<A>()) {
        super({
            objectMode: true,
            read(this: Cons<A>) {
                if (!this.destroyed) {
                    if (this.a.length) this.push(this.a.shift());
                    else this.pull();
                }
            }
        });
    }

    private pull() {
        while (isImmature(this.$)) this.$ = this.$.read();
        if (this.$ instanceof Empty) this.destroy();
        else if (isMature(this.$)) {
            const next = this.$.read();
            if (next === null) this.destroy();
            else if (isImmature(next)) this.pull();
            else this.push(next);
        }
        else throw new Error('Cons#pull: received unexpected stream');
    }
}

export const unit = {
    stream: <A>(items: A[]): Stream<A> => items.length ? new Cons(items) : new Empty()
};

class Lazy<A> extends Readable {
    constructor(private force: () => Stream<A>) {
        super({
            objectMode: true,
            read(this: Lazy<A>) {
                if (!this.destroyed) this.push(this.force());
                this.destroy();
            }
        });
    }
}
export const isLazy = <A>($: unknown): $ is Lazy<A> => $ instanceof Lazy;
export const lazy = <A>(force: () => Stream<A>): Lazy<A> => new Lazy(force);

class Future<A> extends Readable {
    constructor(private promise: Promise<Stream<A>>) {
        super({
            objectMode: true,
            async read(this: Future<A>) {
                if (!this.destroyed) this.push(await this.promise);
                this.destroy();
            }
        });
    }
}
export const isFuture = <A>($: unknown): $ is Future<A> => $ instanceof Future;
export const future = <A>(promise: Promise<Stream<A>>): Future<A> => new Future(promise);

type ImmatureStream<A> = Lazy<A> | Future<A>;
const isImmature = <A>($: unknown): $ is ImmatureStream<A> =>
    isLazy($) || isFuture($);

type MatureStream<A> = Cons<A> | Empty<A>;
const isMature = <A>($: unknown): $ is MatureStream<A> =>
    $ instanceof Empty || $ instanceof Cons;

export type Stream<A> = MatureStream<A> | ImmatureStream<A>;

export const plus = <A>($1: Stream<A>, $2: Stream<A>): Stream<A> => {
    if ($1 instanceof Empty) return $2;
    else if (isImmature($1)) return new Lazy(() => plus($2, $1.read()));
    else {
        const first = $1.read();
        if (first === null) return $2;
        else return new Cons([first], plus($1, $2))
    };
}

export const bind = <A>(fn: (item: A) => Stream<A>, $: Stream<A>): Stream<A> => {
    if ($ instanceof Empty) return new Empty();
    else if (isImmature($)) return new Lazy(() => bind(fn, $.read()));
    else {
        const next = $.read();
        if (next === null) return new Empty();
        else return plus(fn(next), bind(fn, $));
    }
}

export const takeUntil = async <A>($: Stream<A>, predicate: (results: A[]) => boolean = () => false): Promise<A[]> => {
    const results: A[] = [];

    for await (const result of $) {
        if (result !== null) results.push(result);
        if (predicate(results)) break;
    }

    return results;
};

export const delay = <A>(fn: (item: A) => Stream<A>) => (item: A) => new Cons([], lazy(() => fn(item)));

@injectable()
export class StreamReadableAPI<A> implements StreamAPI<A, Stream<A>> {
    bind = bind;
    plus = plus;
    takeUntil = takeUntil;
    unit = (item?: A) => item ? unit.stream([item]) : new Empty();
    delay = delay;
}