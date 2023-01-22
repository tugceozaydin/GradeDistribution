"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = require("../src/rest/Server");
const InsightFacade_1 = require("../src/controller/InsightFacade");
const chai = require("chai");
const chaiHttp = require("chai-http");
const chai_1 = require("chai");
const Util_1 = require("../src/Util");
const fs = require("fs");
const url = "http://localhost:4321/";
describe("Facade D3", function () {
    let facade = null;
    let server = null;
    chai.use(chaiHttp);
    before(function () {
        facade = new InsightFacade_1.default();
        server = new Server_1.default(4321);
        try {
            server.start();
        }
        catch (error) {
            Util_1.default.error("Couldn't start server");
        }
    });
    after(function () {
        server.stop();
    });
    beforeEach(function () {
    });
    afterEach(function () {
    });
    it("PUT test for courses dataset checking code", function () {
        const datasetLoc = "./test/data/courses.zip";
        try {
            return chai.request(url)
                .put("dataset/courses/courses")
                .send(fs.readFileSync(datasetLoc))
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res) {
                chai_1.expect(res.status).to.be.equal(200);
            })
                .catch(function (err) {
                chai_1.expect.fail();
            });
        }
        catch (err) {
            chai_1.expect.fail();
        }
    });
    it("PUT test for courses dataset checking result double", function () {
        const datasetLoc = "./test/data/oneValidCourse.zip";
        try {
            return chai.request(url)
                .put("dataset/oneValidCourse/courses")
                .send(fs.readFileSync(datasetLoc))
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res) {
                let temp = res.text;
                temp = JSON.parse(temp);
                chai_1.expect(temp["result"][1]).to.be.equal("oneValidCourse");
            })
                .catch(function (err) {
                chai_1.expect.fail();
            });
        }
        catch (err) {
            chai_1.expect.fail();
        }
    });
    it("GET list of datasets", function () {
        try {
            return chai.request(url)
                .get("datasets")
                .then(function (res) {
                let temp = res.text;
                temp = JSON.parse(temp);
                chai_1.expect(temp["result"].length).to.be.equal(2);
            })
                .catch(function (err) {
                chai_1.expect.fail();
            });
        }
        catch (err) {
            chai_1.expect.fail();
        }
    });
    it("DEL test for oneValidCourse", function () {
        try {
            return chai.request(url)
                .del("dataset/oneValidCourse")
                .then(function (res) {
                let temp = res.text;
                temp = JSON.parse(temp);
                chai_1.expect(temp["result"]).to.be.equal("oneValidCourse");
            })
                .catch(function (err) {
                chai_1.expect.fail();
            });
        }
        catch (err) {
            chai_1.expect.fail();
        }
    });
    it("DEL test for oneValidCourse - invalid", function () {
        try {
            return chai.request(url)
                .del("dataset/oneValidCourse")
                .then(function (res) {
                chai_1.expect.fail();
            })
                .catch(function (err) {
                chai_1.expect(err.status).to.be.equal(404);
            });
        }
        catch (err) {
            chai_1.expect.fail();
        }
    });
    it("DEL test for insighterror", function () {
        try {
            return chai.request(url)
                .del("dataset/hello_world")
                .then(function (res) {
                chai_1.expect.fail();
            })
                .catch(function (err) {
                chai_1.expect(err.status).to.be.equal(400);
            });
        }
        catch (err) {
            chai_1.expect.fail();
        }
    });
    it("PUT test for courses dataset checking result double check dataset2", function () {
        const datasetLoc = "./test/data/courses.zip";
        try {
            return chai.request(url)
                .put("dataset/courses/courses")
                .send(fs.readFileSync(datasetLoc))
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res) {
                chai_1.expect.fail();
            })
                .catch(function (err) {
                chai_1.expect(err.status).to.be.equal(400);
            });
        }
        catch (err) {
            chai_1.expect.fail();
        }
    });
    it("DEL test for courses", function () {
        try {
            return chai.request(url)
                .del("dataset/courses")
                .then(function (res) {
                let temp = res.text;
                temp = JSON.parse(temp);
                chai_1.expect(temp["result"]).to.be.equal("courses");
            })
                .catch(function (err) {
                chai_1.expect.fail();
            });
        }
        catch (err) {
            chai_1.expect.fail();
        }
    });
    it("PUT test for courses dataset checking result", function () {
        const datasetLoc = "./test/data/courses.zip";
        try {
            return chai.request(url)
                .put("dataset/courses/courses")
                .send(fs.readFileSync(datasetLoc))
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res) {
                let temp = res.text;
                temp = JSON.parse(temp);
                chai_1.expect(temp["result"][0]).to.be.equal("courses");
            })
                .catch(function (err) {
                chai_1.expect(err.status).to.be.equal(400);
            });
        }
        catch (err) {
        }
    });
    it("PUT test for courses dataset checking code noCourses - Invalid", function () {
        const datasetLoc = "./test/data/noCourses.zip";
        try {
            return chai.request(url)
                .put("dataset/noCourses/courses")
                .send(fs.readFileSync(datasetLoc))
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res) {
                chai_1.expect.fail();
            })
                .catch(function (err) {
                chai_1.expect(err.status).to.be.equal(400);
            });
        }
        catch (err) {
            chai_1.expect.fail();
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
                return chai.request(url)
                    .put("dataset/courses/courses")
                    .attach("body", fs.readFileSync(datasetLoc), datasetLoc)
                    .set("Content-Type", "application/x-zip-compressed")
                    .then(function (res) {
                    chai_1.expect.fail();
                });
            })
                .catch(function (err) {
                chai_1.expect(err.status).to.be.equal(400);
            });
        }
        catch (err) {
        }
    });
    it("PUT test for courses dataset checking code noCourses - Invalid", function () {
        const datasetLoc = "./test/data/noCourses.zip";
        try {
            return chai.request(url)
                .put("dataset/noCourses/courses")
                .send(fs.readFileSync(datasetLoc))
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res) {
                chai_1.expect.fail();
            })
                .catch(function (err) {
                chai_1.expect(err.status).to.be.equal(400);
            });
        }
        catch (err) {
            chai_1.expect.fail();
        }
    });
    it("PUT test for courses dataset checking code - Invalid Course", function () {
        const datasetLoc = "./test/data/oneInvalidCourse.zip";
        try {
            return chai.request(url)
                .put("dataset/oneInvalidCourse/courses")
                .send(fs.readFileSync(datasetLoc))
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res) {
                chai_1.expect.fail();
            })
                .catch(function (err) {
                chai_1.expect(err.status).to.be.equal(400);
            });
        }
        catch (err) {
            chai_1.expect.fail();
        }
    });
    it("POST test for valid query- testing length", function () {
        const queryLoc = "./test/queries/simple.json";
        try {
            const queryFile = fs.readFileSync(queryLoc);
            const fun = JSON.parse(queryFile.toString());
            const query = fun["query"];
            return chai.request(url)
                .post("query")
                .send(query)
                .then(function (res) {
                let temp = res.text;
                temp = JSON.parse(temp);
                chai_1.expect(temp["result"].length).to.be.equal(49);
            })
                .catch(function (err) {
                chai_1.expect.fail();
            });
        }
        catch (err) {
            chai_1.expect.fail();
        }
    });
    it("POST test for valid query- testing code", function () {
        const queryLoc = "./test/queries/simple.json";
        try {
            const queryFile = fs.readFileSync(queryLoc);
            const fun = JSON.parse(queryFile.toString());
            const query = fun["query"];
            return chai.request(url)
                .post("query")
                .send(query)
                .then(function (res) {
                chai_1.expect(res.status).to.be.equal(200);
            })
                .catch(function (err) {
                chai_1.expect.fail();
            });
        }
        catch (err) {
            chai_1.expect.fail();
        }
    });
    it("POST test for invalid query- testing code", function () {
        const queryLoc = "./test/queries/invalid.json";
        try {
            const queryFile = fs.readFileSync(queryLoc);
            const fun = JSON.parse(queryFile.toString());
            const query = fun["query"];
            return chai.request(url)
                .post("query")
                .send(query)
                .then(function (res) {
                chai_1.expect.fail();
            })
                .catch(function (err) {
                chai_1.expect(err.status).to.be.equal(400);
            });
        }
        catch (err) {
            chai_1.expect.fail();
        }
    });
});
//# sourceMappingURL=Server.spec.js.map