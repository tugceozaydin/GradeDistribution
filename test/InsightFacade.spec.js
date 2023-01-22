"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chai_1 = require("chai");
const fs = require("fs-extra");
const chaiAsPromised = require("chai-as-promised");
const IInsightFacade_1 = require("../src/controller/IInsightFacade");
const InsightFacade_1 = require("../src/controller/InsightFacade");
const Util_1 = require("../src/Util");
const TestUtil_1 = require("./TestUtil");
chai.use(chaiAsPromised);
describe("InsightFacade Add/Remove/List Dataset", function () {
    const datasetsToLoad = {
        courses: "./test/data/courses.zip",
        rooms: "./test/data/rooms.zip",
        roomsNoIndex: "./test/data/roomsNoIndex.zip",
        courseResultInvalid: "./test/data/courseResultInvalid.zip",
        invalidDirectoryName: "./test/data/invalidDirectoryName.zip",
        joshcourses: "./test/data/josh courses.zip",
        noCourses: "./test/data/noCourses.zip",
        oneInvalidCourse: "./test/data/oneInvalidCourse.zip",
        oneInvalidCourseResult: "./test/data/oneInvalidCourseResult.zip",
        oneValidCourse: "./test/data/oneValidCourse.zip",
        joshs_courses: "./test/data/joshs_courses.zip",
        jsonfile: "./test/data/jsonfile.json"
    };
    let datasets = {};
    let insightFacade;
    const cacheDir = __dirname + "/../data";
    before(function () {
        Util_1.default.test(`Before all`);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }
        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs.readFileSync(datasetsToLoad[id]).toString("base64");
        }
        try {
            insightFacade = new InsightFacade_1.default();
        }
        catch (err) {
            Util_1.default.error(err);
        }
    });
    beforeEach(function () {
        Util_1.default.test(`BeforeTest: ${this.currentTest.title}`);
    });
    after(function () {
        Util_1.default.test(`After: ${this.test.parent.title}`);
    });
    afterEach(function () {
        Util_1.default.test(`AfterTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade_1.default();
        }
        catch (err) {
            Util_1.default.error(err);
        }
    });
    it("Should add a valid rooms dataset", function () {
        const id = "rooms";
        const expected = [id];
        const futureResult = insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Rooms);
        return chai_1.expect(futureResult).to.eventually.deep.equal(expected);
    });
    it("Shouldn't add a valid dataset no index - rooms", function () {
        const id = "roomsNoIndex";
        const datasetName = "roomsNoIndex";
        const futureResult = insightFacade.addDataset(id, datasets[datasetName], IInsightFacade_1.InsightDatasetKind.Rooms);
        return chai_1.expect(futureResult).to.be.rejectedWith(IInsightFacade_1.InsightError);
    });
    it("Should add a valid dataset", function () {
        const id = "courses";
        const expected = [id];
        const futureResult = insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        return chai_1.expect(futureResult).to.eventually.deep.equal(expected);
    });
    it("Should add a valid dataset with whitespace", function () {
        const id = "josh courses";
        const datasetName = "joshcourses";
        const expected = [id];
        const futureResult = insightFacade.addDataset(id, datasets[datasetName], IInsightFacade_1.InsightDatasetKind.Courses);
        return chai_1.expect(futureResult).to.eventually.deep.equal(expected);
    });
    it("Shouldn't add a valid dataset with underscore", function () {
        const id = "joshs_courses";
        const datasetName = "joshcourses";
        const futureResult = insightFacade.addDataset(id, datasets[datasetName], IInsightFacade_1.InsightDatasetKind.Courses);
        return chai_1.expect(futureResult).to.be.rejectedWith(IInsightFacade_1.InsightError);
    });
    it("Shouldn't add a valid dataset with only whitespace", function () {
        const id = " ";
        const datasetName = "joshcourses";
        const futureResult = insightFacade.addDataset(id, datasets[datasetName], IInsightFacade_1.InsightDatasetKind.Courses);
        return chai_1.expect(futureResult).to.be.rejectedWith(IInsightFacade_1.InsightError);
    });
    it("Shouldn't add a valid dataset with undefined key", function () {
        const id = undefined;
        const datasetName = "joshcourses";
        const futureResult = insightFacade.addDataset(id, datasets[datasetName], IInsightFacade_1.InsightDatasetKind.Courses);
        return chai_1.expect(futureResult).to.be.rejectedWith(IInsightFacade_1.InsightError);
    });
    it("Should chain promise with id underscore?", function () {
        let id1 = "joshs_courses";
        const id2 = "joshcourses";
        const expected = [id2];
        return insightFacade.addDataset(id1, datasets[id1], IInsightFacade_1.InsightDatasetKind.Courses)
            .then((result) => {
            return insightFacade.addDataset(id2, datasets[id2], IInsightFacade_1.InsightDatasetKind.Courses).then((result2) => {
                chai_1.expect(result2).to.eventually.deep.equal(expected);
            }).catch((err) => {
                chai_1.expect.fail("No error should have been thrown");
            });
        }).catch((err) => {
            chai_1.expect(err).to.be.instanceOf(IInsightFacade_1.InsightError);
        });
    });
    it("chain promise for incorrect id whitespace", function () {
        let id1 = " ";
        const id2 = "joshcourses";
        const expected = [id2];
        return insightFacade.addDataset(id1, datasets[id1], IInsightFacade_1.InsightDatasetKind.Courses)
            .then((result) => {
            return insightFacade.addDataset(id2, datasets[id2], IInsightFacade_1.InsightDatasetKind.Courses).then((result2) => {
                chai_1.expect(result2).to.eventually.deep.equal(expected);
            }).catch((err) => {
                chai_1.expect.fail("No error should have been thrown");
            });
        }).catch((err) => {
            chai_1.expect(err).to.be.instanceOf(IInsightFacade_1.InsightError);
        });
    });
    it("Shouldn't add a dataset with the same name", function () {
        const id = "courses";
        return insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses)
            .then((result1) => {
            const futureResult = insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
            return chai_1.expect(futureResult).to.be.rejectedWith(IInsightFacade_1.InsightError);
        });
    });
    it("Shouldn't add a dataset that's not a zipped file", function () {
        const id = "jsonfile";
        const futureResult = insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        return chai_1.expect(futureResult).to.be.rejectedWith(IInsightFacade_1.InsightError);
    });
    it("Shouldn't add a dataset that has no valid courses", function () {
        const id = "noCourses";
        const futureResult = insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        return chai_1.expect(futureResult).to.be.rejectedWith(IInsightFacade_1.InsightError);
    });
    it("Shouldn't add a dataset without the correct directory name", function () {
        const id = "invalidDirectoryName";
        const futureResult = insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        return chai_1.expect(futureResult).to.be.rejectedWith(IInsightFacade_1.InsightError);
    });
    it("Should add a dataset with the same name", function () {
        let id1 = "courses";
        let id2 = "CouRsEs";
        const expected = [id1, id2];
        insightFacade.addDataset(id1, datasets[id1], IInsightFacade_1.InsightDatasetKind.Courses)
            .then(() => {
            insightFacade.addDataset(id2, datasets[id1], IInsightFacade_1.InsightDatasetKind.Courses)
                .then((result) => {
                return chai_1.expect(result).to.eventually.deep.equal(expected);
            });
        }).catch((err) => {
            chai_1.expect.fail("Error should not have been thrown");
        });
    });
    it("Should add a dataset with one valid course", function () {
        const id = "oneValidCourse";
        const expected = [id];
        const futureResult = insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        return chai_1.expect(futureResult).to.eventually.deep.equal(expected);
    });
    it("Shouldn't add a dataset with only one invalid course", function () {
        const id = "oneInvalidCourse";
        const futureResult = insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        return chai_1.expect(futureResult).to.be.rejectedWith(IInsightFacade_1.InsightError);
    });
    it("Shouldn't add a dataset with only one course with an invalid result", function () {
        const id = "courseResultInvalid";
        const futureResult = insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        return chai_1.expect(futureResult).to.be.rejectedWith(IInsightFacade_1.InsightError);
    });
    it("Should add a dataset with only one course with an invalid result", function () {
        const id = "oneInvalidCourseResult";
        const expected = [id];
        const futureResult = insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        return chai_1.expect(futureResult).to.eventually.deep.equal(expected);
    });
    it("Shouldn't add a dataset because of the invalid type (Rooms)", function () {
        const id = "courses";
        const futureResult = insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Rooms);
        return chai_1.expect(futureResult).to.be.rejectedWith(IInsightFacade_1.InsightError);
    });
    it("Shouldn't add a dataset because of the invalid type (undefined)", function () {
        const id = "courses";
        const futureResult = insightFacade.addDataset(id, datasets[id], undefined);
        return chai_1.expect(futureResult).to.be.rejectedWith(IInsightFacade_1.InsightError);
    });
    it("Shouldn't add a dataset because it's a duplicate", function () {
        const id = "courses";
        return insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses)
            .then((result) => {
            return insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses)
                .then((result2) => {
                chai_1.expect.fail("An error should have been thrown");
            }).catch((err) => {
                chai_1.expect(err).to.be.instanceOf(IInsightFacade_1.InsightError);
            });
        }).catch(() => {
            chai_1.expect.fail("Error shouldn't have been thrown");
        });
    });
    it("Should add two different databases with chaining", function () {
        const c1 = "courses";
        const c2 = "oneValidCourse";
        const expected = [c1, c2];
        return insightFacade.addDataset(c1, datasets[c1], IInsightFacade_1.InsightDatasetKind.Courses)
            .then((result) => {
            return insightFacade.addDataset(c2, datasets[c2], IInsightFacade_1.InsightDatasetKind.Courses)
                .then((result2) => {
                chai_1.expect(result2).to.deep.equal(expected);
            }).catch(() => {
                chai_1.expect.fail("An error should have been thrown");
            });
        }).catch(() => {
            chai_1.expect.fail("Error shouldn't have been thrown");
        });
    });
    it("Shouldn't remove dataset because of the invalid type (undefined)", function () {
        const id = undefined;
        const futureResult = insightFacade.removeDataset(id);
        return chai_1.expect(futureResult).to.be.rejectedWith(IInsightFacade_1.InsightError);
    });
    it("Shouldn't remove dataset because of the invalid type (whitespace)", function () {
        const id = " ";
        const futureResult = insightFacade.removeDataset(id);
        return chai_1.expect(futureResult).to.be.rejectedWith(IInsightFacade_1.InsightError);
    });
    it("Shouldn't remove dataset because of the invalid type (underline)", function () {
        const id = "Joshs_courses";
        const futureResult = insightFacade.removeDataset(id);
        return chai_1.expect(futureResult).to.be.rejectedWith(IInsightFacade_1.InsightError);
    });
    it("Shouldn't remove dataset because it hasn't been added yet", function () {
        const id = "courses";
        const futureResult = insightFacade.removeDataset(id);
        return chai_1.expect(futureResult).to.be.rejectedWith(IInsightFacade_1.NotFoundError);
    });
    it("Shouldn't remove dataset because it has already been removed", function () {
        const id = "courses";
        const expected = [id];
        return insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses)
            .then((result1) => {
            return insightFacade.removeDataset(id)
                .then((result2) => {
                return insightFacade.removeDataset(id)
                    .then(() => {
                    return chai_1.expect(result2).to.deep.equal(id);
                }).catch((err) => {
                    chai_1.expect(err).to.be.instanceOf(IInsightFacade_1.NotFoundError);
                });
            }).catch((err) => {
                chai_1.expect.fail("Error shouldn't be thrown");
            });
        }).catch((err) => {
            chai_1.expect.fail("Error shouldn't be thrown");
        });
    });
    it("Should remove dataset despite whitespace id because of chained promise", function () {
        const id1 = " ";
        const id2 = "courses";
        const expected = id2;
        return insightFacade.addDataset(id2, datasets[id2], IInsightFacade_1.InsightDatasetKind.Courses)
            .then((result) => {
            return insightFacade.removeDataset(id1)
                .then((result2) => {
                return insightFacade.removeDataset(id2)
                    .then((result3) => {
                    chai_1.expect(result3).to.eventually.deep.equal(expected);
                    chai_1.expect(result).to.eventually.deep.equal([id2]);
                }).catch(() => {
                    chai_1.expect.fail("Error shouldn't be thrown");
                });
            }).catch((err) => {
                chai_1.expect(err).to.be.instanceOf(IInsightFacade_1.InsightError);
            });
        }).catch(() => {
            chai_1.expect.fail("Error shouldn't be thrown");
        });
    });
    it("Should remove dataset despite not being added yet because of chained promise", function () {
        const id = "courses";
        const expected = [id];
        return insightFacade.removeDataset(id)
            .then(() => {
            return insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses)
                .then((result2) => {
                return insightFacade.removeDataset(id)
                    .then((result3) => {
                    return chai_1.expect(result3).to.deep.equal(id);
                }).catch((err) => {
                    chai_1.expect.fail("Shouldn't thrown an error");
                });
            }).catch((err) => {
                chai_1.expect.fail("Shouldn't thrown an error");
            });
        }).catch((err) => {
            chai_1.expect(err).to.be.instanceOf(IInsightFacade_1.NotFoundError);
        });
    });
    it("Should remove dataset", function () {
        const id = "courses";
        const expected = [id];
        return insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses)
            .then((result1) => {
            return insightFacade.removeDataset(id)
                .then((result2) => {
                return chai_1.expect(result2).to.deep.equal(id);
            }).catch((err) => {
                chai_1.expect.fail("Error shouldn't have been thrown");
            });
        }).catch((err) => {
            chai_1.expect.fail("Error Shouldn't have been thrown");
        });
    });
    it("Should list rooms dataset checking id", function () {
        const id = "rooms";
        return insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Rooms)
            .then((result) => {
            return insightFacade.listDatasets()
                .then((result2) => {
                let placeholder = result2[0].id;
                return chai_1.expect(placeholder).to.deep.equal(id);
            }).catch((err) => {
                chai_1.expect.fail("Shouldn't have thrown an error");
            });
        }).catch((err) => {
            chai_1.expect.fail("Shouldn't have thrown an error");
        });
    });
    it("Should list rooms dataset checking row numbers", function () {
        const id = "rooms";
        return insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Rooms)
            .then((result) => {
            return insightFacade.listDatasets()
                .then((result2) => {
                let placeholder = result2[0].numRows;
                return chai_1.expect(placeholder).to.deep.equal(364);
            }).catch((err) => {
                chai_1.expect.fail("Shouldn't have thrown an error");
            });
        }).catch((err) => {
            chai_1.expect.fail("Shouldn't have thrown an error");
        });
    });
    it("Should list rooms dataset checking kind", function () {
        const id = "rooms";
        return insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Rooms)
            .then((result) => {
            return insightFacade.listDatasets()
                .then((result2) => {
                let placeholder = result2[0].kind;
                return chai_1.expect(placeholder).to.deep.equal(IInsightFacade_1.InsightDatasetKind.Rooms);
            }).catch((err) => {
                chai_1.expect.fail("Shouldn't have thrown an error");
            });
        }).catch((err) => {
            chai_1.expect.fail("Shouldn't have thrown an error");
        });
    });
    it("Should list dataset checking id", function () {
        const id = "courses";
        return insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses)
            .then((result) => {
            return insightFacade.listDatasets()
                .then((result2) => {
                let placeholder = result2[0].id;
                return chai_1.expect(placeholder).to.deep.equal(id);
            }).catch((err) => {
                chai_1.expect.fail("Shouldn't have thrown an error");
            });
        }).catch((err) => {
            chai_1.expect.fail("Shouldn't have thrown an error");
        });
    });
    it("Should list dataset checking row numbers", function () {
        const id = "courses";
        return insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses)
            .then((result) => {
            return insightFacade.listDatasets()
                .then((result2) => {
                let placeholder = result2[0].numRows;
                return chai_1.expect(placeholder).to.deep.equal(64612);
            }).catch((err) => {
                chai_1.expect.fail("Shouldn't have thrown an error");
            });
        }).catch((err) => {
            chai_1.expect.fail("Shouldn't have thrown an error");
        });
    });
    it("Should list dataset checking kind", function () {
        const id = "courses";
        return insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses)
            .then((result) => {
            return insightFacade.listDatasets()
                .then((result2) => {
                let placeholder = result2[0].kind;
                return chai_1.expect(placeholder).to.deep.equal(IInsightFacade_1.InsightDatasetKind.Courses);
            }).catch((err) => {
                chai_1.expect.fail("Shouldn't have thrown an error");
            });
        }).catch((err) => {
            chai_1.expect.fail("Shouldn't have thrown an error");
        });
    });
    it("Should list dataset of zero", function () {
        let futureResult = insightFacade.listDatasets();
        return futureResult.then((result) => {
            let placeholder = result.length;
            return chai_1.expect(placeholder).to.deep.equal(0);
        });
    });
    it("Should list dataset when one course is added", function () {
        const id = "courses";
        return insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses)
            .then((result) => {
            return insightFacade.listDatasets()
                .then((result2) => {
                let placeholder = result2.length;
                return chai_1.expect(placeholder).to.deep.equal(1);
            }).catch((err) => {
                chai_1.expect.fail("Shouldn't have thrown an error");
            });
        }).catch((err) => {
            chai_1.expect.fail("Shouldn't have thrown an error");
        });
    });
});
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery = {
        courses: { path: "./test/data/courses.zip", kind: IInsightFacade_1.InsightDatasetKind.Courses },
        rooms: { path: "./test/data/rooms.zip", kind: IInsightFacade_1.InsightDatasetKind.Rooms },
    };
    let insightFacade;
    let testQueries = [];
    before(function () {
        Util_1.default.test(`Before: ${this.test.parent.title}`);
        try {
            testQueries = TestUtil_1.default.readTestQueries();
        }
        catch (err) {
            chai_1.expect.fail("", "", `Failed to read one or more test queries. ${err}`);
        }
        const loadDatasetPromises = [];
        insightFacade = new InsightFacade_1.default();
        for (const id of Object.keys(datasetsToQuery)) {
            const ds = datasetsToQuery[id];
            const data = fs.readFileSync(ds.path).toString("base64");
            loadDatasetPromises.push(insightFacade.addDataset(id, data, ds.kind));
        }
        return Promise.all(loadDatasetPromises);
    });
    beforeEach(function () {
        Util_1.default.test(`BeforeTest: ${this.currentTest.title}`);
    });
    after(function () {
        Util_1.default.test(`After: ${this.test.parent.title}`);
    });
    afterEach(function () {
        Util_1.default.test(`AfterTest: ${this.currentTest.title}`);
    });
    it("one query test", function () {
        let testName = "three apply keys valid - two group keys";
        let test1;
        for (let tests of testQueries) {
            let checker = tests["title"];
            if (checker === testName) {
                test1 = tests;
                break;
            }
        }
        const futureResult1 = insightFacade.performQuery(test1.query);
        return TestUtil_1.default.verifyQueryResult(futureResult1, test1);
    });
    it("Should run test queries", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, function () {
                    const futureResult = insightFacade.performQuery(test.query);
                    return TestUtil_1.default.verifyQueryResult(futureResult, test);
                });
            }
        });
    });
});
//# sourceMappingURL=InsightFacade.spec.js.map