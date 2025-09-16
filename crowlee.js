import { PlaywrightCrawler } from "crawlee";
import fs from "fs";
import path from "path";
import express from "express";
import cron from "node-cron";

// תיקיית public
const publicDir = path.join(process.cwd(), "public");
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

// פונקציה שמריצה את הסקרייפר ויוצרת output.html
async function runScraper() {
    const crawler = new PlaywrightCrawler({
        async requestHandler({ page }) {
            await page.goto("https://www.yad2.co.il/realestate/rent?minRooms=5&sort=date-desc&topArea=101&area=87&city=2300&zoom=13");
            await page.waitForSelector('div.item-layout_feedItemBox__Kvh1y');

            const items = await page.$$eval('div.item-layout_feedItemBox__Kvh1y', (elements) =>
                elements.map((el) => {
                    const price = el.querySelector('[data-testid="price"]')?.innerText.trim() || "";
                    const title = el.querySelector('.item-data-content_heading__tphH4')?.innerText.trim() || "";
                    const infoLine1 = el.querySelector('[data-testid="item-info-line-1st"]')?.innerText.trim() || "";
                    const infoLine2 = el.querySelector('[data-testid="item-info-line-2nd"]')?.innerText.trim() || "";
                    const link = el.querySelector('a.item-layout_itemLink__CZZ7w')?.href || "";
                    const img = el.querySelector('img[data-testid="image"]')?.src || "";
                    return { title, price, infoLine1, infoLine2, link, img };
                })
            );

            // יוצרים HTML
            const html = `
            <!DOCTYPE html>
            <html lang="he">
            <head>
                <meta charset="UTF-8">
                <title>דירות להשכרה - Yad2</title>
                <style>
                    body { font-family: Arial; background:#f5f5f5; padding:20px; }
                    h1 { text-align:center; color:#ff6600; }
                    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px; }
                    .card { background:white; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.1); overflow:hidden; transition:transform 0.2s; }
                    .card:hover { transform:scale(1.02); }
                    .card img { width:100%; height:200px; object-fit:cover; }
                    .card-content { padding:15px; }
                    .price { font-size:18px; font-weight:bold; color:#ff6600; }
                    .title { font-size:16px; margin:5px 0; }
                    .info { font-size:14px; color:#555; }
                    a { text-decoration:none; color:inherit; }
                </style>
            </head>
            <body>
                <h1>דירות להשכרה בקריית טבעון</h1>
                <div class="grid">
                    ${items.map(item => `
                        <div class="card">
                            <a href="${item.link}" target="_blank">
                                <img src="${item.img}" alt="${item.title}">
                                <div class="card-content">
                                    <div class="price">${item.price}</div>
                                    <div class="title">${item.title}</div>
                                    <div class="info">${item.infoLine1}</div>
                                    <div class="info">${item.infoLine2}</div>
                                </div>
                            </a>
                        </div>
                    `).join('')}
                </div>
            </body>
            </html>`;

            // שמירה בתיקיית public
            const outputPath = path.join(publicDir, "output.html");
            fs.writeFileSync(outputPath, html, "utf8");
            console.log(`✅ נשמר הקובץ ב-${outputPath}`);
        },
    });

    await crawler.addRequests([
        "https://www.yad2.co.il/realestate/rent?minRooms=5&sort=date-desc&topArea=101&area=87&city=2300&zoom=13"
    ]);
    await crawler.run();
}

// הפעלה ראשונית
runScraper();

// Cron יומי ב-08:00
cron.schedule("0 8 * * *", () => {
    console.log("🕗 הפעלת סקרייפר אוטומטית");
    runScraper();
});

// Express server כדי שהקובץ יהיה נגיש דרך הדומיין
const app = express();
app.use(express.static(publicDir));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server רץ ב-port ${PORT}`);
});
