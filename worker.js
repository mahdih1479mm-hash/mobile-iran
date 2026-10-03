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

    const jsonRes = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

    try {
      const path = url.pathname;
      const method = request.method;

      // ==================== بخش محصولات ====================
      if (path === "/api/products" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM products ORDER BY id DESC").all();
        return jsonRes(results || []);
      }

      if (path === "/api/products" && method === "POST") {
        const body = await request.json();
        await env.DB.prepare(
          `INSERT INTO products (name, category, price, discount_price, section, image, description)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          body.name,
          body.category || "",
          body.price,
          body.discount_price || "",
          body.section || "normal",
          body.image || "",
          body.description || ""
        ).run();
        return jsonRes({ success: true, message: "محصول با موفقیت اضافه شد" });
      }

      if (path.startsWith("/api/products/") && method === "PUT") {
        const id = path.split("/").pop();
        const body = await request.json();
        await env.DB.prepare(
          `UPDATE products SET name=?, category=?, price=?, discount_price=?, section=?, image=?, description=? WHERE id=?`
        ).bind(
          body.name,
          body.category || "",
          body.price,
          body.discount_price || "",
          body.section || "normal",
          body.image || "",
          body.description || "",
          id
        ).run();
        return jsonRes({ success: true, message: "محصول با موفقیت به‌روزرسانی شد" });
      }

      if (path.startsWith("/api/products/") && method === "DELETE") {
        const id = path.split("/").pop();
        await env.DB.prepare("DELETE FROM products WHERE id=?").bind(id).run();
        return jsonRes({ success: true, message: "محصول با موفقیت حذف شد" });
      }

      // ==================== بخش کاربران ====================
      if (path === "/api/users/register" && method === "POST") {
        const body = await request.json();
        await env.DB.prepare(
          "INSERT INTO users (name, phone_or_email, password) VALUES (?, ?, ?)"
        ).bind(body.name, body.phone_or_email, body.password).run();
        return jsonRes({ success: true, message: "ثبت‌نام با موفقیت انجام شد" });
      }

      if (path === "/api/users/login" && method === "POST") {
        const body = await request.json();
        const { results } = await env.DB.prepare(
          "SELECT id, name, phone_or_email FROM users WHERE phone_or_email=? AND password=?"
        ).bind(body.phone_or_email, body.password).all();

        if (results && results.length > 0) {
          return jsonRes({ success: true, user: results[0] });
        } else {
          return jsonRes({ success: false, error: "اطلاعات ورود اشتباه است" }, 401);
        }
      }

      if (path === "/api/users" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT id, name, phone_or_email, created_at FROM users ORDER BY id DESC").all();
        return jsonRes(results || []);
      }

      // ==================== بخش سفارشات ====================
      if (path === "/api/orders" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM orders ORDER BY id DESC").all();
        return jsonRes(results || []);
      }

      if (path === "/api/orders" && method === "POST") {
        const body = await request.json();
        await env.DB.prepare(
          "INSERT INTO orders (user_name, phone, total_amount, items) VALUES (?, ?, ?, ?)"
        ).bind(body.user_name, body.phone, body.total_amount, JSON.stringify(body.items || [])).run();
        return jsonRes({ success: true, message: "سفارش ثبت شد" });
      }

      return jsonRes({ error: "Not Found" }, 404);
    } catch (err) {
      return jsonRes({ success: false, error: err.message }, 500);
    }
  }
};
