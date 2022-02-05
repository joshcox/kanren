"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kanren = void 0;
const unification_1 = require("./unification");
const list = require("@kanren/data");
const search = require("./search");
const kanren = () => {
    /**
     * A goal that performs [[unification]] over two [[Term]]s. When the two terms successfully unify,
     * this goal returns a mature [[Stream]] of one that contains the substitution store that the terms were
     * able to unify within. When the two terms do _not_ unify, this goal returns a mature empty [[Stream]].
     */
    const unify = (u, v) => ({ substitution, count }) => {
        const newSub = (0, unification_1.unification)(u, v, substitution);
        return search.unit.stream(newSub ? [{ substitution: newSub, count }] : []);
    };
    /**
     * A goal that introduces a new, or "fresh", logic variable (represented here as `symbol`s)
     * to a function that, when given a `symbol`, returns a `Goal`.
     */
    const callWithFresh = (f) => ({ substitution, count }) => f(Symbol.for(`${count}`))({ substitution, count: count + 1 });
    /**
     * Logical "or". This goal, when given two [[Goals]], aggregates states that are
     * successful in one, the other, or both [[Goal]]s.
     */
    const disj = (g1, g2) => (state) => search.plus(g1(state), g2(state));
    /**
     * Logical "and". This goal, when given two [[Goals]], aggregates states that are
     * successful in both [[Goal]]s.
     */
    const conj = (g1, g2) => (state) => search.bind(g2, g1(state));
    /**
     * Call a [[Goal]] against an [[IState]]. Any properties within the [[IState]] that are omitted
     * will be given sane defaults.
     */
    const call = (g, state) => g({ count: 0, substitution: list.empty(), ...state });
    const runner = (isDonePredicate) => (goal, { state = {} } = {}) => search.takeUntil(call(goal, state), isDonePredicate);
    /**
     * Runs a [[Goal]], returning a maximum of `numberOfSolutions` successful states
     */
    const run = (goal, { numberOfSolutions, ...options }) => runner((results) => results.length >= numberOfSolutions)(goal, options);
    /**
     * Runs a [[Goal]], returning all successful states
     */
    const runAll = runner(() => false);
    return {
        unify,
        conj,
        disj,
        callWithFresh,
        run,
        runAll
    };
};
exports.kanren = kanren;
//# sourceMappingURL=index.js.map