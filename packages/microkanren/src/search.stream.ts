import { StreamAPI } from "@kanren/types";
import { injectable } from "inversify";
import { Readable } from "stream";

class Lazy extends Readable {
    private $: Readable | null = null;

    get forced() {
        return this.$ !== null;
    }

    force = () => this.$ = this.delayedStream();

    constructor(private delayedStream: () => Readable) {
        super({
            objectMode: true,
            read(this: Lazy) {
                if (!this.forced) this.force();
                let next;
                while (null !== (next = this.$!.read())) {
                    if (!this.push(next)) this.$!.unshift(next);
                }
            }
        });
    }
}
export const isLazy = ($: unknown): $ is Lazy => $ instanceof Lazy && !$.forced;
export const lazy = (force: () => Readable): Lazy => new Lazy(force);

// Stream a : Readable<a, Lazy a>
@injectable()
export class StreamableAPI<A> implements StreamAPI<A, Readable> {
    // unit : a -> Stream a
    unit = (a?: A): Readable => Readable.from(a ? [a] : []);
    // delay : (() -> a -> Stream a) -> a -> Lazy a
    delay = (fn: () => (a: A) => Readable) => (a: A) => lazy(() => fn()(a))
    // plus : Stream a -> Stream a -> Stream a
    plus = ($1: Readable, $2: Readable): Readable => {
        const self = this;
        return new Readable({
            objectMode: true,
            read() {
                let next;
                while (null !== (next = $1.read())) if (isLazy(next)) {
                    const nextBound = next;
                    if (!this.push(lazy(() => self.plus($2, nextBound.force())))) $1.unshift(next);
                    else this.destroy()
                } else if (!this.push(next)) $1.unshift(next);
        
                if (next === null) {
                    if (isLazy($2)) if (this.push($2)) this.destroy();
                    else while (null !== (next = $2.read())) {
                        if (!this.push(next)) $2.unshift(next);
                    }
                }
            }
        })
    };
    // bind : (a -> Stream a) -> Stream a -> Stream a
    bind = (fn: (a: A) => Readable, $: Readable): Readable => {
        if (isLazy($)) return lazy(() => this.bind(fn, $.force()))
        const first = $.read();
        if (first === null) return this.unit();
        else return this.plus(fn(first), this.bind(fn, $));
    };
    // pull : Stream a -> [a, Stream a]
    pull = ($: Readable): [A, Readable] => {
        const result = $.read();
        if (isLazy(result)) return this.pull(result);
        else return [result, $];
    };
    // take : Stream a -> Readable a
    take = ($: Readable): Readable => {
        const self = this;
        return new Readable({
            objectMode: true,
            read() {
                const [next, next$] = self.pull($);
                $ = next$;
                if (!this.push(next)) $.unshift(next);
            }
        });
    };
    // takeUntil : Stream a -> ([a] -> boolean) -> Promise [a]
    takeUntil = async ($: Readable, predicate: (results: A[]) => boolean = () => false): Promise<A[]> => {
        const results: A[] = [];
        for await (const a of this.take($)) {
            results.push(a);
            if (predicate(results)) break;
        }
        return results;
    };
}