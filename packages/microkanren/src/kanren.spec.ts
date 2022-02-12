import { prelude } from "./test/prelude";
import { kanren } from "./index";
import {SubstitutionList, SubstitutionListAPI} from "./substitution/substitution.list";
import SubstitutionMapAPI, { SubstitutionMap } from "./substitution/substitution.map";
import { StreamReadableAPI } from "./stream/search.stream";
import { ConstraintStore } from "./store/store";
import { Store } from "./store/interface";


prelude({
    name: 'Micro Kanren with substitution list',
    kanren: kanren({
        substitutionAPI: SubstitutionListAPI,
        storeAPI: ConstraintStore<SubstitutionList>(),
        streamAPI: StreamReadableAPI<Store<SubstitutionList>>(),
    })
});

prelude({
    name: 'Micro Kanren with substitution map',
    kanren: kanren({
        substitutionAPI: SubstitutionMapAPI,
        storeAPI: ConstraintStore<SubstitutionMap>(),
        streamAPI: StreamReadableAPI<Store<SubstitutionMap>>(),
    })
});