import { IConstraints } from "./constraints";
import { Stream } from "./Stream";
export type Goal = (constraints: IConstraints) => Stream<IConstraints>;
