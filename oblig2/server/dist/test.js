"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
//import {pymport, proxify} from 'pymport'; 
const jsonstat_toolkit_1 = __importDefault(require("jsonstat-toolkit"));
//Vi lager "vår" express app
const app = (0, express_1.default)();
//Gjør det slik at vi forstår JSON
app.use(express_1.default.json());
// Senker sikkerhetsnivåene slik at vi kan teste dette
app.use(function (inRequest, inResponse, inNext) {
    inResponse.header("Access-Control-Allow-Origin", "*");
    inResponse.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    inResponse.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
    inNext();
});
function lagTable(data) {
    //const tableBody = document.querySelector('#data-table tbody');
    const kommuneDimension = data.Dimension("Region");
    const årDimension = data.Dimension("Tid");
    // Hent indeksen til "LandArealKm2" fra dimensjonen "ContentsCode"
    const contentsCodeDimension = data.Dimension("ContentsCode");
    console.log("==================");
    console.log(data.value);
    console.log("==================");
    const jsonData = data.value;
    const datapunktene_rad = contentsCodeDimension.length;
    const årene_kol = årDimension.length;
    const kommunenene = kommuneDimension.length;
    // Opprett tabell og fyll med verdier
    // rett og slett fordi jeg fant ut at alle var lagt ut i en "lang lang rekke"
    const table = new Array(kommunenene); //kommunene først
    for (let i = 0; i < kommunenene; i++) {
        table[i] = new Array(datapunktene_rad); //
        for (let j = 0; j < datapunktene_rad; j++) {
            table[i][j] = new Array(årene_kol);
            for (let k = 0; k < årene_kol; k++) {
                // Les ut verdien fra jsonData-basert på indeksen
                const index = i * (datapunktene_rad * årene_kol) + j * årene_kol + k;
                table[i][j][k] = jsonData[index];
            }
        }
    }
    let result = [];
    // Loop over kommuner og år for å generere tabellradene
    for (let kommuneIndex = 0; kommuneIndex < kommuneDimension.length; kommuneIndex++) {
        const kommuneLabel = kommuneDimension.Category(kommuneIndex).label;
        for (let årIndex = 0; årIndex < årDimension.length; årIndex++) {
            const yearLabel = årDimension.Category(årIndex).label;
            for (let contentsIndex = 0; contentsIndex < contentsCodeDimension.length; contentsIndex++) {
                const contentLabel = contentsCodeDimension.Category(contentsIndex).label;
                const befolkningVerdi = table[kommuneIndex][contentsIndex][årIndex];
                //muligens ikke enklest å traversere slik senere?
                //Opprett tabellraden og cellene
                let befolkningLabel = "-";
                // Legg til data i cellene
                if (befolkningVerdi) {
                    befolkningLabel = befolkningVerdi;
                }
                result.push({ kommuneLabel, yearLabel, contentLabel, befolkningLabel });
            }
        }
    }
    return result;
}
const query = {
    'query': [
        {
            'code': 'Region',
            'selection': {
                'filter': 'vs:Kommune',
                'values': [
                    '3101',
                    '0301',
                    '1506',
                    '1579'
                ]
            }
        },
        {
            'code': 'Tid',
            'selection': {
                'filter': 'item',
                'values': [
                    '2019',
                    '2020',
                    '2021',
                    '2022',
                    '2023',
                    '2024'
                ]
            }
        }
    ],
    'response': {
        'format': 'json-stat2'
    }
};
var options = {
    method: "POST",
    body: JSON.stringify(query)
};
const url = 'https://data.ssb.no/api/v0/no/table/11342';
function get_data(j) {
    console.log("In: get-data");
    var ds = j.Dataset(0);
    console.log("Out: get-data");
}
//Må ha med én POST-rutine, syns jeg
app.post("/finn", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, jsonstat_toolkit_1.default)(url, options).then(get_data);
        inResponse.send("<html><head></head><body> Vi har hentet data! </body></html>");
    }
    catch (inError) {
        console.log("POST /arrive: Error", inError);
        inResponse.send("<html><head></head><body> Dette gikk ikke så fint! </body></html>");
    }
}));
//Må ha med én POST-rutine, syns jeg
app.post("/fetch", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jsonData = inRequest.body;
        console.log(JSON.stringify(jsonData));
        // Gjør noe med jsonData
        // Send et svar tilbake til brukeren
        // inRequest.send('Data mottatt og behandlet');
        console.log('Data mottatt og behandlet');
        /*
        {
      query: [
          { code: 'Region', selection: [Object] },
          { code: 'Tid', selection: [Object] },
          { code: 'Category', selection: [Object] }
        ],
        response: { format: 'json-stat2' }
        }
        Data mottatt og behandlet
        */
    }
    catch (inError) {
        console.log("POST /arrive: Error", inError);
        inResponse.send("<html><head></head><body> Dette gikk ikke så fint! </body></html>");
    }
    try {
        const response = yield fetch(url, {
            method: 'POST',
            body: JSON.stringify(query),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const result = yield response.json();
        const dataset = (0, jsonstat_toolkit_1.default)(result).Dataset(0);
        let myResult = [];
        if (result && dataset && dataset.length) {
            myResult = lagTable(dataset);
            //console.log(myResult); SKRIVER DETTE VELDIG PENT UT :-)
        }
        else {
            console.error('No data found');
        }
        inResponse.json(myResult); //send("<html><head></head><body> Vi har hentet data! </body></html>");
    }
    catch (error) {
        console.error(error);
    }
}));
app.get('/ready', (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("GET /ready: Ok");
    }
    catch (inError) {
        console.log("GET /ready: Error", inError);
    }
}));
/*
const np = proxify(pymport('numpy'));

const mylist: number[] =
  [1, 2.2, 3, 4, 5, 6, 7, 8, 9.9, 10, 11, 12, 13, 14, 15];
 
const my_numpy_a = np.get('asarray').call(mylist,
  {dtype: 'float'}).get('reshape').call(3, 5);

const my_mean: any = np.get('mean').call(my_numpy_a, 1, {dtype: 'float'});

const print_str: string = my_mean.get('tolist').call().toJS();

console.log(`Jeg har funnet gjennomsnittet for alle radene: ${print_str}`);
*/
app.listen(8080, () => {
    console.log("Serveren lytter på port 8080");
});
//# sourceMappingURL=test.js.map