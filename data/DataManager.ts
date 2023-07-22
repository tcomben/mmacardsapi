import { BlobServiceClient } from '@azure/storage-blob';
import Event, { Promotion } from '../shared/Event'
import EventLite from '../shared/EventLite'
import SearchResult from '../shared/SearchResult';

export default class DataManager {
    private client: BlobServiceClient
    public upcomingEvents: Event[] = [] as Event[];
    public archiveEvents: Event[] = [] as Event[];

    // views
    public upcomingEventList: EventLite[] = [] as EventLite[];
    public archiveEventList: EventLite[] = [] as EventLite[];
    public searchResults: SearchResult[] = [] as SearchResult[];
    public possibleRoots: Event[] = [] as Event[];

    constructor() {
        this.client = BlobServiceClient.fromConnectionString(process.env.CUSTOMCONNSTR_AZURE_STORAGE_CONN as string);
    }

    async refreshData() {
        console.log("refreshing data");

        const containerClient = this.client.getContainerClient(process.env.DATA_CONTAINER as string);
        const eventsClient = containerClient.getBlobClient('events.json');
        const archiveEventsClient = containerClient.getBlobClient('archiveEvents.json');

        const downloads = await Promise.all([eventsClient.downloadToBuffer(), archiveEventsClient.downloadToBuffer()]);

        const eventsJson = downloads[0].toString('utf-8');
        const archiveEventsJson = downloads[1].toString('utf-8');

        this.upcomingEvents = JSON.parse(eventsJson) as Event[];
        this.archiveEvents = JSON.parse(archiveEventsJson) as Event[];

        for (const upcomingEvent of this.upcomingEvents) {
            upcomingEvent.MainEventDateTime = typeof upcomingEvent.MainEventDateTime === 'string' ? new Date(upcomingEvent.MainEventDateTime) : upcomingEvent.MainEventDateTime;
            upcomingEvent.PrelimsEventDateTime = typeof upcomingEvent.PrelimsEventDateTime === 'string' ? new Date(upcomingEvent.PrelimsEventDateTime) : upcomingEvent.PrelimsEventDateTime;
        }

        for (const archiveEvent of this.archiveEvents) {
            archiveEvent.MainEventDateTime = typeof archiveEvent.MainEventDateTime === 'string' ? new Date(archiveEvent.MainEventDateTime) : archiveEvent.MainEventDateTime;
            archiveEvent.PrelimsEventDateTime = typeof archiveEvent.PrelimsEventDateTime === 'string' ? new Date(archiveEvent.PrelimsEventDateTime) : archiveEvent.PrelimsEventDateTime;
        }

        this.upcomingEventList = this.createUpcomingEventList();
        this.archiveEventList = this.createArchiveEventList();
        this.searchResults = this.createSearchResults();
        this.possibleRoots = this.createPossibleRoots();

        console.log("data ready");
    }

    createUpcomingEventList(): EventLite[] {
        return this.upcomingEvents.map(x => {
            const el = new EventLite();
            el.Id = x.Id;
            el.ShortName = x.ShortName;
            el.PrelimsEventDateTime = x.PrelimsEventDateTime;
            el.Promotion = x.Promotion;
            return el;
        }).sort((a, b) => {
            return b.PrelimsEventDateTime.getTime() - a.PrelimsEventDateTime.getTime();
        });
    }

    createArchiveEventList(): EventLite[] {
        return this.archiveEvents.map(x => {
            const el = new EventLite();
            el.Id = x.Id;
            el.ShortName = x.ShortName;
            el.PrelimsEventDateTime = x.PrelimsEventDateTime;
            el.Promotion = x.Promotion;
            return el;
        }).sort((a, b) => {
            return b.PrelimsEventDateTime.getTime() - a.PrelimsEventDateTime.getTime();
        });
    }

    createSearchResults(): SearchResult[] {
        const searchLookup = {} as Record<string, EventLite[]>;
        for (const upcomingEvent of this.upcomingEvents) {
            const el = new EventLite();
            el.Id = upcomingEvent.Id;
            el.PrelimsEventDateTime = upcomingEvent.PrelimsEventDateTime;
            el.Promotion = upcomingEvent.Promotion;
            el.ShortName = upcomingEvent.ShortName;

            for (const mainFight of upcomingEvent.MainFights) {
                const firstFighterName = mainFight.FirstFighter.AltName || mainFight.FirstFighter.Name;
                if (!searchLookup[firstFighterName]) {
                    searchLookup[firstFighterName] = [] as EventLite[];
                }
                searchLookup[firstFighterName].push(el);

                const secondFighterName = mainFight.SecondFighter.AltName || mainFight.SecondFighter.Name;
                if (!searchLookup[secondFighterName]) {
                    searchLookup[secondFighterName] = [] as EventLite[];
                }
                searchLookup[secondFighterName].push(el);
            }
            for (const prelimFight of upcomingEvent.PrelimFights) {
                const firstFighterName = prelimFight.FirstFighter.AltName || prelimFight.FirstFighter.Name;
                if (!searchLookup[firstFighterName]) {
                    searchLookup[firstFighterName] = [] as EventLite[];
                }
                searchLookup[firstFighterName].push(el);

                const secondFighterName = prelimFight.SecondFighter.AltName || prelimFight.SecondFighter.Name;
                if (!searchLookup[secondFighterName]) {
                    searchLookup[secondFighterName] = [] as EventLite[];
                }
                searchLookup[secondFighterName].push(el);
            }
        }

        for (const archiveEvent of this.archiveEvents) {
            const el = new EventLite();
            el.Id = archiveEvent.Id;
            el.PrelimsEventDateTime = archiveEvent.PrelimsEventDateTime;
            el.Promotion = archiveEvent.Promotion;
            el.ShortName = archiveEvent.ShortName;

            for (const mainFight of archiveEvent.MainFights) {
                const firstFighterName = mainFight.FirstFighter.AltName || mainFight.FirstFighter.Name;
                if (!searchLookup[firstFighterName]) {
                    searchLookup[firstFighterName] = [] as EventLite[];
                }
                searchLookup[firstFighterName].push(el);

                const secondFighterName = mainFight.SecondFighter.AltName || mainFight.SecondFighter.Name;
                if (!searchLookup[secondFighterName]) {
                    searchLookup[secondFighterName] = [] as EventLite[];
                }
                searchLookup[secondFighterName].push(el);
            }
            for (const prelimFight of archiveEvent.PrelimFights) {
                const firstFighterName = prelimFight.FirstFighter.AltName || prelimFight.FirstFighter.Name;
                if (!searchLookup[firstFighterName]) {
                    searchLookup[firstFighterName] = [] as EventLite[];
                }
                searchLookup[firstFighterName].push(el);

                const secondFighterName = prelimFight.SecondFighter.AltName || prelimFight.SecondFighter.Name;
                if (!searchLookup[secondFighterName]) {
                    searchLookup[secondFighterName] = [] as EventLite[];
                }
                searchLookup[secondFighterName].push(el);
            }
        }

        const results: SearchResult[] = [] as SearchResult[];

        for (const key of Object.keys(searchLookup)) {
            const result = new SearchResult();
            result.FighterName = key;
            result.Events = searchLookup[key];
            results.push(result);
        }

        return results;
    }

    createPossibleRoots(): Event[] {
        const hoursToAdd = 16;
        const now = new Date();
        const possibleRoots: Event[] = [] as Event[];
        const foundPromotions: Promotion[] = [] as Promotion[];

        const upcomingEvents = this.upcomingEvents.sort((a, b) => {
            return a.PrelimsEventDateTime.getTime() - b.PrelimsEventDateTime.getTime();
        })

        for (const event of this.upcomingEvents) {
            if (foundPromotions.indexOf(event.Promotion) === -1) {
                const mainTest = new Date(event.MainEventDateTime.getTime());
                mainTest.setTime(mainTest.getTime() + (hoursToAdd * 60 * 60 * 1000));

                if (mainTest > now) {
                    foundPromotions.push(event.Promotion);
                    possibleRoots.push(event);
                }
            }
        }

        return possibleRoots;
    }
}