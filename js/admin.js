/**
 * Admin Dashboard & Hotel Operations Management Module
 * Comprehensive operations center for reservations, room inventory, housekeeping, guest profiles, billing, and staff
 */

class AdminManager {
  constructor() {
    this.activeSection = "overview";
    this.statusFilter = "ALL";
    this.searchQuery = "";
    this.initListeners();
  }

  initListeners() {
    // When state updates, refresh current admin view
    window.hotelState.subscribe("*", () => {
      if (document.getElementById("admin-portal-view")?.classList.contains("active")) {
        this.renderActiveSection();
      }
    });
  }

  switchSection(sectionId) {
    this.activeSection = sectionId;
    
    // Update nav links
    document.querySelectorAll(".admin-sidebar-nav .nav-item").forEach(item => {
      item.classList.toggle("active", item.getAttribute("data-section") === sectionId);
    });

    this.renderActiveSection();
  }

  renderActiveSection() {
    const container = document.getElementById("admin-main-stage");
    if (!container) return;

    switch (this.activeSection) {
      case "overview":
        this.renderOverview(container);
        break;
      case "reservations":
        this.renderReservations(container);
        break;
      case "rooms":
        this.renderRooms(container);
        break;
      case "housekeeping":
        this.renderHousekeeping(container);
        break;
      case "customers":
        this.renderCustomers(container);
        break;
      case "billing":
        this.renderBilling(container);
        break;
      case "promotions":
        this.renderPromotions(container);
        break;
      case "staff":
        this.renderStaff(container);
        break;
      case "content":
        this.renderContent(container);
        break;
      default:
        this.renderOverview(container);
    }
  }

  /* -------------------------------------------------------------
   * 1. Overview Section & Floor Rack
   * ------------------------------------------------------------- */
  renderOverview(container) {
    const res = window.hotelState.getReservations();
    const rooms = window.hotelState.getPhysicalRooms();
    const todayStr = new Date().toISOString().slice(0, 10);

    const totalRes = res.length;
    const occupiedCount = rooms.filter(r => r.status === "Occupied").length;
    const availableCount = rooms.filter(r => r.status === "Available").length;
    const cleaningCount = rooms.filter(r => r.cleaningStatus === "Needs Cleaning" || r.status === "Needs Cleaning").length;
    const maintenanceCount = rooms.filter(r => r.status === "Under Maintenance").length;
    
    const occupancyRate = Math.round((occupiedCount / rooms.length) * 100);

    const confirmedRev = res
      .filter(r => r.status !== "Cancelled")
      .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    const arrivalsToday = res.filter(r => r.checkIn === todayStr && r.status === "Confirmed").length;
    const departuresToday = res.filter(r => r.checkOut === todayStr && r.status === "Checked In").length;

    container.innerHTML = `
      <div class="admin-section-content animate-fade-in">
        <div class="admin-topbar-row">
          <div>
            <h2 class="admin-section-title">Operations Command Center</h2>
            <p class="admin-section-subtitle">Real-time status of suites, guest arrivals, house operations, and revenue metrics.</p>
          </div>
          <div class="admin-actions-bar">
            <button class="btn btn-sm" onclick="window.adminManager.confirmClearDatabase()" style="background: rgba(231,76,60,0.2); border: 1px solid #e74c3c; color: #ff6b6b; font-weight: 600;">
              <span>🗑️ Clear All Database</span>
            </button>
            <button class="btn btn-primary btn-sm" onclick="window.adminManager.openWalkInModal()">
              <span>+ Record Walk-in Booking</span>
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.adminManager.openAddRoomModal()">
              <span>+ Add Suite</span>
            </button>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="kpi-grid">
          <div class="kpi-card gold-border">
            <div class="kpi-icon">💰</div>
            <div class="kpi-info">
              <span class="kpi-label">Confirmed Revenue</span>
              <h3 class="kpi-value">${window.hotelState.formatPrice(confirmedRev)}</h3>
              <span class="kpi-sub positive">↑ 18.4% vs last month</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon">🏨</div>
            <div class="kpi-info">
              <span class="kpi-label">Occupancy Rate</span>
              <h3 class="kpi-value">${occupancyRate}%</h3>
              <span class="kpi-sub">${occupiedCount} / ${rooms.length} Suites Occupied</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon">🛬</div>
            <div class="kpi-info">
              <span class="kpi-label">Today's Arrivals</span>
              <h3 class="kpi-value">${arrivalsToday}</h3>
              <span class="kpi-sub">Check-in from 3:00 PM</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon">🛫</div>
            <div class="kpi-info">
              <span class="kpi-label">Today's Departures</span>
              <h3 class="kpi-value">${departuresToday}</h3>
              <span class="kpi-sub">Standard check-out 12 PM</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon">✨</div>
            <div class="kpi-info">
              <span class="kpi-label">Needs Cleaning</span>
              <h3 class="kpi-value">${cleaningCount}</h3>
              <span class="kpi-sub">${maintenanceCount} in Maintenance</span>
            </div>
          </div>
        </div>

        <!-- Interactive Floor Rack / Room Rack -->
        <div class="card admin-box">
          <div class="box-header-flex">
            <div>
              <h3 class="box-title">Interactive Physical Room Rack & Floor Matrix</h3>
              <p class="box-subtitle">Click any suite number to toggle maintenance, update cleaning, or view occupant.</p>
            </div>
            <div class="room-rack-legend">
              <span class="legend-item"><span class="dot dot-avail"></span> Available</span>
              <span class="legend-item"><span class="dot dot-occ"></span> Occupied</span>
              <span class="legend-item"><span class="dot dot-clean"></span> Needs Cleaning</span>
              <span class="legend-item"><span class="dot dot-maint"></span> Maintenance</span>
            </div>
          </div>

          <div class="room-rack-grid">
            ${rooms.map(r => {
              const rType = window.hotelState.getRoomTypeById(r.roomTypeId);
              let statusClass = "status-avail";
              if (r.status === "Occupied") statusClass = "status-occ";
              else if (r.status === "Under Maintenance") statusClass = "status-maint";
              else if (r.cleaningStatus === "Needs Cleaning" || r.status === "Needs Cleaning") statusClass = "status-clean";

              // Find active guest if occupied
              const activeGuest = res.find(resItem => resItem.assignedRoom === r.roomNumber && (resItem.status === "Checked In" || resItem.status === "Confirmed"));

              return `
                <div class="room-tile ${statusClass}" onclick="window.adminManager.openRoomQuickModal('${r.roomNumber}')" title="Floor ${r.floor} - ${rType?.name}">
                  <div class="tile-top">
                    <span class="tile-num">${r.roomNumber}</span>
                    <span class="tile-floor">F${r.floor}</span>
                  </div>
                  <div class="tile-type">${rType?.category || 'Room'}</div>
                  <div class="tile-status-tag">${r.status}</div>
                  ${activeGuest ? `<div class="tile-guest-hint">👤 ${activeGuest.guestName.split(" ")[0]}</div>` : ''}
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- Recent Reservations Table -->
        <div class="card admin-box">
          <div class="box-header-flex">
            <div>
              <h3 class="box-title">Recent Front-Desk Bookings</h3>
              <p class="box-subtitle">Live stream of incoming reservations and guest statuses.</p>
            </div>
            <button class="btn btn-outline btn-sm" onclick="window.adminManager.switchSection('reservations')">
              View All ${totalRes} Reservations →
            </button>
          </div>

          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Ref #</th>
                  <th>Guest Name</th>
                  <th>Suite Category</th>
                  <th>Dates</th>
                  <th>Room</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${res.slice(0, 6).map(r => this.renderReservationRow(r)).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  /* -------------------------------------------------------------
   * 2. Reservations Management
   * ------------------------------------------------------------- */
  renderReservations(container) {
    const allRes = window.hotelState.getReservations();
    
    // Filter
    let filtered = allRes;
    if (this.statusFilter !== "ALL") {
      filtered = filtered.filter(r => r.status.toUpperCase() === this.statusFilter);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.id.toLowerCase().includes(q) ||
        r.guestName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.assignedRoom && r.assignedRoom.includes(q))
      );
    }

    container.innerHTML = `
      <div class="admin-section-content animate-fade-in">
        <div class="admin-topbar-row">
          <div>
            <h2 class="admin-section-title">Reservation Registry & Guest Check-In</h2>
            <p class="admin-section-subtitle">Manage guest arrivals, assign physical rooms, check-in guests, and process invoices.</p>
          </div>
          <div class="admin-actions-bar">
            <button class="btn btn-gold btn-sm" onclick="window.adminManager.openWalkInModal()">
              <span>+ Record Walk-in Booking</span>
            </button>
          </div>
        </div>

        <div class="admin-filter-bar">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" id="res-search-input" class="form-input" 
              placeholder="Search by Guest Name, Reference, Email, Room..." 
              value="${this.searchQuery}">
          </div>

          <div class="filter-pills">
            ${["ALL", "CONFIRMED", "CHECKED IN", "CHECKED OUT", "CANCELLED"].map(st => `
              <button class="filter-pill ${this.statusFilter === st ? 'active' : ''}" 
                onclick="window.adminManager.setResFilter('${st}')">
                ${st}
              </button>
            `).join("")}
          </div>
        </div>

        <div class="card admin-box">
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Ref #</th>
                  <th>Guest Name</th>
                  <th>Suite Category</th>
                  <th>Stay Dates</th>
                  <th>Room Assigned</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                  <th>Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length > 0 
                  ? filtered.map(r => this.renderReservationRow(r)).join("") 
                  : `<tr><td colspan="8" class="text-center py-4 text-muted">No reservations matching current filter.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Search input listener
    const searchEl = document.getElementById("res-search-input");
    searchEl?.addEventListener("input", (e) => {
      this.searchQuery = e.target.value.trim();
      this.renderReservations(container);
      document.getElementById("res-search-input")?.focus();
    });
  }

  setResFilter(st) {
    this.statusFilter = st;
    this.renderActiveSection();
  }

  renderReservationRow(r) {
    const roomType = window.hotelState.getRoomTypeById(r.roomTypeId);
    let statusClass = "pill-confirmed";
    if (r.status === "Checked In") statusClass = "pill-in";
    else if (r.status === "Checked Out") statusClass = "pill-out";
    else if (r.status === "Cancelled") statusClass = "pill-cancelled";

    return `
      <tr>
        <td><strong>${r.id}</strong></td>
        <td>
          <div class="guest-cell">
            <span class="guest-name">${r.guestName}</span>
            <span class="guest-email">${r.email}</span>
          </div>
        </td>
        <td>${roomType?.name || 'Suite'}</td>
        <td>
          <div class="dates-cell">
            <span>${r.checkIn} → ${r.checkOut}</span>
            <span class="nights-tag">${r.nights}n • ${r.adults}A${r.children ? `, ${r.children}C` : ''}</span>
          </div>
        </td>
        <td>
          <span class="assigned-room-pill">${r.assignedRoom ? `Suite #${r.assignedRoom}` : 'Unassigned'}</span>
        </td>
        <td><strong>${window.hotelState.formatPrice(r.totalAmount)}</strong></td>
        <td><span class="conf-status-pill ${statusClass}">${r.status}</span></td>
        <td>
          <div class="row-actions">
            ${r.status === "Confirmed" ? `
              <button class="btn-action btn-action-in" title="Check-In Guest" onclick="window.adminManager.checkInGuest('${r.id}')">
                Check In
              </button>
            ` : ''}
            ${r.status === "Checked In" ? `
              <button class="btn-action btn-action-out" title="Check-Out Guest" onclick="window.adminManager.checkOutGuest('${r.id}')">
                Check Out
              </button>
            ` : ''}
            <button class="btn-action" title="View / Print Tax Invoice" onclick="window.adminManager.openInvoiceModal('${r.id}')">
              Invoice
            </button>
            ${(r.status === "Confirmed" || r.status === "Pending") ? `
              <button class="btn-action btn-action-cancel" title="Cancel Reservation" onclick="window.adminManager.cancelResPrompt('${r.id}')">
                ✕
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }

  checkInGuest(resId) {
    const res = window.hotelState.getReservationById(resId);
    if (!res) return;

    if (!res.assignedRoom) {
      // Find an available room
      const avail = window.hotelState.getPhysicalRooms(res.roomTypeId).find(r => r.status === "Available");
      if (avail) {
        res.assignedRoom = avail.roomNumber;
      } else {
        window.showToast("No vacant room of this type available right now. Please reassign manually.", "error");
        return;
      }
    }

    window.hotelState.updateReservation(resId, {
      status: "Checked In",
      assignedRoom: res.assignedRoom
    });

    window.showToast(`Guest ${res.guestName} successfully checked into Suite #${res.assignedRoom}!`, "success");
  }

  checkOutGuest(resId) {
    const res = window.hotelState.getReservationById(resId);
    if (!res) return;

    window.hotelState.updateReservation(resId, {
      status: "Checked Out"
    });

    window.showToast(`Guest ${res.guestName} checked out. Suite #${res.assignedRoom} dispatched to Housekeeping!`, "success");
  }

  cancelResPrompt(resId) {
    if (confirm(`Are you sure you want to cancel reservation ${resId}? This will release the physical room inventory immediately.`)) {
      window.hotelState.cancelReservation(resId);
      window.showToast(`Reservation ${resId} cancelled.`, "info");
    }
  }

  /* -------------------------------------------------------------
   * 3. Room Inventory Management
   * ------------------------------------------------------------- */
  renderRooms(container) {
    const rooms = window.hotelState.getPhysicalRooms();
    const roomTypes = window.hotelState.getRoomTypes();

    container.innerHTML = `
      <div class="admin-section-content animate-fade-in">
        <div class="admin-topbar-row">
          <div>
            <h2 class="admin-section-title">Physical Rooms & Inventory</h2>
            <p class="admin-section-subtitle">Manage individual suites, floors, maintenance status, and cleaning readiness.</p>
          </div>
          <button class="btn btn-gold btn-sm" onclick="window.adminManager.openAddRoomModal()">
            <span>+ Add New Physical Suite</span>
          </button>
        </div>

        <div class="card admin-box">
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Room #</th>
                  <th>Floor</th>
                  <th>Suite Category</th>
                  <th>Base Nightly Rate</th>
                  <th>Current Occupancy</th>
                  <th>Cleaning Status</th>
                  <th>Last Inspected</th>
                  <th>Operations</th>
                </tr>
              </thead>
              <tbody>
                ${rooms.map(r => {
                  const rType = roomTypes.find(rt => rt.id === r.roomTypeId);
                  return `
                    <tr>
                      <td><strong class="room-number-tag">Suite #${r.roomNumber}</strong></td>
                      <td>Floor ${r.floor}</td>
                      <td>${rType?.name || 'Standard'}</td>
                      <td>${window.hotelState.formatPrice(rType?.basePrice || 250)}</td>
                      <td>
                        <span class="status-indicator-badge badge-${r.status.toLowerCase().replace(/\s+/g, '-')}">
                          ${r.status}
                        </span>
                      </td>
                      <td>
                        <span class="cleaning-badge badge-${r.cleaningStatus.toLowerCase().replace(/\s+/g, '-')}">
                          ${r.cleaningStatus}
                        </span>
                      </td>
                      <td><small>${r.lastCleaned || 'Today'}</small></td>
                      <td>
                        <div class="row-actions">
                          <button class="btn-action" onclick="window.adminManager.toggleMaintenance('${r.roomNumber}')">
                            ${r.status === 'Under Maintenance' ? 'End Maintenance' : 'Set Maintenance'}
                          </button>
                          <button class="btn-action" onclick="window.adminManager.openRoomQuickModal('${r.roomNumber}')">
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  toggleMaintenance(roomNumber) {
    const r = window.hotelState.getPhysicalRooms().find(room => room.roomNumber === roomNumber);
    if (!r) return;

    const newStatus = r.status === "Under Maintenance" ? "Available" : "Under Maintenance";
    window.hotelState.updatePhysicalRoom(roomNumber, { status: newStatus });
    window.showToast(`Suite #${roomNumber} status set to "${newStatus}".`, "info");
  }

  /* -------------------------------------------------------------
   * 4. Housekeeping Management
   * ------------------------------------------------------------- */
  renderHousekeeping(container) {
    const tasks = window.hotelState.getHousekeepingTasks();
    const rooms = window.hotelState.getPhysicalRooms();

    container.innerHTML = `
      <div class="admin-section-content animate-fade-in">
        <div class="admin-topbar-row">
          <div>
            <h2 class="admin-section-title">Housekeeping Operations & Cleanliness Board</h2>
            <p class="admin-section-subtitle">Real-time cleaning assignments, turn-down priority queues, and sanitization audit logs.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.adminManager.openAddHousekeepingModal()">
            <span>+ Dispatch Cleaning Task</span>
          </button>
        </div>

        <div class="hk-kanban-grid">
          <!-- Column 1: Needs Cleaning -->
          <div class="hk-column">
            <div class="hk-col-header col-amber">
              <h4>Needs Cleaning (${tasks.filter(t => t.status === 'Needs Cleaning').length})</h4>
            </div>
            <div class="hk-cards-list">
              ${tasks.filter(t => t.status === 'Needs Cleaning').map(t => this.renderHkCard(t)).join("")}
            </div>
          </div>

          <!-- Column 2: In Progress -->
          <div class="hk-column">
            <div class="hk-col-header col-blue">
              <h4>In Progress (${tasks.filter(t => t.status === 'In Progress').length})</h4>
            </div>
            <div class="hk-cards-list">
              ${tasks.filter(t => t.status === 'In Progress').map(t => this.renderHkCard(t)).join("")}
            </div>
          </div>

          <!-- Column 3: Clean & Inspected -->
          <div class="hk-column">
            <div class="hk-col-header col-green">
              <h4>Clean & Inspected (${tasks.filter(t => t.status === 'Clean' || t.status === 'Inspected').length})</h4>
            </div>
            <div class="hk-cards-list">
              ${tasks.filter(t => t.status === 'Clean' || t.status === 'Inspected').map(t => this.renderHkCard(t)).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderHkCard(t) {
    return `
      <div class="hk-task-card">
        <div class="hk-card-top">
          <strong class="hk-room-num">Suite #${t.roomNumber}</strong>
          <span class="hk-priority-badge priority-${t.priority.toLowerCase()}">${t.priority} Priority</span>
        </div>
        <p class="hk-card-note">${t.note}</p>
        <div class="hk-card-cleaner">
          <span>🧹 Cleaner: <strong>${t.cleaner}</strong></span>
        </div>
        <div class="hk-card-actions">
          ${t.status === 'Needs Cleaning' ? `
            <button class="btn-xs btn-blue" onclick="window.adminManager.updateTaskStatus('${t.id}', 'In Progress')">Start Cleaning</button>
          ` : ''}
          ${t.status === 'In Progress' ? `
            <button class="btn-xs btn-green" onclick="window.adminManager.updateTaskStatus('${t.id}', 'Clean')">Mark Clean</button>
          ` : ''}
          ${t.status === 'Clean' ? `
            <button class="btn-xs btn-gold" onclick="window.adminManager.updateTaskStatus('${t.id}', 'Inspected')">Supervisor Inspect ✓</button>
          ` : ''}
        </div>
      </div>
    `;
  }

  updateTaskStatus(taskId, newStatus) {
    window.hotelState.updateHousekeepingTask(taskId, { status: newStatus });
    window.showToast(`Task updated to "${newStatus}"!`, "success");
  }

  /* -------------------------------------------------------------
   * 5. Customer Directory & User Account Access Control
   * ------------------------------------------------------------- */
  renderCustomers(container) {
    const res = window.hotelState.getReservations();
    const registeredUsers = window.hotelState.getUserAccounts();
    
    // Group all accounts by email
    const customerMap = new Map();

    // First populate from registered user accounts
    registeredUsers.forEach(u => {
      const email = u.email.toLowerCase();
      customerMap.set(email, {
        name: u.fullName || u.name,
        email: u.email,
        phone: u.phone,
        country: u.country,
        status: u.status || "active",
        totalStays: u.totalStays || 0,
        totalSpend: u.totalSpend || 0,
        specialRequests: []
      });
    });

    // Merge in any reservation data
    res.forEach(r => {
      const email = r.email.toLowerCase();
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          name: r.guestName,
          email: r.email,
          phone: r.phone,
          country: r.country,
          status: window.hotelState.isUserDeactivated(email) ? "deactivated" : "active",
          totalStays: 0,
          totalSpend: 0,
          lastCheckIn: r.checkIn,
          specialRequests: []
        });
      }
      const c = customerMap.get(email);
      c.totalStays += 1;
      c.totalSpend += (r.totalAmount || 0);
      if (r.specialRequests) c.specialRequests.push(r.specialRequests);
    });

    const customers = Array.from(customerMap.values());

    container.innerHTML = `
      <div class="admin-section-content animate-fade-in">
        <div class="admin-topbar-row">
          <div>
            <h2 class="admin-section-title">Guest Accounts & CRM Directory</h2>
            <p class="admin-section-subtitle">Manage guest profiles, review stay history, and control user account access (Activate / Deactivate).</p>
          </div>
          <div class="admin-actions-bar">
            <button class="btn btn-gold btn-sm" onclick="window.adminManager.openCreateUserModal()">
              <span>+ Add User Account</span>
            </button>
            <span class="badge-total-guests">${customers.length} Registered Accounts</span>
          </div>
        </div>

        <div class="card admin-box">
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Guest Name</th>
                  <th>Contact Info</th>
                  <th>Country</th>
                  <th>Account Status</th>
                  <th>Total Stays</th>
                  <th>Lifetime Spend</th>
                  <th>VIP Tier</th>
                  <th>Admin Access Control</th>
                </tr>
              </thead>
              <tbody>
                ${customers.length === 0 ? `
                  <tr>
                    <td colspan="8" class="text-center text-muted" style="padding: 40px;">
                      No user accounts registered yet. Database is clean and ready for live bookings.
                    </td>
                  </tr>
                ` : customers.map(c => {
                  const isDeactivated = c.status === "deactivated";
                  return `
                    <tr style="${isDeactivated ? 'background: rgba(231,76,60,0.06);' : ''}">
                      <td><strong>${c.name}</strong></td>
                      <td>
                        <div>${c.email}</div>
                        <small class="text-muted">${c.phone}</small>
                      </td>
                      <td>${c.country || 'USA'}</td>
                      <td>
                        <span class="status-pill" style="display:inline-block; padding: 4px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 700; background: ${isDeactivated ? 'rgba(231,76,60,0.2)' : 'rgba(46,204,113,0.2)'}; color: ${isDeactivated ? '#ff6b6b' : '#2ecc71'}; border: 1px solid ${isDeactivated ? '#e74c3c' : '#2ecc71'};">
                          ${isDeactivated ? '🔴 Deactivated' : '🟢 Active'}
                        </span>
                      </td>
                      <td><span class="badge-count">${c.totalStays} stay${c.totalStays !== 1 ? 's' : ''}</span></td>
                      <td><strong class="text-gold">${window.hotelState.formatPrice(c.totalSpend)}</strong></td>
                      <td>
                        <span class="vip-pill ${c.totalSpend > 3000 ? 'tier-diamond' : 'tier-gold'}">
                          ${c.totalSpend > 3000 ? '👑 Diamond VIP' : '⭐ Gold Club'}
                        </span>
                      </td>
                      <td>
                        <div style="display: flex; gap: 8px; align-items: center;">
                          ${isDeactivated ? `
                            <button class="btn btn-sm" style="background: rgba(46,204,113,0.2); border: 1px solid #2ecc71; color: #2ecc71; font-weight: 600; padding: 4px 10px;" onclick="window.adminManager.toggleAccountStatus('${c.email}', 'activate')">
                              ✓ Activate
                            </button>
                          ` : `
                            <button class="btn btn-sm" style="background: rgba(231,76,60,0.2); border: 1px solid #e74c3c; color: #ff6b6b; font-weight: 600; padding: 4px 10px;" onclick="window.adminManager.toggleAccountStatus('${c.email}', 'deactivate')">
                              ✕ Deactivate
                            </button>
                          `}
                          <button class="btn-action" onclick="alert('Guest: ${c.name}\\nEmail: ${c.email}\\nPhone: ${c.phone}\\nStatus: ${c.status.toUpperCase()}\\nSpecial Requests: ${c.specialRequests.join(', ') || 'None'}')">Notes</button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  /* -------------------------------------------------------------
   * 6. Billing & Invoices
   * ------------------------------------------------------------- */
  renderBilling(container) {
    const res = window.hotelState.getReservations();

    container.innerHTML = `
      <div class="admin-section-content animate-fade-in">
        <div class="admin-topbar-row">
          <div>
            <h2 class="admin-section-title">Billing & Guest Folio Records</h2>
            <p class="admin-section-subtitle">Generate official luxury hotel invoices, check deposits, and print receipts.</p>
          </div>
        </div>

        <div class="card admin-box">
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Invoice Ref</th>
                  <th>Guest Name</th>
                  <th>Stay Period</th>
                  <th>Subtotal</th>
                  <th>Discounts</th>
                  <th>Taxes & Fees</th>
                  <th>Total Due</th>
                  <th>Balance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${res.map(r => `
                  <tr>
                    <td><strong>INV-${r.id}</strong></td>
                    <td>${r.guestName}</td>
                    <td>${r.checkIn} → ${r.checkOut}</td>
                    <td>${window.hotelState.formatPrice(r.totalAmount / 1.12)}</td>
                    <td><span class="text-green">${r.discountAmount ? '-' + window.hotelState.formatPrice(r.discountAmount) : '$0'}</span></td>
                    <td>${window.hotelState.formatPrice(r.totalAmount * 0.12)}</td>
                    <td><strong>${window.hotelState.formatPrice(r.totalAmount)}</strong></td>
                    <td><span class="pill-confirmed">Paid ($0.00)</span></td>
                    <td>
                      <button class="btn-action btn-gold" onclick="window.adminManager.openInvoiceModal('${r.id}')">
                        View Official Invoice
                      </button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  /* -------------------------------------------------------------
   * 7. Promotions & Codes
   * ------------------------------------------------------------- */
  renderPromotions(container) {
    const promos = window.hotelState.data.promotions;

    container.innerHTML = `
      <div class="admin-section-content animate-fade-in">
        <div class="admin-topbar-row">
          <div>
            <h2 class="admin-section-title">Promotions & Promotional Discount Codes</h2>
            <p class="admin-section-subtitle">Configure seasonal discount vouchers and incentives for direct web bookings.</p>
          </div>
          <button class="btn btn-gold btn-sm" onclick="window.adminManager.openAddPromoModal()">
            <span>+ Create New Promo Code</span>
          </button>
        </div>

        <div class="card admin-box">
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Promo Code</th>
                  <th>Discount</th>
                  <th>Description</th>
                  <th>Min Nights</th>
                  <th>Valid Until</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${promos.map(p => `
                  <tr>
                    <td><code class="promo-code-pill">${p.code}</code></td>
                    <td><strong class="text-gold">${p.discountPercent}% OFF</strong></td>
                    <td>${p.description}</td>
                    <td>${p.minNights || 1} nights</td>
                    <td>${p.expiry}</td>
                    <td><span class="conf-status-pill ${p.active ? 'pill-confirmed' : 'pill-cancelled'}">${p.active ? 'Active' : 'Disabled'}</span></td>
                    <td>
                      <button class="btn-action" onclick="window.adminManager.togglePromo('${p.code}')">
                        ${p.active ? 'Disable' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  togglePromo(code) {
    const promo = window.hotelState.data.promotions.find(p => p.code === code);
    if (promo) {
      promo.active = !promo.active;
      window.hotelState.persist();
      window.hotelState.notify("promotions:change", promo);
      window.showToast(`Promo ${code} is now ${promo.active ? 'Active' : 'Disabled'}.`, "info");
    }
  }

  /* -------------------------------------------------------------
   * 8. Staff & Roles
   * ------------------------------------------------------------- */
  renderStaff(container) {
    const staffList = window.hotelState.data.staff;
    const currentRole = window.hotelState.activeStaffRole;

    container.innerHTML = `
      <div class="admin-section-content animate-fade-in">
        <div class="admin-topbar-row">
          <div>
            <h2 class="admin-section-title">Staff Administration & Permissions</h2>
            <p class="admin-section-subtitle">Manage hotel staff access tiers and test role-based permission visibility.</p>
          </div>
          <div class="role-switcher-box">
            <label>Current Active Role View:</label>
            <select class="form-select" onchange="window.adminManager.switchStaffRole(this.value)">
              ${["Super Administrator", "Hotel General Manager", "Head Concierge / Receptionist", "Housekeeping Supervisor"].map(role => `
                <option value="${role}" ${role === currentRole ? 'selected' : ''}>${role}</option>
              `).join("")}
            </select>
          </div>
        </div>

        <div class="card admin-box">
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Permission Scope</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${staffList.map(s => `
                  <tr>
                    <td><strong>${s.name}</strong></td>
                    <td><span class="role-badge">${s.role}</span></td>
                    <td>${s.email}</td>
                    <td>${s.permissions}</td>
                    <td><span class="conf-status-pill pill-confirmed">${s.status}</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  switchStaffRole(role) {
    window.hotelState.activeStaffRole = role;
    window.showToast(`Active staff perspective switched to: ${role}`, "info");
    this.renderStaff(document.getElementById("admin-main-stage"));
  }

  /* -------------------------------------------------------------
   * 9. Website Content
   * ------------------------------------------------------------- */
  renderContent(container) {
    const h = window.hotelState.data.hotelInfo;

    container.innerHTML = `
      <div class="admin-section-content animate-fade-in">
        <div class="admin-topbar-row">
          <div>
            <h2 class="admin-section-title">Hotel Content & Information Management</h2>
            <p class="admin-section-subtitle">Update contact details, official policies, and customer notices without modifying code.</p>
          </div>
        </div>

        <div class="card admin-box">
          <form id="content-mgmt-form" onsubmit="window.adminManager.saveContent(event)">
            <div class="form-grid two-cols">
              <div class="form-group">
                <label class="form-label">Hotel Brand Name</label>
                <input type="text" id="cfg-hotel-name" class="form-input" value="${h.name}">
              </div>
              <div class="form-group">
                <label class="form-label">Brand Tagline</label>
                <input type="text" id="cfg-hotel-tagline" class="form-input" value="${h.tagline}">
              </div>
              <div class="form-group">
                <label class="form-label">Official Phone Numbers</label>
                <input type="text" id="cfg-hotel-phone" class="form-input" value="${h.phone}">
              </div>
              <div class="form-group">
                <label class="form-label">Official Email</label>
                <input type="email" id="cfg-hotel-email" class="form-input" value="${h.email}">
              </div>
              <div class="form-group">
                <label class="form-label">WhatsApp Contact Number (International Format)</label>
                <input type="text" id="cfg-hotel-whatsapp" class="form-input" value="${h.whatsapp}">
              </div>
              <div class="form-group">
                <label class="form-label">Physical Address</label>
                <input type="text" id="cfg-hotel-address" class="form-input" value="${h.address}">
              </div>
            </div>

            <div class="mt-4">
              <button type="submit" class="btn btn-gold">Save Changes & Update Live Site</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  saveContent(e) {
    e.preventDefault();
    const h = window.hotelState.data.hotelInfo;
    h.name = document.getElementById("cfg-hotel-name").value;
    h.tagline = document.getElementById("cfg-hotel-tagline").value;
    h.phone = document.getElementById("cfg-hotel-phone").value;
    h.email = document.getElementById("cfg-hotel-email").value;
    h.whatsapp = document.getElementById("cfg-hotel-whatsapp").value;
    h.address = document.getElementById("cfg-hotel-address").value;

    window.hotelState.persist();
    window.hotelState.notify("hotelInfo:change", h);
    window.showToast("Hotel content successfully updated across website!", "success");
  }

  /* -------------------------------------------------------------
   * Modals & Dialogs (Walk-in, Add Room, Invoice, Quick Room)
   * ------------------------------------------------------------- */
  openWalkInModal() {
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const roomTypes = window.hotelState.getRoomTypes();

    const html = `
      <div class="modal-dialog animate-scale-up">
        <div class="modal-header">
          <h3>Record Front-Desk Walk-In Booking</h3>
          <button class="modal-close" onclick="window.closeGenericModal()">×</button>
        </div>
        <div class="modal-body">
          <form id="walkin-form" onsubmit="window.adminManager.submitWalkIn(event)">
            <div class="form-grid two-cols">
              <div class="form-group">
                <label class="form-label">Guest Full Name *</label>
                <input type="text" id="wi-name" class="form-input" required placeholder="Guest Name">
              </div>
              <div class="form-group">
                <label class="form-label">Contact Email *</label>
                <input type="email" id="wi-email" class="form-input" required placeholder="guest@mail.com">
              </div>
              <div class="form-group">
                <label class="form-label">Phone *</label>
                <input type="tel" id="wi-phone" class="form-input" required placeholder="+1 234 567 8900">
              </div>
              <div class="form-group">
                <label class="form-label">Suite Category *</label>
                <select id="wi-room-type" class="form-select" required>
                  ${roomTypes.map(rt => `<option value="${rt.id}">${rt.name} (${window.hotelState.formatPrice(rt.basePrice)}/n)</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Check-In</label>
                <input type="date" id="wi-checkin" class="form-input" value="${today}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Check-Out</label>
                <input type="date" id="wi-checkout" class="form-input" value="${tomorrow}" required>
              </div>
            </div>
            <div class="form-group mt-3">
              <label class="form-label">Special Notes</label>
              <input type="text" id="wi-notes" class="form-input" placeholder="Front desk walk-in reservation">
            </div>
            <div class="modal-footer-actions mt-4">
              <button type="button" class="btn btn-secondary" onclick="window.closeGenericModal()">Cancel</button>
              <button type="submit" class="btn btn-gold">Confirm & Check In Now</button>
            </div>
          </form>
        </div>
      </div>
    `;
    window.openGenericModal(html);
  }

  submitWalkIn(e) {
    e.preventDefault();
    const name = document.getElementById("wi-name").value;
    const email = document.getElementById("wi-email").value;
    const phone = document.getElementById("wi-phone").value;
    const roomTypeId = document.getElementById("wi-room-type").value;
    const checkIn = document.getElementById("wi-checkin").value;
    const checkOut = document.getElementById("wi-checkout").value;
    const notes = document.getElementById("wi-notes").value;

    const rt = window.hotelState.getRoomTypeById(roomTypeId);
    const nights = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 3600 * 24)));
    const total = Math.round(rt.basePrice * nights * 1.12);

    const res = window.hotelState.createReservation({
      guestName: name,
      email: email,
      phone: phone,
      roomTypeId: roomTypeId,
      checkIn: checkIn,
      checkOut: checkOut,
      nights: nights,
      adults: 1,
      roomsCount: 1,
      totalAmount: total,
      specialRequests: "Walk-in Guest. " + notes
    });

    // Directly check in
    window.hotelState.updateReservation(res.id, { status: "Checked In" });

    window.closeGenericModal();
    window.showToast(`Walk-in guest ${name} checked in! Reference: ${res.id}`, "success");
    this.renderActiveSection();
  }

  openAddRoomModal() {
    const roomTypes = window.hotelState.getRoomTypes();
    const html = `
      <div class="modal-dialog animate-scale-up">
        <div class="modal-header">
          <h3>Add Physical Suite</h3>
          <button class="modal-close" onclick="window.closeGenericModal()">×</button>
        </div>
        <div class="modal-body">
          <form id="add-room-form" onsubmit="window.adminManager.submitAddRoom(event)">
            <div class="form-grid two-cols">
              <div class="form-group">
                <label class="form-label">Room Number *</label>
                <input type="text" id="ar-num" class="form-input" placeholder="e.g. 501" required>
              </div>
              <div class="form-group">
                <label class="form-label">Floor *</label>
                <input type="number" id="ar-floor" class="form-input" value="5" min="1" max="10" required>
              </div>
              <div class="form-group">
                <label class="form-label">Suite Category *</label>
                <select id="ar-type" class="form-select" required>
                  ${roomTypes.map(rt => `<option value="${rt.id}">${rt.name}</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Initial Status</label>
                <select id="ar-status" class="form-select">
                  <option value="Available" selected>Available</option>
                  <option value="Needs Cleaning">Needs Cleaning</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>
            </div>
            <div class="modal-footer-actions mt-4">
              <button type="button" class="btn btn-secondary" onclick="window.closeGenericModal()">Cancel</button>
              <button type="submit" class="btn btn-gold">Create Suite</button>
            </div>
          </form>
        </div>
      </div>
    `;
    window.openGenericModal(html);
  }

  submitAddRoom(e) {
    e.preventDefault();
    const roomNum = document.getElementById("ar-num").value.trim();
    const floor = document.getElementById("ar-floor").value;
    const typeId = document.getElementById("ar-type").value;
    const status = document.getElementById("ar-status").value;

    try {
      window.hotelState.addPhysicalRoom({
        roomNumber: roomNum,
        roomTypeId: typeId,
        floor: floor,
        status: status,
        cleaningStatus: status === "Needs Cleaning" ? "Needs Cleaning" : "Clean"
      });
      window.closeGenericModal();
      window.showToast(`Suite #${roomNum} added to hotel inventory!`, "success");
      this.renderActiveSection();
    } catch (err) {
      window.showToast(err.message, "error");
    }
  }

  openRoomQuickModal(roomNumber) {
    const room = window.hotelState.getPhysicalRooms().find(r => r.roomNumber === roomNumber);
    if (!room) return;
    const rType = window.hotelState.getRoomTypeById(room.roomTypeId);

    const activeRes = window.hotelState.getReservations().find(res => 
      res.assignedRoom === roomNumber && (res.status === "Checked In" || res.status === "Confirmed")
    );

    const html = `
      <div class="modal-dialog animate-scale-up">
        <div class="modal-header">
          <h3>Suite #${room.roomNumber} Status Card</h3>
          <button class="modal-close" onclick="window.closeGenericModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="room-quick-summary">
            <p><strong>Category:</strong> ${rType?.name}</p>
            <p><strong>Floor:</strong> Level ${room.floor}</p>
            <p><strong>Current Status:</strong> <span class="badge-${room.status.toLowerCase().replace(/\s+/g, '-')}">${room.status}</span></p>
            <p><strong>Cleanliness:</strong> <span class="badge-${room.cleaningStatus.toLowerCase().replace(/\s+/g, '-')}">${room.cleaningStatus}</span></p>
            ${activeRes ? `
              <div class="active-guest-box mt-3 p-3 bg-dark rounded">
                <strong>Current In-House Guest:</strong> ${activeRes.guestName}<br>
                <span>Stay: ${activeRes.checkIn} to ${activeRes.checkOut} (${activeRes.id})</span>
              </div>
            ` : '<p class="text-muted">No in-house guest assigned.</p>'}
          </div>

          <div class="form-group mt-3">
            <label class="form-label">Update Room Status</label>
            <select id="quick-status-sel" class="form-select">
              <option value="Available" ${room.status === 'Available' ? 'selected' : ''}>Available</option>
              <option value="Occupied" ${room.status === 'Occupied' ? 'selected' : ''}>Occupied</option>
              <option value="Needs Cleaning" ${room.status === 'Needs Cleaning' ? 'selected' : ''}>Needs Cleaning</option>
              <option value="Under Maintenance" ${room.status === 'Under Maintenance' ? 'selected' : ''}>Under Maintenance</option>
            </select>
          </div>

          <div class="modal-footer-actions mt-4">
            <button type="button" class="btn btn-secondary" onclick="window.closeGenericModal()">Close</button>
            <button type="button" class="btn btn-gold" onclick="window.adminManager.saveRoomQuickStatus('${room.roomNumber}')">Save Room Changes</button>
          </div>
        </div>
      </div>
    `;
    window.openGenericModal(html);
  }

  saveRoomQuickStatus(roomNumber) {
    const val = document.getElementById("quick-status-sel").value;
    window.hotelState.updatePhysicalRoom(roomNumber, {
      status: val,
      cleaningStatus: val === "Needs Cleaning" ? "Needs Cleaning" : "Clean"
    });
    window.closeGenericModal();
    window.showToast(`Suite #${roomNumber} updated!`, "success");
    this.renderActiveSection();
  }

  openInvoiceModal(resId) {
    const res = window.hotelState.getReservationById(resId);
    if (!res) return;
    const room = window.hotelState.getRoomTypeById(res.roomTypeId);
    const subtotal = res.totalAmount / 1.12;
    const tax = res.totalAmount - subtotal;

    const html = `
      <div class="modal-dialog modal-lg animate-scale-up" id="invoice-modal-content">
        <div class="modal-header no-print">
          <h3>Guest Official Tax Invoice</h3>
          <div class="modal-header-actions">
            <button class="btn btn-sm btn-gold" onclick="window.printModalInvoice()">🖨️ Print Invoice</button>
            <button class="modal-close" onclick="window.closeGenericModal()">×</button>
          </div>
        </div>
        <div class="modal-body invoice-printable">
          <div class="invoice-header">
            <div class="invoice-hotel-info">
              <h2 class="invoice-hotel-name">DOUBLETREE BY HILTON</h2>
              <span class="invoice-hotel-sub">HOTEL LOS ANGELES DOWNTOWN</span>
              <p>120 S Los Angeles St, Downtown Los Angeles<br>Los Angeles, CA 90012, United States<br>EIN Tax ID: US-95-4829100</p>
            </div>
            <div class="invoice-meta-block">
              <h1>INVOICE</h1>
              <p><strong>Invoice #:</strong> INV-${res.id}</p>
              <p><strong>Date Issued:</strong> ${new Date(res.createdAt).toLocaleDateString()}</p>
              <p><strong>Booking Ref:</strong> ${res.id}</p>
              <p><strong>Room:</strong> Room #${res.assignedRoom || 'Assigned at Check-in'}</p>
            </div>
          </div>

          <div class="invoice-billed-to">
            <h4>Billed To:</h4>
            <strong>${res.guestName}</strong><br>
            <span>Email: ${res.email}</span><br>
            <span>Phone: ${res.phone}</span><br>
            <span>Country: ${res.country}</span>
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Dates</th>
                <th>Rate / Night</th>
                <th>Qty</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${room?.name} - Contemporary Accommodation</td>
                <td>${res.checkIn} to ${res.checkOut}</td>
                <td>${window.hotelState.formatPrice(room?.basePrice || 250)}</td>
                <td>${res.nights} Nights</td>
                <td class="text-right">${window.hotelState.formatPrice(room?.basePrice * res.nights)}</td>
              </tr>
              ${res.discountAmount > 0 ? `
                <tr class="invoice-discount-line">
                  <td colspan="4">Special Promotional Discount (${res.promoCode || 'Promotion'})</td>
                  <td class="text-right">-${window.hotelState.formatPrice(res.discountAmount)}</td>
                </tr>
              ` : ''}
              <tr>
                <td colspan="4">California State & Los Angeles City Occupancy Tax (14%)</td>
                <td class="text-right">${window.hotelState.formatPrice(tax)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" class="text-right"><strong>Grand Total:</strong></td>
                <td class="text-right"><strong>${window.hotelState.formatPrice(res.totalAmount)}</strong></td>
              </tr>
              <tr>
                <td colspan="4" class="text-right">Deposit Paid:</td>
                <td class="text-right">${window.hotelState.formatPrice(res.depositPaid || res.totalAmount)}</td>
              </tr>
              <tr class="balance-due-row">
                <td colspan="4" class="text-right"><strong>Balance Due:</strong></td>
                <td class="text-right"><strong>${window.hotelState.formatPrice(res.balance || 0)}</strong></td>
              </tr>
            </tfoot>
          </table>

          <div class="invoice-footer-notes">
            <p>Thank you for choosing DoubleTree by Hilton Hotel Los Angeles Downtown. It was our distinct pleasure to serve you.</p>
            <p><small>For any billing or payment inquiries, please contact our General Manager directly at doubletreehotel49@gmail.com</small></p>
          </div>
        </div>
      </div>
    `;
    window.openGenericModal(html);
  }

  /* -------------------------------------------------------------
   * Clear All Database
   * ------------------------------------------------------------- */
  confirmClearDatabase() {
    const ok = window.confirm(
      "⚠️ DATABASE RESET CONFIRMATION:\n\n" +
      "Are you sure you want to completely clear the database?\n" +
      "- All live reservations will be deleted.\n" +
      "- All 15 physical rooms will be reset to 'Available' and 'Clean'.\n" +
      "- All housekeeping tasks will be cleared.\n\n" +
      "Click OK to proceed with database clearance."
    );

    if (ok) {
      window.hotelState.clearAllDatabase();
      window.showToast("Database has been completely cleared and reset to fresh state!", "success");
      this.renderActiveSection();
    }
  }

  /* -------------------------------------------------------------
   * User Account Activation & Deactivation Controls
   * ------------------------------------------------------------- */
  toggleAccountStatus(email, action) {
    const acc = window.hotelState.setUserStatus(email, action === "deactivate" ? "deactivated" : "active");
    if (acc) {
      const msg = action === "deactivate" 
        ? `Account for ${email} has been DEACTIVATED. User cannot make bookings or log in.`
        : `Account for ${email} has been ACTIVATED and restored.`;
      window.showToast(msg, action === "deactivate" ? "warning" : "success");
      this.renderCustomers(document.getElementById("admin-main-stage"));
    }
  }

  openCreateUserModal() {
    const html = `
      <div class="modal-dialog animate-scale-up" style="max-width: 480px;">
        <div class="modal-header">
          <h3>Register / Add User Account</h3>
          <button class="modal-close" onclick="window.closeGenericModal()">×</button>
        </div>
        <div class="modal-body">
          <form onsubmit="window.adminManager.submitCreateUser(event)">
            <div class="form-group mb-3">
              <label class="form-label">Full Name</label>
              <input type="text" id="cu-name" class="form-input" required placeholder="e.g. John Doe">
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Email Address</label>
              <input type="email" id="cu-email" class="form-input" required placeholder="user@example.com">
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Phone Number</label>
              <input type="tel" id="cu-phone" class="form-input" placeholder="+1 (213) 555-0199">
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Country</label>
              <input type="text" id="cu-country" class="form-input" value="United States">
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Account Access Status</label>
              <select id="cu-status" class="form-select">
                <option value="active" selected>🟢 Active (Allowed to book & access portal)</option>
                <option value="deactivated">🔴 Deactivated (Blocked from booking & login)</option>
              </select>
            </div>
            <div class="modal-footer-actions mt-4 text-right">
              <button type="button" class="btn btn-secondary" onclick="window.closeGenericModal()">Cancel</button>
              <button type="submit" class="btn btn-gold">Save User Account</button>
            </div>
          </form>
        </div>
      </div>
    `;
    window.openGenericModal(html);
  }

  submitCreateUser(e) {
    e.preventDefault();
    const name = document.getElementById("cu-name").value.trim();
    const email = document.getElementById("cu-email").value.trim();
    const phone = document.getElementById("cu-phone").value.trim();
    const country = document.getElementById("cu-country").value.trim();
    const status = document.getElementById("cu-status").value;

    const acc = window.hotelState.registerOrUpdateUserAccount({
      fullName: name,
      email: email,
      phone: phone,
      country: country
    });

    if (acc) {
      window.hotelState.setUserStatus(email, status);
      window.closeGenericModal();
      window.showToast(`User account for ${name} (${email}) saved as ${status.toUpperCase()}!`, "success");
      this.renderCustomers(document.getElementById("admin-main-stage"));
    }
  }

  /* -------------------------------------------------------------
   * Admin Authentication Modal & Gate
   * Required Credentials:
   * Username: doubletree
   * Password: Admin1234
   * ------------------------------------------------------------- */
  showAdminLoginModal() {
    const html = `
      <div class="modal-dialog animate-scale-up" style="max-width: 440px;">
        <div class="modal-header" style="text-align: center; border-bottom: 1px solid rgba(212,175,55,0.2); padding-bottom: 16px;">
          <div style="width: 100%;">
            <div class="brand-crest" style="margin: 0 auto 10px; width: 44px; height: 44px; font-size: 1.2rem;">DT</div>
            <h3 style="margin: 0; color: var(--gold-primary); font-size: 1.3rem;">Hotel Admin Sign-In</h3>
            <p style="margin: 4px 0 0; font-size: 0.82rem; color: var(--text-muted);">DoubleTree by Hilton Hotel Los Angeles Downtown</p>
          </div>
          <button class="modal-close" onclick="window.closeGenericModal()">×</button>
        </div>
        <div class="modal-body" style="padding: 24px;">
          <form onsubmit="window.adminManager.submitAdminLogin(event)">
            <div id="admin-login-error" style="display:none; background: rgba(231,76,60,0.15); border: 1px solid #e74c3c; color: #ff6b6b; padding: 10px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 16px; text-align: center;"></div>
            
            <div class="form-group mb-3">
              <label class="form-label" for="admin-login-u">Administrator Username</label>
              <input type="text" id="admin-login-u" class="form-input" required placeholder="Enter username (doubletree)" autofocus autocomplete="username">
            </div>

            <div class="form-group mb-3">
              <label class="form-label" for="admin-login-p">Administrator Password</label>
              <input type="password" id="admin-login-p" class="form-input" required placeholder="Enter password (Admin1234)" autocomplete="current-password">
            </div>

            <div style="background: rgba(212,175,55,0.08); border-radius: 8px; padding: 10px 14px; margin-bottom: 18px; font-size: 0.8rem; color: var(--text-secondary);">
              🔒 <strong>Authorized Staff Only:</strong> Access is restricted to hotel general management and authorized operators.
            </div>

            <button type="submit" class="btn btn-gold btn-block" style="padding: 12px; font-weight: 700;">
              Authenticate & Enter Operations Portal →
            </button>
          </form>
        </div>
      </div>
    `;
    window.openGenericModal(html);
  }

  submitAdminLogin(e) {
    e.preventDefault();
    const u = document.getElementById("admin-login-u")?.value.trim();
    const p = document.getElementById("admin-login-p")?.value.trim();
    const errBox = document.getElementById("admin-login-error");

    const result = window.hotelState.loginAdmin(u, p);
    if (result.success) {
      window.closeGenericModal();
      window.showToast("Welcome, DoubleTree General Manager!", "success");
      window.app.switchView("admin");
    } else {
      if (errBox) {
        errBox.textContent = result.message || "Invalid credentials. Please verify username and password.";
        errBox.style.display = "block";
      }
    }
  }

  logoutAdmin() {
    window.hotelState.logoutAdmin();
    window.showToast("Logged out of Admin Operations Portal.", "info");
    window.app.switchView("home");
  }
}

// Global instance
window.adminManager = new AdminManager();
