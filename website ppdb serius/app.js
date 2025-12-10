/*
 * PPDB Darussalam Bermi Mijen - app.js
 * Versi: 1.0
 * Deskripsi: Interaksi, Animasi, Validasi Form Multi-Step, dan LocalStorage.
 * Menggunakan Vanilla JS (ES6 Modules).
 */

document.addEventListener('DOMContentLoaded', () => {
    // =====================================
    // 1. HEADER & NAVIGATION
    // =====================================
    const header = document.getElementById('main-header');
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const navLinks = mainNav.querySelectorAll('a');

    // Sticky Header
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        mainNav.classList.toggle('open');
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('open')) {
                mainNav.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // =====================================
    // 2. SCROLL REVEAL ANIMATION (Intersection Observer)
    // =====================================
    const revealElements = document.querySelectorAll('.reveal-item');
    
    // Periksa reduced-motion
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducedMotion) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1 // Mulai tampil saat 10% elemen terlihat
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Hanya tampil sekali
                }
            });
        }, observerOptions);

        revealElements.forEach(el => observer.observe(el));
    } else {
        // Jika reduced motion aktif, pastikan semua elemen terlihat
        revealElements.forEach(el => el.classList.add('visible'));
    }


    // =====================================
    // 3. HERO CARD PARALLAX (Parallax Ringan)
    // =====================================
    const heroSection = document.getElementById('hero');
    const heroCard = document.getElementById('hero-card-parallax');

    if (heroSection && heroCard && !reducedMotion) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width; // 0 to 1
            const y = (e.clientY - rect.top) / rect.height; // 0 to 1

            // Map (0 to 1) to (-15 to 15) for rotation and (-5 to 5) for translation
            const xRot = (y - 0.5) * 30; // Tilt based on Y mouse pos
            const yRot = (x - 0.5) * -30; // Tilt based on X mouse pos
            const xTrans = (x - 0.5) * 10;
            const yTrans = (y - 0.5) * 10;

            // Gunakan transform: translate3d untuk memanfaatkan hardware acceleration
            heroCard.style.transform = `
                perspective(1000px)
                rotateX(${xRot}deg)
                rotateY(${yRot}deg)
                translate3d(${xTrans}px, ${yTrans}px, 0)
            `;
        });

        // Reset transformasi saat mouse keluar
        heroSection.addEventListener('mouseleave', () => {
            heroCard.style.transform = `
                perspective(1000px)
                rotateX(0deg)
                rotateY(0deg)
                translate3d(0, 0, 0)
            `;
        });
    }

    // =====================================
    // 4. PROGRAM TABS
    // =====================================
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            // Hapus 'active' dari semua tombol dan konten
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Tambahkan 'active' ke tombol yang diklik
            button.classList.add('active');

            // Tampilkan konten yang sesuai
            const activeContent = document.querySelector(`.tab-content[data-tab-content="${targetTab}"]`);
            if (activeContent) {
                activeContent.classList.add('active');
            }
        });
    });

    // =====================================
    // 5. FORM MULTI-STEP & LOCAL STORAGE
    // =====================================
    const form = document.getElementById('ppdb-multi-step-form');
    const steps = document.querySelectorAll('.form-step');
    const progressBar = document.getElementById('ppdb-progress');
    let currentStep = 1;
    const TOTAL_STEPS = steps.length;
    const LOCAL_STORAGE_KEY = 'ppdb_darussalam_2026_draft';

    // Helper: Update Progress Bar
    const updateProgress = (step) => {
        const percentage = (step / TOTAL_STEPS) * 100;
        progressBar.style.width = `${percentage}%`;
    };

    // Helper: Tampilkan Step
    const showStep = (step) => {
        steps.forEach((s, index) => {
            s.classList.remove('active');
            if (index + 1 === step) {
                s.classList.add('active');
                currentStep = step;
                updateProgress(step);
            }
        });
    };

    // Helper: Simpan ke LocalStorage
    const saveDraft = () => {
        const formData = new FormData(form);
        const data = {};
        for (const [key, value] of formData.entries()) {
            // Khusus untuk file, simpan nama file saja (data file tidak bisa disimpan di localStorage)
            if (value instanceof File) {
                data[key] = value.name;
            } else {
                data[key] = value;
            }
        }
        data.currentStep = currentStep;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    };

    // Helper: Muat dari LocalStorage
    const loadDraft = () => {
        const draft = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (draft) {
            const data = JSON.parse(draft);
            for (const key in data) {
                const element = form.elements[key];
                if (element && key !== 'currentStep') {
                    if (element.type !== 'file') {
                         element.value = data[key];
                    } else {
                        // Tampilkan pesan bahwa file harus diunggah ulang
                        const fileInput = document.getElementById(key);
                        const info = fileInput.nextElementSibling;
                        if (info) info.textContent = `File terakhir: ${data[key]} (Harap unggah ulang)`;
                    }
                }
            }
            // Muat kembali ke langkah terakhir
            showStep(data.currentStep || 1);
        } else {
            showStep(1); // Tampilkan langkah 1 jika tidak ada draft
        }
    };

    // Validasi Step Saat Ini (Client-side)
    const validateStep = (step) => {
        const currentStepEl = document.querySelector(`.form-step[data-step="${step}"]`);
        const requiredInputs = currentStepEl.querySelectorAll('[required]');
        let isValid = true;

        requiredInputs.forEach(input => {
            // Validasi umum
            if (!input.value) {
                input.classList.add('is-invalid');
                isValid = false;
            } else {
                input.classList.remove('is-invalid');
            }

            // Validasi khusus untuk file (ukuran < 2MB)
            if (input.type === 'file' && input.files.length > 0) {
                const maxSize = parseInt(input.getAttribute('data-max-size'));
                if (input.files[0].size > maxSize) {
                    alert(`Ukuran file ${input.name} melebihi batas 2MB.`);
                    input.classList.add('is-invalid');
                    isValid = false;
                } else {
                    input.classList.remove('is-invalid');
                }
            }

            // Validasi checkbox (untuk agreement di step 3)
            if (input.type === 'checkbox' && !input.checked) {
                isValid = false;
            }
        });

        // Tampilkan pesan error jika tidak valid (minimal alert)
        if (!isValid) {
            alert("Harap lengkapi semua bidang yang ditandai * dan perhatikan format/ukuran file.");
        }

        return isValid;
    };

    // Event Listener untuk tombol Next
    form.querySelectorAll('.next-step').forEach(button => {
        button.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                saveDraft(); // Simpan sebelum pindah
                showStep(currentStep + 1);
            }
        });
    });

    // Event Listener untuk tombol Previous
    form.querySelectorAll('.prev-step').forEach(button => {
        button.addEventListener('click', () => {
            saveDraft(); // Simpan sebelum pindah
            showStep(currentStep - 1);
        });
    });

    // Event Listener untuk semua input (untuk simpan otomatis saat ada perubahan)
    form.addEventListener('input', () => {
        // Debounce agar tidak terlalu sering menyimpan ke localStorage (opsional)
        // Saat ini, kita simpan langsung pada event next/prev untuk kepastian data.
    });

    // Event Listener Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (validateStep(currentStep)) {
            // Simulasikan Pengiriman Data ke Backend
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                if (key.startsWith('file_')) {
                    // Hanya simpan nama file untuk ringkasan
                    data[key] = value.name; 
                } else {
                    data[key] = value;
                }
            });

            // Simulasi POST Fetch ke /api/submit
            fetch('/api/submit', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                // Anggap sukses karena ini hanya simulasi
                console.log('Simulasi data terkirim:', data); 

                // Tampilkan Modal Konfirmasi & Ringkasan
                const summaryDiv = document.getElementById('submission-summary');
                summaryDiv.innerHTML = `
                    <p><strong>Nama Santri:</strong> ${data.nama_lengkap}</p>
                    <p><strong>Tanggal Lahir:</strong> ${data.tanggal_lahir}</p>
                    <p><strong>Nama Ayah:</strong> ${data.nama_ayah}</p>
                    <p><strong>No. Telp Ortu:</strong> ${data.telepon_ortu}</p>
                    <p><strong>KK:</strong> ${data.file_kk}</p>
                    <p><strong>Foto:</strong> ${data.file_foto}</p>
                `;

                // Tampilkan Modal
                const modal = document.getElementById('submit-modal');
                modal.style.display = 'block';

                // Bersihkan LocalStorage & Form setelah sukses submit
                localStorage.removeItem(LOCAL_STORAGE_KEY);
                form.reset();
                showStep(1);
            })
            .catch(error => {
                console.error('Simulasi Gagal Kirim:', error);
                alert('Pendaftaran Gagal. Silakan coba lagi.');
            });
        }
    });
    
    // Muat draft saat halaman pertama dimuat
    loadDraft();

    // =====================================
    // 6. MODAL & ACCORDION
    // =====================================
    const modal = document.getElementById('submit-modal');
    const closeButtons = modal.querySelectorAll('.close-btn, .close-modal-btn');

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    });

    // Tutup modal jika klik di luar
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            const body = document.getElementById(header.getAttribute('aria-controls'));

            // Tutup semua accordion body
            document.querySelectorAll('.accordion-body').forEach(b => {
                if (b !== body) {
                    b.style.maxHeight = 0;
                    b.previousElementSibling.setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle accordion yang diklik
            if (!isExpanded) {
                header.setAttribute('aria-expanded', 'true');
                body.style.maxHeight = body.scrollHeight + "px";
            } else {
                header.setAttribute('aria-expanded', 'false');
                body.style.maxHeight = 0;
            }
        });
    });

    // =====================================
    // 7. CAROUSEL (TESTIMONI)
    // =====================================
    const carousel = document.getElementById('testimoni-carousel');
    const nextBtn = document.querySelector('.carousel-nav .next');
    const prevBtn = document.querySelector('.carousel-nav .prev');

    if (carousel) {
        let currentSlide = 0;
        const totalSlides = carousel.children.length;
        // Tentukan jumlah item yang terlihat (3 untuk desktop, 1 untuk mobile)
        const getVisibleItems = () => window.innerWidth <= 768 ? 1 : (window.innerWidth <= 992 ? 2 : 3);
        
        const updateCarousel = () => {
            const visibleItems = getVisibleItems();
            const slideWidth = carousel.children[0].offsetWidth; // Dapatkan lebar satu slide/card
            
            // Batasi currentSlide agar tidak melebihi batas
            if (currentSlide > totalSlides - visibleItems) {
                currentSlide = totalSlides - visibleItems;
            }
            if (currentSlide < 0) {
                currentSlide = 0;
            }
            
            // Hitung nilai transform X
            const transformValue = -currentSlide * slideWidth;
            carousel.style.transform = `translateX(${transformValue}px)`;

            // Sembunyikan/Tampilkan tombol navigasi
            prevBtn.disabled = currentSlide === 0;
            nextBtn.disabled = currentSlide >= totalSlides - visibleItems;
        };

        nextBtn.addEventListener('click', () => {
            const visibleItems = getVisibleItems();
            if (currentSlide < totalSlides - visibleItems) {
                currentSlide++;
                updateCarousel();
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentSlide > 0) {
                currentSlide--;
                updateCarousel();
            }
        });

        // Update saat window di-resize
        window.addEventListener('resize', () => {
            // Reset ke slide 0 saat resize untuk menghindari masalah lebar transform
            currentSlide = 0;
            updateCarousel(); 
        });

        // Inisialisasi awal
        updateCarousel();
    }
});