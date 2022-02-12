import { prelude } from "./test/prelude";
import { kanren } from "./index";
import {SubstitutionList, SubstitutionListAPI} from "./substitution/substitution.list";
import SubstitutionMapAPI, { SubstitutionMap } from "./substitution/substitution.map";
import { StreamReadableAPI } from "./stream/search.stream";
import { ConstraintStore } from "./store/store";
import { StreamListAPI } from "./stream/search";


prelude({
    name: 'Micro Kanren with substitution list',
    kanren: kanren({
        substitutionAPI: SubstitutionListAPI,
        storeAPI: ConstraintStore<SubstitutionList>(),
        streamAPI: StreamReadableAPI<ConstraintStore<SubstitutionList>>(),
    })
});

prelude({
    name: 'Micro Kanren with substitution map',
    kanren: kanren({
        substitutionAPI: SubstitutionMapAPI,
        storeAPI: ConstraintStore<SubstitutionMap>(),
        streamAPI: StreamReadableAPI<ConstraintStore<SubstitutionMap>>(),
    })
});

prelude({
    name: 'Micro Kanren with list-stream implementation ',
    kanren: kanren({
        substitutionAPI: SubstitutionListAPI,
        storeAPI: ConstraintStore<SubstitutionList>(),
        streamAPI: StreamListAPI<ConstraintStore<SubstitutionList>>(),
    })
});