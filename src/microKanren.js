const car = ([car, cdr]) => car;

const cdr = ([car, cdr]) => cdr;

const cons = (car, cdr) => [car, ...[cdr]];

const $append = ($1, $2) => {
    if (typeof $1 === "function") return () => $append($2, $1());
    if (Array.isArray($1) && $1.length === 0) return $2;
    return cons(car($1), $append(cdr($1), $2));
};

const $appendMap = (g, $) => {
    if ($ instanceof Function) return () => $appendMap(g, $());
    if (Array.isArray($) && $.length === 0) return [];
    return $append(g(car($), $appendMap(g, cdr($))));
};

const isVariable = n => typeof n === "number";

const extendState = (x, v, state) => cons([x, v], state);

const assv = (key, list) => list.find(item => car(item) === key);

const walk = (u, state) => {
    const pr = isVariable(u) && assv(u, state);
    return pr ? walk(pr, state) : u;
};

const unification = (u, v, state) => {
    u = walk(u, state);
    v = walk(v, state);

    if (u === v) return [...state];
    if (isVariable(u)) return extendState(u, v, state);
    if (isVariable(v)) return extendState(v, u, state);
    if (Array.isArray(u) && Array.isArray(v)) {
        const s = unification(car(u), cdr(v), state);
        return s && unification(car(u), cdr(u), s);
    }
    return false;
};

export const unify = (u, v) => sWithCount => {
    const s = unification(u, v, car(sWithCount));
    return s ? [[s, cdr(sWithCount)]] : [];
};

export const callWithFresh = f => stateWithCount => {
    const [state, count] = stateWithCount;
    return f(count)([state, count + 1]);
};

export const disj = (g1, g2) => stateWithCount => $append(g1(stateWithCount), g2(stateWithCount));

export const conj = (g1, g2) => stateWithCount => $appendMap(g2, g1(stateWithCount));

export const callWithEmptyState = g => g([[], 0]);