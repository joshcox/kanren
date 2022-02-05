import { Readable } from "stream";

class Grounded<A> extends Readable {
    constructor(private items: A[]) {
        super({
            objectMode: true,
            read(this: Grounded<A>) {
                if (this.items.length === 0) this.destroy();
                else this.push(this.items.shift() ?? null);
            }
        });
    }
}
export const isGrounded = <A>($: unknown): $ is Grounded<A> => $ instanceof Grounded;
export const unit = {
    stream: <A>(items: A[]): Grounded<A> => new Grounded(items)
};

class Lazy<A> extends Readable {
    constructor(private force: () => Stream<A>) {
        super({
            objectMode: true,
            read(this: Lazy<A>) {
                this.push(this.force());
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
                this.push(await this.promise);
                this.destroy();
            }
        });
    }
}
export const isFuture = <A>($: unknown): $ is Future<A> => $ instanceof Future;
export const future = <A>(promise: Promise<Stream<A>>): Future<A> => new Future(promise);

export type Stream<A> = Grounded<A> | Lazy<A> | Future<A> | Plus<A> | Bind<A>;

class Plus<A> extends Readable {
    constructor(private left: Stream<A>, private right: Stream<A>) {
        super({
            objectMode: true,
            read(this: Plus<A>) {
                if (this.left.destroyed) {
                    this.push(this.right.read());
                }
                else if (isLazy<A>(this.left)) {
                    this.left = this.left.read();
                    // this.push(this.read());
                }
                else if (isFuture<A>(this.left)) {
                    const newStream = this.left.read();
                    this.left = this.right;
                    this.right = newStream;
                    // this.push(this.read());
                }
                else if (isGrounded(this.left) || isPlus(this.left) || isBind(this.left)) {
                    const nextLeft = this.left.read();
                    if (nextLeft === null) this.push(this.right.read());
                    else this.push(nextLeft);
                }
                else throw new Error('Plus#read: unsupported kanren stream type');
            }
        });
    }
}
export const isPlus = <A>($: unknown): $ is Plus<A> => $ instanceof Plus;
export const plus = <A>($1: Stream<A>, $2: Stream<A>): Stream<A> => new Plus($1, $2);

class Bind<A> extends Readable {
    constructor(private fn: (item: A) => Stream<A>, private $: Stream<A>) {
        super({
            objectMode: true,
            read(this: Bind<A>) {
                if (isLazy<A>(this.$)) {
                    this.$ = this.$.read();
                    // this.push(this.read());
                }
                else if (isFuture<A>(this.$)) {
                    this.$ = this.$.read();
                    // this.push(this.read());
                }
                else if (isGrounded(this.$) || isPlus(this.$) || isBind(this.$)) {
                    const next = this.$.read();
                    if (next === null) {
                        this.push(null);
                    }
                    else {
                        this.$ = plus<A>(this.$, this.fn(next));
                        const nextValue = this.$.read();
                        this.push(nextValue);
                    }
                }
                else throw new Error('Plus#read: unsupported kanren stream type');
            }
        });
    }
}
export const isBind = <A>($: unknown): $ is Bind<A> => $ instanceof Bind;
export const bind = <A>(fn: (item: A) => Stream<A>, $: Stream<A>): Bind<A> => new Bind(fn, $);

export const takeUntil = async <A>($: Stream<A>, predicate: (results: A[]) => boolean = () => false): Promise<A[]> => {
    const results: A[] = [];

    for await (const result of $) {
        results.push(result);
        if (predicate(results)) break;
    }

    return results;
};

// export { take as takeUntil } from '@kanren/data';

// export const unit = {
//     stream: <A>(items: A[]): Strem<A> => stream(items)
// };

// export const plus = <A>($1: Strem<A>, $2: Strem<A>): Strem<A> => {
//     if (isStream($1) && isStream($2)) {
//         if (isAbort($1)) return $1;
//         else if (isEmpty($1)) return $2;
//         else if (isLazy($1)) return plus(force($1), $2);
//         else if (isFuture($1)) return mapFuture($1, (s1) => plus($2, s1));
//         else if (isCons<A, Strem<A>>($1)) {
//             const new$ = plus($1.cdr, $2);
//             return isFuture(new$)
//                 ? mapFuture(new$, (newS) => plus(stream([$1.car]), newS))
//                 : cons($1.car, new$);
//         }
//         else throw new TypeError('Stream.promise#append: unsupported stream type');
//     }
//     else throw new TypeError('Stream.promise#append: unsupported stream type');
// };

// export const bind = <A>(g: (item: A) => Strem<A>, $: Strem<A>): Strem<A> => {
//     if (isStream($)) {
//         if (isAbort($) || isEmpty($)) return $;
//         else if (isLazy($)) return bind(g, force($));
//         else if (isFuture($)) return mapFuture($, (s) => bind(g, s));
//         else if (isCons<A, Strem<A>>($)) return plus(bind(g, $.cdr), g($.car));
//         else throw new TypeError('Stream.promise#appendMap: unsupported stream type');
//     }
//     else throw new TypeError('Stream.promise#appendMap: unsupported stream type');
// };