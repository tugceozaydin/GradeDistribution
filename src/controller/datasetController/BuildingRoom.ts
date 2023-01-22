export default class BuildingRoom {

    public fullname: string;
    public shortname: string;
    public num: string;
    public name: string;
    public address: string;
    public lat: number;
    public lon: number;
    public seats: number;
    public type: string;
    public furniture: string;
    public href: string;

    constructor(fullname: string, shortname: string, num: string, name: string, address: string, lat: number,
                lon: number, seats: number, type: string, furniture: string, href: string) {
        this.fullname = fullname;
        this.shortname = shortname;
        this.num = num;
        this.name = name;
        this.address = address;
        this.lat = lat;
        this.lon = lon;
        this.seats = seats;
        this.type = type;
        this.furniture = furniture;
        this.href = href;
    }
}
