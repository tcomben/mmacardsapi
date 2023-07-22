import { BlobServiceClient } from '@azure/storage-blob';
import Event from '../shared/Event'
import EventLite from '../shared/EventLite'
import SearchResult from '../shared/SearchResult';

export default class DataManager {
    private client: BlobServiceClient
    private upcomingEvents: Event[] = [] as Event[];
    private archiveEvents: Event[] = [] as Event[];

    // views
    public upcomingEventList: EventLite[] = [] as EventLite[];
    public archiveEventList: EventLite[] = [] as EventLite[];
    public searchResults: SearchResult[] = [] as SearchResult[];

    constructor() {
        this.client = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONN as string);
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

        this.upcomingEventList = this.createUpcomingEventList();
        this.archiveEventList = this.createArchiveEventList();
        this.searchResults = this.createSearchResults();

        console.log("data ready");
    }

    createUpcomingEventList(): EventLite[] {
        return this.upcomingEvents.map(x => {
            const el = new EventLite();
            el.Id = x.Id;
            el.ShortName = x.ShortName;
            el.PrelimsEventDateTime = typeof x.PrelimsEventDateTime === 'string' ? new Date(x.PrelimsEventDateTime) : x.PrelimsEventDateTime;
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
            el.PrelimsEventDateTime = typeof x.PrelimsEventDateTime === 'string' ? new Date(x.PrelimsEventDateTime) : x.PrelimsEventDateTime;
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
}