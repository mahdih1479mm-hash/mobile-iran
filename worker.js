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
      // دریافت لیست محصولات
      if (url.pathname === "/api/products" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM products").all();
        return Response.json(results, { headers: corsHeaders });
      }

      // افزودن محصول جدید (برای پنل ادمین)
      if (url.pathname === "/api/products" && request.method === "POST") {
        const body = await request.json();
        await env.DB.prepare(
          "INSERT INTO products (name, category, price, image, description) VALUES (?, ?, ?, ?, ?)"
        ).bind(body.name, body.category, body.price, body.image, body.description).run();
        
        return Response.json({ success: true, message: "محصول با موفقیت اضافه شد" }, { headers: corsHeaders });
      }

      return new Response("مسیری یافت نشد", { status: 404, headers: corsHeaders });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
    }
  },
};