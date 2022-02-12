import { Term } from "..";

export interface SubstitutionAPI<S> {
    walk(term: Term, substitution: S): Term;
    add(left: Term, right: Term, substitution: S): S;
    empty(): S;
}