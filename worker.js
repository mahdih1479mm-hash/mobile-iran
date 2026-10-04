export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    const jsonRes = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    try {
      const path = url.pathname;
      const method = request.method;

      // ================= محصولات =================
      if (path === "/api/products" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM products ORDER BY id DESC").all();
        return jsonRes(results || []);
      }
      if (path === "/api/products" && method === "POST") {
        const body = await request.json();
        await env.DB.prepare(`INSERT INTO products (name, category, price, discount_price, section, image, description) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(body.name||"", body.category||"", body.price||"", body.discount_price||"", body.section||"normal", body.image||"", body.description||"").run();
        return jsonRes({ success: true });
      }
      if (path.startsWith("/api/products/") && method === "PUT") {
        const id = path.split("/").pop();
        const body = await request.json();
        await env.DB.prepare(`UPDATE products SET name=?, category=?, price=?, discount_price=?, section=?, image=?, description=? WHERE id=?`).bind(body.name||"", body.category||"", body.price||"", body.discount_price||"", body.section||"normal", body.image||"", body.description||"", id).run();
        return jsonRes({ success: true });
      }
      if (path.startsWith("/api/products/") && method === "DELETE") {
        const id = path.split("/").pop();
        await env.DB.prepare("DELETE FROM products WHERE id=?").bind(id).run();
        return jsonRes({ success: true });
      }

      // ================= کاربران =================
      if (path === "/api/users/register" && method === "POST") {
        const body = await request.json();
        await env.DB.prepare("INSERT INTO users (name, phone_or_email, password) VALUES (?, ?, ?)").bind(body.name||"", body.phone_or_email||"", body.password||"").run();
        return jsonRes({ success: true });
      }
      if (path === "/api/users/login" && method === "POST") {
        const body = await request.json();
        const { results } = await env.DB.prepare("SELECT id, name, phone_or_email FROM users WHERE phone_or_email=? AND password=?").bind(body.phone_or_email||"", body.password||"").all();
        return results.length > 0 ? jsonRes({ success: true, user: results[0] }) : jsonRes({ success: false }, 401);
      }
      if (path === "/api/users" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT id, name, phone_or_email, created_at FROM users ORDER BY id DESC").all();
        return jsonRes(results || []);
      }

      // ================= سفارشات =================
      if (path === "/api/orders" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM orders ORDER BY id DESC").all();
        return jsonRes(results || []);
      }
      if (path === "/api/orders" && method === "POST") {
        const body = await request.json();
        const orderDetails = { cartItems: body.items||[], address: body.address||"", postalCode: body.postalCode||"", shippingMethod: body.shippingMethod||"", trackingCode: body.trackingCode||"" };
        await env.DB.prepare("INSERT INTO orders (user_name, phone, total_amount, items) VALUES (?, ?, ?, ?)").bind(body.customerName||body.user_name||"ناشناس", body.mobile||body.phone||"", body.totalPrice||body.total_amount||0, JSON.stringify(orderDetails)).run();
        return jsonRes({ success: true });
      }
      if (path.startsWith("/api/orders/") && method === "PUT") {
        const id = path.split("/").pop();
        const body = await request.json();
        await env.DB.prepare("UPDATE orders SET status=? WHERE id=?").bind(body.status||"completed", id).run();
        return jsonRes({ success: true });
      }

      // ================= نظرات =================
      if (path === "/api/reviews" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM reviews ORDER BY id DESC").all();
        return jsonRes(results || []);
      }
      if (path === "/api/reviews" && method === "POST") {
        const body = await request.json();
        await env.DB.prepare("INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)").bind(body.product_id||0, body.user_name||"کاربر", body.rating||5, body.comment||"").run();
        return jsonRes({ success: true });
      }
      if (path.startsWith("/api/reviews/") && method === "PUT") {
        const id = path.split("/").pop();
        const body = await request.json();
        await env.DB.prepare("UPDATE reviews SET reply=?, status=? WHERE id=?").bind(body.reply||"", "approved", id).run();
        return jsonRes({ success: true });
      }

      return jsonRes({ error: "Not Found" }, 404);
    } catch (err) { return jsonRes({ success: false, error: err.message }, 500); }
  }
};
