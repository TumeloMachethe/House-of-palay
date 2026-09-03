/* ============================================================================
   HOUSE OF PALAY — SHARED STORE / CART SCRIPT
   ============================================================================
   Everyday product edits belong in store-data.js, NOT here.

   This file handles:
   - Product rendering and filtering
   - Search and sorting
   - Product quick view / options
   - Shopping bag and quantities
   - Mobile menu
   - Image loading + fallbacks
   - Shared links and page effects
   ============================================================================ */

(() => {
  "use strict";

  const CONFIG = window.HOP_CONFIG || {};
  const PRODUCTS = Array.isArray(window.HOP_PRODUCTS) ? window.HOP_PRODUCTS : [];
  const PAGE_CATEGORY = document.body.dataset.pageCategory || "";
  const $ = id => document.getElementById(id);

  const currency = new Intl.NumberFormat(CONFIG.locale || "en-ZA", {
    style: "currency",
    currency: CONFIG.currency || "ZAR"
  });

  let activeFilter = PAGE_CATEGORY || "all";
  let searchTerm = "";
  let sortMode = "featured";
  let activeProduct = null;
  let cart = loadCart();

  /* ----------------------------- Product options -----------------------------
     Products can now have separate sizes + colours. Other product types can
     continue using the existing `options` array (perfume ml, hair length, etc.). */
  function optionLabel(option) {
    return typeof option === "object" ? option.label : option;
  }

  function optionPrice(product, selection) {
    const label = typeof selection === "object" ? selection?.option : selection;
    const option = product.options?.find(item => optionLabel(item) === label);
    return typeof option === "object" && option?.price != null
      ? Number(option.price)
      : Number(product.price);
  }

  function firstOption(product) {
    return product.options?.length ? optionLabel(product.options[0]) : "Standard";
  }

  function firstValue(values) {
    if (!Array.isArray(values) || !values.length) return "";
    return optionLabel(values[0]);
  }

  function getDefaultSelection(product) {
    const selection = {};
    if (product.options?.length) selection.option = firstOption(product);
    if (product.sizes?.length) selection.size = firstValue(product.sizes);
    if (product.colors?.length) selection.color = firstValue(product.colors);
    return selection;
  }

  function getProductSelectors(product) {
    const selectors = [];
    if (product.sizes?.length > 1) selectors.push({ key: "size", label: "Choose size", values: product.sizes });
    if (product.colors?.length > 1) selectors.push({ key: "color", label: "Choose colour", values: product.colors });
    if (product.options?.length > 1) selectors.push({ key: "option", label: product.optionLabel || "Choose option", values: product.options });
    return selectors;
  }

  function normalizeCartSelection(product, itemOrSelection) {
    if (itemOrSelection && typeof itemOrSelection === "object" && !Array.isArray(itemOrSelection)) {
      if (itemOrSelection.selections && typeof itemOrSelection.selections === "object") {
        return { ...getDefaultSelection(product), ...itemOrSelection.selections };
      }
      if ("size" in itemOrSelection || "color" in itemOrSelection || "option" in itemOrSelection) {
        return { ...getDefaultSelection(product), ...itemOrSelection };
      }
    }

    const legacy = typeof itemOrSelection === "string"
      ? itemOrSelection
      : String(itemOrSelection?.option || "");
    const selection = getDefaultSelection(product);

    if (legacy && legacy !== "Standard") {
      if (product.sizes?.some(value => optionLabel(value) === legacy)) selection.size = legacy;
      else if (product.colors?.some(value => optionLabel(value) === legacy)) selection.color = legacy;
      else selection.option = legacy;
    }
    return selection;
  }

  function selectionSummary(product, selection) {
    const chosen = normalizeCartSelection(product, selection);
    const parts = [];
    if (chosen.size) parts.push(`Size: ${chosen.size}`);
    if (chosen.color) parts.push(`Colour: ${chosen.color}`);
    if (chosen.option && chosen.option !== "Standard") parts.push(chosen.option);
    return parts.join(" · ") || "Standard";
  }

  function selectionKey(product, selection) {
    const chosen = normalizeCartSelection(product, selection);
    return [product.id, chosen.size || "", chosen.color || "", chosen.option || ""].join("__");
  }

  function productHasChoices(product) {
    return getProductSelectors(product).length > 0;
  }

  function displayCategory(category) {
    if (category === "PJ") return "PJs";
    if (category === "Gym") return "Gym Wear";
    return category;
  }

  function genericImagePlaceholder(name = "House of Palay") {
    return makePlaceholder("Collection", name);
  }

  function prepareImage(image) {
    if (!image || image.dataset.imageReady === "1") return;
    image.dataset.imageReady = "1";
    image.classList.add("hop-image-loading");

    const reveal = () => {
      image.classList.remove("hop-image-loading");
      image.classList.add("hop-image-loaded");
    };

    image.addEventListener("load", reveal, { once: true });
    if (image.complete && image.naturalWidth > 0) reveal();
  }

  function prepareImages(root = document) {
    root.querySelectorAll?.("img").forEach(prepareImage);
  }

  /* --------------------------------- Cart ----------------------------------- */
  function loadCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem("houseOfPalayCart") || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem("houseOfPalayCart", JSON.stringify(cart));
  }

  function getCartDetails() {
    return cart.map(item => {
      const product = PRODUCTS.find(entry => entry.id === item.productId);
      if (!product) return null;
      const selections = normalizeCartSelection(product, item);
      const unitPrice = optionPrice(product, selections);
      return {
        ...item,
        selections,
        option: selections.option || item.option || "Standard",
        selectionSummary: selectionSummary(product, selections),
        product,
        unitPrice,
        lineTotal: unitPrice * item.quantity
      };
    }).filter(Boolean);
  }

  function getCartSubtotal() {
    return getCartDetails().reduce((sum, item) => sum + item.lineTotal, 0);
  }

  function getCartQuantity() {
    return getCartDetails().reduce((sum, item) => sum + item.quantity, 0);
  }

  function addToCart(product, selection = {}) {
    const selections = normalizeCartSelection(product, selection);
    const key = selectionKey(product, selections);
    const existing = cart.find(item => item.key === key);

    if (existing) existing.quantity += 1;
    else cart.push({
      key,
      productId: product.id,
      selections,
      option: selections.option || "Standard",
      quantity: 1
    });

    saveCart();
    renderCart();
    document.dispatchEvent(new CustomEvent("hop:cart-updated"));
    showToast(`${product.name} added — ${currency.format(getCartSubtotal())}`);
  }

  function updateQuantity(key, change) {
    const item = cart.find(entry => entry.key === key);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) cart = cart.filter(entry => entry.key !== key);

    saveCart();
    renderCart();
    document.dispatchEvent(new CustomEvent("hop:cart-updated"));
  }

  function removeFromCart(key) {
    cart = cart.filter(entry => entry.key !== key);
    saveCart();
    renderCart();
    document.dispatchEvent(new CustomEvent("hop:cart-updated"));
  }

  function clearCart() {
    cart = [];
    saveCart();
    renderCart();
    document.dispatchEvent(new CustomEvent("hop:cart-updated"));
  }

  /* ------------------------------ Product grid ------------------------------ */
  const productGrid = $("productGrid");
  const resultsText = $("resultsText");
  const filterRow = $("filterRow");
  const sortProducts = $("sortProducts");

 function getVisibleProducts() {
  let list = PRODUCTS.filter(product => {
    if (product.hiddenFromShop) return false;

    const categoryMatch = activeFilter === "all" || product.category === activeFilter;
    const haystack = `${product.name} ${product.category} ${product.description || ""}`.toLowerCase();

    return categoryMatch && haystack.includes(searchTerm.toLowerCase().trim());
  });

    list = [...list];
    if (sortMode === "price-low") list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortMode === "price-high") list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sortMode === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }

  function productStartingPrice(product) {
    if (!product.options?.length) return Number(product.price);
    return Math.min(...product.options.map(option =>
      typeof option === "object" && option.price != null ? Number(option.price) : Number(product.price)
    ));
  }

  function renderProducts() {
    if (!productGrid) return;

    const list = getVisibleProducts();
    if (resultsText) {
      const suffix = activeFilter !== "all" ? ` in ${displayCategory(activeFilter)}` : "";
      resultsText.textContent = `${list.length} ${list.length === 1 ? "item" : "items"}${suffix}`;
    }

    if (!list.length) {
      productGrid.innerHTML = `
        <div class="no-results">
          <h3>No products found.</h3>
          <p>Try another search or category.</p>
        </div>`;
      return;
    }

    productGrid.innerHTML = list.map(product => {
      const starting = productStartingPrice(product);
      const hasVariablePrice = product.options?.some(option =>
        typeof option === "object" && option.price != null && Number(option.price) !== Number(product.price)
      );

      return `
        <article class="product-card">
          <div class="product-image">
            ${product.badge ? `<span class="product-badge">${escapeHTML(product.badge)}</span>` : ""}
            <img
              src="${escapeAttribute(product.image)}"
              alt="${escapeAttribute(product.name)}"
              loading="lazy"
              decoding="async"
              data-fallback-category="${escapeAttribute(product.category)}"
              data-fallback-name="${escapeAttribute(product.name)}"
            />
            <button class="quick-view" type="button" data-quick-view="${escapeAttribute(product.id)}">Quick view</button>
          </div>
          <div class="product-meta">
            <div>
              <p class="product-category">${escapeHTML(displayCategory(product.category))}</p>
              <h3 class="product-name">${escapeHTML(product.name)}</h3>
            </div>
            <span class="product-price">${hasVariablePrice ? "From " : ""}${currency.format(starting)}</span>
            <button class="add-button" type="button" data-add="${escapeAttribute(product.id)}">
              ${productHasChoices(product) ? "Choose options" : "+ Add to bag"}
            </button>
          </div>
        </article>`;
    }).join("");

    attachImageFallbacks(productGrid);
  }

  function setFilter(category) {
    activeFilter = category;
    document.querySelectorAll("[data-filter]").forEach(button => {
      button.classList.toggle("active", button.dataset.filter === category);
    });
    renderProducts();
  }

  filterRow?.addEventListener("click", event => {
    const button = event.target.closest("[data-filter]");
    if (button) setFilter(button.dataset.filter);
  });

  sortProducts?.addEventListener("change", event => {
    sortMode = event.target.value;
    renderProducts();
  });

  productGrid?.addEventListener("click", event => {
    const addButton = event.target.closest("[data-add]");
    const quickViewButton = event.target.closest("[data-quick-view]");

    if (addButton) {
      const product = PRODUCTS.find(item => item.id === addButton.dataset.add);
      if (!product) return;
      if (productHasChoices(product)) openProductModal(product.id);
      else addToCart(product, getDefaultSelection(product));
    }

    if (quickViewButton) openProductModal(quickViewButton.dataset.quickView);
  });

  document.addEventListener("click", event => {
    const filterButton = event.target.closest("[data-filter-button]");
    if (!filterButton) return;
    setFilter(filterButton.dataset.filterButton);
    $("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  /* ---------------------------- SPECIAL OFFER ---------------------------- */

const specialOfferBtn = $("specialOfferBtn");

specialOfferBtn?.addEventListener("click", () => {
  const specialOffer = PRODUCTS.find(product => product.id === "special-offer");

  if (!specialOffer) {
    showToast("Special offer is currently unavailable.");
    return;
  }

  addToCart(specialOffer);
  openCart();
});

  /* -------------------------------- Search --------------------------------- */
  const globalSearch = $("globalSearch");
  const searchPanel = $("searchPanel");
  const searchToggle = $("searchToggle");
  const searchClose = $("searchClose");

  function openSearch() {
    if (!searchPanel) return;
    searchPanel.classList.add("open");
    setTimeout(() => globalSearch?.focus(), 120);
  }

  function closeSearch() {
    searchPanel?.classList.remove("open");
  }

  searchToggle?.addEventListener("click", () => {
    searchPanel?.classList.contains("open") ? closeSearch() : openSearch();
  });
  searchClose?.addEventListener("click", closeSearch);
  globalSearch?.addEventListener("input", event => {
    searchTerm = event.target.value;
    if (!PAGE_CATEGORY) setFilter("all");
    else renderProducts();
    $("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ------------------------------- Mobile menu ------------------------------ */
  const siteHeader = $("siteHeader");
  const menuToggle = $("menuToggle");
  const mobileMenu = $("mobileMenu");
  const mobileMenuClose = $("mobileMenuClose");
  const menuOverlay = $("menuOverlay");

  let lastMenuTrigger = null;

  function openMenu() {
    if (!mobileMenu || !menuOverlay) return;
    lastMenuTrigger = document.activeElement;
    mobileMenu.classList.add("open");
    menuOverlay.classList.add("open");
    mobileMenu.setAttribute("aria-hidden", "false");
    menuToggle?.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");
    setTimeout(() => mobileMenuClose?.focus(), 0);
  }

  function closeMenu(restoreFocus = true) {
    mobileMenu?.classList.remove("open");
    menuOverlay?.classList.remove("open");
    mobileMenu?.setAttribute("aria-hidden", "true");
    menuToggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
    if (restoreFocus && lastMenuTrigger?.focus) lastMenuTrigger.focus();
  }

  menuToggle?.addEventListener("click", openMenu);
  mobileMenuClose?.addEventListener("click", closeMenu);
  menuOverlay?.addEventListener("click", closeMenu);
  mobileMenu?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));

  /* ---------------------------- Product quick view --------------------------- */
  const productModal = $("productModal");
  const productModalClose = $("productModalClose");
  const modalImage = $("modalImage");
  const modalCategory = $("modalCategory");
  const modalName = $("modalName");
  const modalPrice = $("modalPrice");
  const modalDescription = $("modalDescription");
  const modalOptionWrap = $("modalOptionWrap");
  const modalOption = $("modalOption");
  const modalAdd = $("modalAdd");

  function openProductModal(id) {
    activeProduct = PRODUCTS.find(product => product.id === id);
    if (!activeProduct || !productModal) return;

    if (modalCategory) modalCategory.textContent = displayCategory(activeProduct.category);
    if (modalName) modalName.textContent = activeProduct.name;
    if (modalDescription) modalDescription.textContent = activeProduct.description || "";

    if (modalImage) {
      modalImage.src = activeProduct.image;
      modalImage.alt = activeProduct.name;
      modalImage.dataset.fallbackCategory = activeProduct.category;
      modalImage.dataset.fallbackName = activeProduct.name;
      modalImage.dataset.fallbackApplied = "0";
      modalImage.dataset.imageReady = "0";
      modalImage.classList.remove("hop-image-loaded");
      attachImageFallbacks(productModal);
    }

    const selectors = getProductSelectors(activeProduct);
    const defaults = getDefaultSelection(activeProduct);

    if (modalOptionWrap) {
      modalOptionWrap.style.display = selectors.length ? "grid" : "none";
      modalOptionWrap.innerHTML = selectors.map(selector => {
        const choices = selector.values.map(value => {
          const label = optionLabel(value);
          const price = selector.key === "option" ? optionPrice(activeProduct, { option: label }) : Number(activeProduct.price);
          const suffix = selector.key === "option" && price !== Number(activeProduct.price) ? ` — ${currency.format(price)}` : "";
          return `<option value="${escapeAttribute(label)}">${escapeHTML(label)}${escapeHTML(suffix)}</option>`;
        }).join("");

        return `
          <div class="modal-option-field">
            <label for="modal-${escapeAttribute(selector.key)}">${escapeHTML(selector.label)}</label>
            <select id="modal-${escapeAttribute(selector.key)}" data-modal-variant="${escapeAttribute(selector.key)}" required>
              <option value="">${escapeHTML(selector.label)}</option>
              ${choices}
            </select>
          </div>`;
      }).join("");

      modalOptionWrap.querySelectorAll("[data-modal-variant]").forEach(select => {
        select.addEventListener("change", () => {
          if (!modalPrice) return;
          const selection = { ...defaults };
          modalOptionWrap.querySelectorAll("[data-modal-variant]").forEach(field => {
            if (field.value) selection[field.dataset.modalVariant] = field.value;
          });
          modalPrice.textContent = currency.format(optionPrice(activeProduct, selection));
        });
      });
    }

    if (modalPrice) modalPrice.textContent = currency.format(optionPrice(activeProduct, defaults));

    productModal.showModal();
  }

  productModalClose?.addEventListener("click", () => productModal?.close());
  productModal?.addEventListener("click", event => {
    if (event.target === productModal) productModal.close();
  });

  modalAdd?.addEventListener("click", () => {
    if (!activeProduct) return;

    const selectors = getProductSelectors(activeProduct);
    const selected = getDefaultSelection(activeProduct);
    let missingField = null;

    selectors.forEach(selector => {
      const field = modalOptionWrap?.querySelector(`[data-modal-variant="${selector.key}"]`);
      if (!field?.value && !missingField) missingField = field;
      if (field?.value) selected[selector.key] = field.value;
    });

    if (missingField) {
      showToast(`Please ${missingField.options?.[0]?.textContent?.toLowerCase() || "choose an option"}.`);
      missingField.focus();
      return;
    }

    addToCart(activeProduct, selected);
    productModal?.close();
    openCart();
  });

  /* ------------------------------ Shopping bag ------------------------------ */
  const cartToggle = $("cartToggle");
  const cartClose = $("cartClose");
  const cartDrawer = $("cartDrawer");
  const cartOverlay = $("cartOverlay");
  const cartItems = $("cartItems");
  const cartEmpty = $("cartEmpty");
  const cartFooter = $("cartFooter");
  const cartTotal = $("cartTotal");
  const cartCount = $("cartCount");
  const cartHeaderTotal = $("cartHeaderTotal");
  const checkoutBtn = $("checkoutBtn");

  function renderCart() {
    const details = getCartDetails();
    const subtotal = getCartSubtotal();

    if (cartCount) cartCount.textContent = getCartQuantity();
    if (cartTotal) cartTotal.textContent = currency.format(subtotal);
    if (cartHeaderTotal) cartHeaderTotal.textContent = currency.format(subtotal);

    if (!cartItems) return;

    const isEmpty = details.length === 0;
    cartEmpty?.classList.toggle("show", isEmpty);
    cartFooter?.classList.toggle("hidden", isEmpty);

    cartItems.innerHTML = details.map(item => `
      <div class="cart-item">
        <img
          src="${escapeAttribute(item.product.image)}"
          alt="${escapeAttribute(item.product.name)}"
          data-fallback-category="${escapeAttribute(item.product.category)}"
          data-fallback-name="${escapeAttribute(item.product.name)}"
        />
        <div>
          <h4>${escapeHTML(item.product.name)}</h4>
          <p>${escapeHTML(item.selectionSummary)}</p>
          <div class="qty-control" aria-label="Quantity controls">
            <button type="button" data-qty="-1" data-key="${escapeAttribute(item.key)}" aria-label="Decrease quantity">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-qty="1" data-key="${escapeAttribute(item.key)}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="cart-item-price">
          <strong>${currency.format(item.lineTotal)}</strong>
          <button type="button" class="remove-item" data-remove="${escapeAttribute(item.key)}">Remove</button>
        </div>
      </div>`).join("");

    attachImageFallbacks(cartItems);
  }

  cartItems?.addEventListener("click", event => {
    const quantityButton = event.target.closest("[data-qty]");
    const removeButton = event.target.closest("[data-remove]");

    if (quantityButton) updateQuantity(quantityButton.dataset.key, Number(quantityButton.dataset.qty));
    if (removeButton) removeFromCart(removeButton.dataset.remove);
  });

  function openCart() {
    if (!cartDrawer || !cartOverlay) return;
    closeMenu(false);
    renderCart();
    cartDrawer.classList.add("open");
    cartOverlay.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function closeCart() {
    cartDrawer?.classList.remove("open");
    cartOverlay?.classList.remove("open");
    cartDrawer?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  cartToggle?.addEventListener("click", openCart);
  cartClose?.addEventListener("click", closeCart);
  cartOverlay?.addEventListener("click", closeCart);

  checkoutBtn?.addEventListener("click", () => {
    if (!getCartDetails().length) return;
    closeCart();
    window.location.href = "checkout.html";
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (productModal?.open) productModal.close();
    if (cartDrawer?.classList.contains("open")) closeCart();
    if (mobileMenu?.classList.contains("open")) closeMenu();
    if (searchPanel?.classList.contains("open")) closeSearch();
  });

  /* -------------------------- Social/contact links -------------------------- */
  function socialIcon(type) {
    const icons = {
      email: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`,
      whatsapp: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.6Z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 8.2c.4 2.4 2.2 4.3 4.7 5l1.2-1.2 2 .8-.5 2c-.2.7-.8 1-1.4 1-4.1-.3-7.5-3.7-7.8-7.8 0-.6.3-1.2 1-1.4l2-.5.8 2L9 9.3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`,
      instagram: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17.5" cy="6.7" r="1" fill="currentColor"/></svg>`,
      tiktok: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4v9.2a4.2 4.2 0 1 1-3.4-4.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M14 4c.7 2.5 2.2 4 4.5 4.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
      facebook: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6H17V3.8c-.4-.1-1.4-.2-2.5-.2-2.5 0-4.1 1.5-4.1 4.3V10H8v3h2.4v8h3.1Z" fill="currentColor"/></svg>`
    };
    return icons[type] || "";
  }

  function decorateConnectLink(link, type) {
    if (!link || link.dataset.iconReady === "1") return;
    const label = link.textContent.trim();
    link.classList.add("connect-link");
    link.innerHTML = `<span class="connect-icon">${socialIcon(type)}</span><span>${escapeHTML(label)}</span>`;
    link.dataset.iconReady = "1";
  }

  function setOptionalLink(link, value) {
    if (!value) {
      link.removeAttribute("href");
      link.removeAttribute("target");
      link.removeAttribute("rel");
      link.classList.add("connect-link-disabled");
      link.setAttribute("aria-disabled", "true");
      return;
    }
    link.classList.remove("connect-link-disabled");
    link.removeAttribute("aria-disabled");
    link.href = value;
    if (!value.startsWith("mailto:")) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  }

  function configureOptionalLinks() {
    document.querySelectorAll("[data-social]").forEach(link => {
      const type = link.dataset.social;
      decorateConnectLink(link, type);
      setOptionalLink(link, CONFIG.socials?.[type] || "");
    });

    document.querySelectorAll("[data-contact-email]").forEach(link => {
      decorateConnectLink(link, "email");
      const email = String(CONFIG.contactEmail || "").trim();
      setOptionalLink(link, email ? `mailto:${email}` : "");
    });

    document.querySelectorAll("[data-whatsapp]").forEach(link => {
      decorateConnectLink(link, "whatsapp");
      const number = String(CONFIG.whatsappNumber || "").replace(/\D/g, "");
      setOptionalLink(link, number ? `https://wa.me/${number}` : "");
    });
  }

  /* -------------------------- Newsletter / FormSubmit ------------------------- */
  const newsletterForm = $("newsletterForm");
  newsletterForm?.addEventListener("submit", async event => {
    event.preventDefault();

    const emailField = $("newsletterEmail");
    const message = $("newsletterMessage");
    if (!emailField) return;

    const storeEmail = String(CONFIG.formSubmitEmail || "").trim();
    if (!storeEmail || storeEmail === "YOUR_EMAIL_HERE") {
      if (message) message.textContent = "Queens List signup will be available soon.";
      return;
    }

    try {
      const formData = new FormData();
      formData.append("email", emailField.value);
      formData.append("_subject", "New House of Palay Queens List Signup");
      formData.append("_captcha", "false");

      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(storeEmail)}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData
      });

      if (!response.ok) throw new Error("FormSubmit request failed");
      if (message) message.textContent = "Welcome to the Queens List.";
      emailField.value = "";
    } catch {
      if (message) message.textContent = "Signup could not be sent right now. Please try again.";
    }
  });

  /* ----------------------------- Image fallback ----------------------------- */
  function attachImageFallbacks(root = document) {
    root.querySelectorAll?.("img").forEach(image => {
      prepareImage(image);
      if (image.dataset.fallbackBound === "1") return;
      image.dataset.fallbackBound = "1";
      image.addEventListener("error", () => {
        if (image.dataset.fallbackApplied === "1") return;
        image.dataset.fallbackApplied = "1";
        const category = image.dataset.fallbackCategory || "Collection";
        const name = image.dataset.fallbackName || image.alt || "House of Palay";
        image.src = category === "Collection" ? genericImagePlaceholder(name) : makePlaceholder(category, name);
      });
    });
  }

  function makePlaceholder(category, name) {
    const palettes = {
      Eyelashes: ["#ead7ce", "#9c7467"],
      Gym: ["#d6d1c5", "#6b655b"],
      Hair: ["#d2b99a", "#7d5a36"],
      Perfumes: ["#ddc9ba", "#9a765e"],
      PJ: ["#eadccf", "#b28e79"],
      Nails: ["#eadfd4", "#9c765d"]
    };
    const [bg, accent] = palettes[category] || ["#f0e7db", "#9b7c54"];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1100" viewBox="0 0 900 1100">
      <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="#fffaf3"/></linearGradient></defs>
      <rect width="900" height="1100" fill="url(#g)"/>
      <circle cx="690" cy="240" r="250" fill="none" stroke="${accent}" stroke-opacity=".35" stroke-width="2"/>
      <text x="450" y="500" text-anchor="middle" fill="#181512" font-family="Georgia,serif" font-size="160">HP</text>
      <text x="450" y="575" text-anchor="middle" fill="${accent}" font-family="Georgia,serif" font-size="28" letter-spacing="8">HOUSE OF PALAY</text>
      <text x="450" y="690" text-anchor="middle" fill="#181512" font-family="Georgia,serif" font-size="38">${escapeXML(name || "Product")}</text>
      <text x="450" y="755" text-anchor="middle" fill="#6c6259" font-family="Arial,sans-serif" font-size="18" letter-spacing="6">${escapeXML(displayCategory(category || "Collection").toUpperCase())}</text>
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  /* -------------------------------- Utilities ------------------------------- */
  const toast = $("toast");
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function escapeHTML(value = "") {
    return String(value).replace(/[&<>'"]/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#039;",
      '"': "&quot;"
    })[char]);
  }

  function escapeAttribute(value = "") {
    return escapeHTML(value);
  }

  function escapeXML(value = "") {
    return escapeHTML(value);
  }

  /* ------------------------------- Page effects ----------------------------- */
  window.addEventListener("scroll", () => {
    siteHeader?.classList.toggle("scrolled", window.scrollY > 20);
  }, { passive: true });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal").forEach(element => observer.observe(element));
  } else {
    document.querySelectorAll(".reveal").forEach(element => element.classList.add("visible"));
  }

  const year = $("year");
  if (year) year.textContent = new Date().getFullYear();

  window.addEventListener("load", () => $("pageLoader")?.classList.add("hide"));
  setTimeout(() => $("pageLoader")?.classList.add("hide"), 1800);

  configureOptionalLinks();
  prepareImages(document);
  attachImageFallbacks(document);
  renderProducts();
  renderCart();

  /* --------------------------------------------------------------------------
     Shared API used by checkout.js / order.js.
     -------------------------------------------------------------------------- */
  window.HOPStore = {
    config: CONFIG,
    products: PRODUCTS,
    currency,
    optionLabel,
    optionPrice,
    firstOption,
    getDefaultSelection,
    selectionSummary,
    displayCategory,
    getCartDetails,
    getCartSubtotal,
    getCartQuantity,
    renderCart,
    clearCart,
    makePlaceholder,
    showToast,
    escapeHTML,
    escapeAttribute
  };
})();
