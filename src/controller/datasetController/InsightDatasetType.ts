import {InsightDataset} from "../IInsightFacade";

export default class InsightDatasetType implements InsightDataset {

    public id: string;
    public kind: import("../IInsightFacade").InsightDatasetKind;
    public numRows: number;

}
