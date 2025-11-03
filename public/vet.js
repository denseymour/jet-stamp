// Set today's date as default for date administered
document.getElementById('date_administered').valueAsDate = new Date();

// Handle form submission
document.getElementById('certificateForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/api/certificates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create certificate');
    }

    const result = await response.json();

    // Show success message
    document.getElementById('certificateId').textContent = result.certificateId;
    document.getElementById('viewCertificateLink').href = result.certificateUrl;
    document.getElementById('certificateForm').parentElement.style.display = 'none';
    document.getElementById('successMessage').style.display = 'block';

    // Store URL for copying
    window.generatedCertificateUrl = result.certificateUrl;

  } catch (error) {
    console.error('Error:', error);
    alert('Failed to create certificate. Please try again.');
  }
});

// Copy link button
document.getElementById('copyLinkBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(window.generatedCertificateUrl)
    .then(() => {
      const btn = document.getElementById('copyLinkBtn');
      const originalText = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    })
    .catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy link');
    });
});

// Create another certificate button
document.getElementById('createAnotherBtn').addEventListener('click', () => {
  document.getElementById('certificateForm').reset();
  document.getElementById('date_administered').valueAsDate = new Date();
  document.getElementById('certificateForm').parentElement.style.display = 'block';
  document.getElementById('successMessage').style.display = 'none';
});
