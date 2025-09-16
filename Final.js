import { gotScraping } from 'got-scraping';
import * as cheerio from 'cheerio';

const WEBSITE_URL = 'https://warehouse-theme-metal.myshopify.com';
const storeUrl = `${WEBSITE_URL}/collections/sales`;

console.log('Fetching products on sale.');
const response = await gotScraping(storeUrl);
const html = response.body;

const $ = cheerio.load(html);
const productLinks = $('a.product-item__title');

const productUrls = [];
for (const link of productLinks) {
const relativeUrl = $(link).attr('href');
const absoluteUrl = new URL(relativeUrl, WEBSITE_URL);
productUrls.push(absoluteUrl);
}

console.log(`Found ${productUrls.length} products.`);

const results = [];
const errors = [];

for (const url of productUrls) {
try {
console.log(`Fetching URL: ${url}`);
const productResponse = await gotScraping(url);
const $productPage = cheerio.load(productResponse.body);

const title = $productPage('h1').text().trim();
const vendor = $productPage('a.product-meta__vendor').text().trim();
const price = $productPage('span.price').contents()[2].nodeValue;
const reviewCount = parseInt($productPage('span.rating__caption').text(), 10);
const description = $productPage('div[class*="description"] div.rte').text().trim();

results.push({
title,
vendor,
price,
reviewCount,
description,
});
} catch (error) {
errors.push({ url, msg: error.message });
}
}

console.log('RESULTS:', results);
console.log('ERRORS:', errors);