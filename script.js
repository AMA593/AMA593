// --- Inisialisasi AOS (Animate On Scroll) ---
// Ini yang menangani animasi fade-in saat halaman di-scroll
AOS.init({
    once: true, // Animasi hanya berjalan sekali saat di-scroll ke bawah
    mirror: false, // Animasi tidak akan berjalan lagi saat scroll ke atas
});


// --- REVISI: Fungsi Animasi Mengetik (Typing Effect) ---
const typingSpan = document.querySelector(".typing-text");
// Ganti teks di bawah ini dengan nama lengkap Anda atau variasi teks lain
const textArray = ["Ahmad Murojjib Afthoni.", "Seorang Design Grafis", "Santri Yang Mencoba Berkarya"];
const typingSpeed = 100; // Kecepatan mengetik (ms)
const erasingSpeed = 50;  // Kecepatan menghapus (ms)
const newTextDelay = 2000; // Jeda sebelum mengetik teks baru (ms)
let textArrayIndex = 0;
let charIndex = 0;

function type() {
    if (charIndex < textArray[textArrayIndex].length) {
        typingSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
        charIndex++;
        setTimeout(type, typingSpeed);
    } else {
        // Selesai mengetik satu teks, tunggu sebelum menghapus
        setTimeout(erase, newTextDelay);
    }
}

function erase() {
    if (charIndex > 0) {
        typingSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(erase, erasingSpeed);
    } else {
        // Selesai menghapus, lanjut ke teks berikutnya di array
        textArrayIndex++;
        if (textArrayIndex >= textArray.length) textArrayIndex = 0; // Kembali ke awal jika sudah teks terakhir
        setTimeout(type, typingSpeed + 500);
    }
}

// Mulai animasi mengetik saat halaman dimuat
document.addEventListener("DOMContentLoaded", function() { 
    if(textArray.length) setTimeout(type, newTextDelay + 250);
});


// --- Mengatur perpindahan Tab Galeri ---
function openTab(tabId) {
    // Sembunyikan semua konten tab
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => {
        content.classList.remove('active');
    });

    // Hapus status 'active' dari semua tombol
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(button => {
        button.classList.remove('active');
    });

    // Tampilkan tab yang dipilih
    document.getElementById(tabId).classList.add('active');
    
    // Tambahkan class 'active' ke tombol yang ditekan
    // Kita gunakan event.currentTarget untuk mendapatkan tombol yang diklik
    event.currentTarget.classList.add('active');

    // REVISI: Refresh AOS agar animasi di dalam tab baru berjalan saat tab dibuka
    AOS.refresh();
}


// --- Mengatur Mobile Menu Toggle (Hamburger Icon) ---
const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.querySelector('.nav-menu');

mobileMenu.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    // Animasi ikon hamburger menjadi silang (opsional, perlu CSS tambahan jika ingin)
    const icon = mobileMenu.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// Menutup mobile menu jika salah satu link ditekan
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        // Kembalikan ikon hamburger
        const icon = mobileMenu.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    });
});

// Efek Navbar mengecil saat di-scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.padding = "0.5rem 5%";
        navbar.style.backgroundColor = "rgba(20, 24, 30, 0.98)"; // Sedikit lebih gelap
    } else {
        navbar.style.padding = "1rem 5%";
        navbar.style.backgroundColor = "rgba(34, 40, 49, 0.95)";
    }
});

// --- Navigasi Active State Logic ---

const sections = document.querySelectorAll("section");
const navItems = document.querySelectorAll(".nav-menu a");

const options = {
    // Memberikan batas kapan animasi aktif (0.3 berarti saat 30% section terlihat)
    threshold: 0.3,
    rootMargin: "-10% 0px -40% 0px" 
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            // Hapus class active dari semua menu
            navItems.forEach((link) => {
                link.classList.remove("active");
                // Jika ID section cocok dengan href di navbar
                if (link.getAttribute("href").includes(entry.target.id)) {
                    link.classList.add("active");
                }
            });
        }
    });
}, options);

// Daftarkan semua section ke dalam observer
sections.forEach((section) => {
    observer.observe(section);
});

// Perbaikan: Pastikan menu Home aktif secara default saat di paling atas
window.addEventListener("scroll", () => {
    if (window.scrollY < 100) {
        navItems.forEach(link => link.classList.remove("active"));
        document.querySelector('.nav-menu a[href*="home"]').classList.add("active");
    }
});

// --- Logic Dark/Light Mode ---
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
const currentTheme = localStorage.getItem('theme');

// Cek tema terakhir yang disimpan
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'light') {
        toggleSwitch.checked = true;
    }
}

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }    
}

toggleSwitch.addEventListener('change', switchTheme, false);

// Ambil elemen tombol berdasarkan ID
const tombolTema = document.getElementById("checkbox-tema");

// Fungsi untuk ganti tema
function gantiTema(e) {
    if (e.target.checked) {
        // Jika diceklis, pasang mode terang
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("tema-pilihan", "light");
    } else {
        // Jika tidak, pasang mode gelap
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("tema-pilihan", "dark");
    }    
}

// Jalankan fungsi saat tombol diklik
tombolTema.addEventListener("change", gantiTema);

// CEK TEMA TERAKHIR (Agar saat refresh tidak balik ke awal)
const temaDisimpan = localStorage.getItem("tema-pilihan");
if (temaDisimpan === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    tombolTema.checked = true;
}

// --- Preloader Logic (Fix) ---
function closePreloader() {
    const preloader = document.getElementById("preloader");
    if (preloader) {
        preloader.classList.add("preloader-hidden");
        // Hapus elemen dari DOM setelah animasi selesai agar tidak membebani klik
        setTimeout(() => {
            preloader.style.display = "none";
        }, 800); 
    }
}

// Jalankan saat semua aset siap
window.addEventListener("load", closePreloader);

// Backup: Jika dalam 5 detik aset belum siap (lemot), paksa tutup preloader
setTimeout(closePreloader, 5000);