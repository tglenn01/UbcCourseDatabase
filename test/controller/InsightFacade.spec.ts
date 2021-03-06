import {
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError,
	NotFoundError,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import * as fs from "fs-extra";
import {folderTest} from "@ubccpsc310/folder-test";
import {expect} from "chai";
import {describe} from "mocha";

describe("InsightFacade", function () {
	let insightFacade: InsightFacade;

	const persistDir = "./data";
	const datasetContents = new Map<string, string>();
	// Reference any datasets you've added to test/resources/archives here, and they will
	// automatically be loaded in the 'before' hook.
	const datasetsToLoad: {[key: string]: string} = {
		courses: "./test/resources/archives/courses.zip",
		rooms: "./test/resources/archives/rooms.zip",
		noCourses: "./test/resources/archives/noCourses.zip",
		noRooms: "./test/resources/archives/noRooms.zip",
		noRoomsFolder: "./test/resources/archives/noRoomsFolder.zip",
		nonZip: "./test/resources/archives/nonZip.txt",
		skipNonJSON: "./test/resources/archives/skipNonJSON.zip",
		singleInvalidJSON: "./test/resources/archives/singleInvalidJSON.zip",
		skipInvalidJSON: "./test/resources/archives/skipInvalidJSON.zip",
		skipBuildingNoRooms: "./test/resources/archives/skipBuildingNoRooms.zip",
		skipBuildingNoCodeField: "./test/resources/archives/skipBuildingNoCodeField.zip",
		skipBuildingNoTitleField: "./test/resources/archives/skipBuildingNoTitleField.zip",
		skipBuildingNoAddressField: "./test/resources/archives/skipBuildingNoAddressField.zip",
		skipRoomsNoNumberField: "./test/resources/archives/skipRoomsNoNumberField.zip",
		skipRoomsNoTypeField: "./test/resources/archives/skipRoomsNoTypeField.zip",
		skipRoomsNoFurnitureField: "./test/resources/archives/skipRoomsNoFurnitureField.zip",
		skipRoomsNoCapacityField: "./test/resources/archives/skipRoomsNoCapacityField.zip",
		skipRoomsNoNothingField: "./test/resources/archives/skipRoomsNoNothingField.zip",
	};

	before(function () {
		// This section runs once and loads all datasets specified in the datasetsToLoad object
		for (const key of Object.keys(datasetsToLoad)) {
			const content = fs.readFileSync(datasetsToLoad[key]).toString("base64");
			datasetContents.set(key, content);
		}
		// Just in case there is anything hanging around from a previous run
		fs.removeSync(persistDir);
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			insightFacade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent from the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			fs.removeSync(persistDir);
		});

		// it("should add a course dataset successfully", function () {
		// 	const content: string = datasetContents.get("courses") ?? "";
		// 	return insightFacade
		// 		.addDataset("courses", content, InsightDatasetKind.Courses)
		// 		.then((dataIDS) => {
		// 			expect(dataIDS).to.be.an.instanceof(Array);
		// 			expect(dataIDS).to.have.length(1);
		// 			const insightDatasetCourses = dataIDS.find((dataID) => dataID === "courses");
		// 			expect(insightDatasetCourses).to.exist;
		// 			expect(insightDatasetCourses).to.equal("courses");
		// 		})
		// 		.catch(() => {
		// 			expect.fail("Should not execute");
		// 		});
		// });
		//
		// it("should add multiple course datasets successfully", function () {
		// 	const content: string = datasetContents.get("skipInvalidJSON") ?? "";
		// 	return insightFacade
		// 		.addDataset("courses1", content, InsightDatasetKind.Courses)
		// 		.then(() => {
		// 			return insightFacade.addDataset("courses2", content, InsightDatasetKind.Courses);
		// 		})
		// 		.then((dataIDS) => {
		// 			expect(dataIDS).to.be.an.instanceof(Array);
		// 			expect(dataIDS).to.be.of.length(2);
		// 			const insightDatasetCourses = dataIDS.find((dataID) => dataID === "courses1");
		// 			expect(insightDatasetCourses).to.exist;
		// 			expect(insightDatasetCourses).to.equal("courses1");
		// 			const insightDatasetCourses2 = dataIDS.find((dataID) => dataID === "courses2");
		// 			expect(insightDatasetCourses2).to.exist;
		// 			expect(insightDatasetCourses2).to.equal("courses2");
		// 		})
		// 		.catch(() => {
		// 			expect.fail("Should not execute");
		// 		});
		// });
		//
		// it("should add a room dataset successfully", function () {
		// 	const content: string = datasetContents.get("rooms") ?? "";
		// 	return insightFacade
		// 		.addDataset("rooms", content, InsightDatasetKind.Rooms)
		// 		.then((dataIDS) => {
		// 			expect(dataIDS).to.be.an.instanceof(Array);
		// 			expect(dataIDS).to.have.length(1);
		// 			const insightDatasetCourses = dataIDS.find((dataID) => dataID === "rooms");
		// 			expect(insightDatasetCourses).to.exist;
		// 			expect(insightDatasetCourses).to.equal("rooms");
		// 		})
		// 		.catch((err) => {
		// 			expect.fail("Should not execute");
		// 		});
		// });
		//
		// it("should add multiple room datasets successfully", function () {
		// 	const content: string = datasetContents.get("skipRoomsNoFurnitureField") ?? "";
		// 	return insightFacade
		// 		.addDataset("rooms1", content, InsightDatasetKind.Rooms)
		// 		.then(() => {
		// 			return insightFacade.addDataset("rooms2", content, InsightDatasetKind.Rooms);
		// 		})
		// 		.then((dataIDS) => {
		// 			expect(dataIDS).to.be.an.instanceof(Array);
		// 			expect(dataIDS).to.be.of.length(2);
		// 			const insightDatasetCourses = dataIDS.find((dataID) => dataID === "rooms1");
		// 			expect(insightDatasetCourses).to.exist;
		// 			expect(insightDatasetCourses).to.equal("rooms1");
		// 			const insightDatasetCourses2 = dataIDS.find((dataID) => dataID === "rooms2");
		// 			expect(insightDatasetCourses2).to.exist;
		// 			expect(insightDatasetCourses2).to.equal("rooms2");
		// 		})
		// 		.catch(() => {
		// 			expect.fail("Should not execute");
		// 		});
		// });
		//
		// it("should reject add when id is empty", function () {
		// 	const content: string = datasetContents.get("courses") ?? "";
		// 	return insightFacade
		// 		.addDataset("", content, InsightDatasetKind.Courses)
		// 		.then(() => {
		// 			expect.fail("Should not execute");
		// 		})
		// 		.catch((err) => {
		// 			expect(err).to.be.an.instanceof(InsightError);
		// 		});
		// });
		//
		// it("should reject add when id is white space", function () {
		// 	const content: string = datasetContents.get("courses") ?? "";
		// 	return insightFacade
		// 		.addDataset(" ", content, InsightDatasetKind.Courses)
		// 		.then(() => {
		// 			expect.fail("Should not execute");
		// 		})
		// 		.catch((err) => {
		// 			expect(err).to.be.an.instanceof(InsightError);
		// 		});
		// });
		//
		// it("should reject add when id is underscore", function () {
		// 	const content: string = datasetContents.get("courses") ?? "";
		// 	return insightFacade
		// 		.addDataset("_", content, InsightDatasetKind.Courses)
		// 		.then(() => {
		// 			expect.fail("Should not execute");
		// 		})
		// 		.catch((err) => {
		// 			expect(err).to.be.an.instanceof(InsightError);
		// 		});
		// });
		//
		// it("should reject add when id contains underscore", function () {
		// 	const content: string = datasetContents.get("courses") ?? "";
		// 	return insightFacade
		// 		.addDataset("courses_", content, InsightDatasetKind.Courses)
		// 		.then(() => {
		// 			expect.fail("Should not execute");
		// 		})
		// 		.catch((err) => {
		// 			expect(err).to.be.an.instanceof(InsightError);
		// 		});
		// });
		//
		// it("should reject when id is the same as an id of an already added dataset", function () {
		// 	const content: string = datasetContents.get("courses") ?? "";
		// 	return insightFacade
		// 		.addDataset("courses", content, InsightDatasetKind.Courses)
		// 		.then(() => {
		// 			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses);
		// 		})
		// 		.then(() => {
		// 			expect.fail("Should not execute");
		// 		})
		// 		.catch((err) => {
		// 			expect(err).to.be.an.instanceof(InsightError);
		// 		});
		// });
		//
		// it("should reject non zip files for add course", function () {
		// 	const content: string = datasetContents.get("nonZip") ?? "";
		// 	return insightFacade
		// 		.addDataset("nonZip", content, InsightDatasetKind.Courses)
		// 		.then(() => {
		// 			expect.fail("Should not execute");
		// 		})
		// 		.catch((err) => {
		// 			expect(err).to.be.an.instanceof(InsightError);
		// 		});
		// });
		//
		// it("should reject non zip files for add room", function () {
		// 	const content: string = datasetContents.get("nonZip") ?? "";
		// 	return insightFacade
		// 		.addDataset("nonZip", content, InsightDatasetKind.Rooms)
		// 		.then(() => {
		// 			expect.fail("Should not execute");
		// 		})
		// 		.catch((err) => {
		// 			expect(err).to.be.an.instanceof(InsightError);
		// 		});
		// });
		//
		// it("should reject zip files without a courses folder", function () {
		// 	const content: string = datasetContents.get("rooms") ?? "";
		// 	return insightFacade
		// 		.addDataset("rooms", content, InsightDatasetKind.Courses)
		// 		.then(() => {
		// 			expect.fail("Should not execute");
		// 		})
		// 		.catch((err) => {
		// 			expect(err).to.be.an.instanceof(InsightError);
		// 		});
		// });
		//
		// it("should reject zip files without a rooms folder", function () {
		// 	const content: string = datasetContents.get("noRoomsFolder") ?? "";
		// 	return insightFacade
		// 		.addDataset("noRoomsFolder", content, InsightDatasetKind.Rooms)
		// 		.then(() => {
		// 			expect.fail("Should not execute");
		// 		})
		// 		.catch((err) => {
		// 			expect(err).to.be.an.instanceof(InsightError);
		// 		});
		// });
		//
		// it("should reject zip files with an empty courses folder", function () {
		// 	const content: string = datasetContents.get("noCourses") ?? "";
		// 	return insightFacade
		// 		.addDataset("noCourses", content, InsightDatasetKind.Courses)
		// 		.then(() => {
		// 			expect.fail("Should not execute");
		// 		})
		// 		.catch((err) => {
		// 			expect(err).to.be.an.instanceof(InsightError);
		// 		});
		// });
		//
		// it("should reject zip files with an empty buildings-and-classrooms folder", function () {
		// 	const content: string = datasetContents.get("noRooms") ?? "";
		// 	return insightFacade
		// 		.addDataset("noRooms", content, InsightDatasetKind.Rooms)
		// 		.then(() => {
		// 			expect.fail("Should not execute");
		// 		})
		// 		.catch((err) => {
		// 			expect(err).to.be.an.instanceof(InsightError);
		// 		});
		// });
		//
		// it("should reject single invalid course JSON", function () {
		// 	const content: string = datasetContents.get("singleInvalidJSON") ?? "";
		// 	return insightFacade
		// 		.addDataset("singleInvalidJSON", content, InsightDatasetKind.Courses)
		// 		.then(() => {
		// 			expect.fail("Should not execute");
		// 		})
		// 		.catch((err) => {
		// 			expect(err).to.be.an.instanceof(InsightError);
		// 		});
		// });
		//
		// it("should skip over any non JSON course files", function () {
		// 	const content: string = datasetContents.get("skipNonJSON") ?? "";
		// 	return insightFacade
		// 		.addDataset("skipNonJSON", content, InsightDatasetKind.Courses)
		// 		.then(() => {
		// 			return insightFacade.listDatasets().then((insightDatasets) => {
		// 				expect(insightDatasets).to.be.an.instanceof(Array);
		// 				expect(insightDatasets).to.have.length(1);
		// 				expect(insightDatasets).to.deep.equal([
		// 					{
		// 						id: "skipNonJSON",
		// 						kind: InsightDatasetKind.Courses,
		// 						numRows: 58,
		// 					},
		// 				]);
		// 			});
		// 		})
		// 		.catch(() => {
		// 			expect.fail("Should not execute");
		// 		});
		// });
		//
		// it("should skip over invalid JSON course files", function () {
		// 	const content: string = datasetContents.get("skipInvalidJSON") ?? "";
		// 	return insightFacade
		// 		.addDataset("skipInvalidJSON", content, InsightDatasetKind.Courses)
		// 		.then(() => {
		// 			return insightFacade.listDatasets().then((insightDatasets) => {
		// 				expect(insightDatasets).to.be.an.instanceof(Array);
		// 				expect(insightDatasets).to.have.length(1);
		// 				expect(insightDatasets).to.deep.equal([
		// 					{
		// 						id: "skipInvalidJSON",
		// 						kind: InsightDatasetKind.Courses,
		// 						numRows: 58,
		// 					},
		// 				]);
		// 			});
		// 		})
		// 		.catch(() => {
		// 			expect.fail("Should not execute");
		// 		});
		// });
		//
		// it("should skip over buildings without any rooms", function () {
		// 	const content: string = datasetContents.get("skipBuildingNoRooms") ?? "";
		// 	return insightFacade
		// 		.addDataset("skipBuildingNoRooms", content, InsightDatasetKind.Rooms)
		// 		.then(() => {
		// 			return insightFacade.listDatasets().then((insightDatasets) => {
		// 				expect(insightDatasets).to.be.an.instanceof(Array);
		// 				expect(insightDatasets).to.have.length(1);
		// 				expect(insightDatasets).to.deep.equal([
		// 					{
		// 						id: "skipBuildingNoRooms",
		// 						kind: InsightDatasetKind.Rooms,
		// 						numRows: 1,
		// 					},
		// 				]);
		// 			});
		// 		})
		// 		.catch(() => {
		// 			expect.fail("Should not execute");
		// 		});
		// });
		//
		// it("should skip over buildings missing field-building-code", function () {
		// 	const content: string = datasetContents.get("skipBuildingNoCodeField") ?? "";
		// 	return insightFacade
		// 		.addDataset("skipBuildingNoCodeField", content, InsightDatasetKind.Rooms)
		// 		.then(() => {
		// 			return insightFacade.listDatasets().then((insightDatasets) => {
		// 				expect(insightDatasets).to.be.an.instanceof(Array);
		// 				expect(insightDatasets).to.have.length(1);
		// 				expect(insightDatasets).to.deep.equal([
		// 					{
		// 						id: "skipBuildingNoCodeField",
		// 						kind: InsightDatasetKind.Rooms,
		// 						numRows: 1,
		// 					},
		// 				]);
		// 			});
		// 		})
		// 		.catch((err) => {
		// 			console.log(err);
		// 			expect.fail("Should not execute");
		// 		});
		// });
		//
		// it("should skip over buildings missing field-title", function () {
		// 	const content: string = datasetContents.get("skipBuildingNoTitleField") ?? "";
		// 	return insightFacade
		// 		.addDataset("skipBuildingNoTitleField", content, InsightDatasetKind.Rooms)
		// 		.then(() => {
		// 			return insightFacade.listDatasets().then((insightDatasets) => {
		// 				expect(insightDatasets).to.be.an.instanceof(Array);
		// 				expect(insightDatasets).to.have.length(1);
		// 				expect(insightDatasets).to.deep.equal([
		// 					{
		// 						id: "skipBuildingNoTitleField",
		// 						kind: InsightDatasetKind.Rooms,
		// 						numRows: 1,
		// 					},
		// 				]);
		// 			});
		// 		})
		// 		.catch(() => {
		// 			expect.fail("Should not execute");
		// 		});
		// });
		//
		// it("should skip over buildings missing field-building-address", function () {
		// 	const content: string = datasetContents.get("skipBuildingNoAddressField") ?? "";
		// 	return insightFacade
		// 		.addDataset("skipBuildingNoAddressField", content, InsightDatasetKind.Rooms)
		// 		.then(() => {
		// 			return insightFacade.listDatasets().then((insightDatasets) => {
		// 				expect(insightDatasets).to.be.an.instanceof(Array);
		// 				expect(insightDatasets).to.have.length(1);
		// 				expect(insightDatasets).to.deep.equal([
		// 					{
		// 						id: "skipBuildingNoAddressField",
		// 						kind: InsightDatasetKind.Rooms,
		// 						numRows: 1,
		// 					},
		// 				]);
		// 			});
		// 		})
		// 		.catch(() => {
		// 			expect.fail("Should not execute");
		// 		});
		// });
		//
		// it("should skip over rooms missing field-room-number", function () {
		// 	const content: string = datasetContents.get("skipRoomsNoNumberField") ?? "";
		// 	return insightFacade
		// 		.addDataset("skipRoomsNoNumberField", content, InsightDatasetKind.Rooms)
		// 		.then(() => {
		// 			return insightFacade.listDatasets().then((insightDatasets) => {
		// 				expect(insightDatasets).to.be.an.instanceof(Array);
		// 				expect(insightDatasets).to.have.length(1);
		// 				expect(insightDatasets).to.deep.equal([
		// 					{
		// 						id: "skipRoomsNoNumberField",
		// 						kind: InsightDatasetKind.Rooms,
		// 						numRows: 1,
		// 					},
		// 				]);
		// 			});
		// 		})
		// 		.catch(() => {
		// 			expect.fail("Should not execute");
		// 		});
		// });
		//
		// it("should skip over rooms missing field-room-capacity", function () {
		// 	const content: string = datasetContents.get("skipRoomsNoCapacityField") ?? "";
		// 	return insightFacade
		// 		.addDataset("skipRoomsNoCapacityField", content, InsightDatasetKind.Rooms)
		// 		.then(() => {
		// 			return insightFacade.listDatasets().then((insightDatasets) => {
		// 				expect(insightDatasets).to.be.an.instanceof(Array);
		// 				expect(insightDatasets).to.have.length(1);
		// 				expect(insightDatasets).to.deep.equal([
		// 					{
		// 						id: "skipRoomsNoCapacityField",
		// 						kind: InsightDatasetKind.Rooms,
		// 						numRows: 1,
		// 					},
		// 				]);
		// 			});
		// 		})
		// 		.catch(() => {
		// 			expect.fail("Should not execute");
		// 		});
		// });
		//
		// it("should skip over rooms missing field-room-furniture", function () {
		// 	const content: string = datasetContents.get("skipRoomsNoFurnitureField") ?? "";
		// 	return insightFacade
		// 		.addDataset("skipRoomsNoFurnitureField", content, InsightDatasetKind.Rooms)
		// 		.then(() => {
		// 			return insightFacade.listDatasets().then((insightDatasets) => {
		// 				expect(insightDatasets).to.be.an.instanceof(Array);
		// 				expect(insightDatasets).to.have.length(1);
		// 				expect(insightDatasets).to.deep.equal([
		// 					{
		// 						id: "skipRoomsNoFurnitureField",
		// 						kind: InsightDatasetKind.Rooms,
		// 						numRows: 1,
		// 					},
		// 				]);
		// 			});
		// 		})
		// 		.catch(() => {
		// 			expect.fail("Should not execute");
		// 		});
		// });
		//
		// it("should skip over rooms missing field-room-type", function () {
		// 	const content: string = datasetContents.get("skipRoomsNoTypeField") ?? "";
		// 	return insightFacade
		// 		.addDataset("skipRoomsNoTypeField", content, InsightDatasetKind.Rooms)
		// 		.then(() => {
		// 			return insightFacade.listDatasets().then((insightDatasets) => {
		// 				expect(insightDatasets).to.be.an.instanceof(Array);
		// 				expect(insightDatasets).to.have.length(1);
		// 				expect(insightDatasets).to.deep.equal([
		// 					{
		// 						id: "skipRoomsNoTypeField",
		// 						kind: InsightDatasetKind.Rooms,
		// 						numRows: 1,
		// 					},
		// 				]);
		// 			});
		// 		})
		// 		.catch(() => {
		// 			expect.fail("Should not execute");
		// 		});
		// });
		//
		// it("should skip over rooms missing field-room-nothing", function () {
		// 	const content: string = datasetContents.get("skipRoomsNoNothingField") ?? "";
		// 	return insightFacade
		// 		.addDataset("skipRoomsNoNothingField", content, InsightDatasetKind.Rooms)
		// 		.then(() => {
		// 			return insightFacade.listDatasets().then((insightDatasets) => {
		// 				expect(insightDatasets).to.be.an.instanceof(Array);
		// 				expect(insightDatasets).to.have.length(1);
		// 				expect(insightDatasets).to.deep.equal([
		// 					{
		// 						id: "skipRoomsNoNothingField",
		// 						kind: InsightDatasetKind.Rooms,
		// 						numRows: 1,
		// 					},
		// 				]);
		// 			});
		// 		})
		// 		.catch(() => {
		// 			expect.fail("Should not execute");
		// 		});
		// });
		//
		// it("should remove single course dataset successfully", function () {
		// 	const content: string = datasetContents.get("courses") ?? "";
		// 	return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses).then(() => {
		// 		return insightFacade
		// 			.removeDataset("courses")
		// 			.then((removedID) => {
		// 				expect(removedID).to.be.a("string");
		// 				expect(removedID).to.equal("courses");
		// 				return insightFacade.listDatasets().then((insightDatasets) => {
		// 					expect(insightDatasets).to.be.an.instanceof(Array);
		// 					expect(insightDatasets).to.have.length(0);
		// 				});
		// 			})
		// 			.catch(() => {
		// 				expect.fail("Should not execute");
		// 			});
		// 	});
		// });
		//
		// it("should remove multiple course datasets successfully", function () {
		// 	const content: string = datasetContents.get("courses") ?? "";
		// 	return insightFacade.addDataset("courses1", content, InsightDatasetKind.Courses).then(() => {
		// 		return insightFacade.addDataset("courses2", content, InsightDatasetKind.Courses).then(() => {
		// 			return insightFacade
		// 				.removeDataset("courses2")
		// 				.then((removedID) => {
		// 					expect(removedID).to.be.a("string");
		// 					expect(removedID).to.equal("courses2");
		// 					return insightFacade.listDatasets().then((insightDatasets) => {
		// 						expect(insightDatasets).to.be.an.instanceof(Array);
		// 						expect(insightDatasets).to.have.length(1);
		// 						return insightFacade
		// 							.removeDataset("courses1")
		// 							.then((removedID2) => {
		// 								expect(removedID2).to.be.a("string");
		// 								expect(removedID2).to.equal("courses1");
		// 								return insightFacade.listDatasets().then((insightDatasets2) => {
		// 									expect(insightDatasets2).to.be.an.instanceof(Array);
		// 									expect(insightDatasets2).to.have.length(0);
		// 								});
		// 							})
		// 							.catch(() => {
		// 								expect.fail("Should not execute");
		// 							});
		// 					});
		// 				})
		// 				.catch(() => {
		// 					expect.fail("Should not execute");
		// 				});
		// 		});
		// 	});
		// });
		//
		// it("should remove single room dataset successfully", function () {
		// 	const content: string = datasetContents.get("skipRoomsNoFurnitureField") ?? "";
		// 	return insightFacade.addDataset("rooms", content, InsightDatasetKind.Rooms).then(() => {
		// 		return insightFacade
		// 			.removeDataset("rooms")
		// 			.then((removedID) => {
		// 				expect(removedID).to.be.a("string");
		// 				expect(removedID).to.equal("rooms");
		// 				return insightFacade.listDatasets().then((insightDatasets) => {
		// 					expect(insightDatasets).to.be.an.instanceof(Array);
		// 					expect(insightDatasets).to.have.length(0);
		// 				});
		// 			})
		// 			.catch(() => {
		// 				expect.fail("Should not execute");
		// 			});
		// 	});
		// });
		//
		// it("should remove multiple room datasets successfully", function () {
		// 	const content: string = datasetContents.get("skipRoomsNoFurnitureField") ?? "";
		// 	return insightFacade.addDataset("rooms1", content, InsightDatasetKind.Rooms).then(() => {
		// 		return insightFacade.addDataset("rooms2", content, InsightDatasetKind.Rooms).then(() => {
		// 			return insightFacade
		// 				.removeDataset("rooms2")
		// 				.then((removedID) => {
		// 					expect(removedID).to.be.a("string");
		// 					expect(removedID).to.equal("rooms2");
		// 					return insightFacade.listDatasets().then((insightDatasets) => {
		// 						expect(insightDatasets).to.be.an.instanceof(Array);
		// 						expect(insightDatasets).to.have.length(1);
		// 						return insightFacade
		// 							.removeDataset("rooms1")
		// 							.then((removedID2) => {
		// 								expect(removedID2).to.be.a("string");
		// 								expect(removedID2).to.equal("rooms1");
		// 								return insightFacade.listDatasets().then((insightDatasets2) => {
		// 									expect(insightDatasets2).to.be.an.instanceof(Array);
		// 									expect(insightDatasets2).to.have.length(0);
		// 								});
		// 							})
		// 							.catch(() => {
		// 								expect.fail("Should not execute");
		// 							});
		// 					});
		// 				})
		// 				.catch(() => {
		// 					expect.fail("Should not execute");
		// 				});
		// 		});
		// 	});
		// });
		//
		// it("should reject remove when attempting to remove non-existent, valid id", function () {
		// 	const content: string = datasetContents.get("courses") ?? "";
		// 	return insightFacade
		// 		.addDataset("courses", content, InsightDatasetKind.Courses)
		// 		.then(() => {
		// 			return insightFacade.removeDataset("courses2");
		// 		})
		// 		.then(() => {
		// 			expect.fail("Should not execute");
		// 		})
		// 		.catch((err) => {
		// 			expect(err).to.be.instanceof(NotFoundError);
		// 		});
		// });
		//
		// it("should reject remove when id contains underscore", function () {
		// 	const content: string = datasetContents.get("courses") ?? "";
		// 	return insightFacade
		// 		.addDataset("courses", content, InsightDatasetKind.Courses)
		// 		.then(() => {
		// 			return insightFacade.removeDataset("courses_");
		// 		})
		// 		.then(() => {
		// 			expect.fail("Should not execute");
		// 		})
		// 		.catch((err) => {
		// 			expect(err).to.be.instanceof(InsightError);
		// 		});
		// });
		//
		// it("should reject remove when id is empty", function () {
		// 	const content: string = datasetContents.get("courses") ?? "";
		// 	return insightFacade
		// 		.addDataset("courses", content, InsightDatasetKind.Courses)
		// 		.then(() => {
		// 			return insightFacade.removeDataset("");
		// 		})
		// 		.then(() => {
		// 			expect.fail("Should not execute");
		// 		})
		// 		.catch((err) => {
		// 			expect(err).to.be.instanceof(InsightError);
		// 		});
		// });
		//
		// it("should reject remove when id is white space", function () {
		// 	const content: string = datasetContents.get("courses") ?? "";
		// 	return insightFacade
		// 		.addDataset("courses", content, InsightDatasetKind.Courses)
		// 		.then(() => {
		// 			return insightFacade.removeDataset(" ");
		// 		})
		// 		.then(() => {
		// 			expect.fail("Should not execute");
		// 		})
		// 		.catch((err) => {
		// 			expect(err).to.be.instanceof(InsightError);
		// 		});
		// });
		//
		// it("should reject remove when id is underscore", function () {
		// 	const content: string = datasetContents.get("courses") ?? "";
		// 	return insightFacade
		// 		.addDataset("courses", content, InsightDatasetKind.Courses)
		// 		.then(() => {
		// 			return insightFacade.removeDataset("_");
		// 		})
		// 		.then(() => {
		// 			expect.fail("Should not execute");
		// 		})
		// 		.catch((err) => {
		// 			expect(err).to.be.instanceof(InsightError);
		// 		});
		// });
		//
		// it("should list no datasets", function () {
		// 	return insightFacade.listDatasets().then((insightDatasets) => {
		// 		expect(insightDatasets).to.be.an.instanceof(Array);
		// 		expect(insightDatasets).to.have.length(0);
		// 	});
		// });
		//
		// it("should list one course dataset", function () {
		// 	const content: string = datasetContents.get("courses") ?? "";
		// 	return insightFacade
		// 		.addDataset("courses", content, InsightDatasetKind.Courses)
		// 		.then(() => insightFacade.listDatasets())
		// 		.then((insightDatasets) => {
		// 			expect(insightDatasets).to.be.an.instanceof(Array);
		// 			expect(insightDatasets).to.have.length(1);
		// 			expect(insightDatasets).to.deep.equal([
		// 				{
		// 					id: "courses",
		// 					kind: InsightDatasetKind.Courses,
		// 					numRows: 64612,
		// 				},
		// 			]);
		// 		});
		// });
		//
		// it("should list multiple course datasets", function () {
		// 	const content: string = datasetContents.get("courses") ?? "";
		// 	return insightFacade
		// 		.addDataset("courses1", content, InsightDatasetKind.Courses)
		// 		.then(() => insightFacade.addDataset("courses2", content, InsightDatasetKind.Courses))
		// 		.then(() => insightFacade.listDatasets())
		// 		.then((insightDatasets) => {
		// 			expect(insightDatasets).to.be.an.instanceof(Array);
		// 			expect(insightDatasets).to.have.length(2);
		// 			const insightDatasetCourses = insightDatasets.find((dataset) => dataset.id === "courses1");
		// 			expect(insightDatasetCourses).to.exist;
		// 			expect(insightDatasetCourses).to.deep.equal({
		// 				id: "courses1",
		// 				kind: InsightDatasetKind.Courses,
		// 				numRows: 64612,
		// 			});
		// 			const insightDatasetCourses2 = insightDatasets.find((dataset2) => dataset2.id === "courses2");
		// 			expect(insightDatasetCourses2).to.exist;
		// 			expect(insightDatasetCourses2).to.deep.equal({
		// 				id: "courses2",
		// 				kind: InsightDatasetKind.Courses,
		// 				numRows: 64612,
		// 			});
		// 		});
		// });
		//
		// it("should list one room dataset", function () {
		// 	const content: string = datasetContents.get("skipRoomsNoFurnitureField") ?? "";
		// 	return insightFacade
		// 		.addDataset("rooms", content, InsightDatasetKind.Rooms)
		// 		.then(() => insightFacade.listDatasets())
		// 		.then((insightDatasets) => {
		// 			expect(insightDatasets).to.be.an.instanceof(Array);
		// 			expect(insightDatasets).to.have.length(1);
		// 			expect(insightDatasets).to.deep.equal([
		// 				{
		// 					id: "rooms",
		// 					kind: InsightDatasetKind.Rooms,
		// 					numRows: 1,
		// 				},
		// 			]);
		// 		});
		// });
		//
		// it("should list multiple room datasets", function () {
		// 	const content: string = datasetContents.get("skipRoomsNoFurnitureField") ?? "";
		// 	return insightFacade
		// 		.addDataset("rooms1", content, InsightDatasetKind.Rooms)
		// 		.then(() => insightFacade.addDataset("rooms2", content, InsightDatasetKind.Rooms))
		// 		.then(() => insightFacade.listDatasets())
		// 		.then((insightDatasets) => {
		// 			expect(insightDatasets).to.be.an.instanceof(Array);
		// 			expect(insightDatasets).to.have.length(2);
		// 			const insightDatasetCourses = insightDatasets.find((dataset) => dataset.id === "rooms1");
		// 			expect(insightDatasetCourses).to.exist;
		// 			expect(insightDatasetCourses).to.deep.equal({
		// 				id: "rooms1",
		// 				kind: InsightDatasetKind.Rooms,
		// 				numRows: 1,
		// 			});
		// 			const insightDatasetCourses2 = insightDatasets.find((dataset2) => dataset2.id === "rooms2");
		// 			expect(insightDatasetCourses2).to.exist;
		// 			expect(insightDatasetCourses2).to.deep.equal({
		// 				id: "rooms2",
		// 				kind: InsightDatasetKind.Rooms,
		// 				numRows: 1,
		// 			});
		// 		});
		// });
	});

	/*
	 * This test suite dynamically generates tests from the JSON files in test/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	// describe("PerformQuery", () => {
	// 	before(function () {
	// 		console.info(`Before: ${this.test?.parent?.title}`);
	//
	// 		insightFacade = new InsightFacade();
	//
	// 		// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
	// 		// Will *fail* if there is a problem reading ANY dataset.
	// 		const loadDatasetPromises = [
	// 			insightFacade.addDataset("courses", datasetContents.get("courses") ?? "", InsightDatasetKind.Courses),
	// 		];
	//
	// 		return Promise.all(loadDatasetPromises);
	// 	});
	//
	// 	after(function () {
	// 		console.info(`After: ${this.test?.parent?.title}`);
	// 		fs.removeSync(persistDir);
	// 	});
	//
	// 	type PQErrorKind = "ResultTooLargeError" | "InsightError";
	//
	// 	folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
	// 		"Dynamic InsightFacade PerformQuery tests",
	// 		(input) => insightFacade.performQuery(input),
	// 		"./test/resources/queries",
	// 		{
	// 			errorValidator: (error): error is PQErrorKind =>
	// 				error === "ResultTooLargeError" || error === "InsightError",
	// 			assertOnError(actual, expected) {
	// 				if (expected === "ResultTooLargeError") {
	// 					expect(actual).to.be.instanceof(ResultTooLargeError);
	// 				} else {
	// 					expect(actual).to.be.instanceof(InsightError);
	// 				}
	// 			},
	// 		}
	// 	);
	// });
});
