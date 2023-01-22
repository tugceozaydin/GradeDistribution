/**
 * Builds a query object using the current document object model (DOM).
 * Must use the browser's global document object {@link https://developer.mozilla.org/en-US/docs/Web/API/Document}
 * to read DOM information.
 *
 * @returns query object adhering to the query EBNF
 */
CampusExplorer.buildQuery = () => {
    let query = {};
    let dataset = document.getElementsByClassName("tab-panel active")[0].dataset.type;

    query.WHERE = buildWhere(dataset);
    query.OPTIONS = buildOptions(dataset);
    let transformations = buildTransformations(dataset);
    if(Object.keys(transformations).length !== 0) {
        query.TRANSFORMATIONS = buildTransformations(dataset);
    }

    return query;
};

function buildWhere(dataset) {
    let where = {};
    let text2 = document.getElementsByClassName("tab-panel active")[0];

    let conditionAll = text2.getElementsByClassName("control conditions-all-radio")[0].children[0];
    let conditionNone = text2.getElementsByClassName("control conditions-none-radio")[0].children[0];
    let conditionAny = text2.getElementsByClassName("control conditions-any-radio")[0].children[0];

    let conditionResult = buildFilters(dataset);
    if (Object.keys(conditionResult).length === 0) {
        return where;
    }
    if (Object.keys(conditionResult).length === 1) {
        where = conditionResult;
    } else if(conditionAll.checked){
        where.AND = conditionResult;
    } else if (conditionAny.checked) {
        where.OR = conditionResult;
    } else if (conditionNone.checked) {
        where.NOT = {"OR": conditionResult}
    }
    console.log(where);
    return where;
}

function buildFilters(dataset) {
    let conditionArray = [];
    let code;
    let text = document.getElementsByClassName("tab-panel active")[0].childNodes[0];
    //let numberOfConditions = text.nextSibling.querySelector(".conditions-container").children.length;

    if (dataset === "rooms") {
        code = 1;
    } else if (dataset === "courses") {
        code = 0;
    }

    let text2 = document.getElementsByClassName("tab-panel active")[0];
    let numberOfConditions = text2.getElementsByClassName("control-group condition").length;

    for (let i = 0; i < numberOfConditions; i++) {
        // returns selectedKey such as audit
        let keys = text2.getElementsByClassName("control fields")[i].children[0];
        let selectedKey = keys.options[keys.selectedIndex].value;

        // returns selectedOperator such as GT
        let operators = text2.getElementsByClassName("control operators")[i].children[0];
        let selectedOperator = operators.options[operators.selectedIndex].value;

        // returns entered value for comparison
        let comparisonValue = text2.getElementsByClassName("control term")[i].children[0].value;
        let integer = parseFloat(comparisonValue);
        if(!isNaN(integer)){
            comparisonValue = integer;
        }

        let key = dataset + "_" + selectedKey;
        let keyPair = {};
        keyPair[key] = comparisonValue;
        let currentCondition = {};
        currentCondition[selectedOperator] = keyPair;


        // checking if NOT is clicked or not
        if (text2.getElementsByClassName("control not")[i].children[0].checked) {
            currentCondition = {"NOT": currentCondition}
        }
        if (numberOfConditions === 1){
            return currentCondition;
        }
        conditionArray.push(currentCondition);
        console.log(conditionArray);
    }
    return conditionArray;
}

function buildOptions(dataset) {
    let courseFields = ["audit", "pass", "fail", "avg", "year", "dept", "id", "instructor", "title", "uuid"];
    let roomsFields = ["lat", "lon", "seats", "fullname", "shortname",
        "number", "name", "address", "type", "furniture", "href"];

    // COLUMNS
    let options = {};
    let columns = [];
    let text = document.getElementsByClassName("form-group columns");
    let columnsNumber;
    let code;
    let fields;
    if (dataset === "rooms") {
        code = 1;
        columnsNumber = text[code].children[1].children.length;
        fields = roomsFields;
    } else if (dataset === "courses") {
        code = 0;
        columnsNumber = text[code].children[1].children.length;
        fields = courseFields;
    }

    for (let i = 0; i < columnsNumber; i++) {
        if (text[code].children[1].children[i].children[0].checked){
            let value;
            value = text[code].children[1].children[i].children[0].value;
            let column;
            if (fields.includes(value)){
                column = dataset + "_" + value;
            } else {
                column = value;
            }
            columns.push(column);
        }
    }
    options.COLUMNS = columns;

    // ORDER
    let orders = {};
    let keys = [];
    let text2 = document.getElementsByClassName("form-group order");
    // order keys
    for (let i = 0; i < columnsNumber; i++) {
        if (text2[code].children[1].children[0].children[0].children[i].selected) {
            let value2;
            value2 = text2[code].children[1].children[0].children[0].children[i].value;
            let order;
            if (fields.includes(value2)){
                order = dataset + "_" + value2;
            } else {
                order = value2;
            }
            keys.push(order);
        }
    }
    // order dir
    if (document.getElementsByClassName("control descending")[code].children[0].checked) {
        orders["dir"] = "DOWN";
    }
    else {
        orders["dir"] = "UP";
    }
    orders["keys"] = keys;

    if (keys.length !== 0) {
        options.ORDER = orders;
    }

    return options;
}

function buildTransformations(dataset) {
    let transformations = {};
    let groups = [];
    let text = document.getElementsByClassName("form-group groups");
    let columnsNumber;
    let code;
    if (dataset === "rooms") {
        columnsNumber = 11;
        code = 1;
    } else if (dataset === "courses") {
        columnsNumber = 10;
        code = 0;
    }

    // groups keys
    for (let i = 0; i < columnsNumber; i++) {
        if (text[code].children[1].children[i].children[0].checked) {
            let value2;
            value2 = text[code].children[1].children[i].children[0].value;
            let group;
            group = dataset + "_" + value2;
            groups.push(group);
        }
    }
    if (groups.length !== 0){
        transformations.GROUP = groups;
    }

    //apply keys
    let text2 = document.getElementsByClassName("form-group transformations");
    let numberOfConditions = text2[code].children[1].children.length;
    let transformationArray = [];

    for (let i = 0; i < numberOfConditions; i++) {
        let givenName = text2[code].children[1].children[i].children[0].children[0].value;

        let operators = text2[code].children[1].children[i].children[1].children[0];
        let selectedOperator = operators.options[operators.selectedIndex].value;

        let keys = text2[code].children[1].children[i].children[2].children[0];
        let selectedKey = keys.options[keys.selectedIndex].value;

        let key = dataset + "_" + selectedKey;
        let keyPair = {};
        keyPair[selectedOperator] = key;
        let currentTransformation = {};
        currentTransformation[givenName] = keyPair;

        transformationArray.push(currentTransformation);
    }
    if(transformationArray.length !== 0){
        transformations.APPLY = transformationArray;
    }

    return transformations;
}
