/**
 * Booking Engine & Reservation Flow Manager
 * Controls availability calculation, multi-step booking modal, promo validation, and confirmation
 */

class BookingEngine {
  constructor() {
    this.currentStep = 1;
    this.bookingDraft = {
      checkIn: "",
      checkOut: "",
      nights: 1,
      adults: 2,
      children: 0,
      roomsCount: 1,
      selectedRoomTypeId: null,
      guestName: "",
      email: "",
      phone: "",
      country: "International",
      arrivalEstimate: "15:00",
      specialRequests: [],
      specialRequestsNotes: "",
      promoCode: null,
      discountPercent: 0,
      subtotal: 0,
      discountAmount: 0,
      taxes: 0,
      totalAmount: 0
    };

    this.initDefaultDates();
    this.bindEvents();
  }

  initDefaultDates() {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 2);

    this.bookingDraft.checkIn = this.formatDateInput(today);
    this.bookingDraft.checkOut = this.formatDateInput(tomorrow);
    this.recalculateNights();
  }

  formatDateInput(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  recalculateNights() {
    const inDate = new Date(this.bookingDraft.checkIn);
    const outDate = new Date(this.bookingDraft.checkOut);
    if (!isNaN(inDate) && !isNaN(outDate) && outDate > inDate) {
      const diffTime = Math.abs(outDate - inDate);
      this.bookingDraft.nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else {
      this.bookingDraft.nights = 1;
    }
  }

  bindEvents() {
    // When currency changes, update any active summary
    window.hotelState.subscribe("currency:change", () => {
      this.updatePriceCalculations();
      this.renderSummary();
    });
  }

  openBookingModal(preselectedRoomTypeId = null) {
    const modal = document.getElementById("booking-modal");
    if (!modal) return;

    if (preselectedRoomTypeId) {
      this.bookingDraft.selectedRoomTypeId = preselectedRoomTypeId;
      this.currentStep = 2; // Jump to room confirmation or step 3
    } else {
      this.currentStep = 1;
    }

    // Prefill form if customer is logged in
    const u = window.hotelState.getCurrentUser();
    if (u) {
      this.bookingDraft.guestName = u.fullName || "";
      this.bookingDraft.email = u.email || "";
      this.bookingDraft.phone = u.phone || "";
    }

    this.updatePriceCalculations();
    this.renderStepView();
    modal.classList.add("active");
    document.body.classList.add("modal-open");
  }

  closeBookingModal() {
    const modal = document.getElementById("booking-modal");
    if (modal) {
      modal.classList.remove("active");
      document.body.classList.remove("modal-open");
    }
  }

  goToStep(stepNumber) {
    // Validation before moving forward
    if (stepNumber === 2) {
      // Validate dates
      const inDate = new Date(this.bookingDraft.checkIn);
      const outDate = new Date(this.bookingDraft.checkOut);
      if (isNaN(inDate) || isNaN(outDate) || outDate <= inDate) {
        window.showToast("Please select valid check-in and check-out dates.", "error");
        return;
      }
    }

    if (stepNumber === 3) {
      if (!this.bookingDraft.selectedRoomTypeId) {
        window.showToast("Please choose your preferred room or suite.", "warning");
        return;
      }
    }

    if (stepNumber === 4) {
      // Validate guest details
      const nameInput = document.getElementById("bk-guest-name");
      const emailInput = document.getElementById("bk-guest-email");
      const phoneInput = document.getElementById("bk-guest-phone");
      
      if (!nameInput?.value.trim()) {
        window.showToast("Please enter your full name.", "error");
        nameInput?.focus();
        return;
      }
      if (!emailInput?.value.trim() || !emailInput.value.includes("@")) {
        window.showToast("Please enter a valid email address.", "error");
        emailInput?.focus();
        return;
      }
      if (!phoneInput?.value.trim()) {
        window.showToast("Please enter your contact phone number.", "error");
        phoneInput?.focus();
        return;
      }

      // Check if user account has been deactivated by admin
      if (window.hotelState.isUserDeactivated(emailInput.value.trim())) {
        window.showToast("Your account has been deactivated by Hotel Administration. Please contact our General Manager at doubletreehotel49@gmail.com.", "error");
        emailInput?.focus();
        return;
      }

      this.bookingDraft.guestName = nameInput.value.trim();
      this.bookingDraft.email = emailInput.value.trim();
      this.bookingDraft.phone = phoneInput.value.trim();
      
      const countryInput = document.getElementById("bk-guest-country");
      if (countryInput) this.bookingDraft.country = countryInput.value;

      const arrivalInput = document.getElementById("bk-guest-arrival");
      if (arrivalInput) this.bookingDraft.arrivalEstimate = arrivalInput.value;

      // Special requests checkboxes
      const checkedBoxes = Array.from(document.querySelectorAll("input[name='special-request']:checked")).map(cb => cb.value);
      const notesInput = document.getElementById("bk-guest-notes");
      this.bookingDraft.specialRequests = checkedBoxes;
      this.bookingDraft.specialRequestsNotes = notesInput ? notesInput.value.trim() : "";
    }

    this.currentStep = stepNumber;
    this.updatePriceCalculations();
    this.renderStepView();
  }

  selectRoomType(roomTypeId) {
    // Check availability
    const avail = window.hotelState.checkRoomTypeAvailability(
      roomTypeId,
      this.bookingDraft.checkIn,
      this.bookingDraft.checkOut,
      this.bookingDraft.roomsCount
    );

    if (!avail.available) {
      window.showToast("This suite is fully booked for your selected dates. Please adjust your dates or choose another suite.", "warning");
      return;
    }

    this.bookingDraft.selectedRoomTypeId = roomTypeId;
    this.goToStep(3);
  }

  applyPromoCode(code) {
    if (!code) return;
    const promo = window.hotelState.validatePromoCode(code);
    if (!promo) {
      window.showToast(`Code "${code}" is invalid or expired.`, "error");
      return false;
    }

    if (promo.minNights && this.bookingDraft.nights < promo.minNights) {
      window.showToast(`Code "${promo.code}" requires a minimum of ${promo.minNights} nights.`, "warning");
      return false;
    }

    this.bookingDraft.promoCode = promo.code;
    this.bookingDraft.discountPercent = promo.discountPercent;
    this.updatePriceCalculations();
    this.renderSummary();
    window.showToast(`Promo "${promo.code}" applied! ${promo.discountPercent}% discount activated.`, "success");
    return true;
  }

  updatePriceCalculations() {
    if (!this.bookingDraft.selectedRoomTypeId) return;
    const room = window.hotelState.getRoomTypeById(this.bookingDraft.selectedRoomTypeId);
    if (!room) return;

    const baseNightly = room.basePrice;
    const subtotal = baseNightly * this.bookingDraft.nights * this.bookingDraft.roomsCount;
    const discount = (subtotal * this.bookingDraft.discountPercent) / 100;
    const taxableAmount = subtotal - discount;
    const taxes = Math.round(taxableAmount * 0.14); // 14% California & Los Angeles Transient Occupancy Tax
    const total = taxableAmount + taxes;

    this.bookingDraft.subtotal = subtotal;
    this.bookingDraft.discountAmount = discount;
    this.bookingDraft.taxes = taxes;
    this.bookingDraft.totalAmount = total;
  }

  confirmReservation() {
    this.updatePriceCalculations();

    // Check availability one final time to prevent race condition/collision
    const availCheck = window.hotelState.checkRoomTypeAvailability(
      this.bookingDraft.selectedRoomTypeId,
      this.bookingDraft.checkIn,
      this.bookingDraft.checkOut,
      this.bookingDraft.roomsCount
    );

    if (!availCheck.available) {
      window.showToast("Notice: Selected dates became unavailable. Please select alternate dates.", "error");
      this.goToStep(2);
      return;
    }

    const compiledRequests = [
      ...this.bookingDraft.specialRequests,
      this.bookingDraft.specialRequestsNotes
    ].filter(Boolean).join(" • ");

    try {
      const reservation = window.hotelState.createReservation({
        guestName: this.bookingDraft.guestName,
        email: this.bookingDraft.email,
        phone: this.bookingDraft.phone,
        country: this.bookingDraft.country,
        roomTypeId: this.bookingDraft.selectedRoomTypeId,
        checkIn: this.bookingDraft.checkIn,
        checkOut: this.bookingDraft.checkOut,
        nights: this.bookingDraft.nights,
        adults: this.bookingDraft.adults,
        children: this.bookingDraft.children,
        roomsCount: this.bookingDraft.roomsCount,
        totalAmount: this.bookingDraft.totalAmount,
        discountAmount: this.bookingDraft.discountAmount,
        promoCode: this.bookingDraft.promoCode,
        specialRequests: compiledRequests || "Standard luxury service",
        arrivalEstimate: this.bookingDraft.arrivalEstimate
      });

      this.currentConfirmedReservation = reservation;
      this.currentStep = 5; // Confirmation Step
      this.renderStepView();

      window.showToast(`Reservation ${reservation.id} confirmed! Welcome to DoubleTree by Hilton Hotel Los Angeles Downtown.`, "success");
    } catch (err) {
      console.error(err);
      if (err.code === "ACCOUNT_DEACTIVATED" || (err.message && err.message.includes("deactivated"))) {
        window.showToast("Your account has been deactivated by Hotel Administration. Please contact our General Manager at doubletreehotel49@gmail.com.", "error");
      } else {
        window.showToast("An error occurred creating your reservation. Please try again.", "error");
      }
    }
  }

  renderStepView() {
    const container = document.getElementById("booking-step-content");
    const indicator = document.getElementById("booking-step-indicators");
    if (!container) return;

    // Update step dots
    if (indicator) {
      indicator.innerHTML = [1, 2, 3, 4, 5].map(step => `
        <div class="step-indicator-item ${step === this.currentStep ? 'active' : ''} ${step < this.currentStep ? 'completed' : ''}">
          <span class="step-number">${step < this.currentStep ? '✓' : step}</span>
          <span class="step-label">${['Dates', 'Select Suite', 'Guest Info', 'Review & Book', 'Confirmation'][step - 1]}</span>
        </div>
      `).join("");
    }

    switch (this.currentStep) {
      case 1:
        this.renderStep1(container);
        break;
      case 2:
        this.renderStep2(container);
        break;
      case 3:
        this.renderStep3(container);
        break;
      case 4:
        this.renderStep4(container);
        break;
      case 5:
        this.renderStep5(container);
        break;
    }
  }

  renderStep1(container) {
    container.innerHTML = `
      <div class="booking-step-body animate-fade-in">
        <div class="step-header">
          <span class="step-badge">Step 1 of 4</span>
          <h3 class="step-title">Select Dates & Party Size</h3>
          <p class="step-desc">Choose your anticipated arrival and departure dates to check real-time suite availability.</p>
        </div>

        <div class="form-grid two-cols">
          <div class="form-group">
            <label class="form-label" for="step-checkin">
              <span class="icon">📅</span> Check-in Date
            </label>
            <input type="date" id="step-checkin" class="form-input" 
              value="${this.bookingDraft.checkIn}" 
              min="${this.formatDateInput(new Date())}">
            <span class="form-hint">Standard check-in from 3:00 PM</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="step-checkout">
              <span class="icon">📅</span> Check-out Date
            </label>
            <input type="date" id="step-checkout" class="form-input" 
              value="${this.bookingDraft.checkOut}" 
              min="${this.bookingDraft.checkIn}">
            <span class="form-hint">Standard check-out until 12:00 PM</span>
          </div>
        </div>

        <div class="duration-highlight">
          <div class="duration-badge">
            <span class="icon">🌙</span>
            <span id="calc-nights-display">Total Duration: <strong>${this.bookingDraft.nights} Night${this.bookingDraft.nights > 1 ? 's' : ''}</strong></span>
          </div>
        </div>

        <div class="form-grid three-cols">
          <div class="form-group">
            <label class="form-label">
              <span class="icon">👤</span> Adults (Age 13+)
            </label>
            <select id="step-adults" class="form-select">
              ${[1, 2, 3, 4, 5, 6].map(n => `<option value="${n}" ${n === this.bookingDraft.adults ? 'selected' : ''}>${n} Adult${n > 1 ? 's' : ''}</option>`).join("")}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="icon">🧒</span> Children (0 - 12)
            </label>
            <select id="step-children" class="form-select">
              ${[0, 1, 2, 3, 4].map(n => `<option value="${n}" ${n === this.bookingDraft.children ? 'selected' : ''}>${n} Child${n !== 1 ? 'ren' : ''}</option>`).join("")}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="icon">🚪</span> Number of Rooms
            </label>
            <select id="step-rooms" class="form-select">
              ${[1, 2, 3, 4].map(n => `<option value="${n}" ${n === this.bookingDraft.roomsCount ? 'selected' : ''}>${n} Room${n > 1 ? 's' : ''}</option>`).join("")}
            </select>
          </div>
        </div>

        <div class="step-footer-actions">
          <button type="button" class="btn btn-secondary" onclick="window.bookingEngine.closeBookingModal()">Cancel</button>
          <button type="button" class="btn btn-primary" id="btn-step1-continue">
            <span>Find Available Suites</span>
            <span class="icon">→</span>
          </button>
        </div>
      </div>
    `;

    // Bind change listeners
    const checkinEl = document.getElementById("step-checkin");
    const checkoutEl = document.getElementById("step-checkout");
    const nightsDisplay = document.getElementById("calc-nights-display");

    const updateDates = () => {
      this.bookingDraft.checkIn = checkinEl.value;
      this.bookingDraft.checkOut = checkoutEl.value;
      checkoutEl.min = checkinEl.value;
      this.recalculateNights();
      if (nightsDisplay) {
        nightsDisplay.innerHTML = `Total Duration: <strong>${this.bookingDraft.nights} Night${this.bookingDraft.nights > 1 ? 's' : ''}</strong>`;
      }
    };

    checkinEl?.addEventListener("change", updateDates);
    checkoutEl?.addEventListener("change", updateDates);

    document.getElementById("step-adults")?.addEventListener("change", (e) => {
      this.bookingDraft.adults = parseInt(e.target.value, 10);
    });
    document.getElementById("step-children")?.addEventListener("change", (e) => {
      this.bookingDraft.children = parseInt(e.target.value, 10);
    });
    document.getElementById("step-rooms")?.addEventListener("change", (e) => {
      this.bookingDraft.roomsCount = parseInt(e.target.value, 10);
    });

    document.getElementById("btn-step1-continue")?.addEventListener("click", () => {
      updateDates();
      this.goToStep(2);
    });
  }

  renderStep2(container) {
    const roomTypes = window.hotelState.getRoomTypes();
    const guestCount = this.bookingDraft.adults + this.bookingDraft.children;

    const cardsHtml = roomTypes.map(room => {
      const avail = window.hotelState.checkRoomTypeAvailability(
        room.id,
        this.bookingDraft.checkIn,
        this.bookingDraft.checkOut,
        this.bookingDraft.roomsCount
      );

      const isSelected = this.bookingDraft.selectedRoomTypeId === room.id;
      const exceedsCapacity = guestCount > room.capacity.maxGuests;
      const nightlyPriceFormatted = window.hotelState.formatPrice(room.basePrice);
      const totalEstimated = window.hotelState.formatPrice(room.basePrice * this.bookingDraft.nights * this.bookingDraft.roomsCount);

      return `
        <div class="suite-select-card ${isSelected ? 'selected' : ''} ${!avail.available ? 'unavailable' : ''}">
          <div class="suite-select-thumb">
            <img src="${room.images[0]}" alt="${room.name}" loading="lazy">
            ${room.badge ? `<span class="suite-badge-tag">${room.badge}</span>` : ''}
            <div class="suite-avail-chip ${avail.available ? 'chip-avail' : 'chip-booked'}">
              ${avail.available ? `✓ ${avail.countAvailable} Available` : 'Sold Out for Dates'}
            </div>
          </div>
          <div class="suite-select-details">
            <div class="suite-select-header">
              <div>
                <span class="suite-category">${room.category}</span>
                <h4 class="suite-title">${room.name}</h4>
              </div>
              <div class="suite-select-pricing">
                <span class="price-amount">${nightlyPriceFormatted}</span>
                <span class="price-unit">/ night</span>
                <span class="price-total-hint">${totalEstimated} for ${this.bookingDraft.nights}n</span>
              </div>
            </div>
            
            <p class="suite-short-desc">${room.shortDescription}</p>

            <div class="suite-meta-specs">
              <span>📐 ${room.size}</span>
              <span>🛏️ ${room.bedConfig}</span>
              <span>👥 Max ${room.capacity.maxGuests} Guests</span>
              <span>🌊 ${room.view}</span>
            </div>

            <div class="suite-perks-chips">
              ${room.amenities.slice(0, 4).map(a => `<span class="perk-chip">✦ ${a}</span>`).join("")}
            </div>

            <div class="suite-action-row">
              ${avail.available ? `
                <button type="button" class="btn ${isSelected ? 'btn-gold' : 'btn-outline'}" 
                  onclick="window.bookingEngine.selectRoomType('${room.id}')">
                  ${isSelected ? 'Selected ✓' : 'Select Suite'}
                </button>
              ` : `
                <button type="button" class="btn btn-disabled" disabled>Fully Booked</button>
              `}
              <button type="button" class="btn-link" onclick="window.viewRoomDetailsModal('${room.id}')">View Suite Full Details</button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div class="booking-step-body animate-fade-in">
        <div class="step-header">
          <span class="step-badge">Step 2 of 4</span>
          <h3 class="step-title">Choose Your Luxury Suite</h3>
          <p class="step-desc">
            Showing suites available from <strong>${this.bookingDraft.checkIn}</strong> to <strong>${this.bookingDraft.checkOut}</strong> (${this.bookingDraft.nights} Nights, ${guestCount} Guests)
          </p>
        </div>

        <div class="suite-select-list">
          ${cardsHtml}
        </div>

        <div class="step-footer-actions">
          <button type="button" class="btn btn-secondary" onclick="window.bookingEngine.goToStep(1)">
            <span class="icon">←</span> Change Dates
          </button>
          ${this.bookingDraft.selectedRoomTypeId ? `
            <button type="button" class="btn btn-primary" onclick="window.bookingEngine.goToStep(3)">
              Continue with Selected Suite →
            </button>
          ` : `
            <span class="select-hint-text">Select an available suite above to continue.</span>
          `}
        </div>
      </div>
    `;
  }

  renderStep3(container) {
    const selectedRoom = window.hotelState.getRoomTypeById(this.bookingDraft.selectedRoomTypeId);

    container.innerHTML = `
      <div class="booking-step-body animate-fade-in">
        <div class="step-header">
          <span class="step-badge">Step 3 of 4</span>
          <h3 class="step-title">Primary Guest Information</h3>
          <p class="step-desc">Please supply your arrival details for our concierge and butler teams.</p>
        </div>

        <div class="selected-room-mini-banner">
          <img src="${selectedRoom?.images[0]}" alt="${selectedRoom?.name}">
          <div>
            <span class="mini-tag">Selected Suite</span>
            <h4>${selectedRoom?.name}</h4>
            <p>${this.bookingDraft.nights} Nights • ${this.bookingDraft.adults} Adults${this.bookingDraft.children ? `, ${this.bookingDraft.children} Children` : ''} • ${window.hotelState.formatPrice(selectedRoom?.basePrice)} / night</p>
          </div>
        </div>

        ${window.hotelState.getCurrentUser() ? `
          <div class="user-autofill-banner mb-3">
            <span class="icon">👑</span>
            <div>
              <strong>Hilton Honors Member: ${window.hotelState.getCurrentUser().fullName}</strong>
              <span style="font-size:0.8rem;color:#cbd5e1;display:block;">Honors #${window.hotelState.getCurrentUser().honorsNumber || 'Member'} • Contact details pre-filled.</span>
            </div>
          </div>
        ` : `
          <div class="user-login-prompt-banner mb-3" onclick="window.app.openUserAuthModal('signin')">
            <span>✨ Have a Hilton Honors account? <strong class="text-gold">Sign In / Join Hilton Honors</strong> to auto-fill details & earn 1,000 Honors bonus points.</span>
          </div>
        `}

        <div class="form-grid two-cols">
          <div class="form-group">
            <label class="form-label" for="bk-guest-name">Full Legal Name *</label>
            <input type="text" id="bk-guest-name" class="form-input" placeholder="e.g. Lady Sarah Buckingham" value="${this.bookingDraft.guestName}" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="bk-guest-email">Email Address *</label>
            <input type="email" id="bk-guest-email" class="form-input" placeholder="e.g. sarah.b@luxury.com" value="${this.bookingDraft.email}" required>
            <span class="form-hint">Confirmation & VIP access voucher sent here</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="bk-guest-phone">Phone / WhatsApp Number *</label>
            <input type="tel" id="bk-guest-phone" class="form-input" placeholder="+1 (555) 000-0000" value="${this.bookingDraft.phone}" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="bk-guest-country">Country of Residence</label>
            <select id="bk-guest-country" class="form-select">
              <option value="United States" ${this.bookingDraft.country === 'United States' ? 'selected' : ''}>United States</option>
              <option value="Canada" ${this.bookingDraft.country === 'Canada' ? 'selected' : ''}>Canada</option>
              <option value="United Kingdom" ${this.bookingDraft.country === 'United Kingdom' ? 'selected' : ''}>United Kingdom</option>
              <option value="Japan" ${this.bookingDraft.country === 'Japan' ? 'selected' : ''}>Japan</option>
              <option value="Germany" ${this.bookingDraft.country === 'Germany' ? 'selected' : ''}>Germany</option>
              <option value="France" ${this.bookingDraft.country === 'France' ? 'selected' : ''}>France</option>
              <option value="Australia" ${this.bookingDraft.country === 'Australia' ? 'selected' : ''}>Australia</option>
              <option value="International" ${this.bookingDraft.country === 'International' ? 'selected' : ''}>Other International</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="bk-guest-arrival">Estimated Arrival Time</label>
            <select id="bk-guest-arrival" class="form-select">
              <option value="12:00">12:00 PM (Early Check-In Request)</option>
              <option value="14:00">02:00 PM</option>
              <option value="15:00" selected>03:00 PM (Standard Check-In)</option>
              <option value="17:00">05:00 PM</option>
              <option value="19:00">07:00 PM</option>
              <option value="21:00">09:00 PM or Later (Late Arrival)</option>
            </select>
          </div>
        </div>

        <div class="form-group-block">
          <label class="form-label">Tailored Guest Preferences & Amenities</label>
          <div class="checkbox-pill-grid">
            <label class="checkbox-pill">
              <input type="checkbox" name="special-request" value="High Floor DTLA Skyline View" checked>
              <span>High Floor Skyline View</span>
            </label>
            <label class="checkbox-pill">
              <input type="checkbox" name="special-request" value="Extra Warm DoubleTree Chocolate Chip Cookies">
              <span>Warm DoubleTree Cookies</span>
            </label>
            <label class="checkbox-pill">
              <input type="checkbox" name="special-request" value="On-Site Valet Parking & EV Charging">
              <span>Valet Parking & EV Charge</span>
            </label>
            <label class="checkbox-pill">
              <input type="checkbox" name="special-request" value="Feather-Free Hypoallergenic Pillows">
              <span>Feather-Free Pillows</span>
            </label>
            <label class="checkbox-pill">
              <input type="checkbox" name="special-request" value="Quiet Corner Location">
              <span>Quiet Corner Location</span>
            </label>
            <label class="checkbox-pill">
              <input type="checkbox" name="special-request" value="Late Check-out Privilege">
              <span>Late Check-out Request</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="bk-guest-notes">Additional Special Requests or Dietary Restrictions</label>
          <textarea id="bk-guest-notes" class="form-textarea" rows="2" placeholder="Tell our concierge team any custom preferences or dietary requirements...">${this.bookingDraft.specialRequestsNotes}</textarea>
        </div>

        <div class="step-footer-actions">
          <button type="button" class="btn btn-secondary" onclick="window.bookingEngine.goToStep(2)">
            <span class="icon">←</span> Back to Suites
          </button>
          <button type="button" class="btn btn-primary" onclick="window.bookingEngine.goToStep(4)">
            Review Reservation Summary →
          </button>
        </div>
      </div>
    `;
  }

  renderStep4(container) {
    this.updatePriceCalculations();
    const room = window.hotelState.getRoomTypeById(this.bookingDraft.selectedRoomTypeId);

    container.innerHTML = `
      <div class="booking-step-body animate-fade-in">
        <div class="step-header">
          <span class="step-badge">Step 4 of 4</span>
          <h3 class="step-title">Review & Confirm Reservation</h3>
          <p class="step-desc">Review your reservation breakdown, apply promotional discounts, and finalize your booking.</p>
        </div>

        <div class="summary-breakdown-card">
          <div class="summary-card-header">
            <div class="summary-suite-info">
              <span class="summary-category">${room?.category}</span>
              <h3>${room?.name}</h3>
              <p class="summary-meta-line">
                <span>📅 ${this.bookingDraft.checkIn} to ${this.bookingDraft.checkOut}</span>
                <span>🌙 ${this.bookingDraft.nights} Night${this.bookingDraft.nights > 1 ? 's' : ''}</span>
                <span>👥 ${this.bookingDraft.adults} Adults${this.bookingDraft.children ? `, ${this.bookingDraft.children} Kids` : ''}</span>
              </p>
            </div>
            <div class="summary-suite-img">
              <img src="${room?.images[0]}" alt="${room?.name}">
            </div>
          </div>

          <div class="summary-guest-recap">
            <div class="recap-item">
              <span class="recap-label">Lead Guest:</span>
              <span class="recap-val">${this.bookingDraft.guestName}</span>
            </div>
            <div class="recap-item">
              <span class="recap-label">Contact:</span>
              <span class="recap-val">${this.bookingDraft.email} • ${this.bookingDraft.phone}</span>
            </div>
            <div class="recap-item">
              <span class="recap-label">Country:</span>
              <span class="recap-val">${this.bookingDraft.country}</span>
            </div>
            <div class="recap-item">
              <span class="recap-label">Estimated Arrival:</span>
              <span class="recap-val">${this.bookingDraft.arrivalEstimate}</span>
            </div>
            ${this.bookingDraft.specialRequests.length > 0 ? `
              <div class="recap-item full-width">
                <span class="recap-label">Preferences:</span>
                <span class="recap-val">${this.bookingDraft.specialRequests.join(", ")}</span>
              </div>
            ` : ''}
          </div>

          <!-- Promo Code Bar -->
          <div class="promo-code-box">
            <div class="promo-input-row">
              <input type="text" id="promo-input" class="form-input" 
                placeholder="Promo Code (e.g. DTLA15, WEEKEND20, WELCOME10)" 
                value="${this.bookingDraft.promoCode || ''}">
              <button type="button" class="btn btn-secondary" id="btn-apply-promo">Apply Promo</button>
            </div>
            ${this.bookingDraft.promoCode ? `
              <div class="promo-applied-tag">
                <span>✓ Code <strong>${this.bookingDraft.promoCode}</strong> applied (-${this.bookingDraft.discountPercent}%)</span>
              </div>
            ` : `
              <span class="promo-hint-note">Tip: Use promo code <strong>DTLA15</strong> for 15% off your Downtown Los Angeles stay!</span>
            `}
          </div>

          <!-- Pricing Ledger -->
          <div class="pricing-ledger">
            <div class="ledger-row">
              <span>Room Rate (${window.hotelState.formatPrice(room?.basePrice)} × ${this.bookingDraft.nights} nights)</span>
              <span>${window.hotelState.formatPrice(this.bookingDraft.subtotal)}</span>
            </div>
            ${this.bookingDraft.discountAmount > 0 ? `
              <div class="ledger-row discount-row">
                <span>Promotional Discount (${this.bookingDraft.discountPercent}%)</span>
                <span>-${window.hotelState.formatPrice(this.bookingDraft.discountAmount)}</span>
              </div>
            ` : ''}
            <div class="ledger-row">
              <span>California State & Los Angeles City Occupancy Tax (14%)</span>
              <span>${window.hotelState.formatPrice(this.bookingDraft.taxes)}</span>
            </div>
            <div class="ledger-row total-row">
              <span>Total Reservation Cost</span>
              <span class="grand-total-price">${window.hotelState.formatPrice(this.bookingDraft.totalAmount)}</span>
            </div>
          </div>

          <div class="guarantee-box">
            <div class="guarantee-icon">🛡️</div>
            <div>
              <strong>Free Cancellation Guarantee:</strong> Cancel free of charge up to 48 hours prior to check-in. Warm DoubleTree chocolate chip cookie waiting for you on arrival.
            </div>
          </div>
        </div>

        <div class="step-footer-actions">
          <button type="button" class="btn btn-secondary" onclick="window.bookingEngine.goToStep(3)">
            <span class="icon">←</span> Edit Guest Info
          </button>
          <button type="button" class="btn btn-gold btn-large" onclick="window.bookingEngine.confirmReservation()">
            <span>Confirm & Guarantee Reservation</span>
            <span class="icon">✓</span>
          </button>
        </div>
      </div>
    `;

    document.getElementById("btn-apply-promo")?.addEventListener("click", () => {
      const code = document.getElementById("promo-input")?.value;
      if (this.applyPromoCode(code)) {
        this.renderStep4(container);
      }
    });
  }

  renderStep5(container) {
    const res = this.currentConfirmedReservation;
    if (!res) return;
    const room = window.hotelState.getRoomTypeById(res.roomTypeId);

    // Formatted details for Gmail communication
    const emailSubject = encodeURIComponent(`Booking Payment Procedure - Ref: ${res.id} - ${res.guestName}`);
    const emailText = 
`Dear DoubleTree by Hilton Hotel Los Angeles Downtown Management,

I have completed my room booking on your official website and would like to arrange payment. Here are my booking details:

===========================================
DOUBLETREE BY HILTON HOTEL IN LOS ANGELES DOWNTOWN
BOOKING PAYMENT & CONFIRMATION INQUIRY
===========================================
Booking Reference: ${res.id}
Lead Guest Name: ${res.guestName}
Guest Email: ${res.email}
Guest Phone: ${res.phone}
Country: ${res.country || 'United States'}

Room Reserved: ${room?.name || 'Deluxe Room'}
Assigned Room: Room #${res.assignedRoom || 'Assigned at Front Desk'}
Check-in Date: ${res.checkIn} (3:00 PM PST)
Check-out Date: ${res.checkOut} (12:00 PM PST)
Duration: ${res.nights} Night(s)
Party Size: ${res.adults} Adults${res.children ? `, ${res.children} Children` : ''}
Rooms Count: ${res.roomsCount || 1}

Total Amount Due: $${res.totalAmount} USD
Special Requests: ${res.specialRequests || 'None'}
===========================================

Please advise me on the payment procedure and instructions to complete my reservation.

Thank you,
${res.guestName}`;

    const encodedBody = encodeURIComponent(emailText);
    const mailtoUrl = `mailto:doubletreehotel49@gmail.com?subject=${emailSubject}&body=${encodedBody}`;
    const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=doubletreehotel49@gmail.com&su=${emailSubject}&body=${encodedBody}`;

    container.innerHTML = `
      <div class="booking-step-body confirmation-screen animate-fade-in">
        <div class="conf-badge-success">
          <span class="conf-check">✓</span>
        </div>

        <h2 class="conf-heading">Reservation Details Confirmed!</h2>
        <p class="conf-subheading">Thank you, ${res.guestName}. Your reservation details have been recorded. Follow the payment procedure below to finalize your booking.</p>

        <div class="conf-reference-banner">
          <span class="conf-ref-label">Booking Reference Code</span>
          <h1 class="conf-ref-id">${res.id}</h1>
          <span class="conf-status-pill pill-confirmed">Status: Confirmed - Pending Payment</span>
        </div>

        <!-- Official Payment Procedure via Admin Gmail Card -->
        <div class="conf-payment-card" style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.16) 0%, rgba(14, 22, 38, 0.98) 100%); border: 1.5px solid var(--gold-primary); border-radius: 12px; padding: 24px; margin: 22px 0; text-align: left; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; margin-bottom: 14px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 1.8rem;">💳</span>
              <div>
                <h3 style="margin: 0; color: var(--gold-primary); font-size: 1.2rem; font-weight: 700;">Booking Payment Procedure</h3>
                <span style="font-size: 0.82rem; color: var(--text-secondary);">Direct Payment Arrangement with Hotel General Manager</span>
              </div>
            </div>
            <span style="display: inline-flex; align-items: center; gap: 6px; background: rgba(255, 184, 108, 0.15); border: 1px solid rgba(255, 184, 108, 0.4); color: #ffb86c; padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 600;">
              ⚠️ WhatsApp currently unavailable
            </span>
          </div>
          
          <p style="font-size: 0.92rem; color: #EAEFE9; line-height: 1.6; margin-bottom: 16px;">
            To complete your payment and finalize your reservation, <strong>please contact our General Manager directly via Gmail</strong>. All your booking details, dates, and reference code will follow along automatically in the message.
          </p>

          <div style="background: rgba(0,0,0,0.4); border: 1px dashed rgba(212, 175, 55, 0.5); border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; display: block; margin-bottom: 2px;">Hotel Admin Official Gmail</span>
              <strong style="color: #fff; font-size: 1.1rem; font-family: monospace; letter-spacing: 0.5px;">doubletreehotel49@gmail.com</strong>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('doubletreehotel49@gmail.com'); window.showToast('Admin Gmail copied to clipboard!', 'success');">
              📋 Copy Admin Gmail
            </button>
          </div>

          <div class="conf-email-buttons-row" style="display: flex; gap: 12px; flex-wrap: wrap;">
            <a href="${gmailWebUrl}" target="_blank" class="btn btn-gold" style="flex: 1; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700;">
              <span>✉️ Open in Gmail Web</span>
              <span>↗</span>
            </a>
            <a href="${mailtoUrl}" class="btn btn-secondary" style="flex: 1; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700;">
              <span>📧 Send via Email App</span>
              <span>↗</span>
            </a>
            <button type="button" class="btn btn-outline" style="flex: 1; font-weight: 700;" onclick="window.bookingEngine.copyBookingDetails('${res.id}')">
              <span>📋 Copy Booking Details</span>
            </button>
          </div>
        </div>

        <div class="conf-details-card">
          <div class="conf-grid">
            <div>
              <span class="conf-label">Room Reserved</span>
              <strong>${room?.name}</strong>
            </div>
            <div>
              <span class="conf-label">Assigned Room</span>
              <strong>Room #${res.assignedRoom || 'Assigned at Front Desk'}</strong>
            </div>
            <div>
              <span class="conf-label">Check-in</span>
              <strong>${res.checkIn} (3:00 PM PST)</strong>
            </div>
            <div>
              <span class="conf-label">Check-out</span>
              <strong>${res.checkOut} (12:00 PM PST)</strong>
            </div>
            <div>
              <span class="conf-label">Party Size</span>
              <strong>${res.adults} Adults${res.children ? `, ${res.children} Children` : ''}</strong>
            </div>
            <div>
              <span class="conf-label">Total Amount Due</span>
              <strong class="text-gold" style="font-size: 1.15rem;">${window.hotelState.formatPrice(res.totalAmount)}</strong>
            </div>
          </div>

          ${res.specialRequests ? `
            <div class="conf-special-req">
              <span class="conf-label">Special Requests</span>
              <p>${res.specialRequests}</p>
            </div>
          ` : ''}
        </div>

        <div class="conf-actions-row">
          <button type="button" class="btn btn-primary" onclick="window.printReservationReceipt('${res.id}')">
            <span>🖨️ Print / Download Confirmation</span>
          </button>
          <button type="button" class="btn btn-secondary" onclick="window.bookingEngine.downloadCalendarInvite('${res.id}')">
            <span>📅 Add to Calendar (.ics)</span>
          </button>
          <button type="button" class="btn btn-outline" onclick="window.bookingEngine.closeBookingModal(); window.app.switchView('account');">
            <span>View in My Reservations</span>
          </button>
        </div>
      </div>
    `;
  }

  copyBookingDetails(resId) {
    const res = window.hotelState.getReservationById(resId);
    if (!res) return;
    const room = window.hotelState.getRoomTypeById(res.roomTypeId);

    const summaryText = 
`DOUBLETREE BY HILTON HOTEL IN LOS ANGELES DOWNTOWN
BOOKING PAYMENT & RESERVATION DETAILS
-------------------------------------------
Booking Reference: ${res.id}
Lead Guest: ${res.guestName}
Email: ${res.email}
Phone: ${res.phone}
Country: ${res.country || 'United States'}
Room: ${room?.name || 'Deluxe Room'}
Check-in: ${res.checkIn} (3:00 PM PST)
Check-out: ${res.checkOut} (12:00 PM PST)
Nights: ${res.nights}
Guests: ${res.adults} Adults${res.children ? `, ${res.children} Children` : ''}
Total Amount: $${res.totalAmount} USD
Special Requests: ${res.specialRequests || 'None'}
-------------------------------------------
Admin Gmail for Payment: doubletreehotel49@gmail.com
(Note: WhatsApp is currently unavailable)`;

    navigator.clipboard.writeText(summaryText).then(() => {
      window.showToast("Complete booking summary copied to clipboard! You can paste this in Gmail.", "success");
    }).catch(() => {
      window.showToast("Failed to copy. Please manually copy details.", "error");
    });
  }

  downloadCalendarInvite(resId) {
    const res = window.hotelState.getReservationById(resId);
    if (!res) return;
    const room = window.hotelState.getRoomTypeById(res.roomTypeId);

    const startDate = res.checkIn.replace(/-/g, "") + "T150000Z";
    const endDate = res.checkOut.replace(/-/g, "") + "T120000Z";

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//DoubleTree by Hilton Hotel Los Angeles Downtown//Reservation System//EN",
      "BEGIN:VEVENT",
      `UID:${res.id}@doubletreela.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:Stay at DoubleTree by Hilton Hotel Los Angeles Downtown (${room?.name || 'Room'})`,
      `DESCRIPTION:Booking Reference: ${res.id}\\nGuest: ${res.guestName}\\nRoom: ${room?.name}\\nTotal: ${res.totalAmount}`,
      `LOCATION:120 S Los Angeles St, Los Angeles, CA 90012, United States`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `DoubleTree_DTLA_Reservation_${res.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.showToast("Calendar event file (.ics) downloaded successfully!", "success");
  }
}

// Global instance
window.bookingEngine = new BookingEngine();
