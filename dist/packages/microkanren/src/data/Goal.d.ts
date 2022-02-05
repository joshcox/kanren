import { Strem } from "@kanren/data";
import { IState } from "./State";
/**
 * A Goal is a function that takes in [[IConstraints]] and returns a [[Stream]]
 * of [[IConstraints]] that represent success states
 */
export declare type Goal = (constraints: IState) => Strem<IState>;
