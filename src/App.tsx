import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleHelp,
  CreditCard,
  Headphones,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

type ProductCategory = 'Phones' | 'Audio' | 'Power' | 'Protection';
type ProductVisual = 'phone' | 'accessory' | 'charger' | 'case';

type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  oldPrice?: number;
  description: string;
  badge?: string;
  visual: ProductVisual;
  color: string;
  specs: string[];
};

type CartLine = {
  product: Product;
  quantity: number;
};

const products: Product[] = [
  {
    id: 'pixel-8a',
    name: 'Pixel 8a',
    category: 'Phones',
    price: 6250,
    oldPrice: 6690,
    description: 'Clean Android, sharp camera, properly fast.',
    badge: 'Fresh drop',
    visual: 'phone',
    color: 'ocean',
    specs: ['128GB storage', '8GB RAM', '6.1" OLED display', 'Tensor G3 processor'],
  },
  {
    id: 'iphone-13',
    name: 'iPhone 13',
    category: 'Phones',
    price: 7850,
    oldPrice: 8290,
    description: 'The dependable everyday iPhone in midnight.',
    badge: 'Kumasi pick',
    visual: 'phone',
    color: 'midnight',
    specs: ['128GB storage', 'A15 Bionic chip', 'Dual 12MP camera', 'Battery checked in-store'],
  },
  {
    id: 'galaxy-a55',
    name: 'Galaxy A55 5G',
    category: 'Phones',
    price: 5190,
    description: 'Big screen, all-day battery, 5G ready.',
    visual: 'phone',
    color: 'graphite',
    specs: ['256GB storage', '8GB RAM', '6.6" Super AMOLED', '5000mAh battery'],
  },
  {
    id: 'soundcore-q30',
    name: 'Soundcore Q30',
    category: 'Audio',
    price: 980,
    oldPrice: 1120,
    description: 'Noise cancelling that keeps the trotro outside.',
    badge: 'Best value',
    visual: 'accessory',
    color: 'gold',
    specs: ['Hybrid active noise cancellation', '40-hour playtime', 'Multipoint connection', 'USB-C fast charge'],
  },
  {
    id: 'anker-20k',
    name: 'Anker PowerCore 20K',
    category: 'Power',
    price: 540,
    description: 'Reliable power for long days around Kejetia.',
    visual: 'charger',
    color: 'silver',
    specs: ['20,000mAh capacity', '20W USB-C output', 'Two USB-A ports', 'Travel-ready build'],
  },
  {
    id: 'usb-c-45w',
    name: '45W USB-C GaN',
    category: 'Power',
    price: 390,
    oldPrice: 450,
    description: 'Small charger. Serious speed. One less brick.',
    visual: 'charger',
    color: 'cyan',
    specs: ['45W Power Delivery', 'GaN compact design', 'Overheat protection', 'Works with laptops'],
  },
  {
    id: 'armor-case',
    name: 'Armor Case / Clear',
    category: 'Protection',
    price: 180,
    description: 'A clear, grippy layer for your daily carry.',
    visual: 'case',
    color: 'clear',
    specs: ['Raised camera lip', 'Shock-absorbing corners', 'Anti-yellow shell', 'Pixel and iPhone sizes'],
  },
  {
    id: 'privacy-glass',
    name: 'Privacy Glass',
    category: 'Protection',
    price: 95,
    description: 'Keep your screen yours on the move.',
    visual: 'case',
    color: 'smoke',
    specs: ['Two-way privacy filter', '9H tempered glass', 'Bubble-free install', 'Selected models'],
  },
];

const categories = ['All', 'Phones', 'Audio', 'Power', 'Protection'] as const;
const queryClient = new QueryClient();

function formatPrice(value: number) {
  return `GH₵ ${value.toLocaleString('en-GH')}`;
}

function ProductVisual({ product, detail = false }: { product: Product; detail?: boolean }) {
  return (
    <div className={detail ? 'visual-device' : `visual-device ${product.visual}`} data-testid={`visual-product-${product.id}`}>
      {detail && <span className="sr-only">{product.name} product visual</span>}
    </div>
  );
}

function Header({ bagCount, onOpenBag }: { bagCount: number; onOpenBag: () => void }) {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a className="brand" href="#top" data-testid="link-brand-home">
          <span className="brand-mark">B.</span>
          <span>
            <span className="brand-name">BOADI PHONES</span>
            <span className="brand-sub">+ accessories / kumasi</span>
          </span>
        </a>
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#shop" data-testid="link-shop">Shop</a>
          <a href="#why-boadi" data-testid="link-why-boadi">Why Boadi</a>
          <a href="#contact" data-testid="link-contact">Contact</a>
        </nav>
        <button className="bag-button" type="button" onClick={onOpenBag} data-testid="button-open-bag">
          <ShoppingBag size={16} />
          <span>Bag</span>
          <span className="bag-count" data-testid="text-bag-count">{bagCount}</span>
        </button>
      </div>
    </header>
  );
}

function ProductCard({
  product,
  onAdd,
  onDetails,
}: {
  product: Product;
  onAdd: (product: Product) => void;
  onDetails: (product: Product) => void;
}) {
  return (
    <article className="product-card" data-testid={`card-product-${product.id}`}>
      <div className="product-visual" style={{ background: product.color === 'gold' ? '#3b3428' : undefined }}>
        <span className="visual-label">BP / {product.category.toUpperCase()}</span>
        <ProductVisual product={product} />
        {product.badge && <span className="product-badge">{product.badge}</span>}
      </div>
      <div className="product-copy">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-bottom">
          <div>
            <div className="price" data-testid={`text-price-${product.id}`}>{formatPrice(product.price)}</div>
            {product.oldPrice && <span className="old-price">{formatPrice(product.oldPrice)}</span>}
          </div>
          <button
            className="small-button"
            type="button"
            onClick={() => onAdd(product)}
            data-testid={`button-add-${product.id}`}
          >
            Add to bag
          </button>
        </div>
        <button
          className="detail-link"
          type="button"
          onClick={() => onDetails(product)}
          data-testid={`button-details-${product.id}`}
        >
          View details <ArrowRight size={13} />
        </button>
      </div>
    </article>
  );
}

function BagDrawer({
  lines,
  onClose,
  onChangeQuantity,
  onRemove,
  onCheckout,
  onShop,
}: {
  lines: CartLine[];
  onClose: () => void;
  onChangeQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  onShop: () => void;
}) {
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const totalItems = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="bag-title" data-testid="dialog-bag">
        <div className="drawer-header">
          <div>
            <span className="eyebrow">Your selection / {totalItems} item{totalItems === 1 ? '' : 's'}</span>
            <h2 className="display" id="bag-title">The bag.</h2>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Close bag" data-testid="button-close-bag">
            <X size={18} />
          </button>
        </div>
        <div className="drawer-body">
          {lines.length === 0 ? (
            <div className="empty-bag" data-testid="empty-bag-state">
              <div className="empty-icon"><ShoppingBag size={25} /></div>
              <div>
                <h3 className="display">Nothing here yet.</h3>
                <p>Your next phone, a fresh case, or that charger you keep borrowing is waiting in the shop.</p>
              </div>
              <button className="primary-button" type="button" onClick={onShop} data-testid="button-empty-bag-shop">
                Browse the shop <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            lines.map((line) => (
              <div className="bag-item" key={line.product.id} data-testid={`row-bag-${line.product.id}`}>
                <div className="bag-thumb">
                  <ProductVisual product={line.product} />
                </div>
                <div>
                  <p className="bag-item-name">{line.product.name}</p>
                  <span className="bag-item-meta">{formatPrice(line.product.price)} / each</span>
                  <div className="quantity" aria-label={`Quantity for ${line.product.name}`}>
                    <button
                      type="button"
                      onClick={() => onChangeQuantity(line.product.id, -1)}
                      aria-label={`Decrease ${line.product.name} quantity`}
                      data-testid={`button-decrease-${line.product.id}`}
                    >
                      <Minus size={13} />
                    </button>
                    <span data-testid={`text-quantity-${line.product.id}`}>{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onChangeQuantity(line.product.id, 1)}
                      aria-label={`Increase ${line.product.name} quantity`}
                      data-testid={`button-increase-${line.product.id}`}
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      className="remove-line"
                      type="button"
                      onClick={() => onRemove(line.product.id)}
                      data-testid={`button-remove-${line.product.id}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="bag-item-total">{formatPrice(line.product.price * line.quantity)}</div>
              </div>
            ))
          )}
        </div>
        {lines.length > 0 && (
          <div className="drawer-footer">
            <div className="totals">
              <div className="total-line"><span>Items</span><strong>{totalItems}</strong></div>
              <div className="total-line"><span>Pickup / delivery</span><strong>Calculated next</strong></div>
              <div className="total-line grand"><span>Subtotal</span><strong data-testid="text-bag-subtotal">{formatPrice(subtotal)}</strong></div>
            </div>
            <button className="primary-button full-width" type="button" onClick={onCheckout} data-testid="button-start-checkout">
              Continue to MoMo checkout <ArrowRight size={16} />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

function ProductDetails({
  product,
  onClose,
  onAdd,
}: {
  product: Product;
  onClose: () => void;
  onAdd: (product: Product) => void;
}) {
  return (
    <div className="overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="product-detail-title" data-testid={`dialog-product-${product.id}`}>
        <button className="close-button detail-close" type="button" onClick={onClose} aria-label="Close product details" data-testid="button-close-product-details">
          <X size={18} />
        </button>
        <div className="detail-grid">
          <div className="detail-visual">
            <ProductVisual product={product} />
          </div>
          <div className="detail-copy">
            <span className="eyebrow">{product.category} / in stock in Kumasi</span>
            <h2 className="display" id="product-detail-title">{product.name}</h2>
            <p>{product.description} Every piece is checked before it leaves Boadi, so you know what is coming home with you.</p>
            <ul className="spec-list">
              {product.specs.map((spec) => (
                <li key={spec}><Check size={14} /> {spec}</li>
              ))}
            </ul>
            <div className="product-bottom">
              <div className="price">{formatPrice(product.price)}</div>
              <button
                className="primary-button"
                type="button"
                onClick={() => {
                  onAdd(product);
                  onClose();
                }}
                data-testid={`button-detail-add-${product.id}`}
              >
                Add to bag <ShoppingBag size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type CheckoutValues = {
  name: string;
  phone: string;
  network: string;
  fulfilment: string;
};

function CheckoutModal({
  lines,
  onClose,
  onComplete,
}: {
  lines: CartLine[];
  onClose: () => void;
  onComplete: () => void;
}) {
  const [values, setValues] = useState<CheckoutValues>({
    name: '',
    phone: '',
    network: '',
    fulfilment: 'store pickup',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutValues, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  const updateValue = (key: keyof CheckoutValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof CheckoutValues, string>> = {};
    if (values.name.trim().length < 2) nextErrors.name = 'Add the name we should attach to this order.';
    if (!/^0\d{9}$/.test(values.phone.replace(/\s/g, ''))) nextErrors.phone = 'Use a 10-digit Ghana number, for example 024 123 4567.';
    if (!values.network) nextErrors.network = 'Choose your MoMo network.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitHandoff = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validate()) setSubmitted(true);
  };

  return (
    <div className="overlay" role="presentation">
      <section className="checkout" role="dialog" aria-modal="true" aria-labelledby="checkout-title" data-testid="dialog-checkout">
        {submitted ? (
          <div className="success-state" data-testid="status-payment-success">
            <div className="success-mark"><CheckCircle2 size={35} /></div>
            <span className="eyebrow">Handoff ready / {values.network}</span>
            <h3 className="display">Check your phone.</h3>
            <p>We have prepared your {formatPrice(subtotal)} MoMo request for {values.phone}. Approve the prompt on your phone, then collect from Boadi or wait for our delivery call.</p>
            <button className="primary-button" type="button" onClick={onComplete} data-testid="button-finish-checkout">
              Done — back to Boadi <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="checkout-header">
              <div>
                <span className="eyebrow">Secure local handoff / step 02</span>
                <h2 className="display" id="checkout-title">Pay your way.</h2>
              </div>
              <button className="close-button" type="button" onClick={onClose} aria-label="Close checkout" data-testid="button-close-checkout">
                <X size={18} />
              </button>
            </div>
            <div className="checkout-content">
              <div className="checkout-summary">
                <h3>Order summary</h3>
                {lines.map((line) => (
                  <div className="summary-item" key={line.product.id} data-testid={`summary-item-${line.product.id}`}>
                    <span>{line.product.name} × {line.quantity}</span>
                    <strong>{formatPrice(line.product.price * line.quantity)}</strong>
                  </div>
                ))}
                <div className="total-line grand" style={{ marginTop: 18 }}>
                  <span>Total today</span>
                  <strong data-testid="text-checkout-total">{formatPrice(subtotal)}</strong>
                </div>
                <div className="payment-note">
                  <ShieldCheck size={17} />
                  <span>Your payment prompt goes to your chosen Ghana MoMo number. Boadi never asks for your PIN.</span>
                </div>
              </div>
              <form className="payment-form" onSubmit={submitHandoff} noValidate>
                <h3>MoMo details</h3>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="checkout-name">Full name</label>
                    <input
                      id="checkout-name"
                      value={values.name}
                      onChange={(event) => updateValue('name', event.target.value)}
                      placeholder="Name for this order"
                      aria-invalid={Boolean(errors.name)}
                      data-testid="input-checkout-name"
                    />
                    {errors.name && <span className="field-error">{errors.name}</span>}
                  </div>
                  <div className="form-grid two">
                    <div className="field">
                      <label htmlFor="checkout-phone">MoMo number</label>
                      <input
                        id="checkout-phone"
                        inputMode="tel"
                        value={values.phone}
                        onChange={(event) => updateValue('phone', event.target.value)}
                        placeholder="024 123 4567"
                        aria-invalid={Boolean(errors.phone)}
                        data-testid="input-checkout-phone"
                      />
                      {errors.phone && <span className="field-error">{errors.phone}</span>}
                    </div>
                    <div className="field">
                      <label htmlFor="checkout-network">Network</label>
                      <select
                        id="checkout-network"
                        value={values.network}
                        onChange={(event) => updateValue('network', event.target.value)}
                        aria-invalid={Boolean(errors.network)}
                        data-testid="select-checkout-network"
                      >
                        <option value="">Select network</option>
                        <option value="MTN MoMo">MTN MoMo</option>
                        <option value="Telecel Cash">Telecel Cash</option>
                        <option value="AirtelTigo Money">AirtelTigo Money</option>
                      </select>
                      {errors.network && <span className="field-error">{errors.network}</span>}
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="checkout-fulfilment">How should we get it to you?</label>
                    <select
                      id="checkout-fulfilment"
                      value={values.fulfilment}
                      onChange={(event) => updateValue('fulfilment', event.target.value)}
                      data-testid="select-checkout-fulfilment"
                    >
                      <option value="store pickup">Pick up at our Kumasi shop — free</option>
                      <option value="courier">Kumasi courier — confirm fee on call</option>
                    </select>
                  </div>
                </div>
                <button className="primary-button full-width" type="submit" style={{ marginTop: 20 }} data-testid="button-submit-momo">
                  <CreditCard size={16} /> Send MoMo handoff <ArrowRight size={16} />
                </button>
                <p className="form-footnote">{itemCount} item{itemCount === 1 ? '' : 's'} reserved for 15 minutes while you approve.</p>
              </form>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Home() {
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>('All');
  const [bagOpen, setBagOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);

  const visibleProducts = useMemo(
    () => activeCategory === 'All' ? products : products.filter((product) => product.category === activeCategory),
    [activeCategory],
  );
  const bagCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  };

  const addToBag = (product: Product) => {
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      if (existing) {
        return current.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line);
      }
      return [...current, { product, quantity: 1 }];
    });
    showToast(`${product.name} added to your bag.`);
  };

  const changeQuantity = (id: string, delta: number) => {
    setCart((current) =>
      current
        .map((line) => line.product.id === id ? { ...line, quantity: line.quantity + delta } : line)
        .filter((line) => line.quantity > 0),
    );
  };

  const removeLine = (id: string) => {
    setCart((current) => current.filter((line) => line.product.id !== id));
  };

  const startCheckout = () => {
    setBagOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <div className="storefront" id="top">
      <Header bagCount={bagCount} onOpenBag={() => setBagOpen(true)} />
      <main>
        <section className="hero">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Your plug for good tech / Kumasi, Ghana</span>
              <h1 className="display">Tech that <em>moves</em> with you.</h1>
              <p>Phones that fit your life. Accessories that do their job. Straight prices, checked devices, and a real shop in the heart of Kumasi.</p>
              <div className="hero-actions">
                <a className="primary-button" href="#shop" data-testid="link-shop-hero">Shop the drop <ArrowRight size={16} /></a>
                <button className="ghost-button" type="button" onClick={() => setBagOpen(true)} data-testid="button-view-bag-hero">
                  <ShoppingBag size={16} /> Open bag
                </button>
              </div>
              <div className="hero-footnote"><span className="status-dot" /> Open today · Adum, Kumasi · MoMo accepted</div>
            </div>
            <div className="hero-art" aria-label="Featured Pixel 8a visual">
              <div className="hero-card">
                <div className="hero-card-top">
                  <span className="hero-card-index">01 / 08</span>
                  <Sparkles size={17} color="hsl(39 100% 61%)" />
                </div>
                <div className="hero-phone" />
                <h2 className="hero-card-title display">Good tech.<br />No drama.</h2>
                <div className="hero-card-meta"><span>Featured / Pixel 8a</span><span>from GH₵ 6,250</span></div>
              </div>
            </div>
          </div>
        </section>

        <div className="ticker" aria-label="Boadi service highlights">
          <div className="ticker-track">
            <span><strong>01</strong> Checked devices</span>
            <span><strong>02</strong> MoMo ready</span>
            <span><strong>03</strong> Kumasi pickup</span>
            <span><strong>04</strong> No mystery pricing</span>
            <span><strong>05</strong> Accessories that last</span>
          </div>
        </div>

        <section className="section" id="shop">
          <div className="shell">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Selected in Adum / 08 pieces</span>
                <h2 className="display">The good stuff.</h2>
              </div>
              <p>A tight edit of phones and everyday essentials. Browse at your pace, then pay securely with your Ghana number.</p>
            </div>
            <div className="filter-row" role="tablist" aria-label="Product categories">
              {categories.map((category) => (
                <button
                  className={`filter-button ${activeCategory === category ? 'active' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                  key={category}
                  data-testid={`button-filter-${category.toLowerCase()}`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="product-grid">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={addToBag} onDetails={setSelectedProduct} />
              ))}
            </div>
          </div>
        </section>

        <section className="feature-band" id="why-boadi">
          <div className="shell feature-grid">
            <div className="feature-copy">
              <span className="eyebrow">Why people come back</span>
              <h2 className="display">The shop behind the screen.</h2>
              <p>Buying tech should not feel like a gamble. We know the difference between a deal and a headache — and we will tell you before you pay.</p>
            </div>
            <div className="feature-list">
              <div className="feature-item"><ShieldCheck size={19} /><h3>Checked before sale</h3><p>Battery, screen, cameras, ports. We test the details.</p></div>
              <div className="feature-item"><Zap size={19} /><h3>Fast local advice</h3><p>Tell us what you need. We will not upsell what you do not.</p></div>
              <div className="feature-item"><MapPin size={19} /><h3>Find us in Adum</h3><p>Come through, see it in your hand, leave certain.</p></div>
              <div className="feature-item"><RotateCcw size={19} /><h3>Clear aftercare</h3><p>We stay available after the sale, not just before it.</p></div>
            </div>
          </div>
        </section>

        <section className="section" id="contact">
          <div className="shell">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Need a second opinion?</span>
                <h2 className="display">Ask Boadi.</h2>
              </div>
              <p>Whether you are upgrading or buying your first smartphone, bring the question. We speak human, not spec-sheet.</p>
            </div>
            <div className="feature-list">
              <a className="feature-item contact-item" href="tel:+233240000000" data-testid="link-call-boadi"><Headphones size={19} /><h3>Call the shop</h3><p>+233 24 000 0000 · quick answers from Kumasi.</p></a>
              <a className="feature-item contact-item" href="https://wa.me/233240000000" target="_blank" rel="noreferrer" data-testid="link-whatsapp-boadi"><CircleHelp size={19} /><h3>Chat your shortlist</h3><p>Send your budget and we will point you right.</p></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="shell">
          <div className="footer-grid">
            <div>
              <a className="brand" href="#top" data-testid="link-footer-brand"><span className="brand-mark">B.</span><span><span className="brand-name">BOADI PHONES</span><span className="brand-sub">+ accessories / kumasi</span></span></a>
              <p className="footer-copy">Good tech for real life in Kumasi. Phones, power, audio, and the advice to match.</p>
            </div>
            <div><h3>Visit</h3><p>Adum, Kumasi</p><p>Mon–Sat · 8:30–18:00</p></div>
            <div><h3>Buy easy</h3><p>MoMo accepted</p><p>Pickup or courier</p></div>
          </div>
          <div className="footer-base"><span>© 2024 Boadi Phones + Accessories</span><span>Made for Kumasi / built for the everyday</span></div>
        </div>
      </footer>

      {bagOpen && (
        <BagDrawer
          lines={cart}
          onClose={() => setBagOpen(false)}
          onChangeQuantity={changeQuantity}
          onRemove={removeLine}
          onCheckout={startCheckout}
          onShop={() => {
            setBagOpen(false);
            document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}
      {selectedProduct && <ProductDetails product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToBag} />}
      {checkoutOpen && <CheckoutModal lines={cart} onClose={() => setCheckoutOpen(false)} onComplete={() => { setCheckoutOpen(false); setCart([]); }} />}
      {toast && <div className="toast" role="status" data-testid="status-add-to-bag"><Check size={16} /> {toast}</div>}
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;