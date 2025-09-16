import * as cheerio from 'cheerio';
import { gotScraping } from 'got-scraping';
import fs from 'fs';
import path from 'path';
import open from 'open';

const storeURL = "https://warehouse-theme-metal.myshopify.com/collections/sales";
const response = await gotScraping(storeURL);
const html = response.body;

const $ = cheerio.load(html);

const results = [];

$('a[href^="/products/"]').each((i, link) => {
    let href = $(link).attr('href');
    if (href.startsWith("/products/")) {
        href = "https://warehouse-theme-metal.myshopify.com" + href;
    }
    results.push(href);
});

const htmlOutput = `
<!DOCTYPE html>
<html lang="he">
<head>
    <meta charset="UTF-8">
    <title>תוצאות לינקים</title>
</head>
<body>
    <h1>הלינקים שנמצאו</h1>
    <ul>
        ${results.map(url => `<li><a href="${url}" target="_blank">${url}</a></li>`).join('')}
    </ul>
</body>
</html>
`;

const filePath = path.join(process.cwd(), 'results.html');
fs.writeFileSync(filePath, htmlOutput, 'utf8');

console.log(`✅ נשמר ב: ${filePath}`);
await open(filePath);
