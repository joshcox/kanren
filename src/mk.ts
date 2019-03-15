import { unification, ISubstitutionStore } from "./unification";
import { append$, appendMap$ } from "./stream";
import { Term } from "./term";

interface IConstraints {
    substitutionStore: ISubstitutionStore;
    count: number;
}

const constraints = (substitutionStore: ISubstitutionStore, count: number): IConstraints =>
    ({ substitutionStore, count });

type Goal = (constraints: IConstraints) => IConstraints[];

// unify goal
export const unify = (u: Term, v: Term) => ({ substitutionStore, count }: IConstraints) => {
    const newSubStore = unification(u, v, substitutionStore);
    return newSubStore ? [constraints(newSubStore, count)] : [];
};

// fresh logic variable goal
export const callWithFresh = (f: (a: symbol) => Goal) =>
    ({ substitutionStore, count }: IConstraints) =>
        f(Symbol(count))(constraints(substitutionStore, count + 1));

// disjunction/or goal
export const disj = (g1: Goal, g2: Goal) =>
    (constraints: IConstraints) =>
        append$(g1(constraints), g2(constraints));

// conjunction/and goal
export const conj = (g1: Goal, g2: Goal) =>
    (constraints: IConstraints) =>
        appendMap$(g2, g1(constraints));

// bootstrapper
const callWithEmptyState = (g: Goal) => g(constraints([], 0));

const foo = callWithEmptyState(
    conj(
        callWithFresh(a => unify(a, "seven")),
        callWithFresh(b => disj(
            unify(b, "five"),
            unify(b, "six")
        ))
    )
);

const prettyPrint = ([...solutions]: IConstraints[]) => solutions
    .map(({ substitutionStore, count }, solutionIndex) => ({
        solutionNumber: solutionIndex + 1,
        substitution: substitutionStore
            .map(({ left, right }) => `${left.toString()}: ${right.toString()}`)
            .join("\n\t\t"),
        count: `${count}`
    }))
    .forEach(({ solutionNumber, substitution, count }) => {
        console.log(`Solution #${solutionNumber}:`);
        console.log(`\tNumber of LVars: ${count}`);
        console.log(`\tSubstitution Store:\n\t\t${substitution}`);
    });

prettyPrint(foo);