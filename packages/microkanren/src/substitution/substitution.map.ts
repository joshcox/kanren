import { SubstitutionAPI, Term } from "@kanren/types";

export type SubstitutionMap = Map<symbol, Term>;

/**
 * Follows an associative path to find what the input (`term`) is
 * equivalent to. When no substitution association is made, the result
 * is the input (`term`).
 */
const walk = (term: Term, substitution: SubstitutionMap): Term => {
    const next = typeof term === "symbol" && substitution.has(term);
    return next ? walk(substitution.get(term), substitution) : term;
};

const add = (left: symbol, right: Term, substitution: SubstitutionMap): SubstitutionMap => {
    const map = new Map(substitution).set(left, right);
    return map;
};
    
export const SubstitutionMapAPI: SubstitutionAPI<SubstitutionMap> = {
    walk,
    add,
    empty: () => new Map<symbol, Term>()
};

export default SubstitutionMapAPI;