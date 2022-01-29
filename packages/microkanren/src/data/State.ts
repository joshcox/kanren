import { ISubstitution } from "../unification";
import { List } from "./list";

/**
 * A set of constraints that represents a solution to a model.
 */
export interface IState {
    substitution: List<ISubstitution>;
    count: number;
}
