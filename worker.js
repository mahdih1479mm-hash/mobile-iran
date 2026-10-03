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
      // ۱. دریافت لیست محصولات از دیتابیس ابری D1
      if (url.pathname === "/api/products" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM products").all();
        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // ۲. افزودن محصول جدید به دیتابیس ابری (توسط ادمین)
      if (url.pathname === "/api/products" && request.method === "POST") {
        const data = await request.json();
        await env.DB.prepare(
          "INSERT INTO products (name, price, category, image, description) VALUES (?, ?, ?, ?, ?)"
        ).bind(data.name, data.price, data.category, data.image, data.description).run();
        
        return new Response(JSON.stringify({ success: true, message: "محصول با موفقیت در دیتابیس ابری ذخیره شد" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
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
```[cite: 13]

---

### ۲. فایل `wrangler.toml` (تنظیمات اتصال Worker به پایگاه داده D1)
این فایل تنظیمات اتصال پروژه شما به سرور ابری و دیتابیس `mobile_iran_db` را حفظ می‌کند[cite: 12].

```toml
name = "mobile-iran"
main = "worker.js"
compatibility_date = "2026-10-03"

[[d1_databases]]
binding = "DB"
database_name = "mobile_iran_db"
database_id = "d56093cc-7343-4bac-8941-a8ba24321841"
```[cite: 12]

---

### نکته برای اتصال صفحات (مثل `products.html` یا `index.html`) به این سرور:
در فایل‌های فرانت‌اند خود، به جای استفاده از آرایه‌های ثابت محلی، می‌توانید به راحتی لیست محصولات را از طریق API ابری دریافت کنید:

```javascript
async function loadProductsFromCloud() {
    try {
        let response = await fetch('/api/products');
        let productsData = await response.json();
        renderProducts(productsData); // تابع نمایش محصولات در صفحه
    } catch (error) {
        console.error("خطا در دریافت اطلاعات از سرور ابری:", error);
    }
}
