const people = ['Chris', 'Pat', 'Sam', 'Philip']; 
let totals = {};
let receiptItems = [];

function init() {
    const splitGroup = document.getElementById('split-group');
    splitGroup.innerHTML = '';
    
    people.forEach(person => {
        totals[person] = 0;
        splitGroup.innerHTML += `
            <div class="split-row">
                <input type="checkbox" class="person-check" data-person="${person}">
                <span>${person}</span>
                <input type="number" class="qty-input" data-person="${person}" placeholder="Qty" min="1">
            </div>`;
    });
    renderTotals();
}

function selectAll() {
    const checks = document.querySelectorAll('.person-check');
    const areAllChecked = Array.from(checks).every(cb => cb.checked);
    checks.forEach(cb => cb.checked = !areAllChecked);
}

function addItem() {
    const nameInput = document.getElementById('itemName');
    const priceInput = document.getElementById('itemPrice');
    const totalPrice = parseFloat(priceInput.value);

    let totalQty = 0;
    let breakdown = [];
    
    const rows = document.querySelectorAll('.split-row');
    rows.forEach(row => {
        const checkbox = row.querySelector('.person-check');
        const qtyInput = row.querySelector('.qty-input');
        
        if (checkbox.checked) {
            // If checked but no qty entered, treat it as 1 piece
            const qty = parseFloat(qtyInput.value) || 1; 
            totalQty += qty;
            breakdown.push({ person: checkbox.dataset.person, qty: qty });
        }
    });

    if (!nameInput.value || isNaN(totalPrice) || totalQty === 0) {
        alert("Select at least one person and enter item details!");
        return;
    }

    const pricePerPiece = totalPrice / totalQty;
    
    const newItem = {
        id: Date.now(),
        name: nameInput.value,
        totalPrice: totalPrice,
        details: breakdown.map(b => `${b.person}: ${b.qty}pc ($${(b.qty * pricePerPiece).toFixed(2)})`),
        splitData: breakdown.map(b => ({ person: b.person, share: b.qty * pricePerPiece }))
    };

    receiptItems.push(newItem);
    newItem.splitData.forEach(item => totals[item.person] += item.share);

    updateUI();
    
    // Reset inputs
    nameInput.value = '';
    priceInput.value = '';
    document.querySelectorAll('.person-check').forEach(cb => cb.checked = false);
    document.querySelectorAll('.qty-input').forEach(i => i.value = '');
    nameInput.focus();
}

function deleteItem(id) {
    const itemIndex = receiptItems.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        const item = receiptItems[itemIndex];
        item.splitData.forEach(d => totals[d.person] -= d.share);
        receiptItems.splice(itemIndex, 1);
        updateUI();
    }
}

function renderTotals() {
    const container = document.getElementById('totals-container');
    container.innerHTML = '';
    people.forEach(person => {
        container.innerHTML += `
            <div class="total-box">
                <h3>${person}</h3>
                <p>$${totals[person].toFixed(2)}</p>
            </div>`;
    });
}

function updateUI() {
    renderTotals();
    const list = document.getElementById('itemList');
    list.innerHTML = '';

    receiptItems.slice().reverse().forEach(item => {
        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <div class="item-info">
                <strong>${item.name}</strong>
                <small>${item.details.join('\n')}</small>
            </div>
            <div class="item-price-area">
                <span>$${item.totalPrice.toFixed(2)}</span>
                <button class="delete-btn" onclick="deleteItem(${item.id})">×</button>
            </div>
        `;
        list.appendChild(row);
    });
}

function shareReceipt() {
    let message = "🛒 *FareShare Summary* \n\n";
    people.forEach(p => {
        message += `👤 *${p}*: $${totals[p].toFixed(2)}\n`;
    });
    
    if (navigator.share) {
        navigator.share({ title: 'FareShare', text: message });
    } else {
        navigator.clipboard.writeText(message);
        alert("Summary copied to clipboard!");
    }
}

function resetAll() {
    if (confirm("Reset everything?")) {
        receiptItems = [];
        people.forEach(p => totals[p] = 0);
        updateUI();
    }
}

init();