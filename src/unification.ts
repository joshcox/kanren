import { List } from "immutable";
import { Term } from "./data/Term";

export interface ISubstitution { left: symbol; right: Term }

/**
* Creates a substitution pair where the left associates to the right
*/
const substitution = (left: symbol, right: Term): ISubstitution => ({ left, right });

/**
 * Follows an associative path to find what the input (`term`) is
 * equivalent to. When no substitution association is made, the result
 * is the input (`term`).
 */
const walk = (term: Term, store: List<ISubstitution>): Term => {
    const pr = typeof term === "symbol" && store.find(({ left }) => left === term);
    return pr ? walk(pr.right, store) : term;
};

export const unification = (term1: Term, term2: Term, substitutionStore: List<ISubstitution> | false): List<ISubstitution> | false => {
    if (substitutionStore === false) return false;

    term1 = walk(term1, substitutionStore);
    term2 = walk(term2, substitutionStore);

    if (term1 === term2) {
        return substitutionStore;
    } else if (typeof term1 === "symbol") {
        return substitutionStore.unshift(substitution(term1, term2));
        // store(substitution(term1, term2), ...substitutionStore);
    } else if (typeof term2 === "symbol") {
        return substitutionStore.unshift(substitution(term2, term1));
        // return store(substitution(term2, term1), ...substitutionStore);
    } else if (Array.isArray(term1) && Array.isArray(term2)) {
        if (term1.length === 0 && term2.length === 0) return substitutionStore;
        const [head1, ...tail1] = term1;
        const [head2, ...tail2] = term2;
        return unification(tail1, tail2, unification(head1, head2, substitutionStore));
    } else {
        return false;
    }
};