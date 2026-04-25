 let currentOwner = 'Shared';
        let chrisRunningTotal = 0;
        let patRunningTotal = 0;

        function setOwner(owner, btn) {
            currentOwner = owner;
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }

        function addItem() {
            const name = document.getElementById('itemName').value;
            const price = parseFloat(document.getElementById('itemPrice').value);

            if (!name || isNaN(price)) return;

            let chrisShare = 0;
            let patShare = 0;

            // Logic Core
            if (currentOwner === 'Shared') {
                chrisShare = price / 2;
                patShare = price / 2;
            } else if (currentOwner === 'Chris') {
                chrisShare = price;
            } else {
                patShare = price;
            }

            chrisRunningTotal += chrisShare;
            patRunningTotal += patShare;

            updateUI(name, price, currentOwner);
        }

        function updateUI(name, price, owner) {
            // Update Totals
            document.getElementById('chrisTotal').innerText = `$${chrisRunningTotal.toFixed(2)}`;
            document.getElementById('patTotal').innerText = `$${patRunningTotal.toFixed(2)}`;

            // Add to list
            const row = document.createElement('div');
            row.className = 'item-row';
            row.innerHTML = `
                <span>${name} (${owner})</span>
                <span>$${price.toFixed(2)}</span>
            `;
            document.getElementById('itemList').prepend(row);

            // Reset Inputs
            document.getElementById('itemName').value = '';
            document.getElementById('itemPrice').value = '';
            document.getElementById('itemName').focus();
        }
        function resetAll() {
    if (confirm("Clear this receipt and start over?")) {
        // Reset Totals
        chrisRunningTotal = 0;
        patRunningTotal = 0;
        
        // Update UI
        document.getElementById('chrisTotal').innerText = `$0.00`;
        document.getElementById('patTotal').innerText = `$0.00`;
        document.getElementById('itemList').innerHTML = '';
        
        // Reset Inputs & Focus
        document.getElementById('itemName').value = '';
        document.getElementById('itemPrice').value = '';
        setOwner('Shared', document.querySelector('.toggle-btn')); // Reset toggle to Shared
        document.getElementById('itemName').focus();
    }
}