/**
 * State Management & Data Persistence Layer
 * Provides reactive store, localStorage synchronization, and event subscription
 */

class HotelState {
  constructor() {
    this.STORAGE_KEY = "DOUBLETREE_DTLA_CLEAN_v3";
    this.subscribers = new Map();
    this.init();
  }

  init() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      try {
        this.data = JSON.parse(raw);
        // Ensure all required top-level keys exist if schema evolved
        for (const key of Object.keys(window.INITIAL_DATA)) {
          if (!this.data[key]) {
            this.data[key] = window.INITIAL_DATA[key];
          }
        }
      } catch (e) {
        console.warn("Corrupt local state, resetting to initial data", e);
        this.resetToDefaults();
      }
    } else {
      this.resetToDefaults();
    }

    // Ensure userAccounts array exists
    if (!this.data.userAccounts) {
      this.data.userAccounts = [];
    }

    // Default runtime sessions
    this.currentCurrency = this.data.hotelInfo.currency || "USD";
    this.currentUser = JSON.parse(localStorage.getItem("DOUBLETREE_CURRENT_USER") || "null");
    this.activeStaffRole = "General Manager";
  }

  resetToDefaults() {
    this.data = JSON.parse(JSON.stringify(window.INITIAL_DATA));
    this.persist();
  }

  persist() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  }

  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event).push(callback);
    return () => {
      const arr = this.subscribers.get(event);
      if (arr) {
        const index = arr.indexOf(callback);
        if (index > -1) arr.splice(index, 1);
      }
    };
  }

  notify(event, payload) {
    this.persist();
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).forEach(cb => {
        try { cb(payload); } catch (err) { console.error("Event handler error:", err); }
      });
    }
    // Universal change event
    if (this.subscribers.has("*")) {
      this.subscribers.get("*").forEach(cb => {
        try { cb({ event, payload }); } catch (err) { console.error("Universal event handler error:", err); }
      });
    }
  }

  // Currency Formatter
  setCurrency(code) {
    const curr = this.data.hotelInfo.currencies.find(c => c.code === code);
    if (curr) {
      this.currentCurrency = code;
      this.notify("currency:change", curr);
    }
  }

  formatPrice(amountInUSD, showDecimals = false) {
    const curr = this.data.hotelInfo.currencies.find(c => c.code === this.currentCurrency) || { symbol: "$", rate: 1.0 };
    const converted = amountInUSD * curr.rate;
    if (showDecimals) {
      return `${curr.symbol}${converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${curr.symbol}${Math.round(converted).toLocaleString("en-US")}`;
  }

  // Room & Inventory methods
  getRoomTypes() {
    return this.data.roomTypes;
  }

  getRoomTypeById(id) {
    return this.data.roomTypes.find(rt => rt.id === id);
  }

  getPhysicalRooms(filterTypeId = null) {
    if (filterTypeId) {
      return this.data.physicalRooms.filter(r => r.roomTypeId === filterTypeId);
    }
    return this.data.physicalRooms;
  }

  updatePhysicalRoom(roomNumber, updates) {
    const room = this.data.physicalRooms.find(r => r.roomNumber === roomNumber);
    if (room) {
      Object.assign(room, updates);
      this.notify("rooms:change", room);
      return room;
    }
    return null;
  }

  addPhysicalRoom(roomData) {
    const existing = this.data.physicalRooms.find(r => r.roomNumber === roomData.roomNumber);
    if (existing) {
      throw new Error(`Room number ${roomData.roomNumber} already exists.`);
    }
    const newRoom = {
      roomNumber: roomData.roomNumber,
      roomTypeId: roomData.roomTypeId,
      status: roomData.status || "Available",
      floor: parseInt(roomData.floor, 10) || 1,
      cleaningStatus: roomData.cleaningStatus || "Clean",
      lastCleaned: new Date().toISOString().slice(0, 16).replace("T", " "),
      notes: roomData.notes || ""
    };
    this.data.physicalRooms.push(newRoom);
    this.notify("rooms:change", newRoom);
    return newRoom;
  }

  // Reservation management & Overlap check
  getReservations() {
    return this.data.reservations;
  }

  getReservationById(id) {
    return this.data.reservations.find(r => r.id.toLowerCase() === id.toLowerCase());
  }

  /**
   * Core Availability Logic:
   * Checks whether there are physical rooms of roomTypeId that are NOT under maintenance
   * and NOT overlapping with other confirmed / checked-in reservations during [checkIn, checkOut].
   */
  checkRoomTypeAvailability(roomTypeId, checkInStr, checkOutStr, requiredRooms = 1) {
    const targetCheckIn = new Date(checkInStr);
    const targetCheckOut = new Date(checkOutStr);

    if (isNaN(targetCheckIn) || isNaN(targetCheckOut) || targetCheckOut <= targetCheckIn) {
      return { available: false, availableRooms: [], reason: "Invalid date range" };
    }

    // 1. Get physical rooms of this type not in maintenance
    const eligibleRooms = this.data.physicalRooms.filter(r => 
      r.roomTypeId === roomTypeId && r.status !== "Under Maintenance"
    );

    if (eligibleRooms.length === 0) {
      return { available: false, availableRooms: [], reason: "All rooms in maintenance" };
    }

    // 2. Filter out rooms that have active overlapping bookings
    const availableRooms = eligibleRooms.filter(room => {
      // Find reservations assigned to this room that are active
      const hasConflict = this.data.reservations.some(res => {
        if (res.status === "Cancelled" || res.status === "Checked Out") return false;
        
        // If reservation is assigned to this specific room or holds inventory of this type
        const resCheckIn = new Date(res.checkIn);
        const resCheckOut = new Date(res.checkOut);

        // Date overlap logic: (StartA < EndB) and (EndA > StartB)
        const overlaps = (targetCheckIn < resCheckOut) && (targetCheckOut > resCheckIn);
        
        if (overlaps) {
          if (res.assignedRoom === room.roomNumber) return true;
        }
        return false;
      });

      return !hasConflict;
    });

    const isAvailable = availableRooms.length >= requiredRooms;
    return {
      available: isAvailable,
      countAvailable: availableRooms.length,
      availableRooms: availableRooms,
      reason: isAvailable ? "Available" : "Sold out for selected dates"
    };
  }

  createReservation(bookingData) {
    // Generate unique reference: DTLA-2026-XXXX
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const refId = `DTLA-${new Date().getFullYear()}-${randomHex}`;

    // Check if user is deactivated
    if (this.isUserDeactivated(bookingData.email)) {
      const err = new Error("Your account has been deactivated by Hotel Administration. Please contact our General Manager at doubletreehotel49@gmail.com.");
      err.code = "ACCOUNT_DEACTIVATED";
      throw err;
    }

    // Find best available physical room to assign
    const availCheck = this.checkRoomTypeAvailability(
      bookingData.roomTypeId,
      bookingData.checkIn,
      bookingData.checkOut,
      bookingData.roomsCount || 1
    );

    const assignedRoomNumber = availCheck.availableRooms.length > 0 
      ? availCheck.availableRooms[0].roomNumber 
      : null;

    const newReservation = {
      id: refId,
      guestName: bookingData.guestName,
      email: bookingData.email,
      phone: bookingData.phone,
      country: bookingData.country || "International",
      roomTypeId: bookingData.roomTypeId,
      assignedRoom: assignedRoomNumber,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      nights: bookingData.nights,
      adults: bookingData.adults,
      children: bookingData.children || 0,
      roomsCount: bookingData.roomsCount || 1,
      totalAmount: bookingData.totalAmount,
      discountAmount: bookingData.discountAmount || 0,
      promoCode: bookingData.promoCode || null,
      status: "Confirmed",
      specialRequests: bookingData.specialRequests || "Standard room preparation",
      createdAt: new Date().toISOString(),
      arrivalEstimate: bookingData.arrivalEstimate || "15:00",
      depositPaid: bookingData.totalAmount,
      balance: 0
    };

    this.data.reservations.unshift(newReservation);

    // Auto-record in user accounts directory
    this.registerOrUpdateUserAccount({
      email: bookingData.email,
      fullName: bookingData.guestName,
      phone: bookingData.phone,
      country: bookingData.country,
      totalStays: (this.getUserAccount(bookingData.email)?.totalStays || 0) + 1,
      totalSpend: (this.getUserAccount(bookingData.email)?.totalSpend || 0) + (bookingData.totalAmount || 0)
    });

    this.notify("reservations:change", newReservation);
    return newReservation;
  }

  updateReservation(id, updates) {
    const res = this.getReservationById(id);
    if (!res) return null;

    const oldStatus = res.status;
    Object.assign(res, updates);

    // If status changed to "Checked In", mark physical room as Occupied
    if (updates.status === "Checked In" && res.assignedRoom) {
      this.updatePhysicalRoom(res.assignedRoom, { status: "Occupied" });
    }

    // If status changed to "Checked Out", mark physical room as "Needs Cleaning"
    if (updates.status === "Checked Out" && res.assignedRoom) {
      this.updatePhysicalRoom(res.assignedRoom, { 
        status: "Needs Cleaning", 
        cleaningStatus: "Needs Cleaning" 
      });
      // Add or update housekeeping task
      this.addHousekeepingTask({
        roomNumber: res.assignedRoom,
        cleaner: "Grace Mensah",
        status: "Needs Cleaning",
        priority: "High",
        departure: true,
        note: `Turn-down after check-out of ${res.guestName}`
      });
    }

    this.notify("reservations:change", res);
    return res;
  }

  cancelReservation(id) {
    const res = this.getReservationById(id);
    if (!res) return false;
    res.status = "Cancelled";
    if (res.assignedRoom) {
      // Room remains available or reverts
      const pRoom = this.data.physicalRooms.find(r => r.roomNumber === res.assignedRoom);
      if (pRoom && pRoom.status === "Occupied") {
        pRoom.status = "Available";
      }
    }
    this.notify("reservations:change", res);
    return true;
  }

  // Housekeeping Tasks
  getHousekeepingTasks() {
    return this.data.housekeepingTasks;
  }

  addHousekeepingTask(task) {
    const newTask = {
      id: "hk-" + Date.now(),
      roomNumber: task.roomNumber,
      cleaner: task.cleaner || "Unassigned",
      status: task.status || "Needs Cleaning",
      priority: task.priority || "Normal",
      departure: !!task.departure,
      note: task.note || "General clean & inspection"
    };
    this.data.housekeepingTasks.unshift(newTask);
    this.notify("housekeeping:change", newTask);
    return newTask;
  }

  updateHousekeepingTask(id, updates) {
    const task = this.data.housekeepingTasks.find(t => t.id === id);
    if (task) {
      Object.assign(task, updates);
      if (updates.status === "Clean" || updates.status === "Inspected") {
        // Also update the physical room's cleaning status
        const room = this.data.physicalRooms.find(r => r.roomNumber === task.roomNumber);
        if (room) {
          room.cleaningStatus = "Clean";
          if (room.status === "Needs Cleaning") {
            room.status = "Available";
          }
          room.lastCleaned = new Date().toISOString().slice(0, 16).replace("T", " ");
          this.notify("rooms:change", room);
        }
      }
      this.notify("housekeeping:change", task);
      return task;
    }
    return null;
  }

  // Reviews
  addReview(reviewData) {
    const newRev = {
      id: "rev-" + Date.now(),
      guestName: reviewData.guestName,
      country: reviewData.country || "Verified Guest",
      date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      roomType: reviewData.roomType || "Deluxe Ocean King Suite",
      rating: parseFloat(reviewData.rating) || 5.0,
      categories: {
        cleanliness: parseFloat(reviewData.cleanliness) || 5,
        comfort: parseFloat(reviewData.comfort) || 5,
        staff: parseFloat(reviewData.staff) || 5,
        location: parseFloat(reviewData.location) || 5,
        facilities: parseFloat(reviewData.facilities) || 5,
        value: parseFloat(reviewData.value) || 5
      },
      title: reviewData.title,
      comment: reviewData.comment,
      verified: true
    };
    this.data.reviews.unshift(newRev);
    this.notify("reviews:change", newRev);
    return newRev;
  }

  // Promo Code Validation
  validatePromoCode(code) {
    if (!code) return null;
    const clean = code.trim().toUpperCase();
    const promo = this.data.promotions.find(p => p.code === clean && p.active);
    return promo || null;
  }

  // -------------------------------------------------------------
  // Customer / User Authentication & Registration (Hilton Honors)
  // -------------------------------------------------------------
  getCurrentUser() {
    if (!this.currentUser) {
      const stored = localStorage.getItem("DOUBLETREE_CURRENT_USER");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (this.isUserDeactivated(parsed.email)) {
            this.logoutCustomer();
            return null;
          }
          this.currentUser = parsed;
        } catch (e) {
          this.currentUser = null;
        }
      }
    }
    return this.currentUser;
  }

  registerCustomer({ fullName, email, phone, password, country = "United States" }) {
    if (!email || !fullName || !password) {
      return {
        error: "VALIDATION_ERROR",
        message: "Please fill in all required fields (Full Name, Email, and Password)."
      };
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = this.getUserAccount(cleanEmail);
    if (existing) {
      return {
        error: "ACCOUNT_EXISTS",
        message: `An account with ${cleanEmail} already exists. Please sign in instead.`
      };
    }

    if (password.length < 6) {
      return {
        error: "WEAK_PASSWORD",
        message: "Password must be at least 6 characters long."
      };
    }

    const honorsNum = "HH-" + Math.floor(10000000 + Math.random() * 90000000);
    const newAccount = {
      id: "usr-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      email: cleanEmail,
      fullName: fullName.trim(),
      phone: phone ? phone.trim() : "+1 (213) 555-0199",
      password: password,
      country: country,
      honorsNumber: honorsNum,
      memberTier: "Hilton Honors Member",
      points: 1000, // 1,000 welcome bonus points
      status: "active", // "active" or "deactivated"
      totalStays: 0,
      totalSpend: 0,
      memberSince: new Date().getFullYear().toString(),
      createdAt: new Date().toISOString()
    };

    if (!this.data.userAccounts) this.data.userAccounts = [];
    this.data.userAccounts.push(newAccount);

    this.currentUser = newAccount;
    localStorage.setItem("DOUBLETREE_CURRENT_USER", JSON.stringify(newAccount));
    this.notify("auth:change", newAccount);
    this.notify("users:change", newAccount);

    return {
      success: true,
      user: newAccount,
      message: `Welcome to Hilton Honors, ${newAccount.fullName}! You have received 1,000 welcome bonus points.`
    };
  }

  loginCustomer(email, password) {
    if (!email) {
      return { error: "MISSING_FIELDS", message: "Please enter your email address." };
    }

    const cleanEmail = email.trim().toLowerCase();

    if (this.isUserDeactivated(cleanEmail)) {
      return { 
        error: "ACCOUNT_DEACTIVATED", 
        message: "Your account has been deactivated by Hotel Administration. Please contact our General Manager directly at doubletreehotel49@gmail.com for assistance." 
      };
    }

    const acc = this.getUserAccount(cleanEmail);
    if (!acc) {
      return {
        error: "NOT_FOUND",
        message: `No account found for "${cleanEmail}". Please check your email or click "Join Hilton Honors" to create a new account.`
      };
    }

    // Verify password if account has a password
    if (acc.password && password && acc.password !== password) {
      return {
        error: "INVALID_CREDENTIALS",
        message: "Incorrect password. Please verify your credentials and try again."
      };
    }

    // Ensure Honors Number exists
    if (!acc.honorsNumber) {
      acc.honorsNumber = "HH-" + Math.floor(10000000 + Math.random() * 90000000);
    }
    if (acc.points === undefined) {
      acc.points = 1000;
    }

    this.currentUser = acc;
    localStorage.setItem("DOUBLETREE_CURRENT_USER", JSON.stringify(acc));
    this.notify("auth:change", acc);

    return {
      success: true,
      user: acc,
      message: `Welcome back, ${acc.fullName}!`
    };
  }

  logoutCustomer() {
    this.currentUser = null;
    localStorage.removeItem("DOUBLETREE_CURRENT_USER");
    this.notify("auth:change", null);
  }

  getUserBookings(email) {
    if (!email) return [];
    const clean = email.trim().toLowerCase();
    return (this.data.reservations || []).filter(r => (r.customerEmail || "").toLowerCase() === clean);
  }

  // -------------------------------------------------------------
  // User Accounts Management & Access Control
  // -------------------------------------------------------------
  getUserAccounts() {
    if (!this.data.userAccounts) {
      this.data.userAccounts = [];
    }
    return this.data.userAccounts;
  }

  getUserAccount(email) {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    return this.getUserAccounts().find(a => a.email.toLowerCase() === clean) || null;
  }

  registerOrUpdateUserAccount(userData) {
    if (!userData || !userData.email) return null;
    const cleanEmail = userData.email.trim();
    let acc = this.getUserAccount(cleanEmail);

    if (!acc) {
      acc = {
        id: "usr-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        email: cleanEmail,
        fullName: userData.fullName || userData.name || cleanEmail.split("@")[0].replace(".", " ").replace(/\b\w/g, l => l.toUpperCase()),
        phone: userData.phone || "+1 (213) 555-0199",
        country: userData.country || "United States",
        status: "active", // "active" or "deactivated"
        memberTier: userData.memberTier || "Hilton Honors Member",
        totalStays: userData.totalStays || 0,
        totalSpend: userData.totalSpend || 0,
        createdAt: new Date().toISOString()
      };
      this.data.userAccounts.push(acc);
    } else {
      if (userData.fullName) acc.fullName = userData.fullName;
      if (userData.phone) acc.phone = userData.phone;
      if (userData.country) acc.country = userData.country;
      if (userData.memberTier) acc.memberTier = userData.memberTier;
      if (userData.totalStays !== undefined) acc.totalStays = userData.totalStays;
      if (userData.totalSpend !== undefined) acc.totalSpend = userData.totalSpend;
    }

    this.notify("users:change", acc);
    return acc;
  }

  setUserStatus(email, status) {
    const acc = this.getUserAccount(email);
    if (!acc) return null;
    acc.status = status === "deactivated" ? "deactivated" : "active";
    acc.statusUpdatedAt = new Date().toISOString();
    this.notify("users:change", acc);
    return acc;
  }

  toggleUserStatus(email) {
    const acc = this.getUserAccount(email);
    if (!acc) return null;
    acc.status = acc.status === "active" ? "deactivated" : "active";
    acc.statusUpdatedAt = new Date().toISOString();
    this.notify("users:change", acc);
    return acc;
  }

  isUserDeactivated(email) {
    if (!email) return false;
    const acc = this.getUserAccount(email);
    return acc ? acc.status === "deactivated" : false;
  }

  // -------------------------------------------------------------
  // Admin Operations Authentication
  // Credentials: Username: doubletree | Password: Admin1234
  // -------------------------------------------------------------
  isAdminAuthenticated() {
    return sessionStorage.getItem("DOUBLETREE_ADMIN_AUTH") === "true";
  }

  loginAdmin(username, password) {
    const u = (username || "").trim();
    const p = (password || "").trim();

    if (u === "doubletree" && p === "Admin1234") {
      sessionStorage.setItem("DOUBLETREE_ADMIN_AUTH", "true");
      this.notify("admin:auth", { authenticated: true });
      return { success: true };
    }

    return { 
      success: false, 
      message: "Authentication failed. Please verify your admin username and password." 
    };
  }

  logoutAdmin() {
    sessionStorage.removeItem("DOUBLETREE_ADMIN_AUTH");
    this.notify("admin:auth", { authenticated: false });
  }

  // -------------------------------------------------------------
  // Clear All Database (Zero out bookings & reset rooms to Available)
  // -------------------------------------------------------------
  clearAllDatabase() {
    this.data.reservations = [];
    this.data.housekeepingTasks = [];
    
    // Reset all physical rooms to Available and Clean
    if (this.data.physicalRooms) {
      this.data.physicalRooms.forEach(room => {
        room.status = "Available";
        room.cleaningStatus = "Clean";
        room.lastCleaned = new Date().toISOString().slice(0, 16).replace("T", " ");
      });
    }

    // Keep user accounts registered but reset stays and spend to 0
    if (this.data.userAccounts) {
      this.data.userAccounts.forEach(acc => {
        acc.totalStays = 0;
        acc.totalSpend = 0;
      });
    }

    this.notify("*", { type: "DATABASE_CLEARED" });
    return true;
  }
}

// Global instance
window.hotelState = new HotelState();
