import { head, tail } from "./util/array";
import { Term } from "./term";

export interface ISubstitution { left: symbol; right: Term }

 /**
 * Creates a substitution pair where the left associates to the right
 */
const substitution = (left: symbol, right: Term): ISubstitution => ({left, right});

export interface ISubstitutionStore extends Array<ISubstitution> {}

/**
 * Creates a store by collecting all substitutions into an array
 * of substitutions
 */
const store = (...store: ISubstitutionStore): ISubstitutionStore => store;

/**
 * Follows an associative path to find what the input (`term`) is
 * equivalent to. When no substitution association is made, the result
 * is the input (`term`).
 * @function walk
 * @param {*} term - the starting term
 * @param {Array<{left: *, right: *}>} store - the substitution array being walked
 * @returns {*}
 */
const walk = (term: Term, store: ISubstitutionStore): Term => {
    const pr = typeof term === "symbol" && store.find(({left}) => left === term);
    return pr ? walk(pr.right, store) : term;
};

export const unification = (term1: Term, term2: Term, substitutionStore: ISubstitutionStore): ISubstitutionStore | false => {
    term1 = walk(term1, substitutionStore);
    term2 = walk(term2, substitutionStore);

    if (term1 === term2) {
        return store(...substitutionStore);
    } else if (typeof term1 === "symbol") {
        return store(substitution(term1, term2), ...substitutionStore);
    } else if (typeof term2 === "symbol") {
        return store(substitution(term2, term1), ...substitutionStore);
    } else if (Array.isArray(term1) && Array.isArray(term2)) {
        const newStore = unification(head(term1), head(term2), substitutionStore);
        return newStore && unification(tail(term1), tail(term2), newStore);
    } else {
        return false;
    }
};