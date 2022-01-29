import { future, lazy, cons, Strem, take } from "./stream";

describe('stream', () => {
    describe('lazy', () => {
        it('can stream a sequence of numbers', async () => {
            const integers = (start: number): Strem<number> => cons(start, lazy(() => integers(start + 1)));
            const pulled = await take(integers(1), results => results.length === 10);
            expect(pulled).toHaveLength(10);
        });
        it('can stream a sequence of numbers async', async () => {
            const integers = (start: number): Strem<number> => cons(start, lazy(() => future((async () => integers(start + 1))())));
            const pulled = await take(integers(1), results => results.length === 10);
            expect(pulled).toHaveLength(10);
        });
    });
});