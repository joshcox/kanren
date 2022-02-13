import { car, cdr, Cons, cons, empty, find, List, Pair } from "@kanren/data";
import { SubstitutionAPI, Term } from "@kanren/types";

export type SubstitutionList = List<Pair<symbol, Term>>;

/**
 * Follows an associative path to find what the input (`term`) is
 * equivalent to. When no substitution association is made, the result
 * is the input (`term`).
 */
const walk = (term: Term, substitution: SubstitutionList): Term => {
    const pr = typeof term === "symbol" && find(substitution, (pr) => car(pr) === term);
    return pr ? walk(cdr(pr), substitution) : term;
};

const add = (left: Term, right: Term, substitution: SubstitutionList): SubstitutionList => 
    cons(cons(left, right), substitution);
    
export const SubstitutionListAPI: SubstitutionAPI<SubstitutionList> = {
    walk,
    add,
    empty
};

export default SubstitutionListAPI;