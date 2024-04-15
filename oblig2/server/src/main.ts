import path from "path";
import express, { Express, NextFunction, Request, Response } from "express";
//import pymport from 'pymport'
import fetch from 'node-fetch';
import axios from 'axios'

const app: Express = express();

app.use(express.json());

app.use("/",
    express.static(path.join(__dirname, "../../client/dist")));


app.use(function (inRequest: Request, inResponse: Response,
    inNext: NextFunction) {
    inResponse.header("Access-Control-Allow-Origin", "*");
    inResponse.header("Access-Control-Allow-Methods",
        "GET,POST,DELETE,OPTIONS"
    );
    inResponse.header("Access-Control-Allow-Headers",
        "Origin,X-Requested-With,Content-Type,Accept"
    );
    inNext();
});

//start app listening, Node kjører serveren 
app.listen(80, () => {
    console.log("Lytter på port 80");
})

const url = "https://data.ssb.no/api/v0/no/table/11342/"

const query: any = {
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
  }

  app.get("/table", async (req: Request, res: Response) => {
    console.log("Forespørsel mottatt for /table");
    try {
        // Utfør forespørsel til SSB-API-et
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(query),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Hent data fra responsen
        const data = await response.json();
        console.log("Data mottatt fra SSB-API-et:", data);

        // Render tabellen til nettleseren
        res.send(renderTable(data));
    } catch (error) {
        console.error("Feil ved henting av data:", error);
        res.status(500).send("Feil ved henting av data");
    }
});

// Hjelpefunksjon for å generere HTML-tabell fra dataene
function renderTable(data: any): string {
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
  } else {
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