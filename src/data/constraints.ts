import { List } from "immutable";
import { ISubstitution } from "../unification";

/**
 * A set of constraints that represents a solution to a model.
 */
export interface IState {
    substitution: List<ISubstitution>;
    count: number;
}
