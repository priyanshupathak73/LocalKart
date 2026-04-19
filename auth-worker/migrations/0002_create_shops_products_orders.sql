CREATE TABLE IF NOT EXISTS shops (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  imageUrl TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('products', 'services', 'both')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_shops_owner_id ON shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_category ON shops(category);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  shop_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  imageUrl TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id)
);

CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  shop_id TEXT NOT NULL,
  total REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id)
);

CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON orders(shop_id);
