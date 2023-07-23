import { Promotion } from './Event'

export default class EventLite {
    public Id: string = '';
    public ShortName: string = '';
    public Promotion: Promotion = Promotion.UFC;
    public PrelimsEventDateTime: Date = new Date();
    public MainEventDateTime: Date = new Date();
}