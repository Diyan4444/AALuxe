/* ═══════════════════════════════════════════════
   AALUXE — script.js
   All data, logic, rendering for all pages
═══════════════════════════════════════════════ */

// ─── UTILITY HELPERS ──────────────────────────────────────────────────────────
function formatPrice(p) {
  return '₹' + p.toLocaleString('en-IN');
}

function getCart() {
  try { return JSON.parse(localStorage.getItem('aaluxe_cart')) || []; } catch { return []; }
}
function saveCart(cart) { localStorage.setItem('aaluxe_cart', JSON.stringify(cart)); }

function getFavs() {
  try { return JSON.parse(localStorage.getItem('aaluxe_favs')) || []; } catch { return []; }
}
function saveFavs(favs) { localStorage.setItem('aaluxe_favs', JSON.stringify(favs)); }

function isInCart(id) { return getCart().some(i => i.id === id); }
function isInFavs(id) { return getFavs().includes(id); }

function updateBadges() {
  const c = getCart().length;
  const f = getFavs().length;
  document.querySelectorAll('.cart-badge').forEach(el => el.textContent = c);
  document.querySelectorAll('.fav-badge').forEach(el => el.textContent = f);
}

function showToast(msg, icon = '✦') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="toast-icon">${icon}</span><span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function addToCart(id) {
  const sourceProperties = window.allStaysData || [];
  const prop = sourceProperties.find(p => p.id === id);
  if (!prop) return;
  
  let cart = getCart();
  if (cart.some(i => i.id === id)) {
    showToast('Already in your cart', '◈');
    return;
  }
  cart.push({ id: prop.id, name: prop.name, type: prop.type, location: prop.location, price: prop.price || 0, image: prop.image });
  saveCart(cart);
  updateBadges();
  showToast(`${prop.name} added to cart`, '◉');
  const btn = document.querySelector(`[data-cart="${id}"]`);
  if (btn) { btn.textContent = 'In Cart ✓'; btn.style.opacity = '0.7'; }
}

function toggleFav(id) {
  let favs = getFavs();
  const sourceProperties = window.allStaysData || [];
  const prop = sourceProperties.find(p => p.id === id);
  const willBeSaved = !favs.includes(id);

  if (!willBeSaved) {
    favs = favs.filter(f => f !== id);
    showToast(`Removed from saved`, '♡');
  } else {
    if (!prop) return;
    favs.push(id);
    showToast(`${prop.name} saved to favorites`, '♥');
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

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  const isHome = document.querySelector('.hero');
  if (!isHome && navbar) navbar.classList.add('solid');

  window.addEventListener('scroll', () => {
    if (!navbar) return;
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  const activeUser = JSON.parse(localStorage.getItem('aaluxe_user'));
  const ADMIN_LIST = ['aaluxe0509@gmail.com', 'dailykarma1910@gmail.com'];
  if (activeUser && ADMIN_LIST.includes(activeUser.email)) {
    const consoleButton = document.getElementById('adminConsoleLink');
    if (consoleButton) consoleButton.style.display = 'block';
  }
});

// ─── PROPERTY CARD RENDERER ───────────────────────────────────────────────────
function renderCard(prop) {
  const inFav = isInFavs(prop.id);
  const inCart = isInCart(prop.id);
  const safeName = prop.name ? prop.name.replace(/'/g, "\\'") : '';
  
  return `
    <div class="prop-card" data-id="${prop.id}">
      <div class="card-img-wrap">
        <img src="${prop.image}" alt="${safeName}" loading="lazy" />
        ${prop.highlight ? `<span class="card-highlight">${prop.highlight}</span>` : ''}
        ${prop.deal ? '<span class="card-deal">Best Deal</span>' : ''}
        <button class="fav-btn ${inFav ? 'active' : ''}" data-fav="${prop.id}" onclick="toggleFav('${prop.id}')" aria-label="Save">
          <svg viewBox="0 0 24 24" fill="${inFav ? '#D63939' : 'none'}" stroke="${inFav ? '#D63939' : 'currentColor'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
      </div>
      <div class="card-body" style="padding-bottom: 10px;">
        <div class="card-type">${prop.type}</div>
        <h3 class="card-name">${prop.name}</h3>
        <div class="card-location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          ${prop.location}
        </div>
        <p style="font-size: 12px; color: var(--mid); line-height: 1.4; font-weight: 500; margin-top: auto; border-top: 1px solid var(--ivory-3); padding-top: 12px;">
          Want to see more? Contact us on WhatsApp for additional photos, videos, and our best available prices.
        </p>
      </div>
      <div class="card-actions">
        <button type="button" class="btn-dark" onclick="openPropertyModal('${prop.id}')">View Details</button>
        <button class="btn-outline ${inCart ? 'in-cart' : ''}" data-cart="${prop.id}"
          onclick="addToCart('${prop.id}')"
          ${inCart ? 'style="opacity:0.7"' : ''}>
          ${inCart ? 'In Cart ✓' : 'Add to Cart'}
        </button>
      </div>
    </div>
  `;
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;

  const sourceProperties = window.allStaysData || [];
  let featured = sourceProperties.filter(p => p.deal || (p.rating >= 4.8)).slice(0, 6);

  if (featured.length === 0 && sourceProperties.length > 0) {
    featured = sourceProperties.slice(0, 6);
  }

  if (featured.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888; font-family: \'Montserrat\', sans-serif; font-size: 14px;">Curating luxury stays...</p>';
  } else {
    grid.innerHTML = featured.map(renderCard).join('');
  }
}

function heroSearch() {
  const loc = (document.getElementById('heroLocationSelect') || document.getElementById('heroLocation'))?.value.trim() || '';
  if (loc) {
    window.location.href = `listings.html?search=${encodeURIComponent(loc)}`;
  } else {
    window.location.href = 'listings.html';
  }
}

// ─── LISTINGS PAGE ────────────────────────────────────────────────────────────
function initListings() {
  applyFilters();
}

function applyFilters() {

    const grid = document.getElementById('listingsGrid');
    const noResults = document.getElementById('noResults');
    const countEl = document.getElementById('resultsCount');

    if (!grid) return;


    // ==========================================
    // GET FILTER VALUES
    // ==========================================

    const searchInput =
        document.getElementById('keywordSearch')?.value
            .toLowerCase()
            .trim() || '';

    const selectedTypes =
        Array.from(
            document.querySelectorAll('.type-check:checked')
        ).map(cb => cb.value);

    const locationVal =
        document.getElementById('locationFilter')?.value || '';

    const sortVal =
        document.getElementById('sortSelect')?.value || 'default';


    // ==========================================
    // GET ALL FIREBASE PROPERTIES
    // ==========================================

    const sourceProperties =
        window.allStaysData || [];


    // ==========================================
    // FILTER PROPERTIES
    // ==========================================

    let filtered = sourceProperties.filter(p => {

        // Search filter
        if (searchInput) {

            const nameMatch =
                p.name
                    ? p.name.toLowerCase().includes(searchInput)
                    : false;

            const descMatch =
                p.description
                    ? p.description.toLowerCase().includes(searchInput)
                    : false;

            const amenitiesMatch =
                p.amenities
                    ? p.amenities.some(
                        amenity =>
                            amenity
                                .toLowerCase()
                                .includes(searchInput)
                    )
                    : false;


            if (!nameMatch && !descMatch && !amenitiesMatch) {
                return false;
            }
        }


        // Property type filter
        if (
            selectedTypes.length &&
            !selectedTypes.includes(p.type)
        ) {
            return false;
        }


        // Location filter
        const propertyLocation =
            p.location
                ? p.location.toLowerCase()
                : '';

        if (
            locationVal &&
            !propertyLocation.includes(
                locationVal.toLowerCase()
            )
        ) {
            return false;
        }


        return true;

    });


    // ==========================================
    // SORTING
    // ==========================================

    if (sortVal === 'rating') {

        filtered.sort(
            (a, b) =>
                (b.rating || 0) -
                (a.rating || 0)
        );

    }


    // ==========================================
    // ANIMATED RESULT COUNTER
    // ==========================================

    if (countEl) {

        animatePropertyCount(filtered.length);

    }


    // ==========================================
    // NO RESULTS
    // ==========================================

    if (filtered.length === 0) {

        grid.innerHTML = '';

        noResults?.classList.remove('hidden');

    } else {

        noResults?.classList.add('hidden');

        grid.innerHTML =
            filtered
                .map(renderCard)
                .join('');

    }

}

function clearFilters() {
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

function toggleFilters() {
  const sidebar = document.getElementById('filtersSidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

// ─── FAVORITES PAGE ───────────────────────────────────────────────────────────
function initFavorites() {
  const grid = document.getElementById('favoritesGrid');
  const empty = document.getElementById('emptyFav');
  if (!grid) return;

  const favIds = getFavs();
  const sourceProperties = window.allStaysData || [];
  const favProps = sourceProperties.filter(p => favIds.includes(String(p.id)));

  if (favProps.length === 0) {
    grid.innerHTML = '';
    empty?.classList.remove('hidden');
  } else {
    empty?.classList.add('hidden');
    grid.innerHTML = favProps.map(renderCard).join('');
  }
}

// ─── CART PAGE ────────────────────────────────────────────────────────────────
function initCart() {
  const itemsWrap = document.getElementById('cartItems');
  const summaryWrap = document.getElementById('cartSummary');
  const actionsWrap = document.getElementById('cartHeaderActions');
  if (!itemsWrap) return;

  const cart = getCart();

  if (actionsWrap) {
    if (cart.length >= 1) {
      actionsWrap.innerHTML = `
        <button class="btn-outline" onclick="clearWholeCart()" 
                style="padding: 8px 16px; font-size: 13px; color: #dc3545; border-color: #dc3545; cursor: pointer; transition: all 0.3s ease;">
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
      <div class="cart-item-img"><img src="${item.image}" alt="${item.name}" /></div>
      <div class="cart-item-body">
        <div class="cart-item-type">${item.type}</div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-loc">${item.location}</div>
        <div class="cart-item-footer">
          <p style="font-size: 12px; color: var(--mid); font-weight: 500; max-width: 75%;">Contact us on WhatsApp for photos, videos & custom rates.</p>
          <button class="cart-remove" onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  const cartMsg = cart.map(i => `${i.name} (${i.location})`).join(', ');

  if (summaryWrap) {
    summaryWrap.innerHTML = `
      <h3>Selection Summary</h3>
      ${cart.map(i => `<div class="summary-row"><span>${i.name} (${i.location})</span></div>`).join('')}
      <div class="summary-row total" style="border-top: 1px solid var(--ivory-3); padding-top: 14px; margin-top: 15px;">
        <p style="font-size: 13px; color: var(--charcoal); font-weight: 500; line-height: 1.5;">
          Want to see more? Contact us on WhatsApp for additional photos, videos, and our best available prices.
        </p>
      </div>
      <a href="https://wa.me/919819893157?text=Hi%20AALUXE!%20I%27d%20like%20to%20book:%20${encodeURIComponent(cartMsg)}" target="_blank" class="btn-whatsapp" style="margin-top: 15px;">
        Book All via WhatsApp
      </a>
    `;
  }
}

// ─── PREMIUM DETAIL OVERLAY MODAL ENGINE ──────────────────────────────────────
window.openPropertyModal = function(id) {
  const modal = document.getElementById('propertyModal');
  const innerContainer = document.getElementById('modalContainerInner');
  if (!modal || !innerContainer) return;

  const allStays = window.allStaysData || [];
  const prop = allStays.find(p => p.id === id);
  if (!prop) {
    console.error(`Property with ID ${id} could not be resolved in live state.`);
    return;
  }

  const subTitleDetails = prop.bhk 
    ? `${prop.location} &nbsp; &nbsp; ${prop.bhk}`
    : `${prop.location} &nbsp; `;

  const amenityIcons = {
    'WiFi': '📶', 'Free WiFi': '📶', 'Pool': '🏊', 'Private Pool': '🏊', 'Infinity Pool': '🏊',
    'Spa': '💆', 'Air Conditioning': '❄️', 'Eco Friendly': '🌱', 'Mountain View': '⛰️', 'Lake View': '🏔️',
    'Restaurant': '🍽️', 'Bar': '🍹', 'Parking': '🅿️', 'Butler Service': '🤵', 'BBQ': '🔥', 'Bonfire': '🔥'
  };

  const amenitiesHTML = prop.amenities ? prop.amenities.map(a => `
    <div class="modal-amenity-item">
      <span>${amenityIcons[a] || '✦'}</span>
      <span>${a}</span>
    </div>
  `).join('') : '<p style="font-size: 13px; color: #555; margin:0;">Contact us for custom amenity arrangements.</p>';

  // DYNAMIC PRE-WRITTEN MESSAGING FOR A SPECIFIC RESORT OR VILLA
  const waPrewrittenText = `Hi AALUXE! I'd like to book: ${prop.name} (${prop.location})`;
  const dynamicWhatsAppUrl = `https://wa.me/9819893157?text=${encodeURIComponent(waPrewrittenText)}`;

  innerContainer.innerHTML = `
    <div style="position: relative; height: 355px; width: 100%; overflow: hidden;">
      <img src="${prop.image}" alt="${prop.name}" style="width: 100%; height: 100%; object-fit: cover;" />
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(transparent, rgba(0,0,0,0.85));"></div>
      <div style="position: absolute; bottom: 0; left: 0; width: 100%; padding: 30px; color: #fff; box-sizing: border-box; text-align: left;">
        <span style="background: #c5a880; color: #fff; padding: 4px 8px; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 1px; border-radius: 2px;">
          ${prop.type}
        </span>
        <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 36px; margin: 10px 0 5px 0; font-weight: 400;">${prop.name}</h2>
        <p style="font-family: 'Montserrat', sans-serif; font-size: 13px; display: flex; align-items: center; gap: 5px; opacity: 0.9; margin: 0;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #c5a880;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          ${subTitleDetails}
        </p>
      </div>
    </div>
    
    <div style="padding: 35px; font-family: 'Montserrat', sans-serif; color: #333; box-sizing: border-box; background: #fff; text-align: left;">
      <div style="display: grid; grid-template-columns: 1.8fr 1.2fr; gap: 40px;">
        <div>
          <h4 style="font-family: 'Cormorant Garamond', serif; font-size: 22px; color: #111; margin: 0 0 10px 0; font-weight: 400; border-bottom: 1px solid #f0eadd; padding-bottom: 10px;">About This Property</h4>
          <p style="font-size: 13px; line-height: 1.6; color: #555; margin: 0 0 25px 0;">
            ${prop.description || 'Experience ultimate premium luxury hidden away in this meticulously maintained boutique property destination.'}
          </p>
          
          <h4 style="font-family: 'Cormorant Garamond', serif; font-size: 22px; color: #111; margin: 0 0 10px 0; font-weight: 400; border-bottom: 1px solid #f0eadd; padding-bottom: 10px;">Featured Amenities</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">${amenitiesHTML}</div>
        </div>
        
        <div style="background: #fbf9f6; border: 1px solid #e8dec9; padding: 25px; border-radius: 4px; display: flex; flex-direction: column; justify-content: center; height: max-content;">
          <div style="text-align: left; margin-bottom: 20px;">
            <h5 style="font-family: 'Cormorant Garamond', serif; font-size: 20px; color: #111; margin: 0 0 8px 0; font-weight: 400;">Exclusive Booking Rates</h5>
            <p style="font-size: 12px; line-height: 1.5; color: #666; margin: 0;">
              We bypass third-party platforms via direct personal owner networks to secure direct savings of 15–30%.
            </p>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <a href="${dynamicWhatsAppUrl}" target="_blank" style="background: #c5a880; color: #fff; text-decoration: none; text-align: center; padding: 14px; font-weight: 600; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; border-radius: 4px; transition: background 0.2s;">
              Book Via WhatsApp
            </a>
            <button onclick="addToCart('${prop.id}')" style="background: #1a1a1a; color: #fff; border: none; padding: 14px; font-weight: 600; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; border-radius: 4px; cursor: pointer; transition: background 0.2s;">
              Add To Cart Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window.closePropertyModal = function() {
  const modal = document.getElementById('propertyModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
};

window.addEventListener('click', (e) => {
  const modal = document.getElementById('propertyModal');
  if (e.target === modal) closePropertyModal();
});

function removeFromCart(id) {
  let cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  updateBadges();
  showToast('Removed from cart', '◇');
  initCart();
}

function clearWholeCart() {
  if (confirm("Are you sure you want to remove all items from your cart?")) {
    saveCart([]);
    updateBadges();
    showToast('Cart cleared completely', '◇');
    initCart();
  }
}

// ─── TESTIMONIAL CAROUSEL ENGINE CODE ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const stage = document.getElementById('testimonialStage');
  if (!stage) return;

  const slides = Array.from(stage.querySelectorAll('.testimonial-frame'));
  const prevBtn = document.getElementById('prevSlideBtn');
  const nextBtn = document.getElementById('nextSlideBtn');
  
  if (slides.length === 0) return;
  
  let centerIndex = 0;
  let cycleInterval;

  function setSlideStates() {
    slides.forEach(slide => { slide.className = 'testimonial-frame'; });
    const total = slides.length;
    const leftIndex = (centerIndex - 1 + total) % total;
    const rightIndex = (centerIndex + 1) % total;

    slides[centerIndex].classList.add('position-center');
    slides[leftIndex].classList.add('position-left');
    slides[rightIndex].classList.add('position-right');
  }

  function nextSlide() {
    centerIndex = (centerIndex + 1) % slides.length;
    setSlideStates();
  }

  function prevSlide() {
    centerIndex = (centerIndex - 1 + slides.length) % slides.length;
    setSlideStates();
  }

  function runAutoTimer() {
    clearInterval(cycleInterval);
    cycleInterval = setInterval(nextSlide, 5000);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); runAutoTimer(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); runAutoTimer(); });

  let touchStartX = 0;
  let touchEndX = 0;
  
  stage.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  stage.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    const horizontalDistance = touchEndX - touchStartX;
    if (Math.abs(horizontalDistance) > 50) {
      if (horizontalDistance > 0) prevSlide(); else nextSlide();
      runAutoTimer();
    }
  }, { passive: true });

  setSlideStates();
  runAutoTimer();
});

/* =========================================================
   ANIMATED PROPERTY COUNTER
========================================================= */

function animatePropertyCount(targetCount) {

    const counter = document.getElementById("resultsCount");

    if (!counter) return;

    // Cancel any previous animation
    if (counter._animationFrame) {
        cancelAnimationFrame(counter._animationFrame);
    }

    const duration = 1200;
    const startTime = performance.now();

    function animate(currentTime) {

        const elapsed = currentTime - startTime;

        const progress =
            Math.min(elapsed / duration, 1);

        // Smooth ease-out
        const easedProgress =
            1 - Math.pow(1 - progress, 3);

        const currentCount =
            Math.floor(targetCount * easedProgress);

        counter.textContent =
            `${currentCount} ${
                currentCount === 1
                    ? "property"
                    : "properties"
            } found`;

        if (progress < 1) {

            counter._animationFrame =
                requestAnimationFrame(animate);

        } else {

            counter.textContent =
                `${targetCount} ${
                    targetCount === 1
                        ? "property"
                        : "properties"
                } found`;

        }
    }

    counter._animationFrame =
        requestAnimationFrame(animate);
}