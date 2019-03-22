import { List } from "immutable";

export interface Streamer<A> {
    (): List<A> | Streamer<A>;
}

export type Stream<A> = List<A> | Streamer<A>;

export const isLazy = <A>($: Stream<A>): $ is Streamer<A> => $ instanceof Function;

export const isMature = <A>($: Stream<A>): $ is List<A> => List.isList($);

export const mplus = <A>($1: Stream<A>, $2: Stream<A>): Stream<A> => {
    if (isLazy($1)) return () => mplus($2, $1());
    if (List.isList($1) && $1.isEmpty()) return $2;

    const newList = mplus($1.shift(), $2);
    return (isLazy(newList))
        ? () => mplus(List([$1.get(0)]), newList)
        : newList.unshift($1.get(0));
};

export const bind = <A>(g: (a: A) => Stream<A>, $: Stream<A>): Stream<A> => {
    if (isLazy($)) return () => bind(g, $());
    if (List.isList($) && $.isEmpty()) return $;
    return mplus(bind(g, $.shift()), g($.get(0)));
};

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

export const take = (n: number) => <A>($: Stream<A>): List<A> => {
    const pull = puller($);
    let results = List();
    let result = pull.next();
    while (n-- > 0 && !result.done) {
        results = results.push(result.value);
        result = pull.next();
    }
    return results;
}

export const takeAll = <A>($: Stream<A>): List<A> => {
    const pull = puller($);
    let results = List();
    let result = pull.next();
    while (!result.done) {
        results = results.push(result.value);
        result = pull.next();
    }
    return results;
}