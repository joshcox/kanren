import { head, tail } from "./util/array";

export function append$<A extends any[]>($1: A, $2: A): A;
export function append$<A extends any[], B extends () => A>($1: B, $2: A): B;
export function append$($1: any, $2: any) {
    return $1 instanceof Function
        ? () => append$($2, $1())
        : Array.isArray($1) && $1.length === 0
            ? $2
            : [head($1), ...append$(tail($1), $2)]
};

export function appendMap$<S, A extends S[]>(goal: (s: S) => S[], $: A): S[];
export function appendMap$<S, A extends S[], B extends () => A>(goal: (s: S) => S[], $: B): B;
export function appendMap$(g: any, $: any) {
    return $ instanceof Function
        ? () => appendMap$(g, $())
        : Array.isArray($) && $.length === 0
            ? []
            : append$(appendMap$(g, tail($)), g(head($)))
};