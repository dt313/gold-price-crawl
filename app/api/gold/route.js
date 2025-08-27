// app/api/gold/route.js
import * as cheerio from "cheerio";

export async function GET(request) {
  const response = await fetch(
    "https://www.24h.com.vn/gia-vang-hom-nay-c425.html"
  ); // Replace with your target URL
  const html = await response.text();
  const $ = cheerio.load(html);

  // Lấy ngày hôm nay và hôm qua từ <div class="tabTit">
  const dates = [];
  $(".tabTit td").each((i, el) => {
    const text = $(el).text().trim();
    if (text) dates.push(text);
  });

  // Lấy từng dòng giá vàng
  const goldData = [];
  $(".gia-vang-search-data-table tr").each((i, row) => {
    const tds = $(row).find("td");
    const name = $(tds[0]).text().trim(); // Tên loại vàng (SJC, DOJI, ...)
    const buyToday = $(tds[1]).find("span.fixW").text().trim(); // Giá mua hôm nay
    const sellToday = $(tds[2]).find("span.fixW").text().trim(); // Giá bán hôm nay
    const buyYesterday = $(tds[3]).text().trim(); // Giá mua hôm qua
    const sellYesterday = $(tds[4]).text().trim(); // Giá bán hôm qua

    goldData.push({
      name,
      today: { buy: buyToday, sell: sellToday },
      yesterday: { buy: buyYesterday, sell: sellYesterday },
    });
  });

  return new Response(JSON.stringify({ data: { label: dates, goldData } }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request) {
  return new Response(JSON.stringify({ message: "This is a POST request" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
