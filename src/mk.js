const {
    array: { head, tail }
} = require("./util");
const { unification } = require("./unification");
const { append$, appendMap$ } = require("./stream");

// TODO - Make constraints extendable to add any number of stores
const constraints = (subStore, count) => ({subStore, count});

// unify goal
const unify = (u, v) => ({subStore, count}) => {
    const newSubStore = unification(u, v, subStore);
    return newSubStore ? [constraints(newSubStore, count)] : [];
};

// fresh logic variable goal
const callWithFresh = f => ({subStore, count}) =>
    f(Symbol(count))(constraints(subStore, count + 1));

// disjunction/or goal
const disj = (g1, g2) => constraints =>
    append$(g1(constraints), g2(constraints));

// conjunction/and goal
const conj = (g1, g2) => constraints => appendMap$(g2, g1(constraints));

// bootstrapper
const callWithEmptyState = g => g(constraints([], 0));

const foo = callWithEmptyState(
    conj(
        callWithFresh(a => unify(a, "seven")),
        callWithFresh(b => disj(
            unify(b, "five"),
            unify(b, "six")
        ))
    )
);

const prettyPrint = ([...solutions]) => solutions
    .map(({subStore, count}, solutionIndex) => ({
        solutionNumber: solutionIndex + 1,
        substitution: subStore
            .map(({left, right}) => `${left.toString()}: ${right}`)
            .join("\n\t\t"),
        count: `${count}`
    }))
    .forEach(({solutionNumber, substitution, count}) => {
        console.log(`Solution #${solutionNumber}:`);
        console.log(`\tNumber of LVars: ${count}`);
        console.log(`\tSubstitution Store:\n\t\t${substitution}`);
    });

prettyPrint(foo);