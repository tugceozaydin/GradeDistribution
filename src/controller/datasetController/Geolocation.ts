import * as http from "http";

export default class Geolocation {

    public static getGeoLocation(address: string) {
        return new Promise((resolve, reject) => {
            let geoAddress = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team141/";
            let add = encodeURI(address);
            let fullGeolocation = geoAddress.concat(add);
            let result: any[] = [];
            http.get(fullGeolocation, (res) => {
                let geoData = res;
                let lat, lon;
                geoData.setEncoding("utf8");
                res.on("data", (d) => {
                    d = JSON.parse(d);
                    lat = d["lat"];
                    lon = d["lon"];
                    result.push(lat);
                    result.push(lon);
                    return resolve(result);
                });
            }).on("error", () => {
                return resolve(result);
            });
        });
    }

    public static addGeolocationDetails(storage: any) {
        return new Promise((resolve, reject) => {
            const futureLocations: any[] = [];
            const buildings: any[] = [];
            for (const [key, value] of storage.entries()) {
                futureLocations.push(this.getGeoLocation(value[0].address));
                buildings.push(key);
            }
            Promise.all(futureLocations).then((geoLocData: any) => {
                for (let i = 0; i < geoLocData.length; i++) {
                    if (geoLocData[i].length <= 1) {
                        storage.delete(buildings[i]);
                    }
                    let lor = storage.get(buildings[i]);
                    if (Array.isArray(lor)) {
                        for (let room of lor) {
                            room.lat = geoLocData[i][0];
                            room.lon = geoLocData[i][1];
                        }
                    }
                }
                return resolve(storage);
            });
        });
    }
}
