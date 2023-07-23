import { Promotion } from "./Event";
import Event from "./Event";
import EventLite from "./EventLite";

export default class SearchResult {
    public FighterName: string = '';
    public Events: EventLiteWithFighterId[] = [] as EventLiteWithFighterId[];
}

export class EventLiteWithFighterId extends EventLite {
    public FighterId: string = '';
}