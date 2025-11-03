// Get certificate ID from URL
const certificateId = window.location.pathname.split('/').pop();

// Load certificate data
async function loadCertificate() {
  try {
    const response = await fetch(`/api/certificates/${certificateId}`);

    if (!response.ok) {
      throw new Error('Certificate not found');
    }

    const cert = await response.json();

    // Populate certificate data
    document.getElementById('certId').textContent = cert.id;
    document.getElementById('petName').textContent = cert.pet_name;
    document.getElementById('petType').textContent = cert.pet_type.charAt(0).toUpperCase() + cert.pet_type.slice(1);
    document.getElementById('vaccineType').textContent = cert.vaccine_type;
    document.getElementById('dateAdministered').textContent = new Date(cert.date_administered).toLocaleDateString();
    document.getElementById('vetName').textContent = cert.vet_name;
    document.getElementById('licenseNumber').textContent = cert.license_number;
    document.getElementById('issuedDate').textContent = new Date(cert.created_at).toLocaleString();

    // Optional fields
    if (cert.next_due_date) {
      document.getElementById('nextDueDate').textContent = new Date(cert.next_due_date).toLocaleDateString();
      document.getElementById('nextDueDateRow').style.display = 'flex';
    }

    if (cert.clinic_name) {
      document.getElementById('clinicName').textContent = cert.clinic_name;
      document.getElementById('clinicNameRow').style.display = 'flex';
    }

    // QR Code
    if (cert.qr_code) {
      document.getElementById('qrCode').src = cert.qr_code;
    }

    // Show certificate
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('certificateContent').style.display = 'block';

  } catch (error) {
    console.error('Error loading certificate:', error);
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'block';
  }
}

// Download PDF
document.getElementById('downloadPdfBtn').addEventListener('click', () => {
  window.location.href = `/api/certificates/${certificateId}/pdf`;
});

// Share link
document.getElementById('shareLinkBtn').addEventListener('click', () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url)
    .then(() => {
      const btn = document.getElementById('shareLinkBtn');
      const originalText = btn.textContent;
      btn.textContent = '✓ Link Copied!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    })
    .catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy link');
    });
});

// Print
document.getElementById('printBtn').addEventListener('click', () => {
  window.print();
});

// Load certificate on page load
loadCertificate();
