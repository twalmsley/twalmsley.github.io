(function () {
  "use strict";

  const STORAGE_KEYS = {
    master: "shopping-master",
    categories: "shopping-categories",
    cart: "shopping-cart",
    theme: "shopping-theme",
    masterSort: "shopping-master-sort",
    shoppingSort: "shopping-cart-sort",
  };

  const state = {
    master: [],       // { id, name, categoryId }
    categories: [],   // { id, name }
    cart: [],         // item ids (references master)
    masterSort: "name",
    shoppingSort: "name",
  };

  function uid() {
    return String(Date.now()) + "-" + Math.random().toString(36).slice(2, 9);
  }

  function loadFromStorage() {
    try {
      const rawMaster = localStorage.getItem(STORAGE_KEYS.master);
      const rawCategories = localStorage.getItem(STORAGE_KEYS.categories);
      const rawCart = localStorage.getItem(STORAGE_KEYS.cart);
      const rawTheme = localStorage.getItem(STORAGE_KEYS.theme);
      const rawMasterSort = localStorage.getItem(STORAGE_KEYS.masterSort);
      const rawShoppingSort = localStorage.getItem(STORAGE_KEYS.shoppingSort);

      if (rawMaster) {
        const parsed = JSON.parse(rawMaster);
        state.master = Array.isArray(parsed) ? parsed : [];
      }
      if (rawCategories) {
        const parsed = JSON.parse(rawCategories);
        state.categories = Array.isArray(parsed) ? parsed : [];
      }
      if (rawCart) {
        const parsed = JSON.parse(rawCart);
        state.cart = Array.isArray(parsed) ? parsed : [];
      }
      if (rawTheme === "dark") document.documentElement.setAttribute("data-theme", "dark");
      if (rawMasterSort === "name" || rawMasterSort === "category") state.masterSort = rawMasterSort;
      if (rawShoppingSort === "name" || rawShoppingSort === "category") state.shoppingSort = rawShoppingSort;
    } catch (e) {
      console.warn("loadFromStorage failed", e);
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.master, JSON.stringify(state.master));
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(state.categories));
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(state.cart));
      localStorage.setItem(STORAGE_KEYS.theme, document.documentElement.getAttribute("data-theme") || "light");
      localStorage.setItem(STORAGE_KEYS.masterSort, state.masterSort);
      localStorage.setItem(STORAGE_KEYS.shoppingSort, state.shoppingSort);
    } catch (e) {
      console.warn("saveToStorage failed", e);
    }
  }

  const EXPORT_FORMAT_VERSION = 1;
  const MAX_IMPORT_BYTES = 2 * 1024 * 1024; // 2MB

  function exportToJson() {
    const payload = {
      version: EXPORT_FORMAT_VERSION,
      categories: state.categories,
      master: state.master,
      cart: state.cart,
    };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shopping-list.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function isValidImportData(data) {
    if (!data || typeof data !== "object") return false;
    if (data.version !== EXPORT_FORMAT_VERSION) return false;
    if (!Array.isArray(data.categories) || !Array.isArray(data.master) || !Array.isArray(data.cart)) return false;
    return true;
  }

  function importFromJson(file) {
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      alert("File is too large. Maximum size is 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const data = JSON.parse(reader.result);
        if (!isValidImportData(data)) {
          alert("Invalid file. The file must be a valid shopping list export (version " + EXPORT_FORMAT_VERSION + ").");
          return;
        }
        if (!confirm("Import will replace your current data. Continue?")) return;
        state.categories = data.categories;
        state.master = data.master;
        state.cart = data.cart;
        saveToStorage();
        updateCounts();
        renderMasterList();
        renderCategories();
        renderShoppingList();
        refreshCategorySelect();
        alert("Import complete.");
      } catch (e) {
        alert("Invalid file. Could not read the JSON.");
      }
    };
    reader.readAsText(file);
  }

  function getCategoryName(categoryId) {
    if (!categoryId) return null;
    const cat = state.categories.find(function (c) { return c.id === categoryId; });
    return cat ? cat.name : null;
  }

  function getMasterSorted() {
    const list = state.master.slice();
    if (state.masterSort === "name") {
      list.sort(function (a, b) { return a.name.localeCompare(b.name, undefined, { sensitivity: "base" }); });
    } else {
      list.sort(function (a, b) {
        const na = getCategoryName(a.categoryId) || "";
        const nb = getCategoryName(b.categoryId) || "";
        const cmp = na.localeCompare(nb, undefined, { sensitivity: "base" });
        if (cmp !== 0) return cmp;
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      });
    }
    return list;
  }

  function getCartItemsSorted() {
    const items = state.cart
      .map(function (id) { return state.master.find(function (m) { return m.id === id; }); })
      .filter(Boolean);
    if (state.shoppingSort === "name") {
      items.sort(function (a, b) { return a.name.localeCompare(b.name, undefined, { sensitivity: "base" }); });
    } else {
      items.sort(function (a, b) {
        const na = getCategoryName(a.categoryId) || "";
        const nb = getCategoryName(b.categoryId) || "";
        const cmp = na.localeCompare(nb, undefined, { sensitivity: "base" });
        if (cmp !== 0) return cmp;
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      });
    }
    return items;
  }

  /** Returns array of { categoryId, categoryName, items } for master list when sort is category. Includes all categories (even empty) and Uncategorized. */
  function getMasterGroupedByCategory() {
    const groups = [];
    const sortedCats = state.categories.slice().sort(function (a, b) {
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
    sortedCats.forEach(function (cat) {
      const items = state.master
        .filter(function (m) { return m.categoryId === cat.id; })
        .slice()
        .sort(function (a, b) { return a.name.localeCompare(b.name, undefined, { sensitivity: "base" }); });
      groups.push({ categoryId: cat.id, categoryName: cat.name, items: items });
    });
    const uncategorized = state.master
      .filter(function (m) { return !m.categoryId; })
      .slice()
      .sort(function (a, b) { return a.name.localeCompare(b.name, undefined, { sensitivity: "base" }); });
    groups.push({ categoryId: null, categoryName: "Uncategorized", items: uncategorized });
    return groups;
  }

  /** Returns array of { categoryId, categoryName, items } for cart when sort is category. Only groups that have items. */
  function getCartGroupedByCategory() {
    const items = state.cart
      .map(function (id) { return state.master.find(function (m) { return m.id === id; }); })
      .filter(Boolean);
    const byCat = Object.create(null);
    items.forEach(function (item) {
      const id = item.categoryId != null ? item.categoryId : "__uncategorized";
      if (!byCat[id]) byCat[id] = { categoryId: item.categoryId, categoryName: getCategoryName(item.categoryId) || "Uncategorized", items: [] };
      byCat[id].items.push(item);
    });
    Object.keys(byCat).forEach(function (k) {
      byCat[k].items.sort(function (a, b) { return a.name.localeCompare(b.name, undefined, { sensitivity: "base" }); });
    });
    const sortedCats = state.categories.slice().sort(function (a, b) {
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
    const groups = [];
    sortedCats.forEach(function (cat) {
      if (byCat[cat.id]) groups.push(byCat[cat.id]);
    });
    if (byCat["__uncategorized"]) groups.push(byCat["__uncategorized"]);
    return groups;
  }

  function updateCounts() {
    const masterEl = document.getElementById("count-master");
    const catEl = document.getElementById("count-categories");
    const shopEl = document.getElementById("count-shopping");
    if (masterEl) masterEl.textContent = state.master.length;
    if (catEl) catEl.textContent = state.categories.length;
    if (shopEl) shopEl.textContent = state.cart.length;
  }

  function renderMasterList() {
    const ul = document.getElementById("list-master");
    if (!ul) return;
    ul.innerHTML = "";

    if (state.masterSort === "category") {
      const groups = getMasterGroupedByCategory();
      if (state.master.length === 0) {
        const li = document.createElement("li");
        li.className = "empty-state";
        li.innerHTML = "<p>No items yet. Add one above.</p>";
        ul.appendChild(li);
        return;
      }
      groups.forEach(function (group) {
        const header = document.createElement("li");
        header.className = "list-section-header";
        header.setAttribute("role", "heading");
        header.setAttribute("aria-level", "2");
        const addLabel = "Add item to " + escapeHtml(group.categoryName);
        header.innerHTML =
          '<span class="list-section-header-title">' + escapeHtml(group.categoryName) + '</span>' +
          '<button type="button" class="btn-icon btn-add-in-section" aria-label="' + addLabel + '" title="' + addLabel + '">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
          '</button>';
        ul.appendChild(header);
        const addBtn = header.querySelector(".btn-add-in-section");
        if (addBtn) addBtn.addEventListener("click", function () { openAddItem(group.categoryId); });
        group.items.forEach(function (item) {
          const li = document.createElement("li");
          li.className = "list-item";
          li.dataset.id = item.id;
          const catName = getCategoryName(item.categoryId);
          li.innerHTML =
            '<div class="list-item-content">' +
              '<div class="list-item-name">' + escapeHtml(item.name) + '</div>' +
              (catName ? '<div class="list-item-category">' + escapeHtml(catName) + '</div>' : '') +
            '</div>' +
            '<div class="list-item-actions">' +
              '<button type="button" class="btn-icon btn-edit" aria-label="Edit">' + iconEdit() + '</button>' +
              '<button type="button" class="btn-icon btn-delete" aria-label="Delete">' + iconDelete() + '</button>' +
            '</div>';
          ul.appendChild(li);
          bindMasterItem(li, item);
        });
      });
      return;
    }

    const list = getMasterSorted();
    if (list.length === 0) {
      const li = document.createElement("li");
      li.className = "empty-state";
      li.innerHTML = "<p>No items yet. Add one above.</p>";
      ul.appendChild(li);
      return;
    }
    list.forEach(function (item) {
      const li = document.createElement("li");
      li.className = "list-item";
      li.dataset.id = item.id;
      const catName = getCategoryName(item.categoryId);
      li.innerHTML =
        '<div class="list-item-content">' +
          '<div class="list-item-name">' + escapeHtml(item.name) + '</div>' +
          (catName ? '<div class="list-item-category">' + escapeHtml(catName) + '</div>' : '') +
        '</div>' +
        '<div class="list-item-actions">' +
          '<button type="button" class="btn-icon btn-edit" aria-label="Edit">' + iconEdit() + '</button>' +
          '<button type="button" class="btn-icon btn-delete" aria-label="Delete">' + iconDelete() + '</button>' +
        '</div>';
      ul.appendChild(li);
      bindMasterItem(li, item);
    });
  }

  function iconEdit() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  }

  function iconDelete() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function bindMasterItem(li, item) {
    const editBtn = li.querySelector(".btn-edit");
    const deleteBtn = li.querySelector(".btn-delete");
    if (editBtn) editBtn.addEventListener("click", function () { openEditItem(item); });
    if (deleteBtn) deleteBtn.addEventListener("click", function () { deleteMasterItem(item.id); });
    setupSwipe(li, {
      right: function () { addToCart(item.id); },
      left: null,
    });
  }

  function renderCategories() {
    const ul = document.getElementById("list-categories");
    if (!ul) return;
    ul.innerHTML = "";
    const list = state.categories.slice().sort(function (a, b) {
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
    if (list.length === 0) {
      const li = document.createElement("li");
      li.className = "empty-state";
      li.innerHTML = "<p>No categories yet. Add one above.</p>";
      ul.appendChild(li);
      return;
    }
    list.forEach(function (cat) {
      const li = document.createElement("li");
      li.className = "list-item";
      li.dataset.id = cat.id;
      li.innerHTML =
        '<div class="list-item-content">' +
          '<div class="list-item-name">' + escapeHtml(cat.name) + '</div>' +
        '</div>' +
        '<div class="list-item-actions">' +
          '<button type="button" class="btn-icon btn-edit" aria-label="Edit">' + iconEdit() + '</button>' +
          '<button type="button" class="btn-icon btn-delete" aria-label="Delete">' + iconDelete() + '</button>' +
        '</div>';
      ul.appendChild(li);
      const editBtn = li.querySelector(".btn-edit");
      const deleteBtn = li.querySelector(".btn-delete");
      if (editBtn) editBtn.addEventListener("click", function () { openEditCategory(cat); });
      if (deleteBtn) deleteBtn.addEventListener("click", function () { deleteCategory(cat.id); });
    });
  }

  function renderShoppingList() {
    const ul = document.getElementById("list-shopping");
    if (!ul) return;
    ul.innerHTML = "";

    if (state.shoppingSort === "category") {
      const groups = getCartGroupedByCategory();
      if (groups.length === 0 || state.cart.length === 0) {
        const li = document.createElement("li");
        li.className = "empty-state";
        li.innerHTML = "<p>Swipe right on a Master List item to add it here, or use the add control.</p>";
        ul.appendChild(li);
        return;
      }
      groups.forEach(function (group) {
        const header = document.createElement("li");
        header.className = "list-section-header";
        header.setAttribute("role", "heading");
        header.setAttribute("aria-level", "2");
        header.innerHTML = '<span class="list-section-header-title">' + escapeHtml(group.categoryName) + '</span>';
        ul.appendChild(header);
        group.items.forEach(function (item) {
          const li = document.createElement("li");
          li.className = "list-item";
          li.dataset.id = item.id;
          const catName = getCategoryName(item.categoryId);
          li.innerHTML =
            '<div class="list-item-content">' +
              '<div class="list-item-name">' + escapeHtml(item.name) + '</div>' +
              (catName ? '<div class="list-item-category">' + escapeHtml(catName) + '</div>' : '') +
            '</div>' +
            '<div class="list-item-actions">' +
              '<button type="button" class="btn-icon btn-delete" aria-label="Remove from list">' + iconDelete() + '</button>' +
            '</div>';
          ul.appendChild(li);
          const deleteBtn = li.querySelector(".btn-delete");
          if (deleteBtn) deleteBtn.addEventListener("click", function () { removeFromCart(item.id); });
          setupSwipe(li, { right: null, left: function () { removeFromCart(item.id); } });
        });
      });
      return;
    }

    const list = getCartItemsSorted();
    if (list.length === 0) {
      const li = document.createElement("li");
      li.className = "empty-state";
      li.innerHTML = "<p>Swipe right on a Master List item to add it here, or use the add control.</p>";
      ul.appendChild(li);
      return;
    }
    list.forEach(function (item) {
      const li = document.createElement("li");
      li.className = "list-item";
      li.dataset.id = item.id;
      const catName = getCategoryName(item.categoryId);
      li.innerHTML =
        '<div class="list-item-content">' +
          '<div class="list-item-name">' + escapeHtml(item.name) + '</div>' +
          (catName ? '<div class="list-item-category">' + escapeHtml(catName) + '</div>' : '') +
        '</div>' +
        '<div class="list-item-actions">' +
          '<button type="button" class="btn-icon btn-delete" aria-label="Remove from list">' + iconDelete() + '</button>' +
        '</div>';
      ul.appendChild(li);
      const deleteBtn = li.querySelector(".btn-delete");
      if (deleteBtn) deleteBtn.addEventListener("click", function () { removeFromCart(item.id); });
      setupSwipe(li, { right: null, left: function () { removeFromCart(item.id); } });
    });
  }

  function addMasterItem(name, categoryId) {
    const id = uid();
    state.master.push({ id: id, name: name.trim(), categoryId: categoryId || null });
    saveToStorage();
    updateCounts();
    renderMasterList();
  }

  function updateMasterItem(id, name, categoryId) {
    const item = state.master.find(function (m) { return m.id === id; });
    if (!item) return;
    item.name = name.trim();
    item.categoryId = categoryId || null;
    saveToStorage();
    updateCounts();
    renderMasterList();
    renderShoppingList();
  }

  function deleteMasterItem(id) {
    state.master = state.master.filter(function (m) { return m.id !== id; });
    state.cart = state.cart.filter(function (cid) { return cid !== id; });
    saveToStorage();
    updateCounts();
    renderMasterList();
    renderShoppingList();
  }

  function addToCart(itemId) {
    if (state.cart.indexOf(itemId) !== -1) return;
    state.cart.push(itemId);
    saveToStorage();
    updateCounts();
    renderShoppingList();
  }

  function removeFromCart(itemId) {
    state.cart = state.cart.filter(function (id) { return id !== itemId; });
    saveToStorage();
    updateCounts();
    renderShoppingList();
  }

  function addCategory(name) {
    const id = uid();
    state.categories.push({ id: id, name: name.trim() });
    saveToStorage();
    updateCounts();
    renderCategories();
    refreshCategorySelect();
  }

  function updateCategory(id, name) {
    const cat = state.categories.find(function (c) { return c.id === id; });
    if (!cat) return;
    cat.name = name.trim();
    saveToStorage();
    updateCounts();
    renderCategories();
    renderMasterList();
    renderShoppingList();
    refreshCategorySelect();
  }

  function deleteCategory(id) {
    const inUse = state.master.some(function (m) { return m.categoryId === id; });
    if (inUse) {
      state.master.forEach(function (m) { if (m.categoryId === id) m.categoryId = null; });
    }
    state.categories = state.categories.filter(function (c) { return c.id !== id; });
    saveToStorage();
    updateCounts();
    renderCategories();
    renderMasterList();
    renderShoppingList();
    refreshCategorySelect();
  }

  function refreshCategorySelect() {
    const sel = document.getElementById("item-category");
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = '<option value="">— None —</option>';
    state.categories
      .slice()
      .sort(function (a, b) { return a.name.localeCompare(b.name, undefined, { sensitivity: "base" }); })
      .forEach(function (c) {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.name;
        sel.appendChild(opt);
      });
    sel.value = current || "";
  }

  function openAddItem(categoryId) {
    document.getElementById("modal-item-title").textContent = "Add item";
    document.getElementById("form-item").reset();
    document.getElementById("item-id").value = "";
    refreshCategorySelect();
    const categorySelect = document.getElementById("item-category");
    if (categoryId && categorySelect) categorySelect.value = categoryId;
    document.getElementById("modal-item").showModal();
    setTimeout(function () { document.getElementById("item-name").focus(); }, 50);
  }

  function openEditItem(item) {
    document.getElementById("modal-item-title").textContent = "Edit item";
    document.getElementById("item-id").value = item.id;
    document.getElementById("item-name").value = item.name;
    refreshCategorySelect();
    document.getElementById("item-category").value = item.categoryId || "";
    document.getElementById("modal-item").showModal();
    setTimeout(function () { document.getElementById("item-name").focus(); }, 50);
  }

  function openAddCategory() {
    document.getElementById("modal-category-title").textContent = "Add category";
    document.getElementById("form-category").reset();
    document.getElementById("category-id").value = "";
    document.getElementById("modal-category").showModal();
    setTimeout(function () { document.getElementById("category-name").focus(); }, 50);
  }

  function openEditCategory(cat) {
    document.getElementById("modal-category-title").textContent = "Edit category";
    document.getElementById("category-id").value = cat.id;
    document.getElementById("category-name").value = cat.name;
    document.getElementById("modal-category").showModal();
    setTimeout(function () { document.getElementById("category-name").focus(); }, 50);
  }

  function setupTabs() {
    const tabs = document.querySelectorAll(".tab[data-tab]");
    const panels = document.querySelectorAll(".panel");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        const name = tab.dataset.tab;
        tabs.forEach(function (t) {
          t.classList.toggle("active", t === tab);
          t.setAttribute("aria-selected", t === tab ? "true" : "false");
        });
        panels.forEach(function (panel) {
          const isActive = panel.id === "panel-" + name;
          panel.classList.toggle("active", isActive);
          panel.hidden = !isActive;
        });
        if (name === "master") renderMasterList();
        else if (name === "categories") renderCategories();
        else if (name === "shopping") renderShoppingList();
      });
    });
  }

  function setupSortButtons() {
    document.querySelectorAll(".sort-btn[data-sort]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const sort = btn.dataset.sort;
        const list = btn.dataset.list;
        if (list === "shopping") {
          state.shoppingSort = sort;
          document.querySelectorAll('.sort-btn[data-list="shopping"]').forEach(function (b) { b.classList.toggle("active", b.dataset.sort === sort); });
          renderShoppingList();
        } else {
          state.masterSort = sort;
          document.querySelectorAll("#panel-master .sort-btn").forEach(function (b) { b.classList.toggle("active", b.dataset.sort === sort); });
          renderMasterList();
        }
        saveToStorage();
      });
    });
  }

  function setupSwipe(el, handlers) {
    let startX = 0;
    let currentX = 0;

    function onStart(clientX) {
      startX = clientX;
      currentX = clientX;
      el.classList.remove("swipe-add", "swipe-remove");
    }

    function onMove(clientX) {
      currentX = clientX;
      const dx = currentX - startX;
      if (handlers.right && dx > 30) el.classList.add("swipe-add");
      else if (handlers.left && dx < -30) el.classList.add("swipe-remove");
      else el.classList.remove("swipe-add", "swipe-remove");
    }

    function onEnd() {
      const dx = currentX - startX;
      if (handlers.right && dx > 60) handlers.right();
      else if (handlers.left && dx < -60) handlers.left();
      el.classList.remove("swipe-add", "swipe-remove");
    }

    el.addEventListener("touchstart", function (e) { onStart(e.touches[0].clientX); }, { passive: true });
    el.addEventListener("touchmove", function (e) { onMove(e.touches[0].clientX); }, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });

    el.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return;
      onStart(e.clientX);
      function mousemove(ev) { onMove(ev.clientX); }
      function mouseup() {
        onEnd();
        document.removeEventListener("mousemove", mousemove);
        document.removeEventListener("mouseup", mouseup);
      }
      document.addEventListener("mousemove", mousemove);
      document.addEventListener("mouseup", mouseup);
    });
  }

  function setupTheme() {
    const toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", function () {
      const theme = document.documentElement.getAttribute("data-theme");
      const next = theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next === "dark" ? "dark" : "");
      saveToStorage();
    });
  }

  function setupModals() {
    document.getElementById("form-item").addEventListener("submit", function (e) {
      e.preventDefault();
      const id = document.getElementById("item-id").value;
      const name = document.getElementById("item-name").value.trim();
      const categoryId = document.getElementById("item-category").value || null;
      if (!name) return;
      if (id) updateMasterItem(id, name, categoryId);
      else addMasterItem(name, categoryId);
      document.getElementById("modal-item").close();
    });

    document.getElementById("form-category").addEventListener("submit", function (e) {
      e.preventDefault();
      const id = document.getElementById("category-id").value;
      const name = document.getElementById("category-name").value.trim();
      if (!name) return;
      if (id) updateCategory(id, name);
      else addCategory(name);
      document.getElementById("modal-category").close();
    });

    document.querySelectorAll("[data-close]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const dialog = btn.closest("dialog");
        if (dialog) dialog.close();
      });
    });
  }

  function init() {
    loadFromStorage();
    updateCounts();
    renderMasterList();
    renderCategories();
    renderShoppingList();
    setupTabs();
    setupSortButtons();
    setupTheme();
    setupModals();

    document.getElementById("add-master-item").addEventListener("click", function () { openAddItem(); });
    document.getElementById("add-category").addEventListener("click", openAddCategory);

    const btnExport = document.getElementById("btn-export");
    const btnImport = document.getElementById("btn-import");
    const importFileInput = document.getElementById("import-file");
    if (btnExport) btnExport.addEventListener("click", exportToJson);
    if (btnImport && importFileInput) {
      btnImport.addEventListener("click", function () { importFileInput.click(); });
      importFileInput.addEventListener("change", function () {
        const file = importFileInput.files && importFileInput.files[0];
        if (file) {
          importFromJson(file);
          importFileInput.value = "";
        }
      });
    }

    document.querySelectorAll("#panel-master .sort-btn").forEach(function (b) {
      b.classList.toggle("active", b.dataset.sort === state.masterSort);
    });
    document.querySelectorAll('.sort-btn[data-list="shopping"]').forEach(function (b) {
      b.classList.toggle("active", b.dataset.sort === state.shoppingSort);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
