const API = `${window.location.origin}/api`;
const state = { products: [], user: null };

const esc = (value) => String(value ?? "").replace(/[&<>\'"]/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
}[char]));

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

async function loadProducts() {
  const search = encodeURIComponent(document.getElementById("search").value.trim());
  const category = encodeURIComponent(document.getElementById("category").value);
  const products = document.getElementById("products");
  try {
    const data = await api(`/products?q=${search}&category=${category}`);
    state.products = data.products || [];
    renderProducts();
  } catch (error) {
    products.innerHTML = `<div class="state">Catalog unavailable. Check the MENSWARE API.</div>`;
  }
}

function renderProducts() {
  const element = document.getElementById("products");
  if (!state.products.length) {
    element.innerHTML = '<div class="state">No products found.</div>';
    return;
  }
  element.innerHTML = state.products.map((product) => {
    const variant = product.variants?.find((item) => item.isActive && item.stock > 0);
    const price = variant?.price ?? product.basePrice;
    return `<article class="card">
      <img src="${esc(product.images?.[0] || "https://via.placeholder.com/500x400/111/aaa?text=MENSWARE")}" alt="${esc(product.name)}" loading="lazy">
      <h3>${esc(product.name)}</h3>
      <div class="price">₹${Number(price).toLocaleString("en-IN")}</div>
      <div class="actions">
        <button class="btn secondary" type="button" onclick="quick('${product._id}')">View</button>
        <button class="btn primary" type="button" ${variant ? "" : "disabled"} onclick="addToCart('${product._id}','${variant?._id || ""}')">${variant ? "Add to Bag" : "Out of Stock"}</button>
      </div>
    </article>`;
  }).join("");
}

async function addToCart(productId, variantId) {
  try {
    await api("/cart/items", { method: "POST", body: JSON.stringify({ productId, variantId: variantId || null, quantity: 1 }) });
    await loadCart();
    alert("Added to bag.");
  } catch (error) { alert(error.message); }
}

async function loadCart() {
  try {
    const data = await api("/cart");
    document.getElementById("cartCount").textContent = (data.cart?.items || []).reduce((sum, item) => sum + item.quantity, 0);
  } catch { document.getElementById("cartCount").textContent = "0"; }
}

async function quick(id) {
  try {
    const { product } = await api(`/products/${encodeURIComponent(id)}`);
    const variant = product.variants?.find((item) => item.isActive && item.stock > 0);
    document.getElementById("modalTitle").textContent = product.name;
    document.getElementById("modalBody").innerHTML = `<p>${esc(product.description || "Premium MENSWARE accessory.")}</p><p class="price">From ₹${Number(product.basePrice).toLocaleString("en-IN")}</p><button class="btn primary" type="button" ${variant ? "" : "disabled"} onclick="addToCart('${product._id}','${variant?._id || ""}');closeModal()">${variant ? "Add to Bag" : "Out of Stock"}</button>`;
    document.getElementById("modal").classList.add("show");
  } catch (error) { alert(error.message); }
}

function closeModal() { document.getElementById("modal").classList.remove("show"); }

function auth() {
  document.getElementById("modalTitle").textContent = "MENSWARE Account";
  document.getElementById("modalBody").innerHTML = `<input id="aName" placeholder="Name" autocomplete="name"><input id="aEmail" type="email" placeholder="Email" autocomplete="email"><input id="aPassword" type="password" placeholder="Password (8+ characters)" autocomplete="current-password"><div class="actions"><button class="btn primary" type="button" onclick="register()">Register</button><button class="btn secondary" type="button" onclick="login()">Login</button></div>`;
  document.getElementById("modal").classList.add("show");
}

async function register() {
  try {
    const data = await api("/auth/register", { method: "POST", body: JSON.stringify({ name: document.getElementById("aName").value, email: document.getElementById("aEmail").value, password: document.getElementById("aPassword").value }) });
    state.user = data.user; closeModal(); renderAccount(); await loadCart();
  } catch (error) { alert(error.message); }
}

async function login() {
  try {
    const data = await api("/auth/login", { method: "POST", body: JSON.stringify({ email: document.getElementById("aEmail").value, password: document.getElementById("aPassword").value }) });
    state.user = data.user; closeModal(); renderAccount(); await loadCart();
  } catch (error) { alert(error.message); }
}

async function logout() {
  try { await api("/auth/logout", { method: "POST" }); }
  finally { state.user = null; renderAccount(); loadCart(); }
}

async function renderAccount() {
  const account = document.getElementById("account");
  try { state.user = (await api("/auth/me")).user; } catch { state.user = null; }
  account.innerHTML = state.user
    ? `<button class="btn secondary" type="button" onclick="logout()">Logout</button>`
    : `<button class="btn primary" type="button" onclick="auth()">Account</button>`;
}

document.getElementById("search").addEventListener("input", loadProducts);
document.getElementById("category").addEventListener("change", loadProducts);
document.getElementById("modal").addEventListener("click", (event) => { if (event.target.id === "modal") closeModal(); });

loadProducts();
loadCart();
renderAccount();
