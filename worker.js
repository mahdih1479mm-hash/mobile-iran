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

      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
