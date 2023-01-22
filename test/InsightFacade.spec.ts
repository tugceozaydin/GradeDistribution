import * as chai from "chai";
import {expect} from "chai";
import * as fs from "fs-extra";
import * as chaiAsPromised from "chai-as-promised";
import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";

// This extends chai with assertions that natively support Promises
chai.use(chaiAsPromised);

// This should match the schema given to TestUtil.validate(..) in TestUtil.readTestQueries(..)
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any;  // make any to allow testing structurally invalid queries
    isQueryValid: boolean;
    result: any;
    filename: string;  // This is injected when reading the file
}

describe("InsightFacade Add/Remove/List Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the 'before' hook.
    const datasetsToLoad: { [id: string]: string } = {
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
    let datasets: { [id: string]: string } = {};
    let insightFacade: InsightFacade;
    const cacheDir = __dirname + "/../data";

    before(function () {
        // This section runs once and loads all datasets specified in the datasetsToLoad object
        // into the datasets object
        Log.test(`Before all`);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }
        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs.readFileSync(datasetsToLoad[id]).toString("base64");
        }
        try {
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
        // This runs after each test, which should make each test independent from the previous one
        Log.test(`AfterTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    // ==============================================================================================================
    // METHOD #1 addDataset
    // ==============================================================================================================

    it("Should add a valid rooms dataset", function () {
        const id: string = "rooms";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    it("Shouldn't add a valid dataset no index - rooms", function () {
        const id: string = "roomsNoIndex";
        const datasetName: string = "roomsNoIndex";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[datasetName],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    // This is a unit test. You should create more like this!
    it("Should add a valid dataset", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    // a valid dataset name checking with whitespace
    it("Should add a valid dataset with whitespace", function () {
        const id: string = "josh courses";
        const datasetName: string = "joshcourses";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[datasetName],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    // Check invalid id format - underscore
    it("Shouldn't add a valid dataset with underscore", function () {
        const id: string = "joshs_courses";
        const datasetName: string = "joshcourses";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[datasetName],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    // Check invalid id format - whitespace
    it("Shouldn't add a valid dataset with only whitespace", function () {
        const id: string = " ";
        const datasetName: string = "joshcourses";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[datasetName],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    // try to add a database with an undefined key
    it("Shouldn't add a valid dataset with undefined key", function () {
        const id: string = undefined;
        const datasetName: string = "joshcourses";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[datasetName],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    // chain promise for underscore included
    it("Should chain promise with id underscore?", function () {
        let id1: string = "joshs_courses";
        const id2: string = "joshcourses";
        const expected: string[] = [id2];
        return insightFacade.addDataset(
            id1,
            datasets[id1],
            InsightDatasetKind.Courses,
        )
            .then((result: string[]) => {
                    return insightFacade.addDataset(
                        id2,
                        datasets[id2],
                        InsightDatasetKind.Courses,
                    ).then((result2: string[]) => {
                        expect(result2).to.eventually.deep.equal(expected);
                    }).catch((err: any) => {
                        expect.fail("No error should have been thrown");
                    });
                }
            ).catch((err: any) => {
                expect(err).to.be.instanceOf(InsightError);
            });
    });

    // chain promise for incorrect id whitespace
    it("chain promise for incorrect id whitespace", function () {
        let id1: string = " ";
        const id2: string = "joshcourses";
        const expected: string[] = [id2];
        return insightFacade.addDataset(
            id1,
            datasets[id1],
            InsightDatasetKind.Courses,
        )
            .then((result: string[]) => {
                    return insightFacade.addDataset(
                        id2,
                        datasets[id2],
                        InsightDatasetKind.Courses,
                    ).then((result2: string[]) => {
                        expect(result2).to.eventually.deep.equal(expected);
                    }).catch((err: any) => {
                        expect.fail("No error should have been thrown");
                    });
                }
            ).catch((err: any) => {
                expect(err).to.be.instanceOf(InsightError);
            });
    });

// adding a dataset with an id already associated with an existing dataset
    it("Shouldn't add a dataset with the same name", function () {
        const id: string = "courses";
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((result1: string[]) => {
                const futureResult: Promise<string[]> = insightFacade.addDataset(
                    id,
                    datasets[id],
                    InsightDatasetKind.Courses,
                );
                return expect(futureResult).to.be.rejectedWith(InsightError);
            });
    });

// trying to add a json file as a dataset
    it("Shouldn't add a dataset that's not a zipped file", function () {
        const id: string = "jsonfile";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

// trying to add a dataset that has no courses
    it("Shouldn't add a dataset that has no valid courses", function () {
        const id: string = "noCourses";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

// trying to add a dataset that doesn't have 'courses' as the directory name
    it("Shouldn't add a dataset without the correct directory name", function () {
        const id: string = "invalidDirectoryName";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

// adding a dataset with a case sensitive duplicate name
    it("Should add a dataset with the same name", function () {
        let id1: string = "courses";
        let id2: string = "CouRsEs";
        const expected: string[] = [id1, id2];
        insightFacade.addDataset(id1, datasets[id1], InsightDatasetKind.Courses)
            .then(() => {
                insightFacade.addDataset(
                    id2,
                    datasets[id1],
                    InsightDatasetKind.Courses)
                    .then((result: string[]) => {
                        return expect(result).to.eventually.deep.equal(expected);
                    });
            }).catch((err: any) => {
            expect.fail("Error should not have been thrown");
        });
    });

// adding a dataset with a one invalid course and one valid course
    it("Should add a dataset with one valid course", function () {
        const id: string = "oneValidCourse";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected);
    });

// trying to add a dataset with only one course that is invalid
    it("Shouldn't add a dataset with only one invalid course", function () {
        const id: string = "oneInvalidCourse";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

// trying to add a dataset that with one course that has an invalid result
    it("Shouldn't add a dataset with only one course with an invalid result", function () {
        const id: string = "courseResultInvalid";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

// trying to add a dataset that with one course that has an invalid result
    it("Should add a dataset with only one course with an invalid result", function () {
        const id: string = "oneInvalidCourseResult";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected);
    });

// trying to add a dataset with an invalid kind (Rooms)
    it("Shouldn't add a dataset because of the invalid type (Rooms)", function () {
        const id: string = "courses";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

// trying to add a dataset with an invalid kind (undefined)
    it("Shouldn't add a dataset because of the invalid type (undefined)", function () {
        const id: string = "courses";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            undefined,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    // rejecting a duplicate course with chaining
    it("Shouldn't add a dataset because it's a duplicate", function () {
        const id: string = "courses";
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((result: string[]) => {
                return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
                    .then((result2: string[]) => {
                        expect.fail("An error should have been thrown");
                    }).catch((err: any) => {
                        expect(err).to.be.instanceOf(InsightError);
                    });
            }).catch(() => {
                expect.fail("Error shouldn't have been thrown");
            });
    });

    // adding two courses with chaining
    it("Should add two different databases with chaining", function () {
        const c1: string = "courses";
        const c2: string = "oneValidCourse";
        const expected: string[] = [c1, c2];
        return insightFacade.addDataset(c1, datasets[c1], InsightDatasetKind.Courses)
            .then((result: string[]) => {
                return insightFacade.addDataset(c2, datasets[c2], InsightDatasetKind.Courses)
                    .then((result2: string[]) => {
                        expect(result2).to.deep.equal(expected);
                    }).catch(() => {
                        expect.fail("An error should have been thrown");
                    });
            }).catch(() => {
                expect.fail("Error shouldn't have been thrown");
            });
    });

// ==============================================================================================================
// METHOD #2 removeDataset
// ==============================================================================================================

// trying to remove a dataset with an invalid id - undefined
    it("Shouldn't remove dataset because of the invalid type (undefined)", function () {
        const id: string = undefined;
        const futureResult: Promise<string> = insightFacade.removeDataset(id);
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

// trying to remove a dataset with an invalid id - whitespace
    it("Shouldn't remove dataset because of the invalid type (whitespace)", function () {
        const id: string = " ";
        const futureResult: Promise<string> = insightFacade.removeDataset(id);
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

// trying to remove a dataset with an invalid id - underline
    it("Shouldn't remove dataset because of the invalid type (underline)", function () {
        const id: string = "Joshs_courses";
        const futureResult: Promise<string> = insightFacade.removeDataset(id);
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

// trying to remove a dataset that hasn't been added yet
    it("Shouldn't remove dataset because it hasn't been added yet", function () {
        const id: string = "courses";
        const futureResult: Promise<string> = insightFacade.removeDataset(id);
        return expect(futureResult).to.be.rejectedWith(NotFoundError);
    });

// trying to remove a dataset that has already been removed
    it("Shouldn't remove dataset because it has already been removed", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((result1: string[]) => {
                return insightFacade.removeDataset(id)
                    .then((result2: string) => {
                        return insightFacade.removeDataset(id)
                            .then(() => {
                                return expect(result2).to.deep.equal(id);
                            }).catch((err: any) => {
                                expect(err).to.be.instanceOf(NotFoundError);
                            });
                    }).catch((err: any) => {
                        expect.fail("Error shouldn't be thrown");
                    });
            }).catch((err: any) => {
                expect.fail("Error shouldn't be thrown");
            });
    });

// chained promise when trying to remove a dataset with an invalid id - whitespace
    it("Should remove dataset despite whitespace id because of chained promise", function () {
        const id1: string = " ";
        const id2: string = "courses";
        const expected: string = id2;
        return insightFacade.addDataset(
            id2,
            datasets[id2],
            InsightDatasetKind.Courses)
            .then((result: string[]) => {
                return insightFacade.removeDataset(id1)
                    .then((result2: string) => {
                        return insightFacade.removeDataset(id2)
                            .then((result3: string) => {
                                expect(result3).to.eventually.deep.equal(expected);
                                expect(result).to.eventually.deep.equal([id2]);
                            }).catch(() => {
                                expect.fail("Error shouldn't be thrown");
                            });
                    }).catch((err: any) => {
                        expect(err).to.be.instanceOf(InsightError);
                    });
            }).catch(() => {
                expect.fail("Error shouldn't be thrown");
            });

    });

// chained promise when trying to remove a dataset that hasn't been added yet
    it("Should remove dataset despite not being added yet because of chained promise", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade.removeDataset(id)
            .then(() => {
                return insightFacade.addDataset(
                    id,
                    datasets[id],
                    InsightDatasetKind.Courses)
                    .then((result2: string[]) => {
                        return insightFacade.removeDataset(id)
                            .then((result3: string) => {
                                return expect(result3).to.deep.equal(id);
                            }).catch((err: any) => {
                                expect.fail("Shouldn't thrown an error");
                            });
                    }).catch((err: any) => {
                        expect.fail("Shouldn't thrown an error");
                    });
            }).catch((err: any) => {
                expect(err).to.be.instanceOf(NotFoundError);
            });
    });

// successful removal of a dataset
    it("Should remove dataset", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((result1: string[]) => {
                return insightFacade.removeDataset(id)
                    .then((result2: string) => {
                        return expect(result2).to.deep.equal(id);
                    }).catch((err: any) => {
                        expect.fail("Error shouldn't have been thrown");
                    });
            }).catch((err: any) => {
                expect.fail("Error Shouldn't have been thrown");
            });
    });

// ==============================================================================================================
// METHOD #4 listDatasets
// ==============================================================================================================

    // successful list of dataset checking id
    it("Should list rooms dataset checking id", function () {
        const id: string = "rooms";
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms)
            .then((result: string[]) => {
                return insightFacade.listDatasets()
                    .then((result2: InsightDataset[]) => {
                        let placeholder = result2[0].id;
                        return expect(placeholder).to.deep.equal(id);
                    }).catch((err: any) => {
                        expect.fail("Shouldn't have thrown an error");
                    });
            }).catch((err: any) => {
                expect.fail("Shouldn't have thrown an error");
            });
    });

    // successful list of dataset checking row numbers
    it("Should list rooms dataset checking row numbers", function () {
        const id: string = "rooms";
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms)
            .then((result: string[]) => {
                return insightFacade.listDatasets()
                    .then((result2: InsightDataset[]) => {
                        let placeholder = result2[0].numRows;
                        return expect(placeholder).to.deep.equal(364);
                    }).catch((err: any) => {
                        expect.fail("Shouldn't have thrown an error");
                    });
            }).catch((err: any) => {
                expect.fail("Shouldn't have thrown an error");
            });
    });

    // successful list of dataset checking InsightDataset kind
    it("Should list rooms dataset checking kind", function () {
        const id: string = "rooms";
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms)
            .then((result: string[]) => {
                return insightFacade.listDatasets()
                    .then((result2: InsightDataset[]) => {
                        let placeholder = result2[0].kind;
                        return expect(placeholder).to.deep.equal(
                            InsightDatasetKind.Rooms);
                    }).catch((err: any) => {
                        expect.fail("Shouldn't have thrown an error");
                    });
            }).catch((err: any) => {
                expect.fail("Shouldn't have thrown an error");
            });
    });

// successful list of dataset checking id
    it("Should list dataset checking id", function () {
        const id: string = "courses";
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((result: string[]) => {
                return insightFacade.listDatasets()
                    .then((result2: InsightDataset[]) => {
                        let placeholder = result2[0].id;
                        return expect(placeholder).to.deep.equal(id);
                    }).catch((err: any) => {
                        expect.fail("Shouldn't have thrown an error");
                    });
            }).catch((err: any) => {
                expect.fail("Shouldn't have thrown an error");
            });
    });


// successful list of dataset checking row numbers
    it("Should list dataset checking row numbers", function () {
        const id: string = "courses";
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((result: string[]) => {
                return insightFacade.listDatasets()
                    .then((result2: InsightDataset[]) => {
                        let placeholder = result2[0].numRows;
                        return expect(placeholder).to.deep.equal(64612);
                    }).catch((err: any) => {
                        expect.fail("Shouldn't have thrown an error");
                    });
            }).catch((err: any) => {
                expect.fail("Shouldn't have thrown an error");
            });
    });

// successful list of dataset checking InsightDataset kind
    it("Should list dataset checking kind", function () {
        const id: string = "courses";
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((result: string[]) => {
                return insightFacade.listDatasets()
                    .then((result2: InsightDataset[]) => {
                        let placeholder = result2[0].kind;
                        return expect(placeholder).to.deep.equal(
                            InsightDatasetKind.Courses);
                    }).catch((err: any) => {
                        expect.fail("Shouldn't have thrown an error");
                    });
            }).catch((err: any) => {
                expect.fail("Shouldn't have thrown an error");
            });
    });

// checking to make sure list length is 0 when nothing has been added
    it("Should list dataset of zero", function () {
        let futureResult: Promise<InsightDataset[]> = insightFacade.listDatasets();
        return futureResult.then((result: InsightDataset[]) => {
            let placeholder = result.length;
            return expect(placeholder).to.deep.equal(0);
        });
    });

// checking to make sure list length is 1 when courses has been added
    it("Should list dataset when one course is added", function () {
        const id: string = "courses";
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((result: string[]) => {
                return insightFacade.listDatasets()
                    .then((result2: InsightDataset[]) => {
                        let placeholder = result2.length;
                        return expect(placeholder).to.deep.equal(1);
                    }).catch((err: any) => {
                        expect.fail("Shouldn't have thrown an error");
                    });
            }).catch((err: any) => {
                expect.fail("Shouldn't have thrown an error");
            });
    });
});

/*
 * This test suite dynamically generates tests from the JSON files in test/queries.
 * You should not need to modify it; instead, add additional files to the queries directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery: { [id: string]: { path: string, kind: InsightDatasetKind } } = {
        courses: {path: "./test/data/courses.zip", kind: InsightDatasetKind.Courses},
        rooms: {path: "./test/data/rooms.zip", kind: InsightDatasetKind.Rooms},
    };
    let insightFacade: InsightFacade;
    let testQueries: ITestQuery[] = [];

    // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
    before(function () {
        Log.test(`Before: ${this.test.parent.title}`);
        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            testQueries = TestUtil.readTestQueries();
        } catch (err) {
            expect.fail("", "", `Failed to read one or more test queries. ${err}`);
        }

        // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
        // Will fail* if there is a problem reading ANY dataset.
        const loadDatasetPromises: Array<Promise<string[]>> = [];
        insightFacade = new InsightFacade();
        for (const id of Object.keys(datasetsToQuery)) {
            const ds = datasetsToQuery[id];
            const data = fs.readFileSync(ds.path).toString("base64");
            loadDatasetPromises.push(insightFacade.addDataset(id, data, ds.kind));
        }
        return Promise.all(loadDatasetPromises);

        //     /* *IMPORTANT NOTE: This catch is to let this run even without the implemented addDataset,
        //      * for the purposes of seeing all your tests run.
        //      * TODO For C1, remove this catch block (but keep the Promise.all)
        //      */
        //     return Promise.resolve("HACK TO LET QUERIES RUN");
        // });
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
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
        const futureResult1: Promise<any[]> = insightFacade.performQuery(test1.query);
        // const futureResult2: Promise<any[]> = insightFacade.performQuery(test2.query);
        return TestUtil.verifyQueryResult(futureResult1, test1);
    });

    // Dynamically create and run a test for each query in testQueries
    // Creates an extra "test" called "Should run test queries" as a byproduct. Don't worry about it
    it("Should run test queries", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, function () {
                    const futureResult: Promise<any[]> = insightFacade.performQuery(test.query);
                    return TestUtil.verifyQueryResult(futureResult, test);
                });
            }
        });
    });
});
