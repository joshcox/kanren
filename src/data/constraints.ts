import { List } from "immutable";
import { ISubstitution } from "../unification";

export interface IConstraints {
    substitutionStore: List<ISubstitution>;
    count: number;
}

export const defaultConstraints = () => ({ substitutionStore: List(), count: 0 });
