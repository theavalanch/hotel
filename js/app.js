/**
 * DoubleTree by Hilton Hotel Los Angeles Downtown - Main Application Controller
 * Handles customer-facing views, routing, filters, lightbox, dining, reviews, account management, and UI polish
 */

// Global Toast utility
window.showToast = function(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast-pill toast-${type} animate-slide-in`;
  
  let icon = "ℹ️";
  if (type === "success") icon = "✓";
  if (type === "error") icon = "✕";
  if (type === "warning") icon = "⚠️";

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-msg">${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("toast-fade-out");
    setTimeout(() => toast.remove(), 400);
  }, 4000);
};

// Generic Modal utility
window.openGenericModal = function(htmlContent) {
  const container = document.getElementById("generic-modal-container");
  if (!container) return;
  container.innerHTML = htmlContent;
  container.classList.add("active");
  document.body.classList.add("modal-open");
};

window.closeGenericModal = function() {
  const container = document.getElementById("generic-modal-container");
  if (container) {
    container.classList.remove("active");
    container.innerHTML = "";
    document.body.classList.remove("modal-open");
  }
};

window.printModalInvoice = function() {
  window.print();
};

window.printReservationReceipt = function(resId) {
  window.adminManager.openInvoiceModal(resId);
  setTimeout(() => window.print(), 300);
};

class MainApp {
  constructor() {
    this.currentView = "home"; // home, rooms, facilities, dining, gallery, offers, reviews, contact, account, admin
    this.activeRoomCategory = "ALL";
    this.roomSortOrder = "default";
    this.maxPriceFilter = 1500;
    this.activeDiningTab = "dinner";
    this.activeGalleryCategory = "ALL";
    this.activeLightboxIndex = 0;

    this.init();
  }

  init() {
    this.bindHeaderNav();
    this.bindHeroSearch();
    this.renderFeaturedRooms();
    this.renderAllRoomsList();
    this.renderDiningMenu();
    this.renderGalleryGrid();
    this.renderReviewsList();
    this.renderAccountPortal();
    this.renderSpecialOffers();
    this.bindContactForm();
    this.bindCurrencySelector();
    this.bindWhatsAppLauncher();
    this.bindMobileMenu();
    this.updateUserAuthUI();

    // Listen for state changes
    window.hotelState.subscribe("*", () => {
      this.renderFeaturedRooms();
      this.renderAllRoomsList();
      this.renderReviewsList();
      this.renderAccountPortal();
      this.updateUserAuthUI();
    });

    window.hotelState.subscribe("auth:change", () => {
      this.updateUserAuthUI();
      this.renderAccountPortal();
    });

    window.hotelState.subscribe("currency:change", () => {
      this.renderFeaturedRooms();
      this.renderAllRoomsList();
      this.renderDiningMenu();
    });
  }

  /* -------------------------------------------------------------
   * View & Tab Router
   * ------------------------------------------------------------- */
  switchView(viewName) {
    this.currentView = viewName;

    // Toggle Customer vs Admin container
    const customerView = document.getElementById("customer-site-view");
    const adminView = document.getElementById("admin-portal-view");

    if (viewName === "admin") {
      // Security Gate: Verify admin authentication (Username: doubletree / Password: Admin1234)
      if (!window.hotelState.isAdminAuthenticated()) {
        window.adminManager.showAdminLoginModal();
        return;
      }

      customerView?.classList.add("hidden");
      adminView?.classList.remove("hidden");
      adminView?.classList.add("active");
      window.adminManager.switchSection("overview");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    } else {
      customerView?.classList.remove("hidden");
      adminView?.classList.remove("active");
      adminView?.classList.add("hidden");
    }

    // Update active nav links
    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.toggle("active", link.getAttribute("data-view") === viewName);
    });

    // Handle sections
    if (viewName === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const sectionEl = document.getElementById(`section-${viewName}`);
      if (sectionEl) {
        sectionEl.scrollIntoView({ behavior: "smooth" });
      }
    }

    // Refresh specific view data
    if (viewName === "rooms") this.renderAllRoomsList();
    if (viewName === "account") this.renderAccountPortal();
  }

  bindHeaderNav() {
    document.querySelectorAll("[data-nav-target]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const target = btn.getAttribute("data-nav-target");
        this.switchView(target);
      });
    });

    // Admin switch button in header
    document.getElementById("btn-switch-admin")?.addEventListener("click", () => {
      this.switchView("admin");
    });
    document.getElementById("btn-back-to-site")?.addEventListener("click", () => {
      this.switchView("home");
    });
  }

  toggleMobileMenu(forceState = null) {
    const navDrawer = document.getElementById("mobile-nav-drawer");
    if (!navDrawer) return;
    if (forceState !== null) {
      if (forceState) {
        navDrawer.classList.add("active");
        document.body.classList.add("menu-open");
      } else {
        navDrawer.classList.remove("active");
        document.body.classList.remove("menu-open");
      }
    } else {
      navDrawer.classList.toggle("active");
      document.body.classList.toggle("menu-open");
    }
  }

  bindMobileMenu() {
    const hamburger = document.getElementById("mobile-menu-toggle");
    const closeBtn = document.getElementById("mobile-menu-close");

    hamburger?.addEventListener("click", () => this.toggleMobileMenu());
    closeBtn?.addEventListener("click", () => this.toggleMobileMenu(false));

    document.querySelectorAll(".mobile-nav-link").forEach(link => {
      link.addEventListener("click", () => {
        const target = link.getAttribute("data-view");
        this.toggleMobileMenu(false);
        if (target) this.switchView(target);
      });
    });
  }

  bindCurrencySelector() {
    const sel = document.getElementById("currency-select");
    sel?.addEventListener("change", (e) => {
      window.hotelState.setCurrency(e.target.value);
      window.showToast(`Display currency changed to ${e.target.value}`, "info");
    });
  }

  bindWhatsAppLauncher() {
    const btn = document.getElementById("floating-whatsapp-btn");
    const popup = document.getElementById("whatsapp-quick-popup");
    const closeBtn = document.getElementById("whatsapp-popup-close");
    const sendBtn = document.getElementById("whatsapp-send-btn");

    btn?.addEventListener("click", (e) => {
      e.stopPropagation();
      popup?.classList.toggle("active");
    });

    closeBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      popup?.classList.remove("active");
    });

    sendBtn?.addEventListener("click", () => {
      // WhatsApp is unavailable for now
      const email = "doubletreehotel49@gmail.com";
      const subject = encodeURIComponent("DoubleTree Los Angeles Downtown - Guest Inquiry & Payment Procedure");
      const msgInput = document.getElementById("whatsapp-custom-msg");
      const body = encodeURIComponent(msgInput ? msgInput.value.trim() : "Hello DoubleTree Los Angeles Downtown Manager, I am inquiring regarding room reservation and payment procedure.");
      
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`, "_blank");
      window.showToast("WhatsApp is temporarily unavailable. Opening Gmail to contact manager directly.", "info");
      popup?.classList.remove("active");
    });
  }

  /* -------------------------------------------------------------
   * Hero Fast Availability Search Bar
   * ------------------------------------------------------------- */
  bindHeroSearch() {
    const checkinEl = document.getElementById("hero-checkin");
    const checkoutEl = document.getElementById("hero-checkout");
    const adultsEl = document.getElementById("hero-adults");
    const childrenEl = document.getElementById("hero-children");
    const roomsEl = document.getElementById("hero-rooms");
    const btnSearch = document.getElementById("hero-btn-search");

    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 3);

    if (checkinEl) {
      checkinEl.value = window.bookingEngine.formatDateInput(today);
      checkinEl.min = window.bookingEngine.formatDateInput(today);
    }
    if (checkoutEl) {
      checkoutEl.value = window.bookingEngine.formatDateInput(future);
      checkoutEl.min = checkinEl?.value || window.bookingEngine.formatDateInput(today);
    }

    checkinEl?.addEventListener("change", () => {
      if (checkoutEl) checkoutEl.min = checkinEl.value;
    });

    btnSearch?.addEventListener("click", () => {
      if (checkinEl && checkoutEl) {
        window.bookingEngine.bookingDraft.checkIn = checkinEl.value;
        window.bookingEngine.bookingDraft.checkOut = checkoutEl.value;
      }
      if (adultsEl) window.bookingEngine.bookingDraft.adults = parseInt(adultsEl.value, 10);
      if (childrenEl) window.bookingEngine.bookingDraft.children = parseInt(childrenEl.value, 10);
      if (roomsEl) window.bookingEngine.bookingDraft.roomsCount = parseInt(roomsEl.value, 10);
      window.bookingEngine.recalculateNights();

      window.bookingEngine.openBookingModal();
    });
  }

  /* -------------------------------------------------------------
   * Featured Rooms (Homepage Showcase)
   * ------------------------------------------------------------- */
  renderFeaturedRooms() {
    const container = document.getElementById("featured-rooms-grid");
    if (!container) return;

    const featured = window.hotelState.getRoomTypes().filter(r => r.featured);

    container.innerHTML = featured.map(room => `
      <div class="luxury-room-card animate-fade-in">
        <div class="room-card-media">
          <img src="${room.images[0]}" alt="${room.name}" loading="lazy">
          <div class="room-card-overlay"></div>
          ${room.badge ? `<span class="room-badge">${room.badge}</span>` : ''}
          <div class="room-card-price-tag">
            <span class="price-val">${window.hotelState.formatPrice(room.basePrice)}</span>
            <span class="price-sub">/ night</span>
          </div>
        </div>
        <div class="room-card-body">
          <span class="room-card-category">${room.category}</span>
          <h3 class="room-card-title">${room.name}</h3>
          <p class="room-card-desc">${room.shortDescription}</p>
          
          <div class="room-specs-strip">
            <span>📐 ${room.size}</span>
            <span>🛏️ ${room.bedConfig}</span>
            <span>👥 Max ${room.capacity.maxGuests} Guests</span>
          </div>

          <div class="room-amenities-pills">
            ${room.amenities.slice(0, 3).map(a => `<span>✦ ${a}</span>`).join("")}
          </div>

          <div class="room-card-footer">
            <button class="btn btn-outline btn-sm" onclick="window.viewRoomDetailsModal('${room.id}')">Explore Suite</button>
            <button class="btn btn-gold btn-sm" onclick="window.bookingEngine.openBookingModal('${room.id}')">Book Suite</button>
          </div>
        </div>
      </div>
    `).join("");
  }

  /* -------------------------------------------------------------
   * Room Listings Page & Filter Engine
   * ------------------------------------------------------------- */
  renderAllRoomsList() {
    const container = document.getElementById("all-rooms-grid");
    if (!container) return;

    let rooms = [...window.hotelState.getRoomTypes()];

    // Category filter
    if (this.activeRoomCategory !== "ALL") {
      rooms = rooms.filter(r => r.category.toUpperCase().includes(this.activeRoomCategory));
    }

    // Price filter
    rooms = rooms.filter(r => r.basePrice <= this.maxPriceFilter);

    // Sorting
    if (this.roomSortOrder === "price-low") {
      rooms.sort((a, b) => a.basePrice - b.basePrice);
    } else if (this.roomSortOrder === "price-high") {
      rooms.sort((a, b) => b.basePrice - a.basePrice);
    } else if (this.roomSortOrder === "capacity") {
      rooms.sort((a, b) => b.capacity.maxGuests - a.capacity.maxGuests);
    }

    // Render filter counts
    const countDisplay = document.getElementById("rooms-matched-count");
    if (countDisplay) countDisplay.textContent = `${rooms.length} Suites Available`;

    container.innerHTML = rooms.map(room => `
      <div class="room-list-card animate-fade-in">
        <div class="room-list-media">
          <img src="${room.images[0]}" alt="${room.name}" loading="lazy">
          ${room.badge ? `<span class="room-badge">${room.badge}</span>` : ''}
          <div class="room-list-price-badge">
            <span class="price-val">${window.hotelState.formatPrice(room.basePrice)}</span>
            <span class="price-sub">/ night</span>
          </div>
        </div>
        <div class="room-list-content">
          <div class="room-list-header">
            <div>
              <span class="room-category-pill">${room.category}</span>
              <h3 class="room-name">${room.name}</h3>
            </div>
            <div class="room-view-hint">🌊 ${room.view}</div>
          </div>

          <p class="room-description">${room.fullDescription.slice(0, 160)}...</p>

          <div class="room-specs-grid">
            <div class="spec-cell"><strong>Size:</strong> ${room.size}</div>
            <div class="spec-cell"><strong>Bedding:</strong> ${room.bedConfig}</div>
            <div class="spec-cell"><strong>Capacity:</strong> Up to ${room.capacity.maxGuests} Guests</div>
            <div class="spec-cell"><strong>Location:</strong> ${room.floor}</div>
          </div>

          <div class="room-features-tags">
            ${room.amenities.map(a => `<span class="amenity-chip">✓ ${a}</span>`).join("")}
          </div>

          <div class="room-actions-bar">
            <button class="btn btn-outline" onclick="window.viewRoomDetailsModal('${room.id}')">
              <span>View Full Details & Floorplan</span>
            </button>
            <button class="btn btn-gold" onclick="window.bookingEngine.openBookingModal('${room.id}')">
              <span>Reserve Suite Now</span>
              <span class="icon">→</span>
            </button>
          </div>
        </div>
      </div>
    `).join("");
  }

  setRoomCategoryFilter(category) {
    this.activeRoomCategory = category;
    document.querySelectorAll(".category-filter-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-category") === category);
    });
    this.renderAllRoomsList();
  }

  setRoomSort(order) {
    this.roomSortOrder = order;
    this.renderAllRoomsList();
  }

  /* -------------------------------------------------------------
   * Room Details Modal
   * ------------------------------------------------------------- */
  openRoomDetails(roomId) {
    const room = window.hotelState.getRoomTypeById(roomId);
    if (!room) return;

    const similar = window.hotelState.getRoomTypes().filter(r => r.id !== roomId).slice(0, 2);

    const html = `
      <div class="modal-dialog modal-xl animate-scale-up">
        <div class="modal-header">
          <div>
            <span class="modal-pretitle">${room.category} • ${room.floor}</span>
            <h2 class="modal-title">${room.name}</h2>
          </div>
          <button class="modal-close" onclick="window.closeGenericModal()">×</button>
        </div>
        <div class="modal-body">
          <!-- Room Gallery Grid in Modal -->
          <div class="room-modal-gallery">
            <div class="gallery-hero-img">
              <img src="${room.images[0]}" alt="${room.name}" id="room-modal-main-img">
            </div>
            <div class="gallery-thumbs-col">
              ${room.images.map((img, idx) => `
                <div class="gallery-thumb-item ${idx === 0 ? 'active' : ''}" 
                  onclick="document.getElementById('room-modal-main-img').src='${img}'; document.querySelectorAll('.gallery-thumb-item').forEach(el=>el.classList.remove('active')); this.classList.add('active');">
                  <img src="${img}" alt="Thumbnail">
                </div>
              `).join("")}
            </div>
          </div>

          <div class="room-modal-grid-info">
            <div class="room-modal-left">
              <h3>Suite Overview & Architectural Highlights</h3>
              <p class="lead-text">${room.fullDescription}</p>

              <h4 class="mt-4">Specifications & Key Features</h4>
              <div class="specs-table-box">
                <div class="spec-row"><span>Total Area</span><strong>${room.size}</strong></div>
                <div class="spec-row"><span>Bed Configuration</span><strong>${room.bedConfig}</strong></div>
                <div class="spec-row"><span>Maximum Occupancy</span><strong>${room.capacity.adults} Adults, ${room.capacity.children} Children (Max ${room.capacity.maxGuests})</strong></div>
                <div class="spec-row"><span>Panoramic Orientation</span><strong>${room.view}</strong></div>
                <div class="spec-row"><span>Floor Location</span><strong>${room.floor}</strong></div>
              </div>

              <h4 class="mt-4">Complimentary In-Suite Amenities</h4>
              <div class="amenities-grid-full">
                ${room.amenities.map(a => `<div class="amenity-item"><span>✦</span> ${a}</div>`).join("")}
              </div>

              <h4 class="mt-4">Hotel Policies & Hospitality Guarantees</h4>
              <ul class="policy-bullet-list">
                <li><strong>Check-in:</strong> 3:00 PM (15:00) | <strong>Check-out:</strong> 12:00 PM (12:00)</li>
                <li><strong>Cancellation:</strong> 100% Free cancellation up to 48 hours prior to arrival.</li>
                <li><strong>Complimentary Breakfast:</strong> Included daily at L'Aura or via in-room dining.</li>
                <li><strong>Smoking Policy:</strong> Non-smoking suite. Designated outdoor garden cabanas available.</li>
              </ul>
            </div>

            <div class="room-modal-right">
              <div class="sticky-booking-widget">
                <div class="widget-price-header">
                  <span class="widget-price">${window.hotelState.formatPrice(room.basePrice)}</span>
                  <span class="widget-sub">per night</span>
                </div>
                <p class="widget-guarantee">✓ Best Rate Direct Guarantee</p>
                <p class="widget-guarantee">✓ No Booking Surcharge</p>
                <p class="widget-guarantee">✓ Flexible Rescheduling</p>
                
                <div class="mt-4">
                  <button class="btn btn-gold btn-block btn-large" 
                    onclick="window.closeGenericModal(); window.bookingEngine.openBookingModal('${room.id}')">
                    Reserve This Suite Now
                  </button>
                </div>

                <div class="widget-contact-help mt-3">
                  <small>Prefer personal assistance? Call Front Desk: +1 (213) 629-1200</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Similar recommendations -->
          <div class="similar-rooms-section mt-5">
            <h4>You May Also Appreciate</h4>
            <div class="similar-rooms-grid">
              ${similar.map(s => `
                <div class="similar-room-card" onclick="window.viewRoomDetailsModal('${s.id}')">
                  <img src="${s.images[0]}" alt="${s.name}">
                  <div class="similar-info">
                    <strong>${s.name}</strong>
                    <span>${window.hotelState.formatPrice(s.basePrice)} / night</span>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
    window.openGenericModal(html);
  }

  /* -------------------------------------------------------------
   * Restaurant & Dining Menu
   * ------------------------------------------------------------- */
  renderDiningMenu() {
    const container = document.getElementById("dining-menu-grid");
    if (!container) return;

    const items = window.hotelState.data.menu[this.activeDiningTab] || [];

    container.innerHTML = items.map(dish => `
      <div class="dish-card animate-fade-in">
        <div class="dish-media">
          <img src="${dish.image}" alt="${dish.name}" loading="lazy">
          <div class="dish-price-badge">${window.hotelState.formatPrice(dish.price)}</div>
        </div>
        <div class="dish-content">
          <div class="dish-header">
            <h4 class="dish-name">${dish.name}</h4>
          </div>
          <p class="dish-desc">${dish.desc}</p>
          <div class="dish-dietary-pills">
            ${dish.dietary.map(d => `<span class="diet-tag">${d}</span>`).join("")}
          </div>
        </div>
      </div>
    `).join("");
  }

  setDiningTab(tabKey) {
    this.activeDiningTab = tabKey;
    document.querySelectorAll(".dining-nav-tab").forEach(tab => {
      tab.classList.toggle("active", tab.getAttribute("data-tab") === tabKey);
    });
    this.renderDiningMenu();
  }

  openTableReservationModal() {
    const today = new Date().toISOString().slice(0, 10);
    const html = `
      <div class="modal-dialog animate-scale-up">
        <div class="modal-header">
          <h3>Reserve a Table at L'Aura Fine Dining</h3>
          <button class="modal-close" onclick="window.closeGenericModal()">×</button>
        </div>
        <div class="modal-body">
          <form id="table-res-form" onsubmit="window.submitTableRes(event)">
            <div class="form-grid two-cols">
              <div class="form-group">
                <label class="form-label">Full Name *</label>
                <input type="text" class="form-input" id="tr-name" required placeholder="Guest Name">
              </div>
              <div class="form-group">
                <label class="form-label">Email Address *</label>
                <input type="email" class="form-input" id="tr-email" required placeholder="guest@email.com">
              </div>
              <div class="form-group">
                <label class="form-label">Reservation Date *</label>
                <input type="date" class="form-input" id="tr-date" value="${today}" min="${today}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Time Slot *</label>
                <select class="form-select" id="tr-time">
                  <option value="18:30">06:30 PM (Sunset Seating)</option>
                  <option value="19:30" selected>07:30 PM (Prime Dinner)</option>
                  <option value="20:30">08:30 PM (Chef's Tasting)</option>
                  <option value="21:30">09:30 PM (Late Night Jazz)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Number of Guests</label>
                <select class="form-select" id="tr-guests">
                  <option value="2">2 Guests (Couple Table)</option>
                  <option value="4">4 Guests</option>
                  <option value="6">6 Guests (Private Alcove)</option>
                  <option value="8">8+ Guests (Sommelier Salon)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Seating Preference</label>
                <select class="form-select" id="tr-seating">
                  <option value="Ocean Terrace">Ocean Horizon Terrace</option>
                  <option value="Indoor Salon">Main Chandeliers Salon</option>
                  <option value="Wine Cellar">Sommelier Wine Vault</option>
                </select>
              </div>
            </div>
            <div class="form-group mt-3">
              <label class="form-label">Dietary Accommodations / Celebrations</label>
              <input type="text" class="form-input" id="tr-notes" placeholder="e.g. Birthday, Anniversary, Truffle preference">
            </div>
            <div class="modal-footer-actions mt-4">
              <button type="button" class="btn btn-secondary" onclick="window.closeGenericModal()">Cancel</button>
              <button type="submit" class="btn btn-gold">Confirm Table Reservation</button>
            </div>
          </form>
        </div>
      </div>
    `;
    window.openGenericModal(html);
  }

  /* -------------------------------------------------------------
   * Photo & Video Gallery & Lightbox
   * ------------------------------------------------------------- */
  renderGalleryGrid() {
    const container = document.getElementById("gallery-items-grid");
    if (!container) return;

    let items = window.hotelState.data.gallery;
    if (this.activeGalleryCategory !== "ALL") {
      items = items.filter(g => g.category.toUpperCase().includes(this.activeGalleryCategory));
    }

    container.innerHTML = items.map((item, idx) => `
      <div class="gallery-item-tile animate-fade-in" onclick="window.app.openLightbox(${idx})">
        <img src="${item.url}" alt="${item.title}" loading="lazy">
        <div class="gallery-tile-overlay">
          <span class="gallery-cat-tag">${item.category}</span>
          <h4 class="gallery-title">${item.title}</h4>
          <span class="gallery-zoom-icon">🔍 View Fullscreen</span>
        </div>
      </div>
    `).join("");
  }

  setGalleryCategory(category) {
    this.activeGalleryCategory = category;
    document.querySelectorAll(".gallery-filter-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-category") === category);
    });
    this.renderGalleryGrid();
  }

  openLightbox(index) {
    let items = window.hotelState.data.gallery;
    if (this.activeGalleryCategory !== "ALL") {
      items = items.filter(g => g.category.toUpperCase().includes(this.activeGalleryCategory));
    }

    this.activeLightboxIndex = index;
    const current = items[index];
    if (!current) return;

    const html = `
      <div class="lightbox-overlay active animate-fade-in">
        <button class="lightbox-close" onclick="window.closeGenericModal()">✕</button>
        <button class="lightbox-nav lightbox-prev" onclick="window.app.prevLightbox()">‹</button>
        <button class="lightbox-nav lightbox-next" onclick="window.app.nextLightbox()">›</button>

        <div class="lightbox-content">
          <img src="${current.url}" alt="${current.title}" class="lightbox-img">
          <div class="lightbox-caption">
            <h3>${current.title}</h3>
            <span>Category: ${current.category} • Photo ${index + 1} of ${items.length}</span>
          </div>
        </div>
      </div>
    `;
    window.openGenericModal(html);
  }

  prevLightbox() {
    let items = window.hotelState.data.gallery;
    if (this.activeGalleryCategory !== "ALL") {
      items = items.filter(g => g.category.toUpperCase().includes(this.activeGalleryCategory));
    }
    const nextIdx = (this.activeLightboxIndex - 1 + items.length) % items.length;
    this.openLightbox(nextIdx);
  }

  nextLightbox() {
    let items = window.hotelState.data.gallery;
    if (this.activeGalleryCategory !== "ALL") {
      items = items.filter(g => g.category.toUpperCase().includes(this.activeGalleryCategory));
    }
    const nextIdx = (this.activeLightboxIndex + 1) % items.length;
    this.openLightbox(nextIdx);
  }

  /* -------------------------------------------------------------
   * Verified Guest Reviews
   * ------------------------------------------------------------- */
  renderReviewsList() {
    const container = document.getElementById("reviews-list-grid");
    if (!container) return;

    const reviews = window.hotelState.data.reviews;

    container.innerHTML = reviews.map(rev => `
      <div class="review-card animate-fade-in">
        <div class="review-header">
          <div class="review-author-meta">
            <h4 class="review-name">${rev.guestName}</h4>
            <span class="review-loc">${rev.country} • Stayed ${rev.date}</span>
          </div>
          <div class="review-rating-stars">
            ${'★'.repeat(Math.round(rev.rating))}
            <span class="review-score">${rev.rating.toFixed(1)}</span>
          </div>
        </div>

        <div class="review-room-tag">
          <span>🏨 ${rev.roomType}</span>
          ${rev.verified ? `<span class="verified-tag">✓ Verified Guest Stay</span>` : ''}
        </div>

        <h5 class="review-title">"${rev.title}"</h5>
        <p class="review-text">${rev.comment}</p>

        <div class="review-subscores">
          <span>Cleanliness: ${rev.categories.cleanliness}</span>
          <span>Comfort: ${rev.categories.comfort}</span>
          <span>Staff: ${rev.categories.staff}</span>
        </div>
      </div>
    `).join("");
  }

  openWriteReviewModal() {
    const roomTypes = window.hotelState.getRoomTypes();
    const html = `
      <div class="modal-dialog animate-scale-up">
        <div class="modal-header">
          <h3>Share Your Guest Experience</h3>
          <button class="modal-close" onclick="window.closeGenericModal()">×</button>
        </div>
        <div class="modal-body">
          <form id="write-rev-form" onsubmit="window.submitGuestReview(event)">
            <div class="form-grid two-cols">
              <div class="form-group">
                <label class="form-label">Your Full Name *</label>
                <input type="text" id="wr-name" class="form-input" required placeholder="Guest Name">
              </div>
              <div class="form-group">
                <label class="form-label">Booking Reference or Country *</label>
                <input type="text" id="wr-country" class="form-input" required placeholder="e.g. United Kingdom or AUR-2026-XXXX">
              </div>
              <div class="form-group">
                <label class="form-label">Suite Stayed In *</label>
                <select id="wr-room" class="form-select">
                  ${roomTypes.map(rt => `<option value="${rt.name}">${rt.name}</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Overall Star Rating (1 to 5) *</label>
                <select id="wr-rating" class="form-select">
                  <option value="5" selected>★★★★★ 5.0 (Exceptional Luxury)</option>
                  <option value="4.8">★★★★☆ 4.8 (Superb Experience)</option>
                  <option value="4.0">★★★★☆ 4.0 (Very Good)</option>
                </select>
              </div>
            </div>

            <div class="form-group mt-3">
              <label class="form-label">Review Headline *</label>
              <input type="text" id="wr-title" class="form-input" required placeholder="e.g. Unforgettable beachfront stay!">
            </div>

            <div class="form-group mt-3">
              <label class="form-label">Detailed Review *</label>
              <textarea id="wr-comment" class="form-textarea" rows="3" required placeholder="Describe what made your stay special at DoubleTree by Hilton Hotel Los Angeles Downtown..."></textarea>
            </div>

            <div class="modal-footer-actions mt-4">
              <button type="button" class="btn btn-secondary" onclick="window.closeGenericModal()">Cancel</button>
              <button type="submit" class="btn btn-gold">Publish Verified Review</button>
            </div>
          </form>
        </div>
      </div>
    `;
    window.openGenericModal(html);
  }

  /* -------------------------------------------------------------
   * User Authentication & Hilton Honors Header Controls
   * ------------------------------------------------------------- */
  updateUserAuthUI() {
    const user = window.hotelState.getCurrentUser();
    const btnLabel = document.getElementById("user-auth-btn-label");
    const mobileLabel = document.getElementById("mobile-user-auth-label");

    if (user) {
      const firstName = (user.fullName || "").split(" ")[0] || "Member";
      const tierLabel = user.memberTier ? user.memberTier.replace("Hilton Honors ", "") : "Honors";
      if (btnLabel) btnLabel.innerHTML = `👤 ${firstName} (${tierLabel})`;
      if (mobileLabel) mobileLabel.innerHTML = `👤 ${user.fullName} (${tierLabel})`;
    } else {
      if (btnLabel) btnLabel.innerHTML = `👤 Sign In / Join Honors`;
      if (mobileLabel) mobileLabel.innerHTML = `👤 Sign In / Join Hilton Honors`;
    }
  }

  openUserAuthModal(initialTab = null) {
    const user = window.hotelState.getCurrentUser();
    let currentTab = initialTab || (user ? "profile" : "signin");

    const renderModalContent = (tab) => {
      currentTab = tab;
      const currentUser = window.hotelState.getCurrentUser();
      const userBookings = currentUser ? window.hotelState.getUserBookings(currentUser.email) : [];

      let tabContent = "";
      if (tab === "signin") {
        tabContent = `
          <div class="auth-modal-tab-pane animate-fade-in">
            <div class="auth-pane-header text-center mb-3">
              <div class="brand-crest mx-auto mb-2" style="width:48px;height:48px;font-size:1.1rem;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#c5a059,#93702e);border-radius:50%;color:#0b1325;font-weight:700;">DT</div>
              <h4>Sign In to Hilton Honors</h4>
              <p class="text-muted" style="font-size:0.9rem;">Access exclusive member rates, Kyoto Garden tour privileges, and manage your stays.</p>
            </div>

            <div id="auth-signin-error" class="auth-error-banner hidden mb-3"></div>

            <form id="auth-signin-form" onsubmit="window.app.handleUserSignInModal(event)">
              <div class="form-group mb-3">
                <label class="form-label">Email Address *</label>
                <input type="email" id="modal-signin-email" class="form-input" placeholder="e.g. name@domain.com" required autocomplete="email">
              </div>
              <div class="form-group mb-3">
                <label class="form-label">Password *</label>
                <input type="password" id="modal-signin-password" class="form-input" placeholder="Enter your password" required autocomplete="current-password">
              </div>
              <button type="submit" class="btn btn-gold btn-block mb-3" style="width:100%;padding:0.75rem;font-size:1rem;">Sign In to Account</button>
            </form>

            <div class="auth-switch-prompt text-center mt-3" style="border-top:1px solid rgba(255,255,255,0.1);padding-top:1rem;">
              <span class="text-muted" style="font-size:0.9rem;">Don't have an account yet?</span>
              <a href="javascript:void(0)" class="text-gold font-weight-bold ml-1" onclick="window.app.switchAuthModalTab('signup')">Join Hilton Honors (Free Sign Up) →</a>
            </div>
          </div>
        `;
      } else if (tab === "signup") {
        tabContent = `
          <div class="auth-modal-tab-pane animate-fade-in">
            <div class="auth-pane-header text-center mb-3">
              <div class="brand-crest mx-auto mb-2" style="width:48px;height:48px;font-size:1.1rem;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#c5a059,#93702e);border-radius:50%;color:#0b1325;font-weight:700;">DT</div>
              <h4>Join Hilton Honors Today</h4>
              <p class="text-muted" style="font-size:0.9rem;">Instant elite benefits and guaranteed best rates in Downtown Los Angeles.</p>
            </div>

            <div class="honors-welcome-perks mb-3" style="background:rgba(197,160,89,0.12);border:1px solid rgba(197,160,89,0.3);border-radius:8px;padding:0.75rem 1rem;">
              <div style="font-weight:600;color:#e6ca85;font-size:0.85rem;margin-bottom:0.35rem;">✨ Complimentary Member Privileges:</div>
              <ul style="font-size:0.8rem;color:#cbd5e1;padding-left:1.2rem;margin:0;">
                <li><strong>1,000 Welcome Bonus Points</strong> credited instantly</li>
                <li>Exclusive Hilton Honors rates on all luxury suites</li>
                <li>Free premium high-speed Wi-Fi across the property</li>
                <li>Priority morning access to the Kyoto Rooftop Gardens</li>
              </ul>
            </div>

            <div id="auth-signup-error" class="auth-error-banner hidden mb-3"></div>

            <form id="auth-signup-form" onsubmit="window.app.handleUserSignUpModal(event)">
              <div class="form-group mb-2">
                <label class="form-label">Full Legal Name *</label>
                <input type="text" id="modal-signup-name" class="form-input" placeholder="e.g. Eleanor Vance" required autocomplete="name">
              </div>
              <div class="form-group mb-2">
                <label class="form-label">Email Address *</label>
                <input type="email" id="modal-signup-email" class="form-input" placeholder="e.g. eleanor@luxury.com" required autocomplete="email">
              </div>
              <div class="form-group mb-2">
                <label class="form-label">Phone / WhatsApp Number</label>
                <input type="tel" id="modal-signup-phone" class="form-input" placeholder="+1 (213) 555-0199" autocomplete="tel">
              </div>
              <div class="form-group mb-3">
                <label class="form-label">Create Password * (min 6 characters)</label>
                <input type="password" id="modal-signup-password" class="form-input" placeholder="Create a secure password" minlength="6" required autocomplete="new-password">
              </div>
              <button type="submit" class="btn btn-gold btn-block mb-3" style="width:100%;padding:0.75rem;font-size:1rem;">Create Account & Join Honors</button>
            </form>

            <div class="auth-switch-prompt text-center mt-2" style="border-top:1px solid rgba(255,255,255,0.1);padding-top:0.75rem;">
              <span class="text-muted" style="font-size:0.9rem;">Already have an account?</span>
              <a href="javascript:void(0)" class="text-gold font-weight-bold ml-1" onclick="window.app.switchAuthModalTab('signin')">Sign In to Honors →</a>
            </div>
          </div>
        `;
      } else if (tab === "profile") {
        if (!currentUser) {
          renderModalContent("signin");
          return;
        }
        tabContent = `
          <div class="auth-modal-tab-pane animate-fade-in">
            <div class="user-profile-header-card mb-3" style="background:rgba(255,255,255,0.04);border:1px solid rgba(197,160,89,0.3);border-radius:10px;padding:1.25rem;">
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
                <div style="display:flex;align-items:center;gap:0.85rem;">
                  <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#c5a059,#93702e);display:flex;align-items:center;justify-content:center;font-size:1.5rem;color:#0b1325;font-weight:700;">
                    ${currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 style="margin:0;font-size:1.2rem;">${currentUser.fullName}</h4>
                    <span style="display:inline-block;background:#c5a059;color:#0b1325;font-size:0.75rem;font-weight:700;padding:2px 8px;border-radius:12px;text-transform:uppercase;">${currentUser.memberTier}</span>
                    <span style="font-size:0.8rem;color:#94a3b8;margin-left:6px;">Honors #${currentUser.honorsNumber || 'Member'}</span>
                  </div>
                </div>
                <div>
                  <button class="btn btn-outline btn-sm" onclick="window.app.handleUserSignOut()">Sign Out 🚪</button>
                </div>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:0.75rem;margin-top:1rem;border-top:1px solid rgba(255,255,255,0.08);padding-top:0.75rem;font-size:0.85rem;">
                <div><span class="text-muted">Email:</span> <br><strong>${currentUser.email}</strong></div>
                <div><span class="text-muted">Phone:</span> <br><strong>${currentUser.phone}</strong></div>
                <div><span class="text-muted">Honors Points:</span> <br><strong style="color:#e6ca85;">${(currentUser.points || 1000).toLocaleString()} pts</strong></div>
                <div><span class="text-muted">Account Status:</span> <br><span class="badge ${currentUser.status === 'deactivated' ? 'badge-danger' : 'badge-success'}">${currentUser.status === 'deactivated' ? 'Deactivated' : 'Active'}</span></div>
              </div>
            </div>

            <div class="user-bookings-section">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
                <h5 style="margin:0;font-size:1rem;">Your Stays & Reservations (${userBookings.length})</h5>
                <button class="btn btn-gold btn-sm" onclick="window.closeGenericModal(); window.bookingEngine.openBookingModal();">Book a New Stay +</button>
              </div>

              ${userBookings.length === 0 ? `
                <div style="background:rgba(255,255,255,0.02);border:1px dashed rgba(255,255,255,0.15);border-radius:8px;padding:2rem;text-align:center;">
                  <div style="font-size:2rem;margin-bottom:0.5rem;">🏨</div>
                  <h5 style="margin:0 0 0.25rem 0;">No Stays Booked Yet</h5>
                  <p class="text-muted" style="font-size:0.85rem;max-width:320px;margin:0 auto 1rem auto;">Ready to experience Japanese gardens and luxury suites in downtown Los Angeles?</p>
                  <button class="btn btn-gold btn-sm" onclick="window.closeGenericModal(); window.bookingEngine.openBookingModal();">Explore Available Suites</button>
                </div>
              ` : `
                <div style="display:flex;flex-direction:column;gap:0.75rem;max-height:280px;overflow-y:auto;padding-right:4px;">
                  ${userBookings.map(bk => `
                    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:0.85rem;">
                      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.35rem;">
                        <span style="font-weight:700;color:#e6ca85;font-size:0.9rem;">${bk.id}</span>
                        <span style="font-size:0.75rem;padding:2px 8px;border-radius:10px;background:${bk.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b'};color:#000;font-weight:600;">
                          ${bk.paymentStatus || 'Payment Follow-up (Gmail)'}
                        </span>
                      </div>
                      <div style="font-size:0.85rem;color:#e2e8f0;margin-bottom:0.25rem;">${bk.roomTypeName} • ${bk.checkIn} to ${bk.checkOut} (${bk.nights} nights)</div>
                      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;font-size:0.8rem;border-top:1px solid rgba(255,255,255,0.05);padding-top:0.35rem;margin-top:0.35rem;">
                        <span class="text-muted">Total: <strong>${window.hotelState.formatPrice(bk.totalAmount)}</strong></span>
                        <div style="display:flex;gap:0.5rem;">
                          <button class="btn btn-secondary btn-sm" style="padding:2px 8px;font-size:0.75rem;" onclick="window.printReservationReceipt('${bk.id}')">View Folio</button>
                          <a class="btn btn-gold btn-sm" style="padding:2px 8px;font-size:0.75rem;text-decoration:none;" href="https://mail.google.com/mail/?view=cm&fs=1&to=doubletreehotel49@gmail.com&su=Payment%20Procedure%20for%20Booking%20${bk.id}" target="_blank">Contact Manager</a>
                        </div>
                      </div>
                    </div>
                  `).join("")}
                </div>
              `}
            </div>
          </div>
        `;
      }

      const modalHtml = `
        <div class="modal-dialog auth-modal-dialog animate-scale-up" style="max-width:540px;width:95%;">
          <div class="modal-header" style="border-bottom:none;padding-bottom:0.5rem;">
            <div class="auth-modal-nav-tabs" style="display:flex;gap:0.5rem;width:100%;">
              <button class="auth-tab-btn ${currentTab === 'signin' ? 'active' : ''}" onclick="window.app.switchAuthModalTab('signin')">Sign In</button>
              <button class="auth-tab-btn ${currentTab === 'signup' ? 'active' : ''}" onclick="window.app.switchAuthModalTab('signup')">Join Honors</button>
              ${currentUser ? `<button class="auth-tab-btn ${currentTab === 'profile' ? 'active' : ''}" onclick="window.app.switchAuthModalTab('profile')">👤 My Stays</button>` : ''}
            </div>
            <button class="modal-close" onclick="window.closeGenericModal()">✕</button>
          </div>
          <div class="modal-body" style="padding-top:0.5rem;">
            ${tabContent}
          </div>
        </div>
      `;
      window.openGenericModal(modalHtml);
    };

    renderModalContent(currentTab);
  }

  switchAuthModalTab(tab) {
    this.openUserAuthModal(tab);
  }

  handleUserSignInModal(e) {
    e.preventDefault();
    const email = document.getElementById("modal-signin-email")?.value.trim();
    const pass = document.getElementById("modal-signin-password")?.value;
    const errBox = document.getElementById("auth-signin-error");

    const res = window.hotelState.loginCustomer(email, pass);
    if (res && res.error) {
      if (errBox) {
        errBox.innerHTML = `⚠️ ${res.message}`;
        errBox.classList.remove("hidden");
      } else {
        window.showToast(res.message, "error");
      }
      return;
    }

    window.showToast(res.message || "Signed in successfully!", "success");
    this.updateUserAuthUI();
    this.openUserAuthModal("profile");
  }

  handleUserSignUpModal(e) {
    e.preventDefault();
    const name = document.getElementById("modal-signup-name")?.value.trim();
    const email = document.getElementById("modal-signup-email")?.value.trim();
    const phone = document.getElementById("modal-signup-phone")?.value.trim();
    const pass = document.getElementById("modal-signup-password")?.value;
    const errBox = document.getElementById("auth-signup-error");

    const res = window.hotelState.registerCustomer({ fullName: name, email, phone, password: pass });
    if (res && res.error) {
      if (errBox) {
        errBox.innerHTML = `⚠️ ${res.message}`;
        errBox.classList.remove("hidden");
      } else {
        window.showToast(res.message, "error");
      }
      return;
    }

    window.showToast(res.message || "Account created successfully!", "success");
    this.updateUserAuthUI();
    this.openUserAuthModal("profile");
  }

  handleUserSignOut() {
    window.hotelState.logoutCustomer();
    this.updateUserAuthUI();
    window.showToast("Signed out of Hilton Honors.", "info");
    this.openUserAuthModal("signin");
  }

  /* -------------------------------------------------------------
   * Customer Account Portal & Self-Service
   * ------------------------------------------------------------- */
  renderAccountPortal() {
    const container = document.getElementById("account-portal-container");
    if (!container) return;

    const user = window.hotelState.getCurrentUser();
    const allRes = window.hotelState.getReservations();

    if (!user) {
      // Guest or Login screen
      container.innerHTML = `
        <div class="account-auth-card animate-fade-in">
          <div class="auth-header">
            <h2>Guest & Member Access</h2>
            <p>Access your reservation history, print folios, or manage upcoming stays.</p>
          </div>

          <div class="auth-grid-two">
            <!-- Option 1: Quick Member Login -->
            <div class="auth-box">
              <h3>Hilton Honors Sign In</h3>
              <p class="text-muted">Access Hilton Honors privileges and saved DTLA bookings.</p>
              <form id="member-login-form" onsubmit="window.handleMemberLogin(event)">
                <div class="form-group">
                  <label class="form-label">Email Address</label>
                  <input type="email" id="login-email" class="form-input" placeholder="guest@domain.com" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Password</label>
                  <input type="password" id="login-pass" class="form-input" placeholder="Your password" required>
                </div>
                <button type="submit" class="btn btn-gold btn-block mt-3">Log In to Honors Portal</button>
                <div class="text-center mt-2">
                  <a href="javascript:void(0)" class="text-gold" style="font-size:0.85rem;" onclick="window.app.openUserAuthModal('signup')">New guest? Create account & Join Honors →</a>
                </div>
              </form>
            </div>

            <!-- Option 2: Guest Booking Lookup -->
            <div class="auth-box">
              <h3>Guest Booking Lookup</h3>
              <p class="text-muted">Have a booking reference? Find and manage your stay instantly.</p>
              <form id="lookup-booking-form" onsubmit="window.handleGuestLookup(event)">
                <div class="form-group">
                  <label class="form-label">Booking Reference Number</label>
                  <input type="text" id="lookup-ref" class="form-input" placeholder="e.g. DTLA-2026-8942" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Lead Guest Email</label>
                  <input type="email" id="lookup-email" class="form-input" placeholder="Email on reservation" required>
                </div>
                <button type="submit" class="btn btn-secondary btn-block mt-3">Locate Reservation</button>
              </form>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Logged in user view
    const userRes = window.hotelState.getUserBookings(user.email);

    container.innerHTML = `
      <div class="account-dashboard-view animate-fade-in">
        <div class="account-profile-bar">
          <div class="profile-info">
            <div class="profile-avatar">👑</div>
            <div>
              <h3>Welcome, ${user.fullName}</h3>
              <span class="vip-member-tag">${user.memberTier}</span>
              <p class="profile-contact-text">${user.email} • ${user.phone}</p>
            </div>
          </div>
          <button class="btn btn-outline btn-sm" onclick="window.hotelState.logoutCustomer()">Log Out</button>
        </div>

        <div class="account-reservations-box mt-4">
          <h3>Your Stays & Reservations (${userRes.length})</h3>
          
          ${userRes.length > 0 ? `
            <div class="user-res-list">
              ${userRes.map(res => {
                const room = window.hotelState.getRoomTypeById(res.roomTypeId);
                return `
                  <div class="user-res-card">
                    <div class="user-res-top">
                      <div>
                        <span class="user-res-ref">Reference: <strong>${res.id}</strong></span>
                        <h4 class="user-res-suite">${room?.name || 'Suite'}</h4>
                        <span class="user-res-dates">📅 ${res.checkIn} to ${res.checkOut} (${res.nights} Nights)</span>
                      </div>
                      <div>
                        <span class="conf-status-pill ${res.status === 'Checked In' ? 'pill-in' : res.status === 'Confirmed' ? 'pill-confirmed' : 'pill-out'}">${res.status}</span>
                        <div class="user-res-amount">${window.hotelState.formatPrice(res.totalAmount)}</div>
                      </div>
                    </div>

                    <div class="user-res-footer">
                      <div class="user-res-room-tag">
                        <span>Assigned Room: <strong>Suite #${res.assignedRoom || 'Pending Reception Arrival'}</strong></span>
                      </div>
                      <div class="user-res-btns">
                        <button class="btn btn-sm btn-outline" onclick="window.printReservationReceipt('${res.id}')">🖨️ Receipt</button>
                        ${(res.status === 'Confirmed') ? `
                          <button class="btn btn-sm btn-secondary" onclick="window.cancelUserReservation('${res.id}')">Cancel Reservation</button>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          ` : `
            <div class="no-bookings-box">
              <p>You have no active reservations associated with this email address.</p>
              <button class="btn btn-gold btn-sm mt-2" onclick="window.bookingEngine.openBookingModal()">Make a New Reservation</button>
            </div>
          `}
        </div>
      </div>
    `;
  }

  /* -------------------------------------------------------------
   * Special Offers
   * ------------------------------------------------------------- */
  renderSpecialOffers() {
    const container = document.getElementById("special-offers-grid");
    if (!container) return;

    const promos = window.hotelState.data.promotions.filter(p => p.active);

    container.innerHTML = promos.map(promo => `
      <div class="promo-card animate-fade-in">
        <div class="promo-badge">${promo.discountPercent}% OFF</div>
        <h3 class="promo-title">${promo.description}</h3>
        <p class="promo-meta">Valid on bookings of ${promo.minNights}+ nights through ${promo.expiry}.</p>
        <div class="promo-code-display">
          <span>Use Code:</span>
          <code>${promo.code}</code>
          <button class="btn-copy-code" onclick="navigator.clipboard.writeText('${promo.code}'); window.showToast('Promo code ${promo.code} copied!', 'success');">Copy</button>
        </div>
        <button class="btn btn-gold btn-sm mt-3" onclick="window.bookingEngine.openBookingModal(); window.bookingEngine.bookingDraft.promoCode='${promo.code}';">
          Book with This Offer
        </button>
      </div>
    `).join("");
  }

  /* -------------------------------------------------------------
   * Contact Form & FAQ
   * ------------------------------------------------------------- */
  bindContactForm() {
    const form = document.getElementById("hotel-contact-form");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("cf-name")?.value;
      window.showToast(`Thank you, ${name}! Your inquiry has been sent to our Executive Concierge.`, "success");
      form.reset();
    });

    // FAQ Accordion
    document.querySelectorAll(".faq-item-header").forEach(header => {
      header.addEventListener("click", () => {
        const item = header.parentElement;
        item.classList.toggle("open");
      });
    });
  }
}

// Global modal triggers
window.viewRoomDetailsModal = function(roomId) {
  window.app.openRoomDetails(roomId);
};

window.submitTableRes = function(e) {
  e.preventDefault();
  const name = document.getElementById("tr-name").value;
  const date = document.getElementById("tr-date").value;
  const time = document.getElementById("tr-time").value;
  window.closeGenericModal();
  window.showToast(`Table confirmed for ${name} on ${date} at ${time}. Code: AUR-TBL-${Math.floor(100+Math.random()*900)}`, "success");
};

window.submitGuestReview = function(e) {
  e.preventDefault();
  const name = document.getElementById("wr-name").value;
  const country = document.getElementById("wr-country").value;
  const room = document.getElementById("wr-room").value;
  const rating = document.getElementById("wr-rating").value;
  const title = document.getElementById("wr-title").value;
  const comment = document.getElementById("wr-comment").value;

  window.hotelState.addReview({
    guestName: name,
    country: country,
    roomType: room,
    rating: parseFloat(rating),
    title: title,
    comment: comment
  });

  window.closeGenericModal();
  window.showToast("Thank you! Your verified review has been published.", "success");
};

window.handleMemberLogin = function(e) {
  e.preventDefault();
  const email = document.getElementById("login-email")?.value.trim();
  const pass = document.getElementById("login-pass")?.value;

  if (window.hotelState.isUserDeactivated(email)) {
    window.showToast("Your account has been deactivated by Hotel Administration. Please contact our General Manager at doubletreehotel49@gmail.com.", "error");
    return;
  }

  const result = window.hotelState.loginCustomer(email, pass);
  if (result && result.error) {
    window.showToast(result.message || "Login failed.", "error");
    return;
  }

  window.showToast("Signed in successfully to Hilton Honors Guest Portal!", "success");
  window.app.renderAccountPortal();
};

window.handleGuestLookup = function(e) {
  e.preventDefault();
  const ref = document.getElementById("lookup-ref")?.value.trim();
  const res = window.hotelState.getReservationById(ref);
  if (res) {
    if (window.hotelState.isUserDeactivated(res.email)) {
      window.showToast("Your account has been deactivated by Hotel Administration. Please contact our General Manager at doubletreehotel49@gmail.com.", "error");
      return;
    }
    window.hotelState.loginCustomer(res.email, "guest");
    window.showToast(`Found reservation for ${res.guestName}!`, "success");
    window.app.renderAccountPortal();
  } else {
    window.showToast(`No reservation found matching reference code "${ref}".`, "error");
  }
};

window.cancelUserReservation = function(resId) {
  if (confirm(`Are you sure you wish to cancel reservation ${resId}? Cancellation is free of charge under our guarantee.`)) {
    window.hotelState.cancelReservation(resId);
    window.showToast(`Reservation ${resId} has been cancelled.`, "info");
    window.app.renderAccountPortal();
  }
};

// Start application
window.addEventListener("DOMContentLoaded", () => {
  window.app = new MainApp();

  // If page loaded with #admin hash, switch to admin portal (which triggers auth gate if not logged in)
  if (window.location.hash === "#admin") {
    setTimeout(() => {
      window.app.switchView("admin");
    }, 100);
  }
});
