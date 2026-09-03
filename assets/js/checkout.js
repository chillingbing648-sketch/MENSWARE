const API = `${window.location.origin}/api`;
let cart = null;

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

function renderCart() {
  const element = document.getElementById("cart");
  const items = cart?.items || [];
  if (!items.length) {
    element.innerHTML = "<p>Your bag is empty.</p>";
    document.getElementById("form").hidden = true;
    return;
  }
  element.innerHTML = items.map((item) => `<div class="item"><span>${escapeHtml(item.product?.name || "Product")} × ${item.quantity}</span><span>₹${((item.product?.basePrice || 0) * item.quantity).toLocaleString("en-IN")}</span></div>`).join("");
}

function escapeHtml(value) { return String(value ?? "").replace(/[&<>\'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char])); }

async function init() {
  try { cart = (await api("/cart")).cart; renderCart(); }
  catch (error) { document.getElementById("cart").textContent = error.message; }
}

document.getElementById("form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = event.currentTarget.querySelector("button[type=submit]");
  submit.disabled = true;
  try {
    const items = (cart?.items || []).map((item) => ({ productId: item.product?._id, variantId: item.variantId || null, quantity: item.quantity }));
    const data = await api("/orders", {
      method: "POST",
      body: JSON.stringify({
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        items,
        shippingAddress: {
          addressLine1: document.getElementById("address").value,
          city: document.getElementById("city").value,
          state: document.getElementById("state").value,
          postalCode: document.getElementById("postalCode").value
        },
        paymentMethod: document.getElementById("payment").value
      })
    });
    await api("/cart", { method: "DELETE" });
    document.getElementById("cart").innerHTML = `<h2>Order confirmed</h2><p>Order: <strong>${escapeHtml(data.order.orderNumber)}</strong></p><p>Total: ₹${Number(data.order.total).toLocaleString("en-IN")}</p>`;
    document.getElementById("form").hidden = true;
  } catch (error) {
    alert(error.message);
    submit.disabled = false;
  }
});

init();
