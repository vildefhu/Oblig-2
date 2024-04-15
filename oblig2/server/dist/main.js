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
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
//import pymport from 'pymport'
const node_fetch_1 = __importDefault(require("node-fetch"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/", express_1.default.static(path_1.default.join(__dirname, "../../client/dist")));
app.use(function (inRequest, inResponse, inNext) {
    inResponse.header("Access-Control-Allow-Origin", "*");
    inResponse.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    inResponse.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
    inNext();
});
//start app listening, Node kjører serveren 
app.listen(80, () => {
    console.log("Lytter på port 80");
});
const url = "https://data.ssb.no/api/v0/no/table/11342/";
const query = {
    "query": [
        {
            "code": "Region",
            "selection": {
                "filter": "vs:Kommune",
                "values": [
                    "0301",
                    "1103",
                    "4601",
                    "5001"
                ]
            }
        },
        {
            "code": "Tid",
            "selection": {
                "filter": "item",
                "values": [
                    "2019",
                    "2020",
                    "2021",
                    "2022",
                    "2023",
                    "2024"
                ]
            }
        }
    ],
    "response": {
        "format": "json-stat2"
    }
};
app.get("/table", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Forespørsel mottatt for /table");
    try {
        // Utfør forespørsel til SSB-API-et
        const response = yield (0, node_fetch_1.default)(url, {
            method: 'POST',
            body: JSON.stringify(query),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        // Hent data fra responsen
        const data = yield response.json();
        console.log("Data mottatt fra SSB-API-et:", data);
        // Render tabellen til nettleseren
        res.send(renderTable(data));
    }
    catch (error) {
        console.error("Feil ved henting av data:", error);
        res.status(500).send("Feil ved henting av data");
    }
}));
// Hjelpefunksjon for å generere HTML-tabell fra dataene
function renderTable(data) {
    // Sjekk om datastrukturen er tilstede og komplett
    if (data && data.dimensions) {
        // Bygg HTML-tabellen basert på dataene
        let html = "<table>";
        // Legg til header
        html += "<thead><tr>";
        for (const dimension of data.dimensions) {
            for (const category of dimension.categories) {
                html += `<th>${category.label}</th>`;
            }
        }
        html += "</tr></thead>";
        // Legg til kroppen
        html += "<tbody>";
        for (const observation of data.data) {
            html += "<tr>";
            for (const value of observation) {
                html += `<td>${value}</td>`;
            }
            html += "</tr>";
        }
        html += "</tbody>";
        html += "</table>";
        return html;
    }
    else {
        console.error("Data structure is missing or incomplete");
        return ""; // Returner en tom streng hvis datastrukturen er manglende eller ufullstendig
    }
}
/*
Regene ut gjennomsnitt for lista med verdier
const np = proxify(pymport('numpy'))

const my_nump_a =np.get('asarry').call(mylist,{dtype: 'float'}).get('reshape').call(3,5)

const my_mean: any = np.get('mean').call(my_nump_a,1,{dtype: 'float'})

cont print_str: string = my_mean.get('tolist').call().toJS()

consol.log (` gjennomsnitt for radene: ${print_str}`)

*/ 
//# sourceMappingURL=main.js.map