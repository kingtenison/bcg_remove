document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const imageUpload = document.getElementById('imageUpload');
    const uploadArea = document.getElementById('uploadArea');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const actionButtons = document.getElementById('actionButtons');
    const removeBgBtn = document.getElementById('removeBgBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    // Remove.bg API configuration
    const API_KEY = 'ocePEdYrFbQjFFkDucPL7Euj'; // Get from https://www.remove.bg/api
    const API_URL = 'https://api.remove.bg/v1.0/removebg';
    
    let processedImageBlob = null;
    
    // Handle image upload
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        
        // Validate file
        if (!file) return;
        
        if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
            showError('Please upload a JPG or PNG image');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showError('Image must be smaller than 5MB');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewImage.classList.remove('hidden');
            uploadArea.classList.add('hidden');
            actionButtons.classList.remove('hidden');
            downloadBtn.disabled = true;
            processedImageBlob = null;
            clearError();
        }
        
        reader.readAsDataURL(file);
    });
    
    // Remove background button click
    removeBgBtn.addEventListener('click', async function() {
        if (!previewImage.src) return;
        
        // Show loading indicator
        actionButtons.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');
        clearError();
        
        try {
            // Get the uploaded file
            const file = imageUpload.files[0];
            
            // Create FormData for the API request
            const formData = new FormData();
            formData.append('image_file', file);
            formData.append('size', 'auto');
            
            // Call Remove.bg API
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'X-Api-Key': API_KEY
                },
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.errors ? errorData.errors[0].title : 'API request failed');
            }
            
            // Get the result as a blob
            const blob = await response.blob();
            processedImageBlob = blob;
            
            // Display the result
            const processedImageUrl = URL.createObjectURL(blob);
            previewImage.src = processedImageUrl;
            
            // Hide loading indicator and show buttons
            loadingIndicator.classList.add('hidden');
            actionButtons.classList.remove('hidden');
            downloadBtn.disabled = false;
            
        } catch (error) {
            console.error('Error removing background:', error);
            loadingIndicator.classList.add('hidden');
            actionButtons.classList.remove('hidden');
            showError(`Failed to remove background: ${error.message}`);
        }
    });
    
    // Download button click
    downloadBtn.addEventListener('click', function() {
        if (!processedImageBlob) return;
        
        const a = document.createElement('a');
        a.href = URL.createObjectURL(processedImageBlob);
        a.download = 'background-removed.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
    
    // Reset functionality (click on preview to upload new image)
    imagePreview.addEventListener('click', function() {
        if (previewImage.src && !loadingIndicator.classList.contains('hidden')) return;
        
        imageUpload.value = '';
        previewImage.src = '';
        previewImage.classList.add('hidden');
        uploadArea.classList.remove('hidden');
        actionButtons.classList.add('hidden');
        clearError();
    });
    
    // Helper function to show error messages
    function showError(message) {
        // Remove any existing error messages
        clearError();
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        imagePreview.parentNode.insertBefore(errorElement, imagePreview.nextSibling);
    }
    
    // Helper function to clear error messages
    function clearError() {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }
});