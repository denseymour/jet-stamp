// Get certificate ID from URL
const certificateId = window.location.pathname.split('/').pop();

// Load and verify certificate
async function verifyCertificate() {
  try {
    const response = await fetch(`/api/certificates/${certificateId}`);

    if (!response.ok) {
      throw new Error('Certificate not found');
    }

    const cert = await response.json();

    // Populate verification data
    document.getElementById('certId').textContent = cert.id;
    document.getElementById('issuedDate').textContent = new Date(cert.created_at).toLocaleString();
    document.getElementById('petName').textContent = cert.pet_name;
    document.getElementById('petType').textContent = cert.pet_type.charAt(0).toUpperCase() + cert.pet_type.slice(1);
    document.getElementById('vaccineType').textContent = cert.vaccine_type;
    document.getElementById('dateAdministered').textContent = new Date(cert.date_administered).toLocaleDateString();
    document.getElementById('vetName').textContent = cert.vet_name;
    document.getElementById('licenseNumber').textContent = cert.license_number;

    // Optional fields
    if (cert.next_due_date) {
      document.getElementById('nextDueDate').textContent = new Date(cert.next_due_date).toLocaleDateString();
      document.getElementById('nextDueDateRow').style.display = 'flex';
    }

    if (cert.clinic_name) {
      document.getElementById('clinicName').textContent = cert.clinic_name;
      document.getElementById('clinicNameRow').style.display = 'flex';
    }

    // Set link to view full certificate
    document.getElementById('viewCertificateLink').href = `/certificate/${cert.id}`;

    // Show verification content
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('verificationContent').style.display = 'block';

  } catch (error) {
    console.error('Error verifying certificate:', error);
    document.getElementById('errorCertId').textContent = certificateId;
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'block';
  }
}

// Verify certificate on page load
verifyCertificate();
