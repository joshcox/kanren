import { Kanren } from "@kanren/types";
import { Container } from "inversify";
import { MKanren } from ".";
import { Library } from "./constants";
import { CStore } from "./store/store";
import { StreamableAPI } from "./stream/search.list";
import { Stream, StreamReadableAPI } from "./stream/search.stream";
import { SubstitutionHashMap, SubstitutionHashMapAPI } from "./substitution/substitution.map";

export const buildKanren = () => {
    type S = SubstitutionHashMap;
    type C = CStore<SubstitutionHashMap>;
    type $ = Stream<SubstitutionHashMap>;

    let container = new Container({ defaultScope: 'Singleton' });
    container.bind(Library.Store).to(CStore);
    // container.bind(Library.Stream).to(StreamReadableAPI);
    container.bind(Library.Stream).to(StreamableAPI);
    container.bind(Library.Substitution).to(SubstitutionHashMapAPI);
    container.bind(Library.Kanren).to(MKanren);
    return container.get<Kanren<S, C, $>>(Library.Kanren);
};