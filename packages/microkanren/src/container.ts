import { Kanren } from "@kanren/types";
import { Container } from "inversify";
import { Readable } from "stream";
import { MKanren } from ".";
import { Library } from "./constants";
import { CStore } from "./store";
import { StreamableAPI } from "./search.stream";
import { SubstitutionHashMap, SubstitutionHashMapAPI } from "./substitution.map";

export const buildKanren = () => {
    type S = SubstitutionHashMap;
    type C = CStore<SubstitutionHashMap>;
    type $ = Readable;

    let container = new Container({ defaultScope: 'Singleton' });
    container.bind(Library.Store).to(CStore);
    // container.bind(Library.Stream).to(StreamReadableAPI);
    container.bind(Library.Stream).to(StreamableAPI);
    container.bind(Library.Substitution).to(SubstitutionHashMapAPI);
    container.bind(Library.Kanren).to(MKanren);
    return container.get<Kanren<S, C, $>>(Library.Kanren);
};