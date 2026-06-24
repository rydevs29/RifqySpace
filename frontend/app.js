// Konfigurasi URL API Utama
// Kamu bisa menggantinya jika backend sudah di-deploy ke domain aslimu
const API_URL = 'https://api.rifqydev.my.id/api'; 
// Catatan: Jika saat ini masih testing di komputer sendiri, ganti jadi:
// const API_URL = 'http://localhost:5000/api';

// --- Manajemen Tampilan (DOM Elements) ---
const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const fileList = document.getElementById('file-list');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-upload-input');

// Cek status login saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('rifqy_token');
    if (token) {
        showDashboard();
    } else {
        showLogin();
    }
});

function showLogin() {
    loginView.classList.remove('hidden');
    dashboardView.classList.add('hidden');
}

function showDashboard() {
    loginView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    fetchFiles(); // Langsung ambil data file saat masuk
}

// --- Logika Autentikasi (Login & Logout) ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-btn');

    loginBtn.innerText = 'Memproses...';
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('rifqy_token', data.token);
            showDashboard();
        } else {
            errorMsg.innerText = data.error || 'Email atau password salah.';
        }
    } catch (err) {
        errorMsg.innerText = 'Gagal terhubung ke server API.';
    } finally {
        loginBtn.innerText = 'Masuk';
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('rifqy_token');
    showLogin();
});

// --- Logika Fetch Data (Ambil File) ---
async function fetchFiles() {
    const token = localStorage.getItem('rifqy_token');
    fileList.innerHTML = '<tr><td colspan="3" class="loading-cell">Memuat file...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/directory`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        renderFiles(data.files);
    } catch (error) {
        fileList.innerHTML = `<tr><td colspan="3" class="loading-cell" style="color:red;">Gagal memuat: ${error.message}</td></tr>`;
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'], i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function renderFiles(files) {
    fileList.innerHTML = ''; // Kosongkan tabel
    
    if (files.length === 0) {
        fileList.innerHTML = '<tr><td colspan="3" class="loading-cell">Belum ada file.</td></tr>';
        return;
    }

    files.forEach(file => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="file-name-cell">
                    <i class="ph ph-file-text" style="font-size:1.5rem; color:#6B7280;"></i>
                    ${file.name}
                </div>
            </td>
            <td style="color:#6B7280;">${formatBytes(file.size)}</td>
            <td>
                <button class="action-btn" onclick="downloadFile('${file.id}', '${file.name}')" title="Unduh">
                    <i class="ph ph-download-simple"></i>
                </button>
            </td>
        `;
        fileList.appendChild(tr);
    });
}

// --- Logika Download File ---
async function downloadFile(fileId, fileName) {
    const token = localStorage.getItem('rifqy_token');
    try {
        const response = await fetch(`${API_URL}/files/${fileId}/download`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (error) {
        alert("Gagal mengunduh file.");
    }
}

// --- Logika Upload File Murni ---
uploadBtn.addEventListener('click', () => {
    fileInput.click(); // Memicu input file yang tersembunyi
});

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('rifqy_token');
    
    // FormData khusus untuk streaming ke backend Node.js
    const formData = new FormData();
    formData.append('sizeBytes', file.size.toString());
    formData.append('fileName', file.name);
    formData.append('mimeType', file.type);
    formData.append('file', file);

    uploadBtn.innerHTML = '<i class="ph ph-spinner-gap"></i> Mengunggah...';
    uploadBtn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (response.ok) {
            alert('File berhasil diunggah!');
            fetchFiles(); // Refresh tabel
        } else {
            alert('Gagal mengunggah file.');
        }
    } catch (error) {
        alert('Terjadi kesalahan jaringan.');
    } finally {
        uploadBtn.innerHTML = '<i class="ph ph-upload-simple"></i> Unggah File';
        uploadBtn.disabled = false;
        fileInput.value = ''; // Reset input
    }
});
