import { List } from "immutable";
import { ISubstitution } from "../unification";

/**
 * A set of constraints that represents a solution to a model.
 */
export interface IState {
    substitutionStore: List<ISubstitution>;
    count: number;
}

/**
 * An empty set of constraints
 */
export const emptyState = () => ({ substitutionStore: List(), count: 0 });
