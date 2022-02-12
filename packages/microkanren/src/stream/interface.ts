export interface StreamAPI<A, $> {
    unit(state?: A): $;
    plus(stream1: $, stream2: $): $;
    bind(fn: (store: A) => $, stream: $): $;
    takeUntil(stream: $, isDonePredicate: ($: A[]) => boolean): Promise<A[]>;
}