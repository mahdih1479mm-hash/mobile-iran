export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // دریافت لیست محصولات از دیتابیس
      if (url.pathname === "/api/products" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM products").all();
        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // افزودن محصول جدید (توسط ادمین)
      if (url.pathname === "/api/products" && request.method === "POST") {
        const data = await request.json();
        await env.DB.prepare(
          "INSERT INTO products (name, price, category, image, description) VALUES (?, ?, ?, ?, ?)"
        ).bind(data.name, data.price, data.category, data.image, data.description).run();
        
        return new Response(JSON.stringify({ success: true, message: "محصول با موفقیت اضافه شد" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // نمایش صفحه اصلی (index.html) در ریشه سایت
      if (url.pathname === "/" || url.pathname === "/index.html") {
        const htmlContent = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>موبایل ایران - صفحه اصلی</title>
    <style>
        body { font-family: Tahoma, sans-serif; background: #f4f4f9; margin: 0; padding: 40px; direction: rtl; text-align: center; }
        h1 { color: #333; }
        .menu { margin-top: 30px; }
        .btn { display: inline-block; background: #007bff; color: white; padding: 12px 25px; margin: 10px; text-decoration: none; border-radius: 6px; font-weight: bold; }
        .btn:hover { background: #0056b3; }
    </style>
</head>
<body>
    <h1>به فروشگاه موبایل ایران خوش آمدید</h1>
    <p>مرجع تخصصی خرید لوازم جانبی و موبایل</p>
    <div class="menu">
        <a href="/products.html" class="btn">مشاهده محصولات</a>
        <a href="/admin.html" class="btn" style="background: #28a745;">پنل مدیریت</a>
    </div>
</body>
</html>`;

        return new Response(htmlContent, {
          headers: { ...corsHeaders, "Content-Type": "text/html;charset=UTF-8" }
        });
      }

      // نمایش صفحه محصولات در مسیر /products.html
      if (url.pathname === "/products.html") {
        const htmlContent = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>محصولات - موبایل ایران</title>
    <style>
        body { font-family: Tahoma, sans-serif; background: #f4f4f9; margin: 0; padding: 20px; direction: rtl; }
        h1 { text-align: center; color: #333; }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px; }
        .product-card { background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); text-align: center; }
        .product-card img { max-width: 100%; height: 150px; object-fit: cover; border-radius: 5px; }
        .price { color: #007bff; font-weight: bold; margin: 10px 0; }
        .back { display: block; text-align: center; margin-bottom: 20px; text-decoration: none; color: #555; }
    </style>
</head>
<body>
    <a href="/" class="back">← بازگشت به صفحه اصلی</a>
    <h1>لیست محصولات موبایل ایران</h1>
    <div id="product-list" class="product-grid">در حال بارگذاری محصولات از دیتابیس...</div>

    <script>
        const API_BASE = "";
        async function loadProducts() {
            try {
                const response = await fetch(\`\${API_BASE}/api/products\`);
                const products = await response.json();
                const container = document.getElementById("product-list");
                if (!products.length) {
                    container.innerHTML = "<p>هیچ محصولی یافت نشد.</p>";
                    return;
                }
                container.innerHTML = products.map(p => \`
                    <div class="product-card">
                        <img src="\${p.image || 'https://via.placeholder.com/150'}" alt="\${p.name}">
                        <h3>\${p.name}</h3>
                        <p class="price">\${p.price} تومان</p>
                        <p>\${p.description || ''}</p>
                    </div>
                \`).join("");
            } catch (error) {
                document.getElementById("product-list").innerHTML = "<p style='color:red;'>خطا در ارتباط با سرور.</p>";
            }
        }
        loadProducts();
    </script>
</body>
</html>`;

        return new Response(htmlContent, {
          headers: { ...corsHeaders, "Content-Type": "text/html;charset=UTF-8" }
        });
      }

      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
