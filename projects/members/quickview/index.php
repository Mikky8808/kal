<?php
session_start();

if (!isset($_SESSION['id'])) {
    // Not logged in, redirect to login
    header('Location: ../auth/');
    exit;
}

// Use $_SESSION['member_id'] as needed
$memberId = $_SESSION['id'];

?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
 <title>
   Kalani 1.0
  </title>
   <meta content="width=device-width, initial-scale=1" name="viewport"/>
  <link rel="icon" href="../assets/images/Logo-leftSM.png">

  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-indigo-50 to-gray-100 min-h-screen font-sans text-gray-700">
  <main class="max-w-7xl mx-auto min-h-screen bg-white shadow-xl rounded-lg p-6 md:p-10 transition-shadow">
    
    <!-- Toolbar -->
   
   <nav class="flex justify-end gap-4 mb-8" aria-label="Toolbar">
  <!-- Logout Button -->
  <a href="../logout" title="Logout" class="w-11 h-11 rounded-md bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-700 transition">
    <span class="material-icons">logout</span>
  </a>
  <div class="flex flex-col gap-2 w-full md:w-auto">
      <button id="change-password-btn" class="inline-flex items-center justify-center px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition">
  <span class="material-icons mr-2">lock</span>
  Change Password
</button>
      </div>
</nav>

    <!-- Member Info Section -->
    <section id="member-info-section" class="flex flex-col md:flex-row gap-8 mb-12" aria-label="Member Info">
      <!-- Dynamic content inserted by JS -->
      <!-- Example structure for JS:
      <aside class="flex flex-col items-center rounded-lg shadow-md p-6 w-full md:w-64 relative">
        <div class="relative group">
          <img src="..." class="w-48 h-48 rounded-md object-cover shadow-md" id="member-avatar">
          <button id="avatar-upload-btn" class="absolute bottom-2 right-2 bg-white bg-opacity-80 rounded-full p-2 shadow group-hover:bg-blue-600 group-hover:text-white transition" title="Change Profile Picture" style="border:none;outline:none;">
            <span class="material-icons">photo_camera</span>
          </button>
          <input type="file" id="avatar-file-input" accept="image/*" class="hidden">
        </div>
        <label class="flex items-center mt-6 cursor-pointer select-none">
          <input type="checkbox" class="form-checkbox h-5 w-5 text-indigo-600" id="showAllBox">
          <span class="ml-2 text-gray-700 font-medium">Show All?</span>
        </label>
      </aside>
      -->
    </section>
  
    <!-- Tabs Navigation -->
    <section aria-label="Tabs">
      <header>
        <nav class="flex flex-wrap gap-2 border-b border-gray-300" aria-label="Tab Navigation">
          <button class="tab px-5 py-3 text-indigo-700 font-semibold border-b-4 border-indigo-700 bg-indigo-100 rounded-t-md transition" onclick="showTab('points')">POINTS</button>
          <button class="tab px-5 py-3 text-gray-600 font-semibold hover:text-indigo-700 transition rounded-t-md hidden" id="tab-btn-renewal" onclick="showTab('renewal')">
            RENEWAL (<span id="renewal-count">0</span>)
          </button>
          <button class="tab px-5 py-3 text-gray-600 font-semibold hover:text-indigo-700 transition rounded-t-md hidden" id="tab-btn-purchase" onclick="showTab('purchase')">
            PURCHASE POINTS (<span id="purchase-count">0</span>)
          </button>
          <button class="tab px-5 py-3 text-gray-600 font-semibold hover:text-indigo-700 transition rounded-t-md hidden" id="tab-btn-earn" onclick="showTab('earn')">
            EARN POINTS (<span id="earn-count">0</span>)
          </button>
          <button class="tab px-5 py-3 text-gray-600 font-semibold hover:text-indigo-700 transition rounded-t-md hidden" id="tab-btn-redeem" onclick="showTab('redeem')">
            REDEEM POINTS (<span id="redeem-count">0</span>)
          </button>
          <button class="tab px-5 py-3 text-gray-600 font-semibold hover:text-indigo-700 transition rounded-t-md" onclick="showTab('pt')">PHYSICAL THERAPY (<span id="pt-count">0</span>)</button>
          <button class="tab px-5 py-3 text-gray-600 font-semibold hover:text-indigo-700 transition rounded-t-md" onclick="showTab('rides')">RIDES (<span id="rides-count">0</span>)</button>
          <button class="tab px-5 py-3 text-gray-600 font-semibold hover:text-indigo-700 transition rounded-t-md" onclick="showTab('lunch')">LUNCH (<span id="lunch-count">0</span>)</button>
          <button class="tab px-5 py-3 text-gray-600 font-semibold hover:text-indigo-700 transition rounded-t-md" onclick="showTab('massages')">MASSAGES (<span id="massages-count">0</span>)</button>
          <button class="tab px-5 py-3 text-gray-600 font-semibold hover:text-indigo-700 transition rounded-t-md" onclick="showTab('acupunctures')">ACUPUNCTURES (<span id="acupunctures-count">0</span>)</button>
          <!-- Removed the View More button -->
        </nav>
      </header>

      <!-- Tab Content -->
      <section>
        <div id="tab-points" class="tab-content mt-8">
          <div id="points-table" class="overflow-x-auto rounded-md shadow-sm border border-gray-300"></div>
        </div>
        <div id="tab-renewal" class="tab-content mt-8 hidden">
          <div id="renewal-table" class="overflow-x-auto rounded-md shadow-sm border border-gray-300"></div>
        </div>
        <div id="tab-purchase" class="tab-content mt-8 hidden">
          <div id="purchase-table" class="overflow-x-auto rounded-md shadow-sm border border-gray-300"></div>
        </div>
        <div id="tab-earn" class="tab-content mt-8 hidden">
          <div id="earn-table" class="overflow-x-auto rounded-md shadow-sm border border-gray-300"></div>
        </div>
        <div id="tab-redeem" class="tab-content mt-8 hidden">
          <div id="redeem-table" class="overflow-x-auto rounded-md shadow-sm border border-gray-300"></div>
        </div>
        <div id="tab-notes" class="tab-content mt-8 hidden">
          <div id="notes-content" class="bg-white rounded-md shadow-sm p-6 border border-gray-300 min-h-[100px]">
            <!-- Notes will be loaded here -->
          </div>
        </div>
        <div id="tab-pt" class="tab-content mt-8 hidden">
          <div id="pt-table" class="overflow-x-auto rounded-md shadow-sm border border-gray-300"></div>
        </div>
        <div id="tab-rides" class="tab-content mt-8 hidden">
          <div id="rides-table" class="overflow-x-auto rounded-md shadow-sm border border-gray-300"></div>
        </div>
        <div id="tab-lunch" class="tab-content mt-8 hidden">
          <div id="lunch-table" class="space-y-2"></div>
        </div>
        <div id="tab-massages" class="tab-content mt-8 hidden">
          <div id="massages-table" class="space-y-2"></div>
        </div>
        <div id="tab-acupunctures" class="tab-content mt-8 hidden">
          <div id="acupunctures-table" class="space-y-2"></div>
        </div>
      </section>
    </section>
  </main>

  <script src="main.js"></script>
  <script>

// Modern React-style Password Modal
// Remove old modal logic if present
document.getElementById('change-password-btn').addEventListener('click', function() {
  // Remove any existing modal
  const existing = document.getElementById('password-modal');
  if (existing) existing.remove();
  // Modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'password-modal';
  overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40';
  overlay.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl p-5 w-full max-w-sm relative animate-react-modal" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="pw-modal-title">
      <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 focus:outline-none" aria-label="Close" id="pw-modal-close-btn">
        <span class="material-icons">close</span>
      </button>
      <h2 id="pw-modal-title" class="text-xl font-bold mb-4 text-gray-800 text-center">Change Password</h2>
      <form id="pw-form" class="space-y-4">
        <div>
          <label class="block text-gray-700 font-medium mb-1">Set Password</label>
          <input id="modal-password" type="password" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Enter new password" required autocomplete="new-password" />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-1">Confirm Password</label>
          <input id="modal-password-confirm" type="password" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Confirm new password" required autocomplete="new-password" />
        </div>
        <ul id="pw-validation-list" class="mb-1 space-y-1 text-xs">
          <li id="pw-val-length" class="flex items-center gap-2 text-gray-600"><span class="material-icons align-middle">close</span>At least 4 characters</li>
          <li id="pw-val-capital" class="flex items-center gap-2 text-gray-600"><span class="material-icons align-middle">close</span>Contains a capital letter</li>
          <li id="pw-val-number" class="flex items-center gap-2 text-gray-600"><span class="material-icons align-middle">close</span>Contains a number</li>
          <li id="pw-val-match" class="flex items-center gap-2 text-gray-600"><span class="material-icons align-middle">close</span>Passwords match</li>
        </ul>
        <div id="pw-error" class="text-red-500 text-xs hidden"></div>
        <div class="flex justify-end gap-2 mt-2">
          <button type="button" class="px-3 py-1.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold" id="pw-cancel-btn">Cancel</button>
          <button type="submit" class="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold">Update</button>
        </div>
      </form>
    </div>
    <style>
      @keyframes react-modal {
        0% { opacity: 0; transform: scale(0.95) translateY(20px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      .animate-react-modal {
        animation: react-modal 0.18s cubic-bezier(0.4,0,0.2,1);
      }
    </style>
  `;
  document.body.appendChild(overlay);

  // Focus trap and accessibility
  const modal = overlay.querySelector('[role="dialog"]');
  setTimeout(() => { document.getElementById('modal-password').focus(); }, 100);
  function trapFocus(e) {
    const focusable = overlay.querySelectorAll('input,button,[tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    if (e.key === 'Escape') {
      overlay.remove();
    }
  }
  overlay.addEventListener('keydown', trapFocus);
  // Close on overlay click (not modal click)
  overlay.addEventListener('mousedown', function(e) {
    if (e.target === overlay) overlay.remove();
  });
  // Close on close button or cancel
  document.getElementById('pw-modal-close-btn').onclick = () => overlay.remove();
  document.getElementById('pw-cancel-btn').onclick = () => overlay.remove();

  document.getElementById('pw-form').onsubmit = async function(e) {
    e.preventDefault();
    const newPassword = document.getElementById('modal-password').value;
    const confirmPassword = document.getElementById('modal-password-confirm').value;
    const errorDiv = document.getElementById('pw-error');
    if (!newPassword || !confirmPassword || newPassword !== confirmPassword || !/^(?=.*[A-Z])(?=.*\d).{4,}$/.test(newPassword)) {
      errorDiv.textContent = 'Please fix the errors above.';
      errorDiv.classList.remove('hidden');
      return;
    }
    errorDiv.classList.add('hidden');
    try {
      const res = await fetch('backend.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_password', password: newPassword })
      });
      const data = await res.json();
      if (data.success) {
        overlay.remove();
        alert('Password updated successfully!');
      } else {
        errorDiv.textContent = data.error || 'Failed to update password.';
        errorDiv.classList.remove('hidden');
      }
    } catch (err) {
      errorDiv.textContent = 'Failed to update password.';
      errorDiv.classList.remove('hidden');
    }
  };

  // Live validation on typing
  document.getElementById('modal-password').addEventListener('input', validatePwFields);
  document.getElementById('modal-password-confirm').addEventListener('input', validatePwFields);
  function validatePwFields() {
    const newPassword = document.getElementById('modal-password').value;
    const confirmPassword = document.getElementById('modal-password-confirm').value;
    const errorDiv = document.getElementById('pw-error');
    const hasLength = newPassword.length >= 4;
    const hasCapital = /[A-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const isMatch = newPassword && confirmPassword && newPassword === confirmPassword;
    updateValidationUI('pw-val-length', hasLength);
    updateValidationUI('pw-val-capital', hasCapital);
    updateValidationUI('pw-val-number', hasNumber);
    updateValidationUI('pw-val-match', isMatch);
    if (!newPassword || !confirmPassword) {
      errorDiv.classList.add('hidden');
      return;
    }
    if (!hasLength || !hasCapital || !hasNumber) {
      errorDiv.textContent = 'Password does not meet requirements.';
      errorDiv.classList.remove('hidden');
      return;
    }
    if (!isMatch) {
      errorDiv.textContent = 'Passwords do not match.';
      errorDiv.classList.remove('hidden');
      return;
    }
    errorDiv.classList.add('hidden');
  }
  function updateValidationUI(id, valid) {
    const li = document.getElementById(id);
    const icon = li.querySelector('span');
    if (valid) {
      li.classList.remove('text-gray-600', 'text-red-600');
      li.classList.add('text-green-600');
      icon.textContent = 'check_circle';
    } else {
      li.classList.remove('text-green-600');
      li.classList.add('text-red-600');
      icon.textContent = 'close';
    }
  }
});

  </script>
</body>
</html>