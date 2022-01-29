import { IState } from "./State";
import { Stream } from "./stream";

/**
 * A Goal is a function that takes in [[IConstraints]] and returns a [[Stream]]
 * of [[IConstraints]] that represent success states
 */
export type Goal = (constraints: IState) => Stream<IState>;
