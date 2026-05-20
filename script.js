// Start with your core group of 4
let people = ['Chris', 'Pat', 'Sam', 'Philip']; 
let totals = {};
let receiptItems = [];

function init() {
    totals = {};
    people.forEach(person => {
        totals[person] = 0;
    });
    
    renderPeopleRows();
    renderTotals();
}

// Generates the checkboxes, quantity inputs, and individual removal options
function renderPeopleRows() {
    const splitGroup = document.getElementById('split-group');
    splitGroup.innerHTML = '';
    
    people.forEach(person => {
        splitGroup.innerHTML += `
            <div class="split-row">
                <input type="checkbox" class="person-check" data-person="${person}">
                <span class="person-name">${person}</span>
                <input type="number" class="qty-input" data-person="${person}" placeholder="Qty" min="1">
                <button type="button" class="remove-person-btn" onclick="removePerson('${person}')" title="Remove ${person}">×</button>
            </div>`;
    });
}

// Dynamic function to add a person directly from the UI screen
function addNewPerson() {
    const nameInput = document.getElementById('newPersonName');
    const name = nameInput.value.trim();

    if (!name) {
        alert("Please enter a name!");
        return;
    }

    if (people.includes(name)) {
        alert("This person is already added!");
        return;
    }

    people.push(name);
    totals[name] = 0;

    renderPeopleRows();
    renderTotals();
    nameInput.value = '';
}

// Removes a specific person completely from tracking and adjusts receipt history
function removePerson(nameToRemove) {
    if (!confirm(`Are you sure you want to remove ${nameToRemove}? This will drop them from calculations.`)) {
        return;
    }

    // 1. Remove the individual from the names listing tracking array
    people = people.filter(p => p !== nameToRemove);
    
    // 2. Erase their structural totals property tracking balance
    delete totals[nameToRemove];

    // 3. Clear out their specific breakdown records inside existing receipt entries
    receiptItems.forEach(item => {
        item.splitData = item.splitData.filter(d => d.person !== nameToRemove);
        item.details = item.details.filter(detailStr => !detailStr.startsWith(`${nameToRemove}:`));
    });

    // 4. Update interface components seamlessly
    renderPeopleRows();
    updateUI();
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
        item.splitData.forEach(d => {
            if (totals[d.person] !== undefined) {
                totals[d.person] -= d.share;
            }
        });
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

function printReceipt() {
    if (receiptItems.length === 0) {
        alert("Your receipt is empty! Add items before printing.");
        return;
    }
    window.print();
}

function resetAll() {
    if (confirm("Reset everything?")) {
        receiptItems = [];
        // Revert back to original 4 core group members on standard hard reset
        people = ['Chris', 'Pat', 'Sam', 'Philip']; 
        init();
        updateUI();
    }
}

init();