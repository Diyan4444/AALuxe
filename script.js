/* ═══════════════════════════════════════════════
   AALUXE — script.js
   Core UI logic, rendering, XSS sanitization, cart & favorites state,
   listings filtering, animated counter, and direct WhatsApp concierge inquiry modal engine.
   ═══════════════════════════════════════════════ */

import { escapeHTML } from './src/utils/security.js';
import { logSearchActivity } from './src/firebase/firestore.js';


// ─── UTILITY HELPERS ──────────────────────────────────────────────────────────
export function getOptimizedImageUrl(url, width = 600, quality = 80) {
  if (!url) return 'bg.avif';
  if (url.includes('images.unsplash.com')) {
    const cleanUrl = url.split('?')[0];
    return `${cleanUrl}?auto=format&fit=crop&w=${width}&q=${quality}`;
  }
  return url;
}

export function formatPrice(p) {
  return '₹' + Number(p || 0).toLocaleString('en-IN');
}

export function getCart() {
  try { return JSON.parse(localStorage.getItem('aaluxe_cart')) || []; } catch { return []; }
}
export function saveCart(cart) { localStorage.setItem('aaluxe_cart', JSON.stringify(cart)); }

export function getFavs() {
  try { return JSON.parse(localStorage.getItem('aaluxe_favs')) || []; } catch { return []; }
}
export function saveFavs(favs) { localStorage.setItem('aaluxe_favs', JSON.stringify(favs)); }

export function isInCart(id) { return getCart().some(i => String(i.id) === String(id)); }
export function isInFavs(id) { return getFavs().includes(String(id)) || getFavs().includes(Number(id)); }

export function updateBadges() {
  const c = getCart().length;
  const f = getFavs().length;
  document.querySelectorAll('.cart-badge').forEach(el => el.textContent = c);
  document.querySelectorAll('.fav-badge').forEach(el => el.textContent = f);
}

export function showToast(msg, icon = '✦') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="toast-icon">${escapeHTML(icon)}</span><span>${escapeHTML(msg)}</span>`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

export function addToCart(id) {
  const sourceProperties = window.allStaysData || [];
  const prop = sourceProperties.find(p => String(p.id) === String(id));
  if (!prop) return;
  
  let cart = getCart();
  if (cart.some(i => String(i.id) === String(id))) {
    showToast('Already in your cart', '◈');
    return;
  }
  cart.push({ id: prop.id, name: prop.name, type: prop.type, location: prop.location, image: prop.image });
  saveCart(cart);
  updateBadges();
  showToast(`${prop.name} added to cart`, '◉');
  const btn = document.querySelector(`[data-cart="${id}"]`);
  if (btn) { btn.textContent = 'In Cart ✓'; btn.style.opacity = '0.7'; }
}

export function toggleFav(id) {
  let favs = getFavs();
  const sourceProperties = window.allStaysData || [];
  const prop = sourceProperties.find(p => String(p.id) === String(id));
  const stringId = String(id);
  const willBeSaved = !favs.map(String).includes(stringId);

  if (!willBeSaved) {
    favs = favs.filter(f => String(f) !== stringId);
    showToast(`Removed from saved`, '♡');
  } else {
    if (!prop && !id) return;
    favs.push(id);
    showToast(`${prop ? prop.name : 'Stay'} saved to favorites`, '♥');
  }
  
  saveFavs(favs);
  updateBadges();
  
  document.querySelectorAll(`[data-fav="${id}"]`).forEach(btn => {
    btn.classList.toggle('active', willBeSaved);
    const svg = btn.querySelector('svg');
    if (svg) {
      svg.setAttribute('fill', willBeSaved ? '#D63939' : 'none');
      svg.setAttribute('stroke', willBeSaved ? '#D63939' : 'currentColor');
    }
  });

  if (window.location.pathname.includes('favorites.html') || document.getElementById('favoritesGrid')) {
    initFavorites();
  }
}

// ─── SAFE PROPERTY CARD RENDERER ──────────────────────────────────────────────
export function renderCard(prop) {
  const inFav = isInFavs(prop.id);
  const inCart = isInCart(prop.id);
  const safeName = escapeHTML(prop.name);
  const safeLocation = escapeHTML(prop.location);
  const safeType = escapeHTML(prop.type);
  const rawImage = prop.image || 'bg.avif';
  const safeImage = escapeHTML(getOptimizedImageUrl(rawImage, 600, 75));

  const rawType = (prop.type || '').trim().toLowerCase();
  const isVilla = rawType === 'villa';
  const displayType = isVilla ? 'Villa' : 'Resort';
  const safeBhk = (isVilla && prop.bhk) ? escapeHTML(prop.bhk) : '';
  const cardTypeLabel = safeBhk ? `${displayType} &middot; ${safeBhk}` : displayType;

  return `
    <div class="prop-card" data-id="${escapeHTML(prop.id)}">
      <div class="card-img-wrap">
        <img src="${safeImage}" alt="${safeName}" loading="lazy" decoding="async" />

        <button class="fav-btn ${inFav ? 'active' : ''}" data-fav="${escapeHTML(prop.id)}" onclick="window.toggleFav('${escapeHTML(prop.id)}')" aria-label="Save">
          <svg viewBox="0 0 24 24" fill="${inFav ? '#D63939' : 'none'}" stroke="${inFav ? '#D63939' : 'currentColor'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
      </div>
      <div class="card-body" style="padding-bottom: 10px;">
        <div class="card-type">${cardTypeLabel}</div>
        <h3 class="card-name">${safeName}</h3>
        <div class="card-location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          ${safeLocation}
        </div>
        <p style="font-size: 12px; color: var(--mid); line-height: 1.4; font-weight: 500; margin-top: auto; border-top: 1px solid var(--ivory-3); padding-top: 12px;">
          Want to see more? Contact us on WhatsApp for additional photos, videos, and personalized booking availability.
        </p>
      </div>
      <div class="card-actions">
        <button type="button" class="btn-dark" onclick="window.openPropertyModal('${escapeHTML(prop.id)}')">View Details</button>
        <button class="btn-outline ${inCart ? 'in-cart' : ''}" data-cart="${escapeHTML(prop.id)}"
          onclick="window.addToCart('${escapeHTML(prop.id)}')"
          ${inCart ? 'style="opacity:0.7"' : ''}>
          ${inCart ? 'In Cart ✓' : 'Add to Cart'}
        </button>
      </div>
    </div>
  `;
}

// ─── HOME PAGE FEATURED ───────────────────────────────────────────────────────
export function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;

  const sourceProperties = window.allStaysData || [];
  let featured = sourceProperties.filter(p => p.published !== false).slice(0, 6);

  if (featured.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888; font-family: \'Montserrat\', sans-serif; font-size: 14px;">Curating luxury stays...</p>';
  } else {
    grid.innerHTML = featured.map(renderCard).join('');
  }
}

export function heroSearch() {
  const loc = (document.getElementById('heroLocationSelect') || document.getElementById('heroLocation'))?.value.trim() || '';
  if (loc) {
    logSearchActivity({ location: loc, query: `Destination: ${loc}` });
    window.location.href = `listings.html?search=${encodeURIComponent(loc)}`;
  } else {
    window.location.href = 'listings.html';
  }
}

// ─── LISTINGS FILTERING ENGINE ───────────────────────────────────────────────
export function initListings() {
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get('type');
  const searchParam = urlParams.get('search');

  if (searchParam) {
    const searchInput = document.getElementById('keywordSearch');
    if (searchInput) searchInput.value = searchParam;
  }

  if (typeParam) {
    document.querySelectorAll('.type-check').forEach(cb => {
      if (cb.value.toLowerCase() === typeParam.toLowerCase()) {
        cb.checked = true;
      }
    });
  }

  applyFilters();
}

export function applyFilters() {
  const grid = document.getElementById('listingsGrid');
  const noResults = document.getElementById('noResults');
  const countEl = document.getElementById('resultsCount');

  if (!grid) return;

  const searchInput = document.getElementById('keywordSearch')?.value.toLowerCase().trim() || '';
  const selectedTypes = Array.from(document.querySelectorAll('.type-check:checked')).map(cb => cb.value);
  const locationVal = document.getElementById('locationFilter')?.value || '';
  const sortVal = document.getElementById('sortSelect')?.value || 'default';

  if (searchInput || selectedTypes.length > 0 || locationVal) {
    if (window._searchLogTimer) clearTimeout(window._searchLogTimer);
    window._searchLogTimer = setTimeout(() => {
      logSearchActivity({
        query: searchInput,
        location: locationVal,
        type: selectedTypes.join(', ')
      });
    }, 1000);
  }

  const sourceProperties = window.allStaysData || [];


  let filtered = sourceProperties.filter(p => {
    if (p.published === false) return false;

    // Search filter
    if (searchInput) {
      const nameMatch = p.name ? p.name.toLowerCase().includes(searchInput) : false;
      const descMatch = p.description ? p.description.toLowerCase().includes(searchInput) : false;
      const locationMatch = p.location ? p.location.toLowerCase().includes(searchInput) : false;
      const typeMatch = p.type ? p.type.toLowerCase().includes(searchInput) : false;
      const amenitiesMatch = p.amenities ? p.amenities.some(a => a.toLowerCase().includes(searchInput)) : false;

      if (!nameMatch && !descMatch && !locationMatch && !typeMatch && !amenitiesMatch) {
        return false;
      }
    }

    // Property type filter
    if (selectedTypes.length && !selectedTypes.some(t => t.toLowerCase() === (p.type || '').toLowerCase())) {
      return false;
    }

    // Location filter
    if (locationVal && !(p.location || '').toLowerCase().includes(locationVal.toLowerCase())) {
      return false;
    }

    return true;
  });

  if (countEl && typeof animatePropertyCount === 'function') {
    animatePropertyCount(filtered.length);
  } else if (countEl) {
    countEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'property' : 'properties'} found`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    noResults?.classList.remove('hidden');
  } else {
    noResults?.classList.add('hidden');
    grid.innerHTML = filtered.map(renderCard).join('');
  }
}

export function clearFilters() {
  document.querySelectorAll('.type-check').forEach(cb => cb.checked = false);
  const locSel = document.getElementById('locationFilter');
  if (locSel) locSel.value = '';
  const sortSel = document.getElementById('sortSelect');
  if (sortSel) sortSel.value = 'default';
  const searchBar = document.getElementById('keywordSearch');
  if (searchBar) searchBar.value = '';
  if (window.location.search) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  applyFilters();
}

export function toggleFilters() {
  const sidebar = document.getElementById('filtersSidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

export function animatePropertyCount(targetCount) {
  const counter = document.getElementById("resultsCount");
  if (!counter) return;

  if (counter._animationFrame) {
    cancelAnimationFrame(counter._animationFrame);
  }

  const duration = 1200;
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentCount = Math.floor(targetCount * easedProgress);

    counter.textContent = `${currentCount} ${currentCount === 1 ? "property" : "properties"} found`;

    if (progress < 1) {
      counter._animationFrame = requestAnimationFrame(animate);
    } else {
      counter.textContent = `${targetCount} ${targetCount === 1 ? "property" : "properties"} found`;
    }
  }

  counter._animationFrame = requestAnimationFrame(animate);
}

// ─── FAVORITES & CART ────────────────────────────────────────────────────────
export function initFavorites() {
  const grid = document.getElementById('favoritesGrid');
  const empty = document.getElementById('emptyFav');
  if (!grid) return;

  const favIds = getFavs();
  const sourceProperties = window.allStaysData || [];
  const favProps = sourceProperties.filter(p => favIds.map(String).includes(String(p.id)));

  if (favProps.length === 0) {
    grid.innerHTML = '';
    empty?.classList.remove('hidden');
  } else {
    empty?.classList.add('hidden');
    grid.innerHTML = favProps.map(renderCard).join('');
  }
}

export function initCart() {
  const itemsWrap = document.getElementById('cartItems');
  const summaryWrap = document.getElementById('cartSummary');
  const actionsWrap = document.getElementById('cartHeaderActions');
  if (!itemsWrap) return;

  const cart = getCart();

  if (actionsWrap) {
    if (cart.length >= 1) {
      actionsWrap.innerHTML = `
        <button class="btn-outline" onclick="window.clearWholeCart()" 
                style="padding: 8px 16px; font-size: 13px; color: #dc3545; border-color: #dc3545; cursor: pointer;">
          Clear All Items
        </button>
      `;
    } else {
      actionsWrap.innerHTML = '';
    }
  }

  if (cart.length === 0) {
    itemsWrap.innerHTML = `
      <div class="empty-cart">
        <div class="empty-icon">◇</div>
        <h3>Your cart is empty</h3>
        <p>Browse our collection and add stays you love.</p>
        <a href="listings.html" class="btn-gold" style="display:inline-flex;margin-top:8px">Browse Stays</a>
      </div>`;
    if (summaryWrap) summaryWrap.innerHTML = '';
    return;
  }

  itemsWrap.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img"><img src="${escapeHTML(item.image || 'bg.avif')}" alt="${escapeHTML(item.name)}" /></div>
      <div class="cart-item-body">
        <div class="cart-item-type">${escapeHTML(item.type)}</div>
        <div class="cart-item-name">${escapeHTML(item.name)}</div>
        <div class="cart-item-loc">${escapeHTML(item.location)}</div>
        <div class="cart-item-footer">
          <p style="font-size: 12px; color: var(--mid); font-weight: 500; max-width: 75%;">Contact us on WhatsApp for photos, videos & personalized availability.</p>
          <button class="cart-remove" onclick="window.removeFromCart('${escapeHTML(item.id)}')">Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  const cartMsg = cart.map(i => `${i.name} (${i.location})`).join(', ');

  if (summaryWrap) {
    summaryWrap.innerHTML = `
      <h3>Selection Summary</h3>
      ${cart.map(i => `<div class="summary-row"><span>${escapeHTML(i.name)} (${escapeHTML(i.location)})</span></div>`).join('')}
      <div class="summary-row total" style="border-top: 1px solid var(--ivory-3); padding-top: 14px; margin-top: 15px;">
        <p style="font-size: 13px; color: var(--charcoal); font-weight: 500; line-height: 1.5;">
          Want to see more? Contact us on WhatsApp for additional photos, videos, and personalized availability.
        </p>
      </div>
      <a href="https://wa.me/919819893157?text=Hi%20AALUXE!%20I%27d%20like%20to%20book:%20${encodeURIComponent(cartMsg)}" target="_blank" class="btn-whatsapp" style="margin-top: 15px;">
        Book All via WhatsApp
      </a>
    `;
  }
}

export function removeFromCart(id) {
  let cart = getCart().filter(i => String(i.id) !== String(id));
  saveCart(cart);
  updateBadges();
  showToast('Removed from cart', '◇');
  initCart();
}

export function clearWholeCart() {
  if (confirm("Are you sure you want to remove all items from your cart?")) {
    saveCart([]);
    updateBadges();
    showToast('Cart cleared completely', '◇');
    initCart();
  }
}

// Expose all UI helpers globally on window object for HTML inline handlers
window.addToCart = addToCart;
window.toggleFav = toggleFav;
window.formatPrice = formatPrice;
window.renderCard = renderCard;
window.renderFeatured = renderFeatured;
window.heroSearch = heroSearch;
window.initListings = initListings;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.toggleFilters = toggleFilters;
window.animatePropertyCount = animatePropertyCount;
window.initFavorites = initFavorites;
window.initCart = initCart;
window.removeFromCart = removeFromCart;
window.clearWholeCart = clearWholeCart;
window.updateBadges = updateBadges;
window.showToast = showToast;
window.getOptimizedImageUrl = getOptimizedImageUrl;


// ─── PROPERTY DETAIL MODAL WITH LUXURY CARD POP TRANSITION & WHATSAPP ENGINE ─
window.openPropertyModal = function(id) {
  const modal = document.getElementById('propertyModal');
  const innerContainer = document.getElementById('modalContainerInner');
  if (!modal || !innerContainer) return;

  const allStays = window.allStaysData || [];
  const prop = allStays.find(p => String(p.id) === String(id));
  if (!prop) return;

  const safeName = escapeHTML(prop.name);
  const safeLocation = escapeHTML(prop.location);
  const safeType = escapeHTML(prop.type || 'Luxury Stay');
  const isVilla = (prop.type || '').toLowerCase() === 'villa';
  const safeBhk = (isVilla && prop.bhk) ? escapeHTML(prop.bhk) : '';
  const rawImage = prop.image || 'bg.avif';
  const safeImage = escapeHTML(getOptimizedImageUrl(rawImage, 1000, 82));
  const safeDesc = escapeHTML(prop.description || 'Experience ultimate luxury hidden away in this meticulously maintained boutique property destination.');

  const subTitleDetails = safeBhk ? `${safeLocation} &nbsp;&middot;&nbsp; ${safeBhk}` : safeLocation;

  // WhatsApp Pre-written Message as specified:
  // "Hi AALUXE, I want more details about {Property Name} in {Location}."
  const waPrewrittenText = `Hi AALUXE, I want more details about ${prop.name} in ${prop.location}.`;
  const dynamicWhatsAppUrl = `https://wa.me/919819893157?text=${encodeURIComponent(waPrewrittenText)}`;

  innerContainer.innerHTML = `
    <div class="modal-header-image" style="position: relative; height: 320px; width: 100%; overflow: hidden; border-radius: 16px 16px 0 0;">
      <img src="${safeImage}" alt="${safeName}" loading="eager" decoding="async" style="width: 100%; height: 100%; object-fit: cover;" />

      <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%);"></div>
      <div style="position: absolute; bottom: 0; left: 0; width: 100%; padding: 25px 30px; color: #fff; box-sizing: border-box;">
        <span style="background: #c5a880; color: #fff; padding: 4px 10px; font-size: 10px; text-transform: uppercase; font-weight: 700; letter-spacing: 1.5px; border-radius: 4px; display: inline-block; margin-bottom: 8px;">
          ${safeType}
        </span>
        <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 34px; margin: 4px 0; font-weight: 400; line-height: 1.1; color: #ffffff; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">${safeName}</h2>
        <p style="font-family: 'Montserrat', sans-serif; font-size: 13px; opacity: 0.95; margin: 6px 0 0 0; color: #e8dec9; display: flex; align-items: center; gap: 6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          ${subTitleDetails}
        </p>
      </div>
    </div>
    
    <div style="padding: 30px; font-family: 'Montserrat', sans-serif; color: #333; background: #ffffff; border-radius: 0 0 16px 16px;">
      <div style="display: grid; grid-template-columns: 1.5fr 1.3fr; gap: 30px;" class="modal-card-grid">
        <div>
          <h4 style="font-family: 'Cormorant Garamond', serif; font-size: 22px; color: #111; margin: 0 0 10px 0; border-bottom: 1px solid #f0eadd; padding-bottom: 8px; font-weight: 600;">About This Experience</h4>
          <p style="font-size: 13px; line-height: 1.7; color: #555; margin: 0;">${safeDesc}</p>
        </div>
        
        <div style="background: #faf7f2; border: 1px solid #e8dec9; padding: 24px; border-radius: 12px; display: flex; flex-direction: column; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
          <h5 style="font-family: 'Cormorant Garamond', serif; font-size: 22px; color: #111; margin: 0 0 6px 0; font-weight: 600;">Direct Luxury Booking</h5>
          <p style="font-size: 12px; line-height: 1.5; color: #666; margin: 0 0 18px 0;">
            Select your preferred check-in / visit date and inquire directly with our Concierge via WhatsApp for instant photo/video walkthroughs and direct rates.
          </p>

          <!-- DATE SELECTION (NO TIME SLOTS) -->
          <div style="margin-bottom: 18px;">
            <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #666; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">Select Preferred Visit / Check-in Date</label>
            <input type="date" id="modalBookingDate" style="width: 100%; padding: 12px; border: 1px solid #e8dec9; border-radius: 6px; font-family: inherit; font-size: 13px; background: #fff; box-sizing: border-box;" min="${new Date().toISOString().split('T')[0]}">
            <div id="dateNoticeMessage" style="display: none; margin-top: 10px;"></div>
          </div>

          <!-- WHATSAPP DIRECT ACTION BUTTON -->
          <a id="btnWhatsAppInquiry" href="${dynamicWhatsAppUrl}" target="_blank" rel="noopener noreferrer" class="whatsapp-modal-btn" style="margin-bottom: 12px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            Inquire on WhatsApp (9819893157)
          </a>

          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: auto;">
            <button type="button" id="btnConfirmDateBooking" class="btn-gold" style="padding: 13px; border: none; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; cursor: pointer; border-radius: 6px; box-shadow: 0 4px 12px rgba(197, 168, 128, 0.3);">
              Request Date Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach card modal class for 3D pop transition
  const cardContent = modal.querySelector('.modal-content');
  if (cardContent && !cardContent.classList.contains('luxury-card-modal')) {
    cardContent.classList.add('luxury-card-modal');
  }

  // Display modal & trigger active transition
  modal.style.display = 'flex';
  void modal.offsetWidth; // Force browser layout reflow
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Attach Date Selection & WhatsApp Dynamic Update Events
  const dateInput = document.getElementById('modalBookingDate');
  const waBtn = document.getElementById('btnWhatsAppInquiry');
  const dateNotice = document.getElementById('dateNoticeMessage');

  if (dateInput && waBtn) {
    dateInput.addEventListener('change', () => {
      const selectedDate = dateInput.value;
      const stayTypeStr = (prop.type || 'property').toLowerCase();

      if (selectedDate) {
        const waMessage = `Hi AALUXE, I want more details about ${stayTypeStr} ${prop.name} in ${prop.location} for date ${selectedDate}.`;
        waBtn.href = `https://wa.me/919819893157?text=${encodeURIComponent(waMessage)}`;

        if (dateNotice) {
          dateNotice.style.display = 'block';
          dateNotice.innerHTML = `
            <div style="background: #f0fdf4; border: 1px solid #25D366; color: #166534; padding: 12px; border-radius: 8px; font-size: 12px; font-weight: 500; display: flex; align-items: flex-start; gap: 10px; box-shadow: 0 4px 12px rgba(37,211,102,0.15);">
              <span style="font-size: 18px; line-height: 1;">📲</span>
              <div>
                <strong style="display: block; color: #128C7E; font-weight: 700; margin-bottom: 2px;">Date Selected: ${escapeHTML(selectedDate)}</strong>
                Please click the <span style="color: #25D366; font-weight: 700; text-decoration: underline;">WhatsApp button below</span> to open WhatsApp and send your inquiry with this date!
              </div>
            </div>
          `;
        }

        // Highlight WhatsApp button with pulsing glow
        waBtn.style.animation = 'waPulse 1.5s infinite';
      } else {
        const waMessage = `Hi AALUXE, I want more details about ${stayTypeStr} ${prop.name} in ${prop.location}.`;
        waBtn.href = `https://wa.me/919819893157?text=${encodeURIComponent(waMessage)}`;
        if (dateNotice) {
          dateNotice.style.display = 'none';
          dateNotice.innerHTML = '';
        }
        waBtn.style.animation = 'none';
      }
    });
  }

  // Date Booking Request Submit
  document.getElementById('btnConfirmDateBooking')?.addEventListener('click', () => {
    const chosenDate = dateInput?.value;
    if (!chosenDate) {
      alert("Please select a preferred date first.");
      return;
    }
    const stayTypeStr = (prop.type || 'property').toLowerCase();
    const waMessage = `Hi AALUXE, I want more details about ${stayTypeStr} ${prop.name} in ${prop.location} for date ${chosenDate}.`;
    
    // Always open WhatsApp with prefilled date message
    window.open(`https://wa.me/919819893157?text=${encodeURIComponent(waMessage)}`, '_blank');
  });
};

window.closePropertyModal = function() {
  const modal = document.getElementById('propertyModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }, 350);
  }
};

// Global modal backdrop & escape key listeners
if (!window._modalListenersAttached) {
  window._modalListenersAttached = true;
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('propertyModal');
    if (modal && modal.classList.contains('active') && e.target === modal) {
      window.closePropertyModal();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closePropertyModal();
    }
  });
}

// Dynamic Navbar Scroll Glassmorphism Listener
function handleNavScroll() {
  const nav = document.getElementById('navbar') || document.querySelector('.navbar');
  if (nav) {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
}
window.addEventListener('scroll', handleNavScroll, { passive: true });

// Mobile Hamburger Navigation Drawer Initialization
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    function toggleDrawer(open) {
      const isOpen = open !== undefined ? open : !navLinks.classList.contains('open');
      navLinks.classList.toggle('open', isOpen);
      hamburger.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDrawer();
    });

    // Close menu when clicking nav link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggleDrawer(false);
      });
    });

    // Close menu when clicking outside navbar
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        toggleDrawer(false);
      }
    });

    // Close menu on ESC key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        toggleDrawer(false);
      }
    });
  }
}

// Mobile Floating WhatsApp Button Initialization
function initMobileWaFab() {
  if (document.getElementById('mobileWaFab')) return;
  const fab = document.createElement('a');
  fab.id = 'mobileWaFab';
  fab.className = 'mobile-wa-fab';
  fab.href = 'https://wa.me/919819893157?text=Hi%20AALUXE!%20I%27d%20like%20to%20inquire%20about%20a%20luxury%20stay.';
  fab.target = '_blank';
  fab.rel = 'noopener noreferrer';
  fab.setAttribute('aria-label', 'Chat on WhatsApp');
  fab.innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.764.459 3.486 1.333 5.004L2 22l5.127-1.338a9.92 9.92 0 0 0 4.885 1.28h.004c5.507 0 9.99-4.478 9.99-9.984 0-2.668-1.039-5.176-2.927-7.062A9.925 9.925 0 0 0 12.012 2zm5.66 14.159c-.234.656-1.156 1.203-1.898 1.258-.516.039-1.189.176-3.869-.916-2.859-1.164-4.664-4.047-4.805-4.234-.141-.188-1.148-1.523-1.148-2.906 0-1.383.727-2.062.984-2.344.258-.281.562-.352.75-.352.188 0 .375.002.539.009.174.008.41-.066.64.484.234.562.797 1.945.867 2.086.07.141.117.305.023.492-.094.188-.141.305-.281.469-.141.164-.297.367-.422.492-.141.141-.289.293-.125.574.164.281.73.1.203 1.637 2.012 2.125 2.453.258.445.41.742.47.883.059.141.117.234.023.422-.094.188-.422.984-.938 1.578z"/></svg>`;
  document.body.appendChild(fab);
}

// Auto update badges, nav scroll state & mobile hamburger menu on DOM load
document.addEventListener('DOMContentLoaded', () => {
  updateBadges();
  handleNavScroll();
  initMobileMenu();
  initMobileWaFab();
});