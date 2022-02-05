import { Term } from "./data/term";
import { IState } from "./data/State";
import { Goal } from "./data/Goal";
export { Term } from "./data/term";
interface IRunOptions {
    state?: Partial<IState>;
}
export declare const kanren: () => {
    unify: (u: Term, v: Term) => Goal;
    conj: (g1: Goal, g2: Goal) => Goal;
    disj: (g1: Goal, g2: Goal) => Goal;
    callWithFresh: (f: (a: symbol) => Goal) => Goal;
    run: (goal: Goal, { numberOfSolutions, ...options }: IRunOptions & {
        numberOfSolutions: number;
    }) => Promise<IState[]>;
    runAll: (goal: Goal, { state }?: IRunOptions) => Promise<IState[]>;
};
