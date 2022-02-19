import { Goal } from '@kanren/types';
import { suite, add, complete, configure, cycle, save } from 'benny';
import { Readable } from 'stream';
import { buildKanren } from '../container';
import { CStore } from '../store';
import { SubstitutionHashMap } from '../substitution.map';

const kanren = buildKanren();

const fours = (x: symbol): Goal<CStore<SubstitutionHashMap>, Readable> =>
    kanren.disj(kanren.unify(x, 4), kanren.delay(() => fours(x)));

const foursLazy = (x: symbol): Goal<CStore<SubstitutionHashMap>, Readable> =>
    kanren.delay(() => kanren.disj(kanren.unify(x, 4), foursLazy(x)));

export default () => suite(
    'Infinite Disjunction',

    add('When delay is around the disjunction', async () => {
        await kanren.runWithFresh(foursLazy, { numberOfSolutions: 10000 })
    }),
    
    add('When delay is around the recursive call', async () => {
        await kanren.runWithFresh(fours, { numberOfSolutions: 10000 })
    }),

    cycle()
);