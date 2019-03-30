import { unification, ISubstitution } from "./unification";
import { mplus, bind, take, takeAll } from "./data/Stream";
import { Term } from "./data/Term";
import { List } from "immutable";
import { IState, emptyState } from "./data/Constraints";
import { Goal } from "./data/Goal";

export { Term } from "./data/Term";

// unify goal
export const unify = (u: Term, v: Term): Goal =>
    ({ substitutionStore, count }) => {
        const newSubStore = unification(u, v, substitutionStore);
        return newSubStore ? List([{ substitutionStore: newSubStore, count }]) : List();
    };

// fresh logic variable goal
export const callWithFresh = (f: (a: symbol) => Goal): Goal =>
    ({ substitutionStore, count }) =>
        f(Symbol(count))({ substitutionStore, count: count + 1 });

// disjunction/or goal
export const disj = (g1: Goal, g2: Goal): Goal =>
    (constraints) => mplus(g1(constraints), g2(constraints));

// conjunction/and goal
export const conj = (g1: Goal, g2: Goal): Goal =>
    (constraints) => bind(g2, g1(constraints));

// Run a goal against
const call = (g: Goal, constraints: IState) => g({ ...constraints });

export interface IRunOptions {
    numberOfSolutions: number;
    goal: Goal;
    constraints?: Partial<{
        substitutionStore: ISubstitution[];
        count: number;
    }>;
}

export const run = ({ numberOfSolutions, goal, constraints: { substitutionStore = [], count = 0 } = {} }: IRunOptions) =>
    take(numberOfSolutions)(call(goal, { substitutionStore: List(substitutionStore), count }));

export const runAll = ({ goal, constraints: { substitutionStore = [], count = 0 } = {} }: Pick<IRunOptions, Exclude<keyof IRunOptions, "numberOfSolutions">>) =>
    takeAll(call(goal, { substitutionStore: List(substitutionStore), count }));
