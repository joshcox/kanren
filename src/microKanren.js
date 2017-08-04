import Variable from "./Variable";
import State from "./State";

const call = (goal, s = new State()) => goal(s);

const fresh = fn => fn(...Array.from(new Array(fn.length), _ => new Variable()));

const conj = (goal1, goal2) => state => goal1(state)
    .reduce((states, state) => [...states, ...goal2(state)], []);

const disj = (goal1, goal2) => state => [...goal1(state), ...goal2(state)];

const unify = (u, v) => state => {
    const newState = state.unify(u, v);
    return newState ? [newState] : [];
};

export {
    call,
    fresh,
    conj,
    disj,
    State,
    unify,
    Variable
}