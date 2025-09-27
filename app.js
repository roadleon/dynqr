// Import the Supabase client library
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.2/+esm';

// Supabase project credentials
const SUPABASE_URL = 'https://phvfayqklknxrvyfjzru.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodmZheXFrbGtueHJ2eWZqenJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNTc1NzUsImV4cCI6MjA3MzgzMzU3NX0.iMb2goMgHYzAPjePlawuIe0ovoJ_WHB89fzkPy_U0Ds';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get HTML elements
const form = document.getElementById('qr-form');
const urlInput = document.getElementById('destination-url');
const loader = document.getElementById('loader');

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission
    loader.classList.remove('hidden');

    // Remove any existing error messages
    const existingError = document.getElementById('insert-error');
    if (existingError) {
        existingError.remove();
    }

    const url = urlInput.value.trim();
    if (!url) {
        console.warn('Please enter a destination URL.');
        loader.classList.add('hidden');
        return;
    }

    try {
        // Generate a random short code and edit token
        const shortCode = Math.random().toString(36).substring(2, 8);
        const editToken = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);

        // Save the data to Supabase
        const { data, error } = await supabase
            .from('links')
            .insert([{
                destination_url: url,
                short_code: shortCode,
                edit_token: editToken,
            }, ])
            .select();

        if (error) throw error; // If Supabase returns an error, throw it
        if (!data || data.length === 0) throw new Error('Data was not saved successfully.');
        
        // ★★★ This is the key part ★★★
        // Redirect to the new result.html with the code and token
        window.location.href = `/result.html?code=${shortCode}&token=${editToken}`;

    } catch (err) {
        // Error handling: Display the error message on the page
        console.error('Error during QR code generation:', err);
        const errorElement = document.createElement('p');
        errorElement.id = 'insert-error';
        errorElement.textContent = `ERROR: An unexpected error occurred. Please try again. (${err.message})`;
        errorElement.style.color = 'red';
        errorElement.style.fontWeight = 'bold';
        errorElement.style.marginTop = '1rem';
        form.insertAdjacentElement('afterend', errorElement);
    
    } finally {
        // Hide the loader
        loader.classList.add('hidden');
    }
});

