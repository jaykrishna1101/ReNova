document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const toxicityFilter = document.getElementById('toxicityFilter');
    const recyclableFilter = document.getElementById('recyclableFilter');
    const itemsGrid = document.getElementById('itemsGrid');
    const mapContainer = document.getElementById('mapContainer');

    let allItems = [];
    let map = null;
    let markers = [];

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
                initializeMap(allItems);
            } else {
                allItems = [];
                itemsGrid.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No items available yet. Check back later!</p>';
                mapContainer.innerHTML = '<p style="text-align: center; padding: 250px 20px; color: #999;">No items with location data available.</p>';
            }
        } catch (err) {
            console.error('Error loading items:', err);
            itemsGrid.innerHTML = '<p style="text-align: center; color: #f00; padding: 40px;">Error loading items. Please refresh the page.</p>';
        }
    }

    function displayItems(items) {
        itemsGrid.innerHTML = '';
        
        if (items.length === 0) {
            itemsGrid.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No items match your filters.</p>';
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
        card.setAttribute('data-item-id', item.id);
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
        
        // Format location
        let locationText = '';
        if (item.location) {
            if (item.location.address) {
                locationText = escapeHtml(item.location.address);
            } else if (item.location.latitude && item.location.longitude) {
                locationText = `${item.location.latitude.toFixed(4)}, ${item.location.longitude.toFixed(4)}`;
            }
        }
        
        // Format resell value
        let resellValueText = '';
        if (item.resell_value !== undefined && item.resell_value !== null) {
            const value = parseFloat(item.resell_value);
            if (!isNaN(value) && value > 0) {
                resellValueText = `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
            }
        }
        
        card.innerHTML = `
            <div class="item-image">${emoji}</div>
            <h3>${productName}</h3>
            <div class="item-details">
                <span class="badge ${toxicityClass}">${toxicityLevel} Toxicity</span>
                ${isRecyclable ? '<span class="badge recyclable">Recyclable</span>' : '<span class="badge non-recyclable">Non-Recyclable</span>'}
            </div>
            ${resellValueText ? `<p class="item-description" style="font-size: 1.1em; font-weight: bold; color: #00D084;"><strong>Resell Value:</strong> ${resellValueText}</p>` : ''}
            ${locationText ? `<p class="item-description" style="font-size: 0.9em; color: #666;"><strong>📍 Location:</strong> ${locationText}</p>` : ''}
            ${componentsText ? `<p class="item-description"><strong>Components:</strong> ${componentsText}</p>` : ''}
            ${harmfulText ? `<p class="item-description"><strong>Harmful:</strong> ${harmfulText}</p>` : ''}
            ${listedAt ? `<p class="item-description" style="font-size: 0.85em; color: #666;">Listed: ${listedAt}</p>` : ''}
            <div style="display: flex; gap: 10px; margin-top: 10px; padding: 0;">
                <button class="btn btn-primary view-details-btn" data-item-id="${item.id}" style="flex: 1;">View Details</button>
                <button class="btn btn-delete delete-btn" data-item-id="${item.id}" data-item-name="${productName}">🗑️ Delete</button>
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
        updateMap(filtered);
    }

    function initializeMap(items) {
        // Check if Leaflet is loaded
        if (typeof L === 'undefined') {
            console.error('Leaflet library not loaded');
            mapContainer.innerHTML = '<p style="text-align: center; padding: 250px 20px; color: #f00;">Map library failed to load. Please refresh the page.</p>';
            return;
        }
        
        // Clear previous map if exists
        if (map) {
            map.remove();
        }
        
        mapContainer.innerHTML = '';
        
        // Filter items with coordinates
        const itemsWithLocation = items.filter(item => 
            item.location && item.location.latitude && item.location.longitude
        );
        
        // Fixed pinned location at 21°14'28.3"N 78°59'02.4"E (converted to decimal: 21.241194°N, 78.984°E)
        const fixedLat = 21.241194;
        const fixedLng = 78.984;
        
        // Initialize map centered on fixed location or first item
        let centerLat = fixedLat;
        let centerLng = fixedLng;
        
        if (itemsWithLocation.length > 0) {
            const firstItem = itemsWithLocation[0];
            centerLat = firstItem.location.latitude;
            centerLng = firstItem.location.longitude;
        }
        
        map = L.map(mapContainer).setView([centerLat, centerLng], 6);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Add fixed pinned location (already defined above)
        
        // Create a different icon for the fixed location (red pin)
        const fixedIcon = L.divIcon({
            className: 'fixed-marker',
            html: `<div style="background: #dc3545; width: 35px; height: 35px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
                    <div style="transform: rotate(45deg); color: white; font-weight: bold; text-align: center; line-height: 29px; font-size: 18px;">📍</div>
                </div>`,
            iconSize: [35, 35],
            iconAnchor: [17, 35],
            popupAnchor: [0, -35]
        });
        
        const fixedMarker = L.marker([fixedLat, fixedLng], { icon: fixedIcon }).addTo(map);
        fixedMarker.bindPopup(`
            <div style="min-width: 200px;">
                <h4 style="margin: 0 0 10px 0; color: #dc3545;">📍 Reference Location</h4>
                <p style="margin: 5px 0;"><strong>Coordinates:</strong> 21°14'28.3"N, 78°59'02.4"E</p>
                <p style="margin: 5px 0;"><strong>Decimal:</strong> ${fixedLat.toFixed(6)}°N, ${fixedLng.toFixed(6)}°E</p>
            </div>
        `).openPopup();
        markers.push(fixedMarker);
        
        // Add markers for all items
        addMarkersToMap(itemsWithLocation);
        
        // Fit map to show all markers including fixed location
        const allBounds = itemsWithLocation.map(item => 
            [item.location.latitude, item.location.longitude]
        );
        // Add fixed location to bounds
        allBounds.push([fixedLat, fixedLng]);
        
        if (allBounds.length > 1) {
            map.fitBounds(allBounds, { padding: [50, 50] });
        } else {
            // If only fixed location, center on it with appropriate zoom
            map.setView([fixedLat, fixedLng], 13);
        }
    }

    function addMarkersToMap(items) {
        // Clear existing markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        
        items.forEach(item => {
            if (!item.location || !item.location.latitude || !item.location.longitude) {
                return;
            }
            
            const lat = item.location.latitude;
            const lng = item.location.longitude;
            const address = item.location.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            
            // Create custom icon
            const icon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background: #00D084; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
                    <div style="transform: rotate(45deg); color: white; font-weight: bold; text-align: center; line-height: 24px; font-size: 16px;">📍</div>
                </div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -30]
            });
            
            const marker = L.marker([lat, lng], { icon: icon }).addTo(map);
            
            // Create popup content
            const resellValue = item.resell_value ? 
                `₹${parseFloat(item.resell_value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : 
                'N/A';
            
            const popupContent = `
                <div style="min-width: 200px;">
                    <h4 style="margin: 0 0 10px 0; color: #00D084;">${item.product_name || 'Unknown Item'}</h4>
                    <p style="margin: 5px 0;"><strong>Resell Value:</strong> ${resellValue}</p>
                    <p style="margin: 5px 0;"><strong>Toxicity:</strong> ${item.toxicity_level || 'N/A'}</p>
                    <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${address}</p>
                    <button onclick="window.scrollToItem(${item.id})" style="margin-top: 10px; padding: 8px 15px; background: #00D084; color: white; border: none; border-radius: 5px; cursor: pointer; width: 100%;">
                        View Details
                    </button>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            markers.push(marker);
        });
    }

    function updateMap(filteredItems) {
        if (!map) {
            initializeMap(filteredItems);
            return;
        }
        
        // Filter items with coordinates
        const itemsWithLocation = filteredItems.filter(item => 
            item.location && item.location.latitude && item.location.longitude
        );
        
        // Keep the fixed marker, only remove item markers
        const itemMarkers = markers.filter(marker => {
            // Check if marker is the fixed location (red pin)
            const markerLat = marker.getLatLng().lat;
            const markerLng = marker.getLatLng().lng;
            const fixedLat = 21.241194;
            const fixedLng = 78.984;
            // If it's the fixed location, keep it
            if (Math.abs(markerLat - fixedLat) < 0.0001 && Math.abs(markerLng - fixedLng) < 0.0001) {
                return false; // Don't remove fixed marker
            }
            return true; // Remove item markers
        });
        
        // Remove item markers
        itemMarkers.forEach(marker => map.removeLayer(marker));
        markers = markers.filter(marker => {
            const markerLat = marker.getLatLng().lat;
            const markerLng = marker.getLatLng().lng;
            const fixedLat = 21.241194;
            const fixedLng = 78.984;
            // Keep fixed marker
            return Math.abs(markerLat - fixedLat) < 0.0001 && Math.abs(markerLng - fixedLng) < 0.0001;
        });
        
        if (itemsWithLocation.length === 0) {
            // Still show fixed location
            return;
        }
        
        // Update markers for items
        addMarkersToMap(itemsWithLocation);
        
        // Fit map to show all visible markers including fixed location
        const allBounds = itemsWithLocation.map(item => 
            [item.location.latitude, item.location.longitude]
        );
        allBounds.push([21.241194, 78.984]); // Add fixed location
        map.fitBounds(allBounds, { padding: [50, 50] });
    }

    // Global function to scroll to item
    window.scrollToItem = function(itemId) {
        const itemCard = document.querySelector(`[data-item-id="${itemId}"]`);
        if (itemCard) {
            itemCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight the card
            itemCard.style.boxShadow = '0 0 20px rgba(0, 208, 132, 0.5)';
            setTimeout(() => {
                itemCard.style.boxShadow = '';
            }, 2000);
        }
    };

    window.showItemDetails = function(itemId) {
        const item = allItems.find(i => i.id === itemId);
        if (item) {
            let details = `Item Details:\n\n`;
            details += `Product: ${item.product_name || 'Unknown'}\n`;
            details += `Toxicity: ${item.toxicity_level || 'Unknown'}\n`;
            details += `Recyclable: ${item.recyclable ? 'Yes' : 'No'}\n`;
            if (item.resell_value !== undefined && item.resell_value !== null) {
                const value = parseFloat(item.resell_value);
                if (!isNaN(value) && value > 0) {
                    details += `Resell Value: ₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}\n`;
                }
            }
            if (item.location) {
                if (item.location.address) {
                    details += `\n📍 Location: ${item.location.address}\n`;
                } else if (item.location.latitude && item.location.longitude) {
                    details += `\n📍 Location: ${item.location.latitude.toFixed(4)}, ${item.location.longitude.toFixed(4)}\n`;
                    details += `(Click to view on map: https://www.google.com/maps?q=${item.location.latitude},${item.location.longitude})\n`;
                }
            }
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

