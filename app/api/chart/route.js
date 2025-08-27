const { chromium } = require("playwright");

export async function GET(request) {
  // Your logic to handle GET requests

  const browser = await chromium.launch();
  const page = await browser.newPage();
  let chartData = null;
  try {
    console.log("Đang truy cập trang web...");
    await page.goto("https://www.24h.com.vn/gia-vang-hom-nay-c425.html", {
      waitUntil: "networkidle",
      timeout: 600000,
    });

    chartData = await page.evaluate(() => {
      // Kiểm tra xem Highcharts có tồn tại không
      if (typeof Highcharts === "undefined" || !Highcharts.charts.length) {
        console.error("Không tìm thấy đối tượng Highcharts trên trang.");
        return null;
      }

      // Lấy đối tượng biểu đồ đầu tiên
      const chart = Highcharts.charts[0];
      if (!chart) {
        return null;
      }

      const data = {};
      // LẤY CÁC NHÃN NGÀY THÁNG TỪ TRỤC X CỦA BIỂU ĐỒ
      const dates = chart.xAxis[0].categories;

      // Lặp qua từng series (chuỗi dữ liệu) trong biểu đồ
      chart.series.forEach((series) => {
        // Lấy tên series (Mua vào/Bán ra) và dữ liệu của nó
        data[series.name] = series.data.map((point, index) => {
          return {
            date: dates[index], // Lấy ngày tháng từ mảng dates đã khai báo
            value: point.y, // Lấy giá trị vàng
          };
        });
      });
      return data;
    });

    console.log("Dữ liệu biểu đồ đã được cào:");
    console.log(JSON.stringify(chartData), typeof chartData);
  } catch (error) {
    console.error("Đã xảy ra lỗi khi cào dữ liệu:", error);
  } finally {
    await browser.close();
  }

  return new Response(JSON.stringify({ data: chartData }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=1800", // cache 30 minutes
    },
  });
}
