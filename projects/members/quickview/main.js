// Helper: escape HTML
function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Get member ID from session via API
async function getMemberIdFromSession() {
  const res = await fetch('session_member.php');
  const data = await res.json();
  return data.id; // match the key returned from PHP
}

// Fetch and render member data
async function loadMember(showAll = false) {
  const response = await fetch('backend.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({showAll: showAll ? 1 : 0})
  });
  const data = await response.json();

  // Member Info Section (with camera icon for avatar upload and View All checkbox)
  const member = data.member || {};
  document.getElementById('member-info-section').innerHTML = `
    <aside class="flex flex-col items-center rounded-lg shadow-md p-6 w-full md:w-64 relative">
      <div class="relative group">
        <img src="${escapeHtml(member.avatar || '../assets/images/person.png')}" class="w-48 h-48 rounded-md object-cover shadow-md" id="member-avatar">
        <button id="avatar-upload-btn" class="absolute bottom-2 right-2 bg-white bg-opacity-80 rounded-full p-2 shadow group-hover:bg-blue-600 group-hover:text-white transition" title="Change Profile Picture" style="border:none;outline:none;">
          <span class="material-icons">photo_camera</span>
        </button>
        <input type="file" id="avatar-file-input" accept="image/*" class="hidden">
      </div>
      <label class="flex items-center mt-6 cursor-pointer select-none">
        <input type="checkbox" class="form-checkbox h-5 w-5 text-indigo-600" id="viewAllCheckbox" ${showAll ? 'checked' : ''}>
        <span class="ml-2 text-gray-700 font-medium">View All</span>
      </label>
    </aside>
    <section class="flex-1 rounded-lg shadow-md p-6">
      <div class="space-y-2">
        <div class="flex"><span class="w-32 font-semibold text-gray-700">ID:</span><span>${escapeHtml(member.id || '')}</span></div>
        <div class="flex"><span class="w-32 font-semibold text-gray-700">EMR:</span><span>${escapeHtml(member.emrID || '')}</span></div>
        <div class="flex"><span class="w-32 font-semibold text-gray-700">DOB:</span><span>${escapeHtml(member.dob || '')}</span></div>
        <div class="flex"><span class="w-32 font-semibold text-gray-700">Phone:</span>
          <a href="tel:${escapeHtml(member.phone || '')}" class="text-indigo-600 hover:underline flex items-center">
            <span class="material-icons text-base mr-1">phone</span>
            ${escapeHtml(member.phone || '')}
          </a>
        </div>
        <div class="flex"><span class="w-32 font-semibold text-gray-700">Membership:</span><span>${escapeHtml(member.mbrshpStartDate || '')} - ${escapeHtml(member.mbrshpEndDate || '')}</span></div>
        <div class="flex"><span class="w-32 font-semibold text-gray-700">Name:</span><span>${escapeHtml(member.fullName || '')}</span></div>
        <div class="flex"><span class="w-32 font-semibold text-gray-700">Insurance:</span><span>${escapeHtml(member.insurance || '')}</span></div>
      </div>
    </section>
  `;

  // View All checkbox logic
  document.getElementById('viewAllCheckbox').addEventListener('change', function() {
    loadMember(this.checked);
  });

  // Camera icon upload logic
  document.getElementById('avatar-upload-btn').addEventListener('click', function() {
    document.getElementById('avatar-file-input').click();
  });
  document.getElementById('avatar-file-input').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('action', 'upload_avatar');
    try {
      const res = await fetch('backend.php', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.avatarUrl) {
        document.getElementById('member-avatar').src = data.avatarUrl;
        alert('Profile picture updated!');
      } else {
        alert(data.error || 'Failed to update profile picture.');
      }
    } catch (err) {
      alert('Failed to upload profile picture.');
    }
  });

  // Set counts for all tabs
  document.getElementById('pt-count').textContent = data.Ptappts ? data.Ptappts.length : 0;
  document.getElementById('rides-count').textContent = data.trips ? data.trips.length : 0;
  document.getElementById('lunch-count').textContent = data.lunch ? data.lunch.length : 0;
  document.getElementById('massages-count').textContent = data.accuMassages ? data.accuMassages.filter(a => a.title && a.title.toLowerCase().includes('massage')).length : 0;
  document.getElementById('acupunctures-count').textContent = data.accuMassages ? data.accuMassages.filter(a => a.title && a.title.toLowerCase().includes('acup')).length : 0;
  document.getElementById('renewal-count').textContent = data.renewal ? data.renewal.length : 0;
  document.getElementById('purchase-count').textContent = data.purchases ? data.purchases.length : 0;
  document.getElementById('earn-count').textContent = data.earn ? data.earn.length : 0;
  document.getElementById('redeem-count').textContent = data.redeem ? data.redeem.length : 0;

  // Points Table
  let pointsHtml = '';
  if (data.sumPoints && data.sumPoints.length) {
    pointsHtml += `<table class="min-w-full border border-gray-300 border-collapse text-sm">
      <thead>
        <tr>
          <th class="px-4 py-2 text-left font-semibold bg-blue-800 text-white border border-gray-300">Type</th>
          <th class="px-4 py-2 text-left font-semibold bg-blue-800 text-white border border-gray-300">Points</th>
          <th class="px-4 py-2 text-left font-semibold bg-blue-800 text-white border border-gray-300">Pending Points</th>
          <th class="px-4 py-2 text-left font-semibold bg-blue-800 text-white border border-gray-300">DP</th>
          <th class="px-4 py-2 text-left font-semibold bg-blue-800 text-white border border-gray-300">Pending DP</th>
        </tr>
      </thead>
      <tbody>`;
    let totalPoints = 0, totalPendPoints = 0, totalDP = 0, totalPendDP = 0;
    data.sumPoints.forEach((row, index) => {
      pointsHtml += `<tr class="${index % 2 === 0 ? 'bg-white' : 'bg-blue-100'} border border-gray-300">
        <td class="px-4 py-2 border border-gray-300">${escapeHtml(row.tran_type)}</td>
        <td class="px-4 py-2 border border-gray-300">${row.totPoints}</td>
        <td class="px-4 py-2 border border-gray-300">${row.totPendPoints}</td>
        <td class="px-4 py-2 border border-gray-300">${row.totdaypass}</td>
        <td class="px-4 py-2 border border-gray-300">${row.totPenddaypass}</td>
      </tr>`;
      totalPoints += parseInt(row.totPoints);
      totalPendPoints += parseInt(row.totPendPoints);
      totalDP += parseInt(row.totdaypass);
      totalPendDP += parseInt(row.totPenddaypass);
    });
    pointsHtml += `</tbody>
      <tfoot>
        <tr class="bg-blue-800 text-white font-semibold">
          <td class="px-4 py-2 border border-gray-300">Total</td>
          <td class="px-4 py-2 border border-gray-300">${totalPoints}</td>
          <td class="px-4 py-2 border border-gray-300">${totalPendPoints}</td>
          <td class="px-4 py-2 border border-gray-300">${totalDP}</td>
          <td class="px-4 py-2 border border-gray-300">${totalPendDP}</td>
        </tr>
      </tfoot>
    </table>`;
  } else {
    pointsHtml = '<div>No points data.</div>';
  }
  document.getElementById('points-table').innerHTML = pointsHtml;

  // Transaction Tables (Renewal, Purchase, Earn, Redeem)
  renderTransactionTable('renewal-table', data.renewal, 'Renewal');
  renderTransactionTable('purchase-table', data.purchases, 'Purchase Points');
  renderTransactionTable('earn-table', data.earn, 'Earn Points');
  renderTransactionTable('redeem-table', data.redeem, 'Redeem Points');

  // PT Table
  let ptHtml = '';
  if (data.Ptappts && data.Ptappts.length) {
    ptHtml += `<table class="min-w-full border border-gray-300 border-collapse text-sm">
      <thead>
        <tr>
          <th class="px-4 py-2 text-left font-semibold bg-blue-800 text-white border border-gray-300">Appt Date</th>
          <th class="px-4 py-2 text-left font-semibold bg-blue-800 text-white border border-gray-300">Appt Time</th>
          <th class="px-4 py-2 text-left font-semibold bg-blue-800 text-white border border-gray-300">Duration</th>
          <th class="px-4 py-2 text-left font-semibold bg-blue-800 text-white border border-gray-300">PT Staff</th>
        </tr>
      </thead>
      <tbody>`;
    data.Ptappts.forEach((appt, index) => {
      const dateObj = new Date(appt.start);
      ptHtml += `<tr class="${index % 2 === 0 ? 'bg-white' : 'bg-blue-100'} border border-gray-300">
        <td class="px-4 py-2 border border-gray-300">${dateObj.toLocaleDateString()}${appt.wheelChair ? ' <span class="material-icons text-teal-500 text-base">accessibility_new</span>' : ''}</td>
        <td class="px-4 py-2 border border-gray-300">${dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
        <td class="px-4 py-2 border border-gray-300">${appt.apptDuration} min</td>
        <td class="px-4 py-2 border border-gray-300">${escapeHtml(appt.PTStaff)}</td>
      </tr>`;
    });
    ptHtml += '</tbody></table>';
  } else {
    ptHtml = '<div>No PT appointments.</div>';
  }
  document.getElementById('pt-table').innerHTML = ptHtml;

  // Rides Table (NO STATUS COLUMN)
  let ridesHtml = '';
  if (data.trips && data.trips.length) {
    ridesHtml += `<table class="min-w-full border border-gray-300 border-collapse text-sm">
      <thead>
        <tr>
          <th class="px-4 py-2 text-left font-semibold bg-blue-800 text-white border border-gray-300">Pickup Date</th>
          <th class="px-4 py-2 text-left font-semibold bg-blue-800 text-white border border-gray-300">Pickup Time</th>
        </tr>
      </thead>
      <tbody>`;
    data.trips.forEach((trip, index) => {
      const dateObj = new Date(trip.pickupDate);
      ridesHtml += `<tr class="${index % 2 === 0 ? 'bg-white' : 'bg-blue-100'} border border-gray-300">
        <td class="px-4 py-2 border border-gray-300">${dateObj.toLocaleDateString()}${trip.wheelChair ? ' <span class="material-icons text-purple-500 text-base">accessible</span>' : ''}</td>
        <td class="px-4 py-2 border border-gray-300">${dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
      </tr>`;
    });
    ridesHtml += '</tbody></table>';
  } else {
    ridesHtml = '<div>No rides found.</div>';
  }
  document.getElementById('rides-table').innerHTML = ridesHtml;

  // Lunch Table
  let lunchHtml = '';
  if (data.lunch && data.lunch.length) {
    data.lunch.forEach(lunch => {
      lunchHtml += `<button class="bg-indigo-100 text-indigo-700 px-4 py-2 rounded mb-2">${escapeHtml(lunch.start)}</button>`;
    });
  } else {
    lunchHtml = '<div>No lunch reservations.</div>';
  }
  document.getElementById('lunch-table').innerHTML = lunchHtml;

  // Massages Table
  let massagesHtml = '';
  if (data.accuMassages && data.accuMassages.length) {
    data.accuMassages.filter(a => a.title && a.title.toLowerCase().includes('massage')).forEach(massage => {
      massagesHtml += `<button class="bg-pink-100 text-pink-700 px-4 py-2 rounded mb-2 mr-2">${escapeHtml(massage.start)}</button>`;
    });
  } else {
    massagesHtml = '<div>No massages found.</div>';
  }
  document.getElementById('massages-table').innerHTML = massagesHtml;

  // Acupunctures Table
  let acupuncturesHtml = '';
  if (data.accuMassages && data.accuMassages.length) {
    data.accuMassages.filter(a => a.title && a.title.toLowerCase().includes('acup')).forEach(acup => {
      acupuncturesHtml += `<button class="bg-blue-100 text-blue-700 px-4 py-2 rounded mb-2">${escapeHtml(acup.start)}</button>`;
    });
  } else {
    acupuncturesHtml = '<div>No acupunctures found.</div>';
  }
  document.getElementById('acupunctures-table').innerHTML = acupuncturesHtml;

  // Notes
  if (document.getElementById('notes-content')) {
    document.getElementById('notes-content').innerHTML = member.notes
      ? `<p>${escapeHtml(member.notes)}</p>`
      : `<p>No notes available.</p>`;
  }
}

// Helper to render transaction tables
function renderTransactionTable(containerId, dataArr, label) {
  let html = '';
  if (dataArr && dataArr.length) {
    html += `<table class="min-w-full border border-gray-300 border-collapse text-sm">
      <thead>
        <tr>
          <th class="px-4 py-2 text-left font-semibold bg-blue-800 text-white border border-gray-300">Date</th>
          <th class="px-4 py-2 text-left font-semibold bg-blue-800 text-white border border-gray-300">Description</th>
          <th class="px-4 py-2 text-left font-semibold bg-blue-800 text-white border border-gray-300">Points</th>
          <th class="px-4 py-2 text-left font-semibold bg-blue-800 text-white border border-gray-300">Method</th>
        </tr>
      </thead>
      <tbody>`;
    dataArr.forEach((row, idx) => {
      html += `<tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-blue-100'} border border-gray-300">
        <td class="px-4 py-2 border border-gray-300">${escapeHtml(row.transactiondate || '')}</td>
        <td class="px-4 py-2 border border-gray-300">${escapeHtml(row.description || '')}</td>
        <td class="px-4 py-2 border border-gray-300">${row.points}</td>
        <td class="px-4 py-2 border border-gray-300">${escapeHtml(row.method || '')}</td>
      </tr>`;
    });
    html += '</tbody></table>';
  } else {
    html = `<div>No ${label} transactions.</div>`;
  }
  document.getElementById(containerId).innerHTML = html;
}

// Tab switching logic
function showTab(tab) {
  document.querySelectorAll('.tab').forEach((btn) => {
    const btnTab = btn.textContent.replace(/\s*\(.*/, '').toLowerCase().replace(/\s/g, '');
    btn.classList.toggle('border-indigo-700', btnTab === tab);
    btn.classList.toggle('text-indigo-700', btnTab === tab);
    btn.classList.toggle('bg-indigo-100', btnTab === tab);
  });
  document.querySelectorAll('.tab-content').forEach(div => {
    div.classList.toggle('hidden', div.id !== 'tab-' + tab);
  });
}

// Show more tabs logic
function showMoreTabs() {
  document.getElementById('tab-btn-renewal').classList.remove('hidden');
  document.getElementById('tab-btn-purchase').classList.remove('hidden');
  document.getElementById('tab-btn-earn').classList.remove('hidden');
  document.getElementById('tab-btn-redeem').classList.remove('hidden');
  document.getElementById('view-more-btn').classList.add('hidden');
}

// Set default tab
showTab('points');

// Load member data on page load using memberId from session
document.addEventListener('DOMContentLoaded', async function() {
  const memberId = await getMemberIdFromSession();
  if (memberId) {
    loadMember();
  }  else {
    document.getElementById('member-info-section').innerHTML = '<div style="color:red">No memberId found in session.</div>';
  }
});