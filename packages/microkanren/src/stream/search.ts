import { cons, force, isAbort, isCons, isEmpty, isFuture, isLazy, isStream, mapFuture, stream, Strem } from "@kanren/data";

export { take as takeUntil } from '@kanren/data';

export const unit = {
    stream: <A>(items: A[]): Strem<A> => stream(items)
};

export const plus = <A>($1: Strem<A>, $2: Strem<A>): Strem<A> => {
    if (isStream($1) && isStream($2)){
        if (isAbort($1)) return $1;
        else if (isEmpty($1)) return $2;
        else if (isLazy($1)) return plus(force($1), $2);
        else if (isFuture($1)) return mapFuture($1, (s1) => plus($2, s1));
        else if (isCons<A, Strem<A>>($1)) {
            const new$ = plus($1.cdr, $2);
            return isFuture(new$)
            ? mapFuture(new$, (newS) => plus(stream([$1.car]), newS))
            : cons($1.car, new$);
        }
        else throw new TypeError('Stream.promise#append: unsupported stream type');
    }
    else throw new TypeError('Stream.promise#append: unsupported stream type');
};

export const bind = <A>(g: (item: A) => Strem<A>, $: Strem<A>): Strem<A> => {
    if (isStream($)) {
        if (isAbort($) || isEmpty($)) return $;
        else if (isLazy($)) return bind(g, force($));
        else if (isFuture($)) return mapFuture($, (s) => bind(g, s));
        else if (isCons<A, Strem<A>>($)) return plus(bind(g, $.cdr), g($.car));
        else throw new TypeError('Stream.promise#appendMap: unsupported stream type');
    }
    else throw new TypeError('Stream.promise#appendMap: unsupported stream type');
};