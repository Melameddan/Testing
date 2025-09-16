import { gotScraping } from "got-scraping";
import * as cheerio from "cheerio";
import { parse } from 'json2csv';
import { writeFileSync } from 'fs';

// URL of the page to scrape
const storeURL = "https://www.d.co.il/h-c2550-e0-p0-l0/";

async function main() {

    const response = await gotScraping(storeURL);
    const html = response.body;

    const $ = cheerio.load(html);

    //טבלת המוצרים בעמוד
    const products = $('.card-item');

    const results = [];

    for (const product of products) {

        //כותרת החברה
        const titleElement = $(product).find('h3');
        const title = titleElement.text();

        //כתובת החברה
        const locationElement = $(product).find('svg + span');
        const location = locationElement.text();

        results.push({ title, location });

    }

    const csv = parse(results);
    writeFileSync("products.csv", "\uFEFF" + csv, "utf8");
}
main();