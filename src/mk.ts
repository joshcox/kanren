import { unification } from "./unification";
import { append, appendMap, take, takeAll, Stream } from "./data/Stream";
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
    (constraints) => append(g1(constraints), g2(constraints));

// conjunction/and goal
export const conj = (g1: Goal, g2: Goal): Goal =>
    (constraints) => appendMap(g2, g1(constraints));

// Run a goal against
const call = (g: Goal, constraints: Partial<IState>) => g({ count: 0, substitution: List(), ...constraints });

export interface IRunOptions {
    goal: Goal;
    constraints?: Partial<IState>;
}

export const runner = (take: ($: Stream<IState>) => List<IState>) =>
    ({ goal, constraints = {} }: IRunOptions) =>
        take(call(goal, constraints))

export const run = ({ numberOfSolutions, ...options }: IRunOptions & { numberOfSolutions: number }) =>
    runner(take(numberOfSolutions))(options);

export const runAll = runner(takeAll);
