import Fight from './Fight'

export default class Event {
    public Id: string = '';
    public Name: string = '';
    public ShortName: string = '';
    public MainName: string = '';
    public MainFights: Fight[] = [] as Fight[];
    public PrelimFights: Fight[] = [] as Fight[];
    public MainEventDateTime: Date = new Date();
    public PrelimsEventDateTime: Date = new Date();
    public Promotion: Promotion = Promotion.UFC;
    public EventPageUrl: string = '';
    public OddsPageUrl: string = '';
    public EventFileName: string = '';
}

export enum Promotion {
    UFC,
    Bellator,
    PFL,
    OneChampionship
}