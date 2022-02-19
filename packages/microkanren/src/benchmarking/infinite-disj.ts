import { BaseTerms, Goal } from '@kanren/types';
import { suite, add, complete, configure, cycle, save } from 'benny';
import { Readable } from 'stream';
import { buildKanren } from '../container';
import { ConstraintStore } from '../store';
import { SubstitutionHashMap } from '../substitution.map';

const {
    disj,
    unify,
    delay,
    runWithFresh
} = buildKanren();

type G = Goal<ConstraintStore<SubstitutionHashMap<BaseTerms>>, Readable>;

const fours = (x: symbol): G => disj(unify(x, 4), delay(() => fours(x)));
const foursLazy = (x: symbol): G => delay(() => disj(unify(x, 4), foursLazy(x)));

export default () => suite(
    'Infinite Disjunction',

    add('When delay is around the disjunction', async () => {
        await runWithFresh(foursLazy, { numberOfSolutions: 10000 })
    }),

    add('When delay is around the recursive call', async () => {
        await runWithFresh(fours, { numberOfSolutions: 10000 })
    }),

    cycle()
);