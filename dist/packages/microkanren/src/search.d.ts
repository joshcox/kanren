import { Strem } from "@kanren/data";
export { take as takeUntil } from '@kanren/data';
export declare const unit: {
    stream: <A>(items: A[]) => Strem<A, never>;
};
export declare const plus: <A>($1: Strem<A, never>, $2: Strem<A, never>) => Strem<A, never>;
export declare const bind: <A>(g: (item: A) => Strem<A, never>, $: Strem<A, never>) => Strem<A, never>;
