/* ============================================================================
   HOUSE OF PALAY — CHECKOUT, PAYFAST HANDOFF & ORDER CONFIRMATION
   ============================================================================

   IMPORTANT:
   The browser does NOT mark a payment as approved.
   New orders are emailed to the owner through FormSubmit after Make accepts
   the order, while PayFast ITN remains responsible for confirming PAID status.

   WHAT YOU PASTE LATER:
   Open store-data.js and paste your Make webhook URLs in:
   - makeCreateOrderWebhook
   - payFastNotifyWebhook

   Order flow:
   Checkout browser -> Make Create Order / Excel -> FormSubmit order email -> PayFast
   -> PayFast ITN -> Make verifies -> Excel row marked Paid.
   ============================================================================ */

(() => {
  "use strict";

  const Store = window.HOPStore;
  if (!Store) return;

  const CONFIG = Store.config || {};
  const $ = id => document.getElementById(id);
  const page = document.body.dataset.orderPage || "";

  /* ------------------------------- Utilities ------------------------------- */
  function normalizeText(value = "") {
    return String(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  /* Used by both the thank-you preview and the downloaded receipt.
     Keeping it here prevents a missing helper from stopping the receipt from rendering. */
  function formatDate(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return new Intl.DateTimeFormat(CONFIG.locale || "en-ZA", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  }

  function generateOrderNumber() {
    const now = new Date();
    const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("");
    let random;
    if (window.crypto?.getRandomValues) {
      const bytes = new Uint32Array(1);
      window.crypto.getRandomValues(bytes);
      random = (bytes[0] % 100000).toString().padStart(5, "0");
    } else {
      random = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
    }
    return `${CONFIG.orderPrefix || "HOP"}-${date}-${random}`;
  }

  function getSiteBaseUrl() {
    const configured = String(CONFIG.siteUrl || "").trim().replace(/\/$/, "");
    if (configured) return configured;
    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
      const path = window.location.pathname;
      const basePath = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
      return `${window.location.origin}${basePath}`.replace(/\/$/, "");
    }
    return "";
  }

  function savePendingOrder(order) {
    localStorage.setItem("houseOfPalayPendingOrder", JSON.stringify(order));
  }

  function getPendingOrder() {
    try {
      return JSON.parse(localStorage.getItem("houseOfPalayPendingOrder") || "null");
    } catch {
      return null;
    }
  }

  function saveLastOrderNumber(orderNumber) {
    localStorage.setItem("houseOfPalayLastOrderNumber", orderNumber);
  }

  /* Keep the displayed order number stable when checkout is refreshed.
     A fresh number is created when the cart represents a new order or the
     previous checkout lock is older than 24 hours. */
  const CHECKOUT_SESSION_KEY = "houseOfPalayCheckoutSession";

  function getCheckoutSession() {
    try {
      return JSON.parse(localStorage.getItem(CHECKOUT_SESSION_KEY) || "null");
    } catch {
      return null;
    }
  }

  function saveCheckoutSession(orderNumber, fingerprint) {
    localStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify({
      orderNumber,
      fingerprint,
      lockedAt: Date.now()
    }));
  }

  function clearCheckoutSession() {
    localStorage.removeItem(CHECKOUT_SESSION_KEY);
  }

  function getLockedOrderNumber(fingerprint) {
    const session = getCheckoutSession();
    const maxAge = 24 * 60 * 60 * 1000;
    const validSession = session?.orderNumber
      && session?.fingerprint === fingerprint
      && Number(session?.lockedAt || 0) > Date.now() - maxAge;

    if (validSession) return session.orderNumber;

    const pending = getPendingOrder();
    if (pending?.orderNumber && pending?.cartFingerprint === fingerprint) {
      saveCheckoutSession(pending.orderNumber, fingerprint);
      return pending.orderNumber;
    }

    const orderNumber = generateOrderNumber();
    saveCheckoutSession(orderNumber, fingerprint);
    return orderNumber;
  }

  function buildItemPayload() {
    return Store.getCartDetails().map(item => ({
      productId: item.product.id,
      name: item.product.name,
      category: item.product.category,
      option: item.selections?.option || item.option || "",
      size: item.selections?.size || "",
      color: item.selections?.color || "",
      selected: item.selectionSummary || Store.selectionSummary?.(item.product, item.selections) || "Standard",
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice.toFixed(2)),
      lineTotal: Number(item.lineTotal.toFixed(2)),
      image: item.product.image
    }));
  }

  function getFreeAreaFromText(text) {
    const normalized = normalizeText(text);
    if (!normalized) return null;

    return (CONFIG.freeDeliveryAreas || []).find(area => {
      const values = [area.label, ...(area.aliases || [])].map(normalizeText);
      return values.some(alias => alias === normalized || (alias.length > 3 && normalized.includes(alias)));
    }) || null;
  }

  function calculateDeliveryFee(zoneValue, customArea = "") {
    if (!zoneValue) return Number(CONFIG.deliveryFee || 0);
    if (zoneValue !== "other") return 0;
    return getFreeAreaFromText(customArea) ? 0 : Number(CONFIG.deliveryFee || 0);
  }

  function getDeliveryLabel(zoneValue, customArea = "") {
    if (zoneValue === "other") return customArea.trim() || "Other area";
    const area = (CONFIG.freeDeliveryAreas || []).find(item => item.id === zoneValue);
    return area?.label || zoneValue || "";
  }

  async function postJson(url, payload) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      throw new Error(data.message || `Request failed (${response.status})`);
    }
    return data;
  }

  function formatMoneyForEmail(value) {
    const amount = Number(value || 0);
    return Store.currency?.format ? Store.currency.format(amount) : `R${amount.toFixed(2)}`;
  }

  function buildOrderEmailItems(order) {
    return (order.items || []).map((item, index) => {
      const details = [];
      if (item.size) details.push(`Size: ${item.size}`);
      if (item.color) details.push(`Colour: ${item.color}`);
      if (item.option && item.option !== "Standard") details.push(item.option);
      if (!details.length && item.selected && item.selected !== "Standard") details.push(item.selected);

      const variant = details.length ? ` (${details.join(" · ")})` : "";
      return `${index + 1}. ${item.name}${variant} — Qty ${item.quantity} × ${formatMoneyForEmail(item.unitPrice)} = ${formatMoneyForEmail(item.lineTotal)}`;
    }).join("\n");
  }

  async function sendOrderToFormSubmit(order) {
    const storeEmail = String(CONFIG.formSubmitEmail || "").trim();
    if (!storeEmail || storeEmail === "YOUR_EMAIL_HERE") return { skipped: true };

    /* Prevent accidental duplicate emails if the customer double-clicks Pay or
       returns to checkout and retries the same locked order number. */
    const sentKey = `houseOfPalayFormSubmitSent:${order.orderNumber}`;
    if (localStorage.getItem(sentKey) === "1") return { skipped: true, duplicate: true };

    const customerName = `${order.customer?.firstName || ""} ${order.customer?.surname || ""}`.trim();
    const deliveryAddress = [
      order.delivery?.address,
      order.delivery?.suburb,
      order.delivery?.area,
      order.delivery?.postalCode
    ].filter(Boolean).join(", ");

    const formData = new FormData();
    formData.append("_subject", `New House of Palay Order — ${order.orderNumber}`);
    formData.append("_captcha", "false");
    formData.append("_template", "table");
    if (order.customer?.email) {
      formData.append("email", order.customer.email);
      formData.append("_replyto", order.customer.email);
    }

    formData.append("Order Number", order.orderNumber || "");
    formData.append("Customer Name", customerName || "Not provided");
    formData.append("Customer Email", order.customer?.email || "Not provided");
    formData.append("Customer Phone", order.customer?.phone || "Not provided");
    formData.append("Date", order.createdAt ? new Date(order.createdAt).toLocaleString(CONFIG.locale || "en-ZA") : new Date().toLocaleString(CONFIG.locale || "en-ZA"));
    formData.append("Delivery Area", order.delivery?.area || "");
    formData.append("Delivery Address", deliveryAddress || "Not provided");
    formData.append("Products", buildOrderEmailItems(order) || "No products");
    formData.append("Subtotal", formatMoneyForEmail(order.pricing?.subtotal));
    formData.append("Service Fee", formatMoneyForEmail(order.pricing?.serviceFee));
    formData.append("Delivery Fee", Number(order.pricing?.deliveryFee || 0) === 0 ? "FREE" : formatMoneyForEmail(order.pricing?.deliveryFee));
    formData.append("Order Total", formatMoneyForEmail(order.pricing?.total));
    formData.append("Payment Method", "PayFast");
    formData.append("Payment Status", "Pending PayFast Payment");
    if (order.notes) formData.append("Customer Notes", order.notes);

    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(storeEmail)}`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData
    });

    if (!response.ok) {
      let message = "FormSubmit order email failed";
      try {
        const data = await response.json();
        message = data?.message || message;
      } catch {
        /* Keep the generic message. */
      }
      throw new Error(message);
    }

    localStorage.setItem(sentKey, "1");
    return { sent: true };
  }

  function submitPayFastForm(action, fields) {
    /* PayFast accepts a normal POST form. Make.com should create the secure
       signed fields and return them. The PayFast passphrase stays in Make. */
    const form = document.createElement("form");
    form.method = "POST";
    form.action = action;
    form.style.display = "none";

    Object.entries(fields || {}).forEach(([name, value]) => {
      if (value == null || value === "") return;
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }

  /* -------------------------------- Checkout -------------------------------- */
  function initCheckout() {
    const form = $("checkoutPageForm");
    if (!form) return;

    const cartDetails = Store.getCartDetails();
    if (!cartDetails.length) {
      $("checkoutEmpty")?.classList.remove("hidden");
      $("checkoutContent")?.classList.add("hidden");
      return;
    }

    const areaSelect = $("deliveryAreaSelect");
    const customAreaWrap = $("customAreaWrap");
    const customArea = $("customArea");
    const orderNumberField = $("checkoutOrderNumber");
    const submitButton = $("payNowButton");
    const statusMessage = $("checkoutStatus");

    const fingerprint = cartFingerprint();
    const orderNumber = getLockedOrderNumber(fingerprint);

    if (orderNumberField) orderNumberField.textContent = orderNumber;

    populateDeliveryOptions(areaSelect);
    renderCheckoutItems();
    updateCheckoutTotals();

    areaSelect?.addEventListener("change", () => {
      const other = areaSelect.value === "other";
      customAreaWrap?.classList.toggle("hidden", !other);
      if (customArea) customArea.required = other;
      updateCheckoutTotals();
    });

    customArea?.addEventListener("input", updateCheckoutTotals);

    document.addEventListener("hop:cart-updated", () => {
      if (!Store.getCartDetails().length) {
        window.location.reload();
        return;
      }
      renderCheckoutItems();
      updateCheckoutTotals();
    });

    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const zoneValue = areaSelect?.value || "";
      const customAreaValue = customArea?.value || "";
      const subtotal = Store.getCartSubtotal();
      const serviceFee = Number(CONFIG.serviceFee || 0);
      const deliveryFee = calculateDeliveryFee(zoneValue, customAreaValue);
      const total = subtotal + serviceFee + deliveryFee;
      const baseUrl = getSiteBaseUrl();

      const formData = new FormData(form);
      const order = {
        action: "create_order",
        orderNumber,
        createdAt: new Date().toISOString(),
        cartFingerprint: cartFingerprint(),
        source: "House of Palay website",
        customer: {
          firstName: String(formData.get("firstName") || "").trim(),
          surname: String(formData.get("surname") || "").trim(),
          email: String(formData.get("email") || "").trim(),
          phone: String(formData.get("phone") || "").trim()
        },
        delivery: {
          zoneId: zoneValue,
          area: getDeliveryLabel(zoneValue, customAreaValue),
          address: String(formData.get("address") || "").trim(),
          suburb: String(formData.get("suburb") || "").trim(),
          postalCode: String(formData.get("postalCode") || "").trim(),
          fee: Number(deliveryFee.toFixed(2)),
          isFree: deliveryFee === 0
        },
        notes: String(formData.get("notes") || "").trim(),
        items: buildItemPayload(),
        pricing: {
          subtotal: Number(subtotal.toFixed(2)),
          serviceFee: Number(serviceFee.toFixed(2)),
          deliveryFee: Number(deliveryFee.toFixed(2)),
          total: Number(total.toFixed(2)),
          currency: CONFIG.currency || "ZAR"
        },
        urls: {
          returnUrl: baseUrl ? `${baseUrl}/thankyou.html?order=${encodeURIComponent(orderNumber)}` : "",
          cancelUrl: baseUrl ? `${baseUrl}/checkout.html?cancelled=1&order=${encodeURIComponent(orderNumber)}` : "",
          notifyUrl: String(CONFIG.payFastNotifyWebhook || "").trim()
        }
      };

      savePendingOrder(order);
      saveLastOrderNumber(orderNumber);

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Preparing secure payment…";
      }
      if (statusMessage) statusMessage.textContent = "Preparing your secure PayFast checkout…";

      const createWebhook = String(CONFIG.makeCreateOrderWebhook || "").trim();

      if (!createWebhook) {
        if (CONFIG.demoMode === true) {
          const demoOrder = { ...order, demoMode: true };
          savePendingOrder(demoOrder);
          window.location.href = `thankyou.html?order=${encodeURIComponent(orderNumber)}&demo=1`;
          return;
        }

        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Continue to secure payment";
        }
        if (statusMessage) {
          statusMessage.textContent = "Payment is not connected yet. Paste your Make Create Order webhook into store-data.js before launch.";
        }
        return;
      }

      try {
        const response = await postJson(createWebhook, order);

        if (response.orderNumber && response.orderNumber !== orderNumber) {
          order.orderNumber = response.orderNumber;
          savePendingOrder(order);
          saveLastOrderNumber(response.orderNumber);
          saveCheckoutSession(response.orderNumber, order.cartFingerprint);
        }

        /* Email the order to the owner once Make has accepted/stored it.
           A FormSubmit failure must NEVER stop the customer from reaching PayFast. */
        try {
          if (statusMessage) statusMessage.textContent = "Order saved. Sending order notification…";
          await sendOrderToFormSubmit(order);
        } catch (emailError) {
          console.warn("House of Palay order email could not be sent:", emailError);
        }

        if (statusMessage) statusMessage.textContent = "Opening secure PayFast checkout…";

        /* Make can reply in any ONE of these supported ways:
           A) { paymentUrl: "https://..." }
           B) { redirectUrl: "https://..." }
           C) { payfast: { action: "https://.../eng/process", fields: {...} } }
        */
        const redirectUrl = response.paymentUrl || response.redirectUrl;
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }

        if (response.payfast?.action && response.payfast?.fields) {
          submitPayFastForm(response.payfast.action, response.payfast.fields);
          return;
        }

        throw new Error("Make did not return PayFast payment data. Check the Make response mapping.");
      } catch (error) {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Continue to secure payment";
        }
        if (statusMessage) statusMessage.textContent = error.message || "Could not start payment. Please try again.";
      }
    });

    const cancelled = new URLSearchParams(window.location.search).get("cancelled");
    if (cancelled === "1" && statusMessage) {
      statusMessage.textContent = "Payment was cancelled. Your bag is still saved, so you can try again.";
    }
  }

  function populateDeliveryOptions(select) {
    if (!select) return;
    const freeOptions = (CONFIG.freeDeliveryAreas || []).map(area =>
      `<option value="${Store.escapeAttribute(area.id)}">${Store.escapeHTML(area.label)} — FREE delivery</option>`
    ).join("");

    select.innerHTML = `
      <option value="">Select delivery area</option>
      ${freeOptions}
      <option value="other">Other area — ${Store.escapeHTML(Store.currency.format(Number(CONFIG.deliveryFee || 0)))} delivery</option>`;
  }

  function renderCheckoutItems() {
    const container = $("checkoutPageItems");
    if (!container) return;

    container.innerHTML = Store.getCartDetails().map(item => `
      <div class="checkout-page-item">
        <img src="${Store.escapeAttribute(item.product.image)}" alt="${Store.escapeAttribute(item.product.name)}" />
        <div>
          <h3>${Store.escapeHTML(item.product.name)}</h3>
          <p>${Store.escapeHTML(item.option)} · Qty ${item.quantity}</p>
        </div>
        <strong>${Store.currency.format(item.lineTotal)}</strong>
      </div>`).join("");
  }

  function updateCheckoutTotals() {
    const areaSelect = $("deliveryAreaSelect");
    const customArea = $("customArea");
    const subtotal = Store.getCartSubtotal();
    const serviceFee = Number(CONFIG.serviceFee || 0);
    const deliveryFee = calculateDeliveryFee(areaSelect?.value || "", customArea?.value || "");
    const total = subtotal + serviceFee + deliveryFee;

    if ($("checkoutSubtotal")) $("checkoutSubtotal").textContent = Store.currency.format(subtotal);
    if ($("checkoutServiceFee")) $("checkoutServiceFee").textContent = Store.currency.format(serviceFee);
    if ($("checkoutDeliveryFee")) $("checkoutDeliveryFee").textContent = deliveryFee === 0 ? "FREE" : Store.currency.format(deliveryFee);
    if ($("checkoutGrandTotal")) $("checkoutGrandTotal").textContent = Store.currency.format(total);

    const note = $("deliveryFeeNote");
    if (note) {
      if (!areaSelect?.value) note.textContent = "Choose an area to calculate delivery.";
      else if (deliveryFee === 0) note.textContent = "Free delivery applies to this area.";
      else note.textContent = `${Store.currency.format(deliveryFee)} delivery applies outside the free-delivery areas.`;
    }
  }

  function cartFingerprint() {
    return Store.getCartDetails()
      .map(item => `${item.product.id}:${item.selectionSummary || item.option}:${item.quantity}:${item.unitPrice}`)
      .join("|");
  }


  /* ------------------------------- Thank you -------------------------------- */
  const LAST_RECEIPT_KEY = "houseOfPalayLastReceipt";

  function saveLastReceipt(order) {
    localStorage.setItem(LAST_RECEIPT_KEY, JSON.stringify(order));
  }

  function getLastReceipt() {
    try {
      return JSON.parse(localStorage.getItem(LAST_RECEIPT_KEY) || "null");
    } catch {
      return null;
    }
  }

  function money(value) {
    return Store.currency.format(Number(value || 0)).replace(/\u00a0/g, " ");
  }

  function receiptCustomerName(order) {
    return [order?.customer?.firstName, order?.customer?.surname].filter(Boolean).join(" ").trim() || "Customer";
  }

  function receiptDeliveryAddress(order) {
    return [
      order?.delivery?.address,
      order?.delivery?.suburb,
      order?.delivery?.area,
      order?.delivery?.postalCode
    ].filter(Boolean).join(", ") || "Not provided";
  }

  function receiptItemDescription(item) {
    const chosen = item?.selected || [item?.size, item?.color, item?.option].filter(Boolean).join(" · ");
    return chosen && chosen !== "Standard" ? chosen : "Standard";
  }

  function renderReceiptPreview(order) {
    const itemsContainer = $("receiptItems");
    const serviceFeeRow = $("receiptServiceFeeRow");
    const items = Array.isArray(order?.items) ? order.items : [];
    const pricing = order?.pricing || {};

    if ($("receiptOrderNumber")) $("receiptOrderNumber").textContent = order?.orderNumber || "—";
    if ($("receiptCustomer")) $("receiptCustomer").textContent = receiptCustomerName(order);
    if ($("receiptEmail")) $("receiptEmail").textContent = order?.customer?.email || "Not provided";
    if ($("receiptPhone")) $("receiptPhone").textContent = order?.customer?.phone || "Not provided";
    if ($("receiptDeliveryArea")) $("receiptDeliveryArea").textContent = order?.delivery?.area || "Not provided";
    if ($("receiptDeliveryAddress")) $("receiptDeliveryAddress").textContent = receiptDeliveryAddress(order);
    if ($("receiptDate")) $("receiptDate").textContent = formatDate(order?.createdAt || new Date().toISOString());
    if ($("receiptSubtotal")) $("receiptSubtotal").textContent = money(pricing.subtotal);
    if ($("receiptDeliveryFee")) $("receiptDeliveryFee").textContent = Number(pricing.deliveryFee || 0) === 0 ? "FREE" : money(pricing.deliveryFee);
    if ($("receiptServiceFee")) $("receiptServiceFee").textContent = money(pricing.serviceFee);
    if ($("receiptTotal")) $("receiptTotal").textContent = money(pricing.total);

    /* Always keep the service-fee line visible, including when it is R0.00. */
    if (serviceFeeRow) serviceFeeRow.classList.remove("hidden");

    if (itemsContainer) {
      if (!items.length) {
        itemsContainer.innerHTML = `<p class="receipt-empty">The full product list is not available in this browser. Keep your order number for support.</p>`;
      } else {
        itemsContainer.innerHTML = items.map(item => `
          <div class="receipt-item-row">
            <div class="receipt-item-copy">
              <strong>${Store.escapeHTML(item.name || "Product")}</strong>
              <span>${Store.escapeHTML(receiptItemDescription(item))}</span>
            </div>
            <span class="receipt-item-qty">Qty ${Number(item.quantity || 0)}</span>
            <span class="receipt-item-unit">${money(item.unitPrice)}</span>
            <strong class="receipt-item-total">${money(item.lineTotal)}</strong>
          </div>
        `).join("");
      }
    }
  }

  function configureThankYouWhatsApp(orderNumber) {
    const button = $("thankYouWhatsapp");
    const help = $("thankYouHelp");
    if (!button) return;

    const number = String(CONFIG.whatsappNumber || "").replace(/\D/g, "");
    if (!number) {
      button.hidden = true;
      const email = String(CONFIG.contactEmail || CONFIG.formSubmitEmail || "").trim();
      if (help) {
        help.innerHTML = email
          ? `Need help with your order? Email <a href="mailto:${Store.escapeAttribute(email)}">${Store.escapeHTML(email)}</a>.`
          : "Keep your order number safe in case you need assistance.";
      }
      return;
    }

    const message = [
      "Hi House of Palay,",
      `I would like help with order ${orderNumber || ""}.`
    ].join(" ");

    button.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }

  function downloadReceiptAsHtml(order) {
    const items = Array.isArray(order?.items) ? order.items : [];
    const pricing = order?.pricing || {};
    const rows = items.map(item => `
      <tr>
        <td>${Store.escapeHTML(item.name || "Product")}<br><small>${Store.escapeHTML(receiptItemDescription(item))}</small></td>
        <td>${Number(item.quantity || 0)}</td>
        <td>${Store.escapeHTML(money(item.unitPrice))}</td>
        <td>${Store.escapeHTML(money(item.lineTotal))}</td>
      </tr>`).join("");

    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>House of Palay Receipt</title>
<style>
body{font-family:Arial,sans-serif;color:#171512;padding:32px;max-width:760px;margin:auto}
h1{font-family:Georgia,serif;margin-bottom:4px}.muted{color:#6f665c}
table{width:100%;border-collapse:collapse;margin:24px 0}th,td{padding:10px;border-bottom:1px solid #ddd;text-align:left}th:nth-child(n+2),td:nth-child(n+2){text-align:right}
.total{font-size:20px;font-weight:700}.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:20px 0}.paid{color:#315b35;font-weight:700}
</style></head><body>
<h1>House of Palay</h1><p class="muted">Home of Queens</p>
<div class="meta"><div><strong>Order:</strong> ${Store.escapeHTML(order.orderNumber || "")}</div><div><strong>Purchase date:</strong> ${Store.escapeHTML(formatDate(order.createdAt || new Date().toISOString()))}</div><div><strong>Customer:</strong> ${Store.escapeHTML(receiptCustomerName(order))}</div><div><strong>Email:</strong> ${Store.escapeHTML(order?.customer?.email || "Not provided")}</div><div><strong>Phone / WhatsApp:</strong> ${Store.escapeHTML(order?.customer?.phone || "Not provided")}</div><div><strong>Delivery area:</strong> ${Store.escapeHTML(order?.delivery?.area || "Not provided")}</div><div><strong>Delivery address:</strong> ${Store.escapeHTML(receiptDeliveryAddress(order))}</div><div><strong>Payment:</strong> PayFast · <span class="paid">Paid</span></div></div>
<table><thead><tr><th>Product</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
<p>Subtotal: <strong>${Store.escapeHTML(money(pricing.subtotal))}</strong></p>
<p>Service fee: <strong>${Store.escapeHTML(money(pricing.serviceFee))}</strong></p>
<p>Delivery fee: <strong>${Number(pricing.deliveryFee || 0) === 0 ? "FREE" : Store.escapeHTML(money(pricing.deliveryFee))}</strong></p>
<p class="total">Total paid: ${Store.escapeHTML(money(pricing.total))}</p>
<p class="muted">Thank you for shopping with House of Palay.</p>
</body></html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `House-of-Palay-Receipt-${order.orderNumber || "order"}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadReceiptPdf(order) {
    const jsPDF = window.jspdf?.jsPDF;
    if (!jsPDF) {
      downloadReceiptAsHtml(order);
      return;
    }

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const left = 18;
    const right = 192;
    const pageBottom = 280;
    let y = 20;

    const addLine = (text, options = {}) => {
      const size = options.size || 10;
      const weight = options.bold ? "bold" : "normal";
      doc.setFont("helvetica", weight);
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(String(text), options.width || 174);
      if (y + lines.length * 5 > pageBottom) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines, left, y);
      y += lines.length * (options.leading || 5);
    };

    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.text("HOUSE OF PALAY", left, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Home of Queens", left, y);
    y += 10;

    addLine(`Order number: ${order.orderNumber || ""}`, { bold: true });
    addLine(`Purchase date: ${formatDate(order.createdAt || new Date().toISOString())}`);
    addLine(`Customer: ${receiptCustomerName(order)}`);
    addLine(`Email: ${order?.customer?.email || "Not provided"}`);
    addLine(`Phone / WhatsApp: ${order?.customer?.phone || "Not provided"}`);
    addLine(`Delivery area: ${order?.delivery?.area || "Not provided"}`);
    addLine(`Delivery address: ${receiptDeliveryAddress(order)}`);
    addLine("Payment method: PayFast");
    addLine("Payment status: Paid", { bold: true });
    y += 3;

    doc.setDrawColor(200);
    doc.line(left, y, right, y);
    y += 7;

    const items = Array.isArray(order?.items) ? order.items : [];
    items.forEach((item, index) => {
      addLine(`${index + 1}. ${item.name || "Product"}`, { bold: true, width: 130 });
      addLine(receiptItemDescription(item), { size: 9, width: 130 });
      addLine(`Quantity: ${Number(item.quantity || 0)}    Unit price: ${money(item.unitPrice)}    Line total: ${money(item.lineTotal)}`, { size: 9 });
      y += 2;
    });

    doc.line(left, y, right, y);
    y += 7;

    const pricing = order?.pricing || {};
    addLine(`Subtotal: ${money(pricing.subtotal)}`);
    addLine(`Service fee: ${money(pricing.serviceFee)}`);
    addLine(`Delivery fee: ${Number(pricing.deliveryFee || 0) === 0 ? "FREE" : money(pricing.deliveryFee)}`);
    addLine(`TOTAL PAID: ${money(pricing.total)}`, { bold: true, size: 13 });
    y += 5;
    addLine("Thank you for shopping with House of Palay.", { size: 10 });

    doc.save(`House-of-Palay-Receipt-${order.orderNumber || "order"}.pdf`);
  }

  function initThankYou() {
    const params = new URLSearchParams(window.location.search);
    const pending = getPendingOrder();
    const previousReceipt = getLastReceipt();
    const orderNumber = params.get("order")
      || pending?.orderNumber
      || localStorage.getItem("houseOfPalayLastOrderNumber")
      || previousReceipt?.orderNumber
      || "";

    const orderLabel = $("thankYouOrderNumber");
    const statusBox = $("thankYouStatus");
    const downloadButton = $("downloadReceiptButton");

    if (orderLabel) orderLabel.textContent = orderNumber || "Order number unavailable";
    configureThankYouWhatsApp(orderNumber);

    let receiptOrder = null;
    if (pending?.orderNumber && (!orderNumber || pending.orderNumber === orderNumber)) {
      receiptOrder = {
        ...pending,
        orderNumber: pending.orderNumber || orderNumber,
        payment: {
          method: "PayFast",
          status: "Paid",
          recordedAt: new Date().toISOString()
        }
      };
      saveLastReceipt(receiptOrder);

      /* The customer-facing receipt is created from the order saved before the
         PayFast handoff. Fulfilment/payment truth still belongs to PayFast ITN
         -> Make -> Excel, not to this browser page. */
      Store.clearCart();
      localStorage.removeItem("houseOfPalayPendingOrder");
      clearCheckoutSession();
    } else if (previousReceipt?.orderNumber && (!orderNumber || previousReceipt.orderNumber === orderNumber)) {
      receiptOrder = previousReceipt;
    }

    if (!orderNumber) {
      if (statusBox) {
        statusBox.className = "thankyou-status pending";
        statusBox.innerHTML = `<strong>Order number unavailable.</strong><span>Please contact House of Palay and we will help you.</span>`;
      }
    } else if (!receiptOrder) {
      if (statusBox) {
        statusBox.className = "thankyou-status pending";
        statusBox.innerHTML = `<strong>Payment return received.</strong><span>Your order number is available, but this browser no longer has the full receipt details. Contact us with your order number for help.</span>`;
      }
    } else {
      renderReceiptPreview(receiptOrder);
      if (statusBox) {
        statusBox.className = "thankyou-status success";
        statusBox.innerHTML = `<strong>Payment received.</strong><span>Your receipt is ready. House of Palay also uses the PayFast ITN confirmation in Make/Excel for fulfilment.</span>`;
      }
    }

    if (downloadButton) {
      downloadButton.disabled = !receiptOrder;
      downloadButton.addEventListener("click", () => {
        if (receiptOrder) downloadReceiptPdf(receiptOrder);
      });
    }
  }

  /* --------------------------------- Start ---------------------------------- */
  if (page === "checkout") initCheckout();
  if (page === "thankyou") initThankYou();
})();
