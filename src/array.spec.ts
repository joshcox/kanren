import { runAll, callWithFresh } from "./mk";
import { append } from "./array";

describe("array", () => {
    it("append", () => {
        const $ = runAll({ goal: callWithFresh((a) => append([1, []], [2, []], [1, [2, []]])) });
        debugger;
    });
});