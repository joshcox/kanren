import { StreamAPI } from "@kanren/types";
import { injectable } from "inversify";
import { Readable } from "stream";

class Lazy extends Readable {
    private $: Readable | null = null;

    get forced() {
        return this.$ !== null;
    }

    constructor(private delayedStream: () => Readable) {
        super({
            objectMode: true,
            read(this: Lazy) {
                if (!this.forced) this.$ = this.delayedStream();
                let next;
                while (null !== (next = this.$!.read()))
                    if (!this.push(next)) this.$!.unshift(next);
            }
        });
    }
}
export const isLazy = ($: unknown): $ is Lazy => $ instanceof Lazy;
export const isUnforced = ($: unknown): $ is Lazy => isLazy($) && !$.forced;
export const lazy = (force: () => Readable): Lazy => new Lazy(force);


const plus = ($1: Readable, $2: Readable): Readable =>
    isLazy($1) ? plus($2, $1) : new Readable({
        objectMode: true,
        read() {
            let next;
            while (null !== (next = $1.read())) {
                if (!this.push(next)) $1.unshift(next);
            }
            if (next === null && !isLazy($2)) while (null !== (next = $2.read())) {
                if (!this.push(next)) $2.unshift(next);
            } else {
                this.push($2);
                this.destroy();
            }
        }
    });

const bind = <A>(fn: (item: A) => Readable, $: Readable): Readable => {
    const first = $.read();
    if (first === null) return unit();
    else return plus(fn(first), bind(fn, $));
};

export const takeUntil = async <A>($: Readable, predicate: (results: A[]) => boolean = () => false): Promise<A[]> => {
    const results: A[] = [];

    while (!predicate(results)) {
        const result = $.read();
        if (isLazy(result)) $ = result;
        else if (result === null) break;
        else results.push(result);
    }

    return results;
};

export const delay = <A>(fn: () => (item: A) => Readable) => (item: A) => lazy(() => fn()(item));

@injectable()
export class StreamableAPI<A> implements StreamAPI<A, Readable> {
    bind = bind;
    plus = plus;
    takeUntil = takeUntil;
    unit = unit;
    delay = delay;
}

const unit = <A>(item?: A): Readable => Readable.from(item ? [item] : [], {
    objectMode: true
});
