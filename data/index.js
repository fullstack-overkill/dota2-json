import files from "fs/promises";
import { delay } from "./helpers/index.js";
/*
 * Bibliotecas
 */
import puppeteer from "puppeteer-extra";
import puppeteerStealth from "puppeteer-extra-plugin-stealth";
import { scrollPageToBottom } from "puppeteer-autoscroll-down";
import { load } from "cheerio";

/*
 * Dados relevantes
 */

const heros = await JSON.parse(
  await files.readFile(new URL("../JSON/heroeswikiLink.json", import.meta.url))
);

const heroisComSeusConters = [];

/*
 * Configurando e iniciando o puppeteer
 */
puppeteer.use(puppeteerStealth());

const browser = await puppeteer.launch({ headless: false });

/*
 * Iniciando a coleta
 */
const page = await browser.newPage();

await page.setViewport({ width: 1300, height: 100000 });

await page.goto("https://arh.antoinevastel.com/bots/areyouheadless");

console.log("Running tests..");

for (let i = 0; i < heros.length; i++) {
  await page.goto(heros[i].hrefFandom + "/Counters", {
    waitUntil: "load",
  });

  await page.evaluate((_) => {
    window.scrollTo(0, 0);
    window.scrollTo({
      left: 0,
      top: document.body.scrollHeight,
      behavior: "instant",
    });
  });
  await delay(1000);
  const content = await page.content();

  let $ = load(content);

  $('p').remove();

  /* Titulo: Bad against... */
  const inicio = $(".mw-headline");

  /* Começa a pegar os herois */
  let nodeAtual = inicio.first().parent().next();

  let heroConters = [];

  /* Coleta todas a desc do heroi conter */

  while (nodeAtual.children().first().text() !== "Others") {
    if (heros[i].hrefFandom === "https://dota2.fandom.com/wiki/Huskar") {
      console.log(nodeAtual.html());
      debugger;
    }
    const conterHero = {
      img: nodeAtual.find("img").attr("src"),
      nome: nodeAtual.nextAll().children().children().html(),
      desc: nodeAtual.nextAll().nextAll().text(),
    };

    heroConters.push(conterHero);

    nodeAtual = nodeAtual.nextAll().nextAll().nextAll();
  }
  heroisComSeusConters.push({
    nome: heros[i].nome,
    hrefFandom: heros[i].hrefFandom + "/Counters",
    conters: heroConters,
  });
  await delay(1000);
}
