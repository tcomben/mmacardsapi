export default class Fighter {
    public Name: string = '';
    public AltName: string | null | undefined = undefined;
    public Id: string = '';
    public Image: string = '';
    public ProfileUrl: string = '';
    public Odds: number = 0;
    public Outcome: Outcome | null = null
}

export enum Outcome {
    Win,
    Loss,
    Draw,
    NoContest
}