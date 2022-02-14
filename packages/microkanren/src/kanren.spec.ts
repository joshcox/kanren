import { buildKanren } from "./container";
import { prelude } from "./test/prelude";

prelude({
    name: 'Micro Kanren with substitution hash map',
    kanren: buildKanren()
});