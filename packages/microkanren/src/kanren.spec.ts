import { prelude } from "./test/prelude";
import { kanren } from "./index";
import {SubstitutionListAPI} from "./substitution/substitution.list";
import SubstitutionMapAPI from "./substitution/substitution.map";


prelude({
    name: 'Micro Kanren with substitution list',
    kanren: kanren({
        substitutionAPI: SubstitutionListAPI
    })
});

prelude({
    name: 'Micro Kanren with substitution map',
    kanren: kanren({
        substitutionAPI: SubstitutionMapAPI
    })
});