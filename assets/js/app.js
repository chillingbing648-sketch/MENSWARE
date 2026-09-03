const API = window.MENSWARE_API_URL || (window.location.hostname.endsWith("github.io") ? null : `${window.location.origin}/api`);
const STATIC_CATALOG_URL = "assets/data/catalog.json";
const STATIC_CART_KEY = "mensware-static-cart";
const state = { products: [], user: null, staticMode: !API };

const esc = (value) => String(value ?? "").replace(/[&<>\'\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));

async function api(path, options = {}) {
  if (!API) throw new Error("The GitHub Pages preview is running in static catalog mode.");
  const response = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

async function loadStaticCatalog() {
  const response = await fetch(STATIC_CATALOG_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`Static catalog unavailable (${response.status})`);
  const products = await response.json();
  if (!Array.isArray(products)) throw new Error("Static catalog format is invalid");
  state.products = products.filter((product) => product.isActive !== false);
  state.staticMode = true;
  renderProducts();
}

async function loadProducts() {
  const query = document.getElementById("search").value.trim().toLowerCase();
  const selectedCategory = document.getElementById("category").value;
  const products = document.getElementById("products");
  products.innerHTML = '<div class="state">Loading MENSWARE catalog…</div>';

  try {
    if (!API) return await loadStaticCatalogAndFilter(query, selectedCategory);
    const data = await api(`/products?q=${encodeURIComponent(query)}&category=${encodeURIComponent(selectedCategory)}`);
    state.products = data.products || [];
    state.staticMode = false;
    renderProducts();
  } catch (error) {
    try {
      await loadStaticCatalogAndFilter(query, selectedCategory);
    } catch (fallbackError) {
      products.innerHTML = `<div class="state">Catalog unavailable. ${esc(fallbackError.message)}</div>`;
      console.error(error);
    }
  }
}

async function loadStaticCatalogAndFilter(query = "", selectedCategory = "") {
  const response = await fetch(STATIC_CATALOG_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`Static catalog unavailable (${response.status})`);
  const catalog = await response.json();
  if (!Array.isArray(catalog)) throw new Error("Static catalog format is invalid");
  state.products = catalog.filter((product) => {
    const haystack = `${product.name} ${product.description} ${product.category}`.toLowerCase();
    return product.isActive !== false && (!query || haystack.includes(query)) && (!selectedCategory || product.category === selectedCategory);
  });
  state.staticMode = true;
  renderProducts();
}

function getStaticCart() {
  try { return JSON.parse(localStorage.getItem(STATIC_CART_KEY) || "[]"); }
  catch { return []; }
}

function saveStaticCart(cart) {
  localStorage.setItem(STATIC_CART_KEY, JSON.stringify(cart));
  document.getElementById("cartCount").textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
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
    const action = state.staticMode
      ? `<button class="btn primary" type="button" ${variant ? "" : "disabled"} onclick="addStaticToCart('${product._id}','${variant?._id || ""}')">${variant ? "Add to Bag" : "Out of Stock"}</button>`
      : `<button class="btn primary" type="button" ${variant ? "" : "disabled"} onclick="addToCart('${product._id}','${variant?._id || ""}')">${variant ? "Add to Bag" : "Out of Stock"}</button>`;
    return `<article class="card">
      <img src="${esc(product.images?.[0] || "https://via.placeholder.com/500x400/111/aaa?text=MENSWARE")}" alt="${esc(product.name)}" loading="lazy">
      <h3>${esc(product.name)}</h3>
      <div class="price">₹${Number(price).toLocaleString("en-IN")}</div>
      <div class="actions">
        <button class="btn secondary" type="button" onclick="quick('${product._id}')">View</button>
        ${action}
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

function addStaticToCart(productId, variantId) {
  const product = state.products.find((item) => item._id === productId);
  if (!product) return;
  const cart = getStaticCart();
  const existing = cart.find((item) => item.productId === productId && item.variantId === (variantId || null));
  if (existing) existing.quantity = Math.min(existing.quantity + 1, 20);
  else cart.push({ productId, variantId: variantId || null, name: product.name, price: product.variants?.find((v) => v._id === variantId)?.price ?? product.basePrice, image: product.images?.[0] || null, quantity: 1 });
  saveStaticCart(cart);
  alert("Added to bag. Static preview cart is saved in this browser.");
}

async function loadCart() {
  if (!API) {
    saveStaticCart(getStaticCart());
    return;
  }
  try {
    const data = await api("/cart");
    document.getElementById("cartCount").textContent = (data.cart?.items || []).reduce((sum, item) => sum + item.quantity, 0);
  } catch { document.getElementById("cartCount").textContent = "0"; }
}

async function quick(id) {
  try {
    const product = state.products.find((item) => item._id === id) || (await api(`/products/${encodeURIComponent(id)}`)).product;
    const variant = product.variants?.find((item) => item.isActive && item.stock > 0);
    document.getElementById("modalTitle").textContent = product.name;
    const action = state.staticMode
      ? `<button class="btn primary" type="button" ${variant ? "" : "disabled"} onclick="addStaticToCart('${product._id}','${variant?._id || ""}');closeModal()">${variant ? "Add to Bag" : "Out of Stock"}</button>`
      : `<button class="btn primary" type="button" ${variant ? "" : "disabled"} onclick="addToCart('${product._id}','${variant?._id || ""}');closeModal()">${variant ? "Add to Bag" : "Out of Stock"}</button>`;
    document.getElementById("modalBody").innerHTML = `<p>${esc(product.description || "Premium MENSWARE accessory.")}</p><p class="price">From ₹${Number(product.basePrice).toLocaleString("en-IN")}</p>${action}`;
    document.getElementById("modal").classList.add("show");
  } catch (error) { alert(error.message); }
}

function closeModal() { document.getElementById("modal").classList.remove("show"); }

function auth() {
  if (!API) {
    alert("Account login is available on the full-stack deployment. GitHub Pages provides the static catalog preview.");
    return;
  }
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
  if (!API) {
    account.innerHTML = `<button class="btn secondary" type="button" onclick="auth()">Preview</button>`;
    return;
  }
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
