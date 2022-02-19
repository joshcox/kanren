import { BaseTerms, Kanren } from "@kanren/types";
import { Container } from "inversify";
import { Readable } from "stream";
import { MKanren } from ".";
import { Library } from "./constants";
import { ConstraintStore, CStore } from "./store";
import { StreamableAPI } from "./search.stream";
import { SubstitutionHashMap, SubstitutionHashMapAPI } from "./substitution.map";
import { TermBaseAPI } from "./term";

export const buildKanren = () => {
    type S = SubstitutionHashMap<BaseTerms>;
    type C = ConstraintStore<S>;
    type $ = Readable;

    let container = new Container({ defaultScope: 'Singleton' });
    container.bind(Library.Store).to(CStore);
    container.bind(Library.Stream).to(StreamableAPI);
    container.bind(Library.Substitution).to(SubstitutionHashMapAPI);
    container.bind(Library.Kanren).to(MKanren);
    container.bind(Library.Term).to(TermBaseAPI);
    return container.get<Kanren<BaseTerms, S, C, $>>(Library.Kanren);
};