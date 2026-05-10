-- ============================================================
-- Supabase Migration: create_tables.sql
-- Stock Trading Simulator — Complete Database Schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- DROP existing tables (clean slate — order matters for FKs)
-- ============================================================
DROP TABLE IF EXISTS messages      CASCADE;
DROP TABLE IF EXISTS transactions  CASCADE;
DROP TABLE IF EXISTS orders        CASCADE;
DROP TABLE IF EXISTS portfolio     CASCADE;
DROP TABLE IF EXISTS watchlist     CASCADE;
DROP TABLE IF EXISTS price_history CASCADE;
DROP TABLE IF EXISTS stocks        CASCADE;
DROP TABLE IF EXISTS users         CASCADE;

-- Drop old wallets table if it still exists
DROP TABLE IF EXISTS wallets CASCADE;

-- ============================================================
-- 1. USERS
--    Linked 1-to-1 with Supabase auth.users.
--    Balance is stored here (in paise/cents as NUMERIC for
--    precision). Default starting balance: 100,000.00
-- ============================================================
CREATE TABLE users (
    id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email        TEXT        NOT NULL UNIQUE,
    display_name TEXT,
    balance      NUMERIC(15,2) NOT NULL DEFAULT 100000.00 CHECK (balance >= 0),
    is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. STOCKS
--    Master list of tradeable stocks. Price is updated by
--    the backend periodically (or via Alpha Vantage webhook).
-- ============================================================
CREATE TABLE stocks (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol         TEXT          NOT NULL UNIQUE,
    name           TEXT          NOT NULL,
    sector         TEXT          NOT NULL,
    current_price  NUMERIC(12,2) NOT NULL CHECK (current_price > 0),
    prev_close     NUMERIC(12,2),
    day_high       NUMERIC(12,2),
    day_low        NUMERIC(12,2),
    volume         BIGINT        DEFAULT 0,
    market_cap     NUMERIC(20,2),
    is_active      BOOLEAN       NOT NULL DEFAULT TRUE,
    last_updated   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. PRICE HISTORY
--    Stores per-stock OHLCV candles (daily/intraday).
-- ============================================================
CREATE TABLE price_history (
    id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_id   UUID          NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    open       NUMERIC(12,2) NOT NULL,
    high       NUMERIC(12,2) NOT NULL,
    low        NUMERIC(12,2) NOT NULL,
    close      NUMERIC(12,2) NOT NULL,
    volume     BIGINT        NOT NULL DEFAULT 0,
    interval   TEXT          NOT NULL DEFAULT 'daily',  -- 'daily', '1min', '5min', etc.
    recorded_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. PORTFOLIO
--    One row per (user, stock) pair. Quantity can reach 0
--    but the row is deleted when stock is fully sold.
-- ============================================================
CREATE TABLE portfolio (
    id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stock_id   UUID          NOT NULL REFERENCES stocks(id) ON DELETE RESTRICT,
    quantity   INTEGER       NOT NULL CHECK (quantity > 0),
    avg_price  NUMERIC(12,2) NOT NULL CHECK (avg_price > 0),
    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, stock_id)
);

-- ============================================================
-- 5. ORDERS
--    Immutable record of every trade intent. Status tracks
--    execution state.
-- ============================================================
CREATE TABLE orders (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stock_id    UUID          NOT NULL REFERENCES stocks(id) ON DELETE RESTRICT,
    order_type  TEXT          NOT NULL CHECK (order_type IN ('buy', 'sell')),
    quantity    INTEGER       NOT NULL CHECK (quantity > 0),
    price       NUMERIC(12,2) NOT NULL CHECK (price > 0),
    total_value NUMERIC(15,2) GENERATED ALWAYS AS (quantity * price) STORED,
    status      TEXT          NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'failed')),
    executed_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. TRANSACTIONS
--    Financial ledger entry for every order. One transaction
--    per order (DEBIT for buy, CREDIT for sell).
-- ============================================================
CREATE TABLE transactions (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id         UUID          NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    user_id          UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stock_id         UUID          NOT NULL REFERENCES stocks(id) ON DELETE RESTRICT,
    transaction_type TEXT          NOT NULL CHECK (transaction_type IN ('DEBIT', 'CREDIT')),
    amount           NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    pnl              NUMERIC(15,2) NOT NULL DEFAULT 0,  -- realised P&L (non-zero only on SELL)
    balance_after    NUMERIC(15,2) NOT NULL,             -- snapshot of user balance post-trade
    executed_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. WATCHLIST
--    Users can track stocks without owning them.
-- ============================================================
CREATE TABLE watchlist (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stock_id   UUID        NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, stock_id)
);

-- ============================================================
-- 8. MESSAGES  (community chat)
-- ============================================================
CREATE TABLE messages (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username   TEXT        NOT NULL,
    content    TEXT        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_portfolio_user_id        ON portfolio(user_id);
CREATE INDEX idx_portfolio_stock_id       ON portfolio(stock_id);
CREATE INDEX idx_orders_user_id           ON orders(user_id);
CREATE INDEX idx_orders_stock_id          ON orders(stock_id);
CREATE INDEX idx_orders_executed_at       ON orders(executed_at DESC);
CREATE INDEX idx_transactions_user_id     ON transactions(user_id);
CREATE INDEX idx_transactions_order_id    ON transactions(order_id);
CREATE INDEX idx_price_history_stock_id   ON price_history(stock_id);
CREATE INDEX idx_price_history_recorded   ON price_history(stock_id, recorded_at DESC);
CREATE INDEX idx_watchlist_user_id        ON watchlist(user_id);
CREATE INDEX idx_messages_created_at      ON messages(created_at DESC);

-- ============================================================
-- TRIGGERS — auto-update updated_at columns
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_portfolio_updated_at
    BEFORE UPDATE ON portfolio
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist     ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;

-- users: own row only
CREATE POLICY "users_select_own"  ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own"  ON users FOR UPDATE USING (auth.uid() = id);

-- stocks & price_history: fully public read (no auth required — prices are not sensitive)
CREATE POLICY "stocks_public_read"        ON stocks        FOR SELECT USING (true);
CREATE POLICY "price_history_public_read" ON price_history FOR SELECT USING (true);

-- portfolio: own rows only
CREATE POLICY "portfolio_select_own" ON portfolio FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "portfolio_insert_own" ON portfolio FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "portfolio_update_own" ON portfolio FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "portfolio_delete_own" ON portfolio FOR DELETE USING (auth.uid() = user_id);

-- orders: own rows only
CREATE POLICY "orders_select_own" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_insert_own" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- transactions: own rows only
CREATE POLICY "transactions_select_own" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_insert_own" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- watchlist: own rows only
CREATE POLICY "watchlist_select_own" ON watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "watchlist_insert_own" ON watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "watchlist_delete_own" ON watchlist FOR DELETE USING (auth.uid() = user_id);

-- messages: authenticated users can read all; insert own only
CREATE POLICY "messages_select_all" ON messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "messages_insert_own" ON messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- STORED FUNCTION: execute_trade
--    Atomically executes a buy or sell order.
--    Returns JSON: { success, order_id, balance_after, pnl }
-- ============================================================
CREATE OR REPLACE FUNCTION execute_trade(
    p_user_id  UUID,
    p_stock_id UUID,
    p_type     TEXT,           -- 'buy' | 'sell'
    p_quantity INTEGER,
    p_price    NUMERIC(12,2)
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_balance        NUMERIC(15,2);
    v_qty_held       INTEGER := 0;
    v_avg_price      NUMERIC(12,2) := 0;
    v_total_value    NUMERIC(15,2);
    v_pnl            NUMERIC(15,2) := 0;
    v_balance_after  NUMERIC(15,2);
    v_order_id       UUID;
    v_portfolio_id   UUID;
    v_txn_type       TEXT;
BEGIN
    -- ── Validate inputs ────────────────────────────────────────
    IF p_type NOT IN ('buy', 'sell') THEN
        RAISE EXCEPTION 'Invalid order type: %', p_type;
    END IF;
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity must be positive';
    END IF;
    IF p_price <= 0 THEN
        RAISE EXCEPTION 'Price must be positive';
    END IF;

    -- ── Fetch user balance (lock row) ──────────────────────────
    SELECT balance INTO v_balance
    FROM users WHERE id = p_user_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- ── Fetch existing portfolio position ──────────────────────
    SELECT id, quantity, avg_price
    INTO v_portfolio_id, v_qty_held, v_avg_price
    FROM portfolio
    WHERE user_id = p_user_id AND stock_id = p_stock_id;

    v_total_value := p_quantity * p_price;

    IF p_type = 'buy' THEN
        -- ── BUY ───────────────────────────────────────────────
        IF v_balance < v_total_value THEN
            RAISE EXCEPTION 'Insufficient balance. Need %, have %', v_total_value, v_balance;
        END IF;

        v_balance_after := v_balance - v_total_value;
        v_txn_type      := 'DEBIT';

        -- Deduct balance
        UPDATE users SET balance = v_balance_after WHERE id = p_user_id;

        -- Upsert portfolio
        IF v_portfolio_id IS NULL THEN
            INSERT INTO portfolio (user_id, stock_id, quantity, avg_price)
            VALUES (p_user_id, p_stock_id, p_quantity, p_price);
        ELSE
            UPDATE portfolio SET
                avg_price  = ((v_qty_held * v_avg_price) + v_total_value) / (v_qty_held + p_quantity),
                quantity   = v_qty_held + p_quantity,
                updated_at = NOW()
            WHERE id = v_portfolio_id;
        END IF;

    ELSIF p_type = 'sell' THEN
        -- ── SELL ──────────────────────────────────────────────
        IF v_portfolio_id IS NULL OR v_qty_held < p_quantity THEN
            RAISE EXCEPTION 'Insufficient shares. Have %, need %',
                COALESCE(v_qty_held, 0), p_quantity;
        END IF;

        -- Realised P&L = (sell_price - avg_cost) * qty
        v_pnl           := (p_price - v_avg_price) * p_quantity;
        v_balance_after := v_balance + v_total_value;
        v_txn_type      := 'CREDIT';

        -- Credit balance
        UPDATE users SET balance = v_balance_after WHERE id = p_user_id;

        -- Update or delete portfolio row
        IF v_qty_held = p_quantity THEN
            DELETE FROM portfolio WHERE id = v_portfolio_id;
        ELSE
            UPDATE portfolio SET
                quantity   = v_qty_held - p_quantity,
                updated_at = NOW()
            WHERE id = v_portfolio_id;
        END IF;
    END IF;

    -- ── Record order ───────────────────────────────────────────
    INSERT INTO orders (user_id, stock_id, order_type, quantity, price, status)
    VALUES (p_user_id, p_stock_id, p_type, p_quantity, p_price, 'completed')
    RETURNING id INTO v_order_id;

    -- ── Record transaction ─────────────────────────────────────
    INSERT INTO transactions (order_id, user_id, stock_id, transaction_type, amount, pnl, balance_after)
    VALUES (v_order_id, p_user_id, p_stock_id, v_txn_type, v_total_value, v_pnl, v_balance_after);

    RETURN json_build_object(
        'success',       true,
        'order_id',      v_order_id,
        'balance_after', v_balance_after,
        'pnl',           v_pnl
    );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error',   SQLERRM
    );
END;
$$;

-- ============================================================
-- STORED FUNCTION: handle_new_user
--    Trigger on auth.users INSERT — auto-creates user profile.
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name, balance)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        100000.00
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SEED DATA — sample stocks
-- ============================================================
INSERT INTO stocks (symbol, name, sector, current_price, prev_close) VALUES
    ('AAPL',  'Apple Inc.',              'Technology',    189.30, 187.15),
    ('MSFT',  'Microsoft Corporation',   'Technology',    415.50, 412.00),
    ('GOOGL', 'Alphabet Inc.',           'Technology',    175.20, 173.80),
    ('AMZN',  'Amazon.com Inc.',         'Consumer',      185.60, 183.90),
    ('META',  'Meta Platforms Inc.',     'Technology',    518.40, 514.20),
    ('TSLA',  'Tesla Inc.',              'Automotive',    177.90, 175.50),
    ('NVDA',  'NVIDIA Corporation',      'Technology',    875.40, 862.10),
    ('JPM',   'JPMorgan Chase & Co.',    'Finance',       196.80, 195.20),
    ('V',     'Visa Inc.',               'Finance',       270.30, 268.50),
    ('JNJ',   'Johnson & Johnson',       'Healthcare',    147.60, 146.80),
    ('WMT',   'Walmart Inc.',            'Retail',        65.40,  64.90),
    ('PG',    'Procter & Gamble Co.',    'Consumer',      161.20, 160.50),
    ('MA',    'Mastercard Incorporated', 'Finance',       462.70, 459.30),
    ('HD',    'The Home Depot Inc.',     'Retail',        342.10, 339.80),
    ('BAC',   'Bank of America Corp.',   'Finance',       37.80,  37.40),
    ('XOM',   'Exxon Mobil Corporation', 'Energy',        108.50, 107.20),
    ('DIS',   'The Walt Disney Company', 'Entertainment', 99.70,  98.90),
    ('NFLX',  'Netflix Inc.',            'Entertainment', 627.80, 621.40),
    ('ADBE',  'Adobe Inc.',              'Technology',    476.30, 472.10),
    ('CRM',   'Salesforce Inc.',         'Technology',    271.50, 268.90)
ON CONFLICT (symbol) DO NOTHING;