document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const toxicityFilter = document.getElementById('toxicityFilter');
    const recyclableFilter = document.getElementById('recyclableFilter');
    const itemsGrid = document.getElementById('itemsGrid');

    let allItems = [];

    loadItems();

    searchBtn.addEventListener('click', filterItems);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            filterItems();
        }
    });

    toxicityFilter.addEventListener('change', filterItems);
    recyclableFilter.addEventListener('change', filterItems);

    async function loadItems() {
        try {
            const response = await fetch('/get-items');
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            if (data.items && Array.isArray(data.items)) {
                allItems = data.items;
                displayItems(allItems);
            } else {
                allItems = [];
                itemsGrid.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No items available yet. Check back later!</p>';
            }
        } catch (err) {
            console.error('Error loading items:', err);
            itemsGrid.innerHTML = '<p style="text-align: center; color: #f00; padding: 40px;">Error loading items. Please refresh the page.</p>';
        }
    }

    function displayItems(items) {
        itemsGrid.innerHTML = '';
        
        if (items.length === 0) {
            itemsGrid.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No items match your filters.</p>';
            return;
        }

        items.forEach(item => {
            const itemCard = createItemCard(item);
            itemsGrid.appendChild(itemCard);
        });
    }

    function createItemCard(item) {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.setAttribute('data-name', (item.product_name || '').toLowerCase());
        card.setAttribute('data-toxicity', item.toxicity_level || '');
        card.setAttribute('data-recyclable', item.recyclable ? 'true' : 'false');

        const emoji = getItemEmoji(item.product_name);
        const toxicityClass = `toxicity-${(item.toxicity_level || '').toLowerCase()}`;

        const isRecyclable = typeof item.recyclable === 'string' 
            ? ['true', 'yes', '1'].includes(item.recyclable.toLowerCase())
            : Boolean(item.recyclable);
        
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };
        
        const productName = escapeHtml(item.product_name || 'Unknown Item');
        const toxicityLevel = escapeHtml(item.toxicity_level || 'Unknown');
        const componentsText = item.components && item.components.length > 0 
            ? escapeHtml(item.components.slice(0, 3).join(', ') + (item.components.length > 3 ? '...' : ''))
            : '';
        const harmfulText = item.harmful_substances && item.harmful_substances.length > 0
            ? escapeHtml(item.harmful_substances.slice(0, 2).join(', ') + (item.harmful_substances.length > 2 ? '...' : ''))
            : '';
        const listedAt = item.listed_at ? escapeHtml(item.listed_at) : '';
        
        card.innerHTML = `
            <div class="item-image">${emoji}</div>
            <h3>${productName}</h3>
            <div class="item-details">
                <span class="badge ${toxicityClass}">${toxicityLevel} Toxicity</span>
                ${isRecyclable ? '<span class="badge recyclable">Recyclable</span>' : '<span class="badge non-recyclable">Non-Recyclable</span>'}
            </div>
            ${componentsText ? `<p class="item-description"><strong>Components:</strong> ${componentsText}</p>` : ''}
            ${harmfulText ? `<p class="item-description"><strong>Harmful:</strong> ${harmfulText}</p>` : ''}
            ${listedAt ? `<p class="item-description" style="font-size: 0.85em; color: #999;">Listed: ${listedAt}</p>` : ''}
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button class="btn btn-primary view-details-btn" data-item-id="${item.id}" style="flex: 1;">View Details</button>
                <button class="btn btn-delete delete-btn" data-item-id="${item.id}" data-item-name="${productName}" style="flex: 0 0 auto;">🗑️ Delete</button>
            </div>
        `;

        const viewBtn = card.querySelector('.view-details-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-item-id'));
                showItemDetails(itemId);
            });
        }

        const deleteBtn = card.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-item-id'));
                const itemName = this.getAttribute('data-item-name');
                deleteItem(itemId, itemName);
            });
        }

        return card;
    }

    function getItemEmoji(productName) {
        const name = (productName || '').toLowerCase();
        if (name.includes('phone') || name.includes('smartphone') || name.includes('mobile')) return '📱';
        if (name.includes('laptop') || name.includes('notebook')) return '💻';
        if (name.includes('desktop') || name.includes('computer') || name.includes('pc')) return '🖥️';
        if (name.includes('tablet') || name.includes('ipad')) return '📱';
        if (name.includes('monitor') || name.includes('screen') || name.includes('display')) return '🖥️';
        if (name.includes('keyboard')) return '⌨️';
        if (name.includes('mouse')) return '🖱️';
        if (name.includes('printer')) return '🖨️';
        if (name.includes('router') || name.includes('modem')) return '📡';
        if (name.includes('battery')) return '🔋';
        return '📦';
    }

    function filterItems() {
        const searchTerm = searchInput.value.toLowerCase();
        const toxicityValue = toxicityFilter.value;
        const recyclableValue = recyclableFilter.value;

        const filtered = allItems.filter(item => {
            const matchesSearch = !searchTerm || (item.product_name || '').toLowerCase().includes(searchTerm);
            const matchesToxicity = !toxicityValue || (item.toxicity_level || '') === toxicityValue;
            
            const itemRecyclable = typeof item.recyclable === 'string'
                ? ['true', 'yes', '1'].includes(item.recyclable.toLowerCase())
                : Boolean(item.recyclable);
            
            const matchesRecyclable = !recyclableValue || 
                (recyclableValue === 'true' && itemRecyclable) || 
                (recyclableValue === 'false' && !itemRecyclable);
            
            return matchesSearch && matchesToxicity && matchesRecyclable;
        });

        displayItems(filtered);
    }

    window.showItemDetails = function(itemId) {
        const item = allItems.find(i => i.id === itemId);
        if (item) {
            let details = `Item Details:\n\n`;
            details += `Product: ${item.product_name || 'Unknown'}\n`;
            details += `Toxicity: ${item.toxicity_level || 'Unknown'}\n`;
            details += `Recyclable: ${item.recyclable ? 'Yes' : 'No'}\n`;
            if (item.components && item.components.length > 0) {
                details += `\nComponents:\n${item.components.join('\n')}\n`;
            }
            if (item.harmful_substances && item.harmful_substances.length > 0) {
                details += `\nHarmful Substances:\n${item.harmful_substances.join('\n')}\n`;
            }
            if (item.listed_at) {
                details += `\nListed: ${item.listed_at}`;
            }
            alert(details);
        }
    };

    async function deleteItem(itemId, productName) {
        const confirmed = confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`);
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch('/delete-item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: itemId })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                allItems = allItems.filter(item => item.id !== itemId);
                filterItems();
                alert('Item deleted successfully!');
            } else {
                alert('Failed to delete item: ' + (result.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error deleting item:', err);
            alert('Error deleting item: ' + err.message);
        }
    };
});

