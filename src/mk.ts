import { unification } from "./unification";
import { mplus, bind, take, takeAll } from "./data/Stream";
import { Term } from "./data/Term";
import { List } from "immutable";
import { IState } from "./data/Constraints";
import { Goal } from "./data/Goal";

export { Term } from "./data/Term";

// unify goal
export const unify = (u: Term, v: Term): Goal =>
    ({ substitution: substitutionStore, count }) => {
        const newSubStore = unification(u, v, substitutionStore);
        return newSubStore ? List([{ substitution: newSubStore, count }]) : List();
    };

// fresh logic variable goal
export const callWithFresh = (f: (a: symbol) => Goal): Goal =>
    ({ substitution, count }) =>
        f(Symbol(count))({ substitution, count: count + 1 });

// disjunction/or goal
export const disj = (g1: Goal, g2: Goal): Goal =>
    (constraints) => mplus(g1(constraints), g2(constraints));

// conjunction/and goal
export const conj = (g1: Goal, g2: Goal): Goal =>
    (constraints) => bind(g2, g1(constraints));

// Run a goal against
const call = (g: Goal, constraints: Partial<IState>) => g({ count: 0, substitution: List(), ...constraints });

export interface IRunOptions {
    numberOfSolutions: number;
    goal: Goal;
    constraints?: Partial<IState>;
}

export const run = ({ numberOfSolutions, goal, constraints = {} }: IRunOptions) =>
    take(numberOfSolutions)(call(goal, constraints));

type Omit<O, K> = Pick<O, Exclude<keyof O, K>>;

export const runAll = ({ goal, constraints = {} }: Omit<IRunOptions, "numberOfSolutions">) =>
    takeAll(call(goal, constraints));
