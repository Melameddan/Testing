import { gotScraping } from 'got-scraping';
import * as cheerio from 'cheerio';

const productUrl = 'https://warehouse-theme-metal.myshopify.com/products/denon-ah-c720-in-ear-headphones';
const response = await gotScraping(productUrl);
const html = response.body;

const $ = cheerio.load(html);

const title = $('h1').text().trim();
const vendor = $('a.product-meta__vendor').text().trim();
const price = $('span.price').contents()[2].nodeValue;
const reviewCount = parseInt($('span.rating__caption').text(), 10);
const description = $('div[class*="description"] div.rte').text().trim();

const product = {
title,
vendor,
price,
reviewCount,
description,
};

console.log(product);