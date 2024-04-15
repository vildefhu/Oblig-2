import path from "path";
import express, { Express, NextFunction, Request, Response } from "express";
//import pymport from 'pymport'
import fetch from "node-fetch";
import axios from "axios";

const app: Express = express();

app.use(express.json());

app.use("/", express.static(path.join(__dirname, "../../client/dist")));

app.use(function (
  inRequest: Request,
  inResponse: Response,
  inNext: NextFunction
) {
  inResponse.header("Access-Control-Allow-Origin", "*");
  inResponse.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  inResponse.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept"
  );
  inNext();
});

//start app listening, Node kjører serveren
app.listen(80, () => {
  console.log("Lytter på port 80");
});

const url = "https://data.ssb.no/api/v0/no/table/11342/";

const query: any = {
  query: [
    {
      code: "Region",
      selection: {
        filter: "vs:Kommune",
        values: ["0301", "1103", "4601", "5001"],
      },
    },
    {
      code: "Tid",
      selection: {
        filter: "item",
        values: ["2019", "2020", "2021", "2022", "2023", "2024"],
      },
    },
  ],
  response: {
    format: "json-stat2",
  },
};

app.get("/table", async (req: Request, res: Response) => {
  console.log("Forespørsel mottatt for /table");
  try {
    // Utfør forespørsel til SSB-API-et
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(query),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Hent data fra responsen
    const data = await response.json();
    console.log("Data mottatt fra SSB-API-et:", data);

    // Render tabellen til nettleseren
    let html = renderTable(data);
    res.send(html);
  } catch (error) {
    console.error("Feil ved henting av data:", error);
    res.status(500).send("Feil ved henting av data");
  }
});

app.get("/calculate", async (req: Request, res: Response) => {
  try {
    // Utfør forespørsel til SSB-API-et
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(query),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Hent data fra responsen
    const data = await response.json();
    const variableIndices = data.dimension.ContentsCode.category.index;
    const variableLabels = data.dimension.ContentsCode.category.label;
    const variableKeys = Object.keys(variableIndices).sort(
      (a, b) => variableIndices[a] - variableIndices[b]
    );
    const yearSize = Object.keys(data.dimension.Tid.category.index).length;
    const regionSize = Object.keys(data.dimension.Region.category.index).length;

    let html = `<table border="1" style="border-collapse: collapse; width: 100%;">`;
    html += `<thead><tr><th>Variable</th><th>Median</th><th>Average</th><th>Max</th><th>Min</th></tr></thead><tbody>`;

    for (let variableCode of variableKeys) {
      const variableIndex = variableIndices[variableCode];
      const values = [];

      console.log(regionSize);
      console.log(yearSize);
      for (let i = 0; i < regionSize * yearSize; i++) {
        const valueIndex = i * variableKeys.length + variableIndex;
        values.push(data.value[valueIndex]);
      }
      console.log(values);

      const stats = calculateStats(values);
      html += `<tr>
                    <td>${variableLabels[variableCode]}</td>
                    <td>${stats.median.toFixed(2)}</td>
                    <td>${stats.average.toFixed(2)}</td>
                    <td>${stats.max.toFixed(2)}</td>
                    <td>${stats.min.toFixed(2)}</td>
                 </tr>`;
    }

    html += `</tbody></table>`;
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (error) {
    console.error("Feil ved henting av data:", error);
    res.status(500).send("Feil ved henting av data");
  }
});

function calculateStats(values: number[]): {
  median: number;
  average: number;
  max: number;
  min: number;
} {
  const sortedValues = [...values].sort((a, b) => a - b);
  const total = values.length;
  const mid = Math.floor(total / 2);
  const median =
    total % 2 !== 0
      ? sortedValues[mid]
      : (sortedValues[mid - 1] + sortedValues[mid]) / 2;
  const average = values.reduce((acc, val) => acc + val, 0) / total;
  const max = Math.max(...sortedValues);
  const min = Math.min(...sortedValues);

  return { median, average, max, min };
}

// Hjelpefunksjon for å generere HTML-tabell fra dataene
function renderTable(data: any): string {
  const regions = data.dimension.Region.category.label;
  const variables = data.dimension.ContentsCode.category.label;
  const years = data.dimension.Tid.category.label;
  const values = data.value;
  const regionIndices = data.dimension.Region.category.index;
  const variableIndices = data.dimension.ContentsCode.category.index;
  const yearIndices = data.dimension.Tid.category.index;

  const regionKeys = Object.keys(regionIndices).sort(
    (a, b) => regionIndices[a] - regionIndices[b]
  );
  const variableKeys = Object.keys(variableIndices).sort(
    (a, b) => variableIndices[a] - variableIndices[b]
  );
  const yearKeys = Object.keys(yearIndices).sort(
    (a, b) => yearIndices[a] - yearIndices[b]
  );

  let html = `<table border="1" style="border-collapse: collapse; width: 100%;">`;
  html += `<thead><tr><th>Region</th><th>Variable</th><th>Year</th><th>Value</th></tr></thead><tbody>`;

  for (let regionCode of regionKeys) {
    for (let variableCode of variableKeys) {
      for (let yearCode of yearKeys) {
        const rowIndex = regionIndices[regionCode];
        const variableIndex = variableIndices[variableCode];
        const yearIndex = yearIndices[yearCode];
        const valueIndex =
          rowIndex * variableKeys.length * yearKeys.length +
          variableIndex * yearKeys.length +
          yearIndex;

        html += `<tr>
                          <td>${regions[regionCode]}</td>
                          <td>${variables[variableCode]} (${data.dimension.ContentsCode.category.unit[variableCode]?.base})</td>
                          <td>${years[yearCode]}</td>
                          <td>${values[valueIndex]}</td>
                       </tr>`;
      }
    }
  }

  html += `</tbody></table>`;
  return html;
}

/*
  Regene ut gjennomsnitt for lista med verdier 
  const np = proxify(pymport('numpy'))

  const my_nump_a =np.get('asarry').call(mylist,{dtype: 'float'}).get('reshape').call(3,5)

  const my_mean: any = np.get('mean').call(my_nump_a,1,{dtype: 'float'})

  cont print_str: string = my_mean.get('tolist').call().toJS()

  consol.log (` gjennomsnitt for radene: ${print_str}`)

  */
