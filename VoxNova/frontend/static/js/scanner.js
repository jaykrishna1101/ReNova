document.addEventListener('DOMContentLoaded', function() {
    const captureBtn = document.getElementById('captureBtn');
    const fileInput = document.getElementById('fileInput');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const error = document.getElementById('error');
    const videoFeed = document.getElementById('videoFeed');
    const webcamError = document.getElementById('webcamError');

    videoFeed.addEventListener('error', function() {
        webcamError.style.display = 'block';
    });

    videoFeed.addEventListener('load', function() {
        webcamError.style.display = 'none';
    });

    captureBtn.addEventListener('click', async function() {
        await analyzeImage('/capture', null);
    });

    fileInput.addEventListener('change', async function(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            await analyzeImage('/upload', file);
        }
    });

    async function analyzeImage(endpoint, file) {
        results.style.display = 'none';
        error.style.display = 'none';
        loading.style.display = 'block';

        try {
            let response;
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                response = await fetch(endpoint, {
                    method: 'POST',
                    body: formData
                });
            } else {
                response = await fetch(endpoint, {
                    method: 'POST'
                });
            }

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            loading.style.display = 'none';

            if (data.error) {
                error.textContent = data.error;
                error.style.display = 'block';
                return;
            }

            displayResults(data);
            results.style.display = 'block';
        } catch (err) {
            loading.style.display = 'none';
            error.textContent = 'An error occurred: ' + err.message;
            error.style.display = 'block';
        }
    }

    function displayResults(data) {
        document.getElementById('productName').textContent = data.product_name || 'Unknown';
        document.getElementById('toxicity').textContent = data.toxicity_level || 'N/A';
        document.getElementById('recyclable').textContent = data.recyclable ? 'Yes' : 'No';

        const componentsList = document.getElementById('components');
        componentsList.innerHTML = '';
        if (data.components && Array.isArray(data.components) && data.components.length > 0) {
            data.components.forEach(component => {
                const li = document.createElement('li');
                li.textContent = String(component);
                componentsList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No components listed';
            li.style.fontStyle = 'italic';
            li.style.color = '#999';
            componentsList.appendChild(li);
        }

        const harmfulList = document.getElementById('harmfulSubstances');
        harmfulList.innerHTML = '';
        if (data.harmful_substances && Array.isArray(data.harmful_substances) && data.harmful_substances.length > 0) {
            data.harmful_substances.forEach(substance => {
                const li = document.createElement('li');
                li.textContent = String(substance);
                harmfulList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No harmful substances listed';
            li.style.fontStyle = 'italic';
            li.style.color = '#999';
            harmfulList.appendChild(li);
        }

        window.lastScanData = data;
        showListForSaleButton(data);
    }

    function showListForSaleButton(data) {
        const existingBtn = document.getElementById('listForSaleBtn');
        if (existingBtn) {
            existingBtn.remove();
        }

        const listBtn = document.createElement('button');
        listBtn.id = 'listForSaleBtn';
        listBtn.className = 'btn btn-primary';
        listBtn.style.marginTop = '20px';
        listBtn.style.width = '100%';
        listBtn.textContent = '📋 List This Item for Sale';
        listBtn.addEventListener('click', () => listItemForSale(data));

        const resultsDiv = document.getElementById('results');
        resultsDiv.appendChild(listBtn);
    }

    async function listItemForSale(data) {
        const listBtn = document.getElementById('listForSaleBtn');
        if (!listBtn) {
            console.error('List button not found');
            return;
        }
        
        const originalText = listBtn.textContent;
        const productName = data.product_name || 'this item';
        
        const confirmed = confirm(`Do you want to list "${productName}" for sale?`);
        if (!confirmed) {
            return;
        }

        listBtn.disabled = true;
        listBtn.textContent = 'Listing...';

        try {
            const response = await fetch('/list-item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                listBtn.textContent = '✅ Listed Successfully!';
                listBtn.style.backgroundColor = '#28a745';
                setTimeout(() => {
                    listBtn.textContent = originalText;
                    listBtn.style.backgroundColor = '';
                    listBtn.disabled = false;
                }, 3000);
            } else {
                alert('Failed to list item: ' + (result.error || 'Unknown error'));
                listBtn.textContent = originalText;
                listBtn.disabled = false;
            }
        } catch (err) {
            alert('Error listing item: ' + err.message);
            listBtn.textContent = originalText;
            listBtn.disabled = false;
        }
    }
});

