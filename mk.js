// microKanren

// List
const head = ([car]) => car;
const tail = ([car, ...cdr]) => cdr;

// Stream
const append$ = ($1, $2) => {
    if ($1 instanceof Function) {
        return () => append$($2, $1());
    } else if (Array.isArray($1) && $1.length === 0) {
        return $2;
    } else {
        return [head($1), ...append$(tail($1), $2)];
    }
};
const appendMap$ = (g, $) => {
    if ($ instanceof Function) {
        return () => appendMap$(g, $());
    } else if (Array.isArray($) && $.length === 0) {
        return [];
    } else {
        return append$(appendMap$(g, tail($)), g(head($)));
    }
};

// Substitution Store
const substitution = (left, right) => ({ left, right });
const substitutionStore = (left, right, store) => [substitution(left, right), ...store];
const walkSubstitution = (u, store) => {
    const pr = typeof u === "symbol" && store.find(({left}) => left === u);
    return pr ? walkSubstitution(pr, store) : u;
};
const unification = (u, v, store) => {
    u = walkSubstitution(u, store);
    v = walkSubstitution(v, store);

    if (u === v) {
        return [...store];
    } else if (typeof u === "symbol") {
        return substitutionStore(u, v, store);
    } else if (typeof v === "symbol") {
        return substitutionStore(v, u, store);
    } else if (Array.isArray(u) && Array.isArray(v)) {
        store = unification(head(u), head(v), store);
        return store && unification(tail(u), tail(cdr), store);
    } else {
        return false;
    }
};

// TODO - Make constraints extendable to add any number of stores
const constraints = (subStore, count) => ({ subStore, count });

// unify goal
const unify = (u, v) => ({ subStore, count }) => {
    const s = unification(u, v, subStore);
    return s ? [constraints(s, count)] : [];
};

// fresh logic variable goal
const callWithFresh = f => ({ subStore, count}) =>
    f(Symbol(count))(constraints(subStore, count+1));

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
    .map(({ subStore, count }, solutionIndex) => {
        return {
            solutionNumber: solutionIndex + 1,
            substitution: subStore
                .map(({ left, right }) => `${left.toString()}: ${right}`)
                .join("\n\t\t"),
            count: `${count}`
        }
    })
    .forEach(({ solutionNumber, substitution, count }) => {
        console.log(`Solution #${solutionNumber}:`);
        console.log(`\tNumber of LVars: ${count}`);
        console.log(`\tSubstitution Store:\n\t\t${substitution}`);
    });

prettyPrint(foo);