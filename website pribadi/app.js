document.addEventListener('DOMContentLoaded', () => {
    // Pastikan GSAP dan ScrollTrigger sudah terload
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn("GSAP atau ScrollTrigger tidak terload. Animasi tidak aktif.");
    } else {
        gsap.registerPlugin(ScrollTrigger);
    }

    // --- 1. NAVIGASI STICKY & BLUR ---
    const header = document.getElementById('main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });

    // --- 2. TEMA TOGGLE ---
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        const body = document.body;
        body.classList.toggle('dim-mode');
        // Simpan preferensi ke localStorage
        localStorage.setItem('theme', body.classList.contains('dim-mode') ? 'dim-mode' : 'light-mode');
        themeToggle.textContent = body.classList.contains('dim-mode') ? '☀️' : '🌙';
    });

    // Load tema dari localStorage saat startup
    if (localStorage.getItem('theme') === 'dim-mode') {
        document.body.classList.add('dim-mode');
        themeToggle.textContent = '☀️';
    }

    // --- 3. ANIMASI HERO (GSAP) ---
    // Staggered reveal untuk teks Hero
    gsap.from(".hero-text .stagger-up", {
        y: 50,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.5
    });
    
    // --- 4. SCROLL REVEAL (Intersection Observer & GSAP) ---
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
    
    scrollRevealElements.forEach(element => {
        gsap.from(element, {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: element,
                start: "top 80%", // Mulai animasi ketika 80% elemen terlihat
                toggleActions: "play none none none"
            }
        });
    });

    // --- 5. THREE.JS 3D INTERAKTIF DI HERO ---
    const hero3dArea = document.getElementById('hero-3d');
    const fallback3d = document.getElementById('fallback-3d-css');

    if (window.THREE) {
        // Hapus fallback jika three.js tersedia
        fallback3d.style.display = 'none';

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); // Rasio 1:1
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        renderer.setSize(hero3dArea.clientWidth, hero3dArea.clientHeight);
        hero3dArea.appendChild(renderer.domElement);
        
        // Objek Sederhana (Bola Pastel Low-Poly)
        const geometry = new THREE.IcosahedronGeometry(1.5, 1); // Icosahedron Low-Poly
        const material = new THREE.MeshPhongMaterial({ 
            color: new THREE.Color('#F2E8FF'), // Warna Lilac
            shininess: 30,
            flatShading: true
        });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        
        // Pencahayaan
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        camera.position.z = 5;

        // Auto-Rotate & Interaksi Cursor (Parallax)
        let mouseX = 0, mouseY = 0;
        let targetX = 0, targetY = 0;
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;
        
        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - windowHalfX) * 0.001; // Normalisasi dan perkalian kecil
            mouseY = (event.clientY - windowHalfY) * 0.001;
        });

        const animate = () => {
            requestAnimationFrame(animate);

            // Pergerakan halus ke target (parallax)
            targetX += (mouseX - targetX) * 0.1;
            targetY += (mouseY - targetY) * 0.1;
            
            // Rotasi otomatis lambat
            sphere.rotation.x += 0.001 + targetY * 0.05;
            sphere.rotation.y += 0.005 + targetX * 0.05;

            renderer.render(scene, camera);
        };

        animate();

        // Handle resize
        window.addEventListener('resize', () => {
            camera.aspect = hero3dArea.clientWidth / hero3dArea.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(hero3dArea.clientWidth, hero3dArea.clientHeight);
        });

    } else {
        console.warn("three.js tidak terload. Menggunakan fallback CSS 3D.");
    }
    
    // --- 6. LAZY LOAD GAMBAR (Intersection Observer) ---
    const lazyImages = document.querySelectorAll('.lazyload');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazyload');
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '0px 0px 200px 0px' // Load 200px sebelum masuk viewport
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback sederhana tanpa IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.add('loaded');
        });
    }

    // --- 7. QUOTES RANDOMIZER ---
    const quotes = [
        { text: "Desain yang baik adalah desain yang seminimal mungkin.", author: "Dieter Rams" },
        { text: "Kesederhanaan adalah kecanggihan tertinggi.", author: "Leonardo da Vinci" },
        { text: "Jika Anda harus menjelaskan, itu tidak cukup baik.", author: "Anonim" },
        { text: "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupéry" }
    ];

    const currentQuoteEl = document.getElementById('current-quote');
    const quoteAuthorEl = document.getElementById('quote-author');
    const randomizeButton = document.getElementById('randomize-quote');
    let currentQuoteIndex = 0;

    const displayQuote = (index) => {
        // Animasi fade out/in dengan GSAP
        gsap.to(currentQuoteEl, { opacity: 0, y: 10, duration: 0.3, onComplete: () => {
            currentQuoteEl.textContent = `"${quotes[index].text}"`;
            quoteAuthorEl.textContent = `- ${quotes[index].author}`;
            gsap.to(currentQuoteEl, { opacity: 1, y: 0, duration: 0.5 });
        }});
        
        gsap.to(quoteAuthorEl, { opacity: 0, y: 10, duration: 0.3, delay: 0.1, onComplete: () => {
            gsap.to(quoteAuthorEl, { opacity: 1, y: 0, duration: 0.5 });
        }});
    };

    randomizeButton.addEventListener('click', () => {
        currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length; // Loop melalui quotes
        displayQuote(currentQuoteIndex);
    });

    // Tampilkan quote pertama saat load
    displayQuote(currentQuoteIndex);

    // --- 8. LIGHTBOX GALLERY ---
    window.openLightbox = (imageSrc) => {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        lightbox.style.display = "block";
        lightboxImg.src = imageSrc;
    }

    window.closeLightbox = () => {
        document.getElementById('lightbox').style.display = "none";
    }

    // Close lightbox saat tekan ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('lightbox').style.display === "block") {
            closeLightbox();
        }
    });

    // --- 9. COPY LINK SOCIALS ---
    const copyButtons = document.querySelectorAll('.copy-link-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const link = button.dataset.link;
            navigator.clipboard.writeText(link).then(() => {
                const originalText = button.textContent;
                button.textContent = '✅ Copied!';
                gsap.to(button, { backgroundColor: '#E9F8F2', duration: 0.1, yoyo: true, repeat: 1, onComplete: () => {
                    setTimeout(() => {
                        button.textContent = originalText;
                    }, 1000);
                }});
            }).catch(err => {
                console.error('Gagal menyalin:', err);
            });
        });
    });

    // Set tahun di Footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
});