import { Readable } from "stream";

export interface Stream<A> extends Readable {
    read(): A;
}

export interface StreamAPI<A, $> {
    unit(state?: A): $;
    plus(stream1: $, stream2: $): $;
    bind(fn: (store: A) => $, stream: $): $;
    takeUntil(stream: $, isDonePredicate: ($: A[]) => boolean): Promise<A[]>;
}