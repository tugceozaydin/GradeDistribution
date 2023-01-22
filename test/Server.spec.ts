import Server from "../src/rest/Server";

import InsightFacade from "../src/controller/InsightFacade";
import chai = require("chai");
import chaiHttp = require("chai-http");
import Response = ChaiHttp.Response;
import {expect} from "chai";
import Log from "../src/Util";
import * as fs from "fs";

const url = "http://localhost:4321/";

describe("Facade D3", function () {

    let facade: InsightFacade = null;
    let server: Server = null;

    chai.use(chaiHttp);

    before(function () {
        facade = new InsightFacade();
        server = new Server(4321);
        try {
            server.start();
        } catch (error) {
            Log.error("Couldn't start server");
        }
    });

    after(function () {
        server.stop();
    });

    beforeEach(function () {
        // might want to add some process logging here to keep track of what"s going on
    });

    afterEach(function () {
        // might want to add some process logging here to keep track of what"s going on
    });

    // Sample on how to format PUT requests

    it("PUT test for courses dataset checking code", function () {
        const datasetLoc = "./test/data/courses.zip";
        try {
            return chai.request(url)
                .put("dataset/courses/courses")
                .send(fs.readFileSync(datasetLoc))
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err) {
                    // some logging here please!
                    expect.fail();
                });
        } catch (err) {
            expect.fail();
            // and some more logging here!
        }
    });

    it("PUT test for courses dataset checking result double", function () {
        const datasetLoc = "./test/data/oneValidCourse.zip";
        try {
            return chai.request(url)
                .put("dataset/oneValidCourse/courses")
                .send(fs.readFileSync(datasetLoc))
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: any) {
                    let temp: any = res.text;
                    temp = JSON.parse(temp);
                    expect(temp["result"][1]).to.be.equal("oneValidCourse");
                })
                .catch(function (err) {
                    // some logging here please!
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            expect.fail();
        }
    });

    it("GET list of datasets", function () {
        try {
            return chai.request(url)
                .get("datasets")
                .then(function (res: any) {
                    let temp: any = res.text;
                    temp = JSON.parse(temp);
                    expect(temp["result"].length).to.be.equal(2);
                })
                .catch(function (err) {
                    // some logging here please!
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            expect.fail();
        }
    });

    it("DEL test for oneValidCourse", function () {
        try {
            return chai.request(url)
                .del("dataset/oneValidCourse")
                .then(function (res: any) {
                    let temp: any = res.text;
                    temp = JSON.parse(temp);
                    expect(temp["result"]).to.be.equal("oneValidCourse");
                })
                .catch(function (err) {
                    // some logging here please!
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            expect.fail();
        }
    });

    it("DEL test for oneValidCourse - invalid", function () {
        try {
            return chai.request(url)
                .del("dataset/oneValidCourse")
                .then(function (res: any) {
                    expect.fail();
                })
                .catch(function (err) {
                    // some logging here please!
                    expect(err.status).to.be.equal(404);
                });
        } catch (err) {
            // and some more logging here!
            expect.fail();
        }
    });

    it("DEL test for insighterror", function () {
        try {
            return chai.request(url)
                .del("dataset/hello_world")
                .then(function (res: any) {
                    expect.fail();
                })
                .catch(function (err) {
                    // some logging here please!
                    expect(err.status).to.be.equal(400);
                });
        } catch (err) {
            // and some more logging here!
            expect.fail();
        }
    });

    it("PUT test for courses dataset checking result double check dataset2", function () {
        const datasetLoc = "./test/data/courses.zip";
        try {
            return chai.request(url)
                .put("dataset/courses/courses")
                .send(fs.readFileSync(datasetLoc))
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    expect.fail();
                })
                .catch(function (err) {
                    // some logging here please!
                    expect(err.status).to.be.equal(400);
                });
        } catch (err) {
            // and some more logging here!
            expect.fail();
        }
    });

    it("DEL test for courses", function () {
        try {
            return chai.request(url)
                .del("dataset/courses")
                .then(function (res: any) {
                    let temp: any = res.text;
                    temp = JSON.parse(temp);
                    expect(temp["result"]).to.be.equal("courses");
                })
                .catch(function (err) {
                    // some logging here please!
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            expect.fail();
        }
    });

    it("PUT test for courses dataset checking result", function () {
        const datasetLoc = "./test/data/courses.zip";
        try {
            return chai.request(url)
                .put("dataset/courses/courses")
                .send(fs.readFileSync(datasetLoc))
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    let temp: any = res.text;
                    temp = JSON.parse(temp);
                    expect(temp["result"][0]).to.be.equal("courses");
                })
                .catch(function (err) {
                    // some logging here please!
                    expect(err.status).to.be.equal(400);
                });
        } catch (err) {
            // and some more logging here!
        }
    });

    it("PUT test for courses dataset checking code noCourses - Invalid", function () {
        const datasetLoc = "./test/data/noCourses.zip";
        try {
            return chai.request(url)
                .put("dataset/noCourses/courses")
                .send(fs.readFileSync(datasetLoc))
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    expect.fail();
                })
                .catch(function (err) {
                    // some logging here please!
                    expect(err.status).to.be.equal(400);
                });
        } catch (err) {
            // and some more logging here!
            expect.fail();
        }
    });

    it("PUT test for courses dataset checking result same name invalid", function () {
        const datasetLoc = "./test/data/courses.zip";
        try {
            return chai.request(url)
                .put("dataset/courses/courses")
                .send(fs.readFileSync(datasetLoc))
                .set("Content-Type", "application/x-zip-compressed")
                .then(function () {
                    // some logging here please!
                    return chai.request(url)
                        .put("dataset/courses/courses")
                        .attach("body", fs.readFileSync(datasetLoc), datasetLoc)
                        .set("Content-Type", "application/x-zip-compressed")
                        .then(function (res: Response) {
                            expect.fail();
                        });
                })
                .catch(function (err) {
                    // some logging here please!
                    expect(err.status).to.be.equal(400);
                });
        } catch (err) {
            // and some more logging here!
        }
    });

    it("PUT test for courses dataset checking code noCourses - Invalid", function () {
        const datasetLoc = "./test/data/noCourses.zip";
        try {
            return chai.request(url)
                .put("dataset/noCourses/courses")
                .send(fs.readFileSync(datasetLoc))
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    expect.fail();
                })
                .catch(function (err) {
                    // some logging here please!
                    expect(err.status).to.be.equal(400);
                });
        } catch (err) {
            // and some more logging here!
            expect.fail();
        }
    });

    it("PUT test for courses dataset checking code - Invalid Course", function () {
        const datasetLoc = "./test/data/oneInvalidCourse.zip";
        try {
            return chai.request(url)
                .put("dataset/oneInvalidCourse/courses")
                .send(fs.readFileSync(datasetLoc))
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    expect.fail();
                })
                .catch(function (err) {
                    // some logging here please!
                    expect(err.status).to.be.equal(400);
                });
        } catch (err) {
            // and some more logging here!
            expect.fail();
        }
    });

    it("POST test for valid query- testing length", function () {
        const queryLoc = "./test/queries/simple.json";
        try {
            const queryFile: any = fs.readFileSync(queryLoc);
            const fun = JSON.parse(queryFile.toString());
            const query: any = fun["query"];
            return chai.request(url)
                .post("query")
                .send(query)
                .then(function (res: any) {
                    let temp: any = res.text;
                    temp = JSON.parse(temp);
                    expect(temp["result"].length).to.be.equal(49);
                })
                .catch(function (err) {
                    // some logging here please!
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            expect.fail();
        }
    });

    it("POST test for valid query- testing code", function () {
        const queryLoc = "./test/queries/simple.json";
        try {
            const queryFile: any = fs.readFileSync(queryLoc);
            const fun = JSON.parse(queryFile.toString());
            const query: any = fun["query"];
            return chai.request(url)
                .post("query")
                .send(query)
                .then(function (res: any) {
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err) {
                    // some logging here please!
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            expect.fail();
        }
    });

    it("POST test for invalid query- testing code", function () {
        const queryLoc = "./test/queries/invalid.json";
        try {
            const queryFile: any = fs.readFileSync(queryLoc);
            const fun = JSON.parse(queryFile.toString());
            const query: any = fun["query"];
            return chai.request(url)
                .post("query")
                .send(query)
                .then(function (res: any) {
                    expect.fail();
                })
                .catch(function (err) {
                    // some logging here please!
                    expect(err.status).to.be.equal(400);
                });
        } catch (err) {
            // and some more logging here!
            expect.fail();
        }
    });
});
