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
      // 1. دریافت لیست محصولات از دیتابیس
      if (url.pathname === "/api/products" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM products").all();
        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 2. افزودن محصول جدید (توسط ادمین)
      if (url.pathname === "/api/products" && request.method === "POST") {
        const data = await request.json();
        await env.DB.prepare(
          "INSERT INTO products (name, price, category, image, description) VALUES (?, ?, ?, ?, ?)"
        ).bind(data.name, data.price, data.category, data.image, data.description).run();
        
        return new Response(JSON.stringify({ success: true, message: "محصول با موفقیت اضافه شد" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 3. سرویس کردن صفحه اصلی (index.html)
      if (url.pathname === "/" || url.pathname === "/index.html") {
        // اینجا می‌توانید محتوای کامل index.html بالا را قرار دهید تا در ریشه سایت لود شود
        // یا اینکه پروژه را در Cloudflare Pages تنظیم کنید تا فایل‌های گیت‌هاب مستقیم خوانده شوند.
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
