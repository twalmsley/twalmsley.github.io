# Shopping List

A simple, offline-first shopping list app. Manage a **master list** of items and **categories**, then build a **shopping list** for each trip. Data is stored in your browser (localStorage)—no account or server required.

## How to run

1. **Open in a browser**  
   Double-click `index.html` or open it from your file manager. You can also drag `index.html` into a browser window.

2. **Or use a local server** (optional, if you prefer not to use `file://`):
   ```bash
   npx serve .
   ```
   Then open the URL shown (e.g. http://localhost:3000).

No build step or dependencies are required.

## Using the app

### Tabs

- **Master List** – Your full list of items. Add everything you might ever buy and assign categories. This is your “library” of items.
- **Categories** – Define categories (e.g. Dairy, Produce, Frozen). Use these to group items in the master list and shopping list.
- **Shopping List** – The list for your current trip. Add items here from the master list when you plan to buy them; remove them when done.

### Master List

- **Add item** – Click **Add item**, enter a name, optionally choose a category, then **Save**.
- **Edit** – Click the pencil icon on an item to change its name or category.
- **Delete** – Click the trash icon to remove an item from the master list (and from the shopping list if it was there).
- **Add to shopping list** – Click the **+** (add) button on an item, or **swipe right** on touch devices.
- **Sort** – Use **By name** or **By category**; when by category, items are shown in category sections.

### Categories

- **Add category** – Click **Add category**, enter a name, then **Save**.
- **Edit / Delete** – Use the pencil or trash icon on a category. Deleting a category leaves its items in the master list as “Uncategorized”.

### Shopping List

- **Remove item** – Click the trash icon or **swipe left** to take an item off the shopping list (the item stays in the master list).
- **Sort** – Use **By name** or **By category** to organize the list.

### Other

- **Theme** – Use the sun/moon icon in the header to switch between light and dark mode. Your choice is saved.

## Data and privacy

All data (master list, categories, shopping list, sort order, theme) is stored in your browser’s localStorage. Nothing is sent to any server. Clearing site data or using a different browser/device will start with an empty list.

## Project structure

- `index.html` – Markup and structure
- `app.js` – Logic and localStorage handling
- `styles.css` – Layout and theme styles
