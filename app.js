// Instaglow Windows & Doors — Interactive Logic & Lead System

document.addEventListener('DOMContentLoaded', () => {

    /* -----------------------------------------------
       LEAD FORM CONFIGURATION
       To receive leads directly to meeran@instaglowwindows.co.uk:
       1. Get a free access key from https://web3forms.com
       2. Paste it in accessKey below.
    ----------------------------------------------- */
    const FORM_CONFIG = {
        endpoint: 'https://api.web3forms.com/submit',
        accessKey: 'YOUR_ACCESS_KEY_HERE', // Replace with free key from web3forms.com
        recipientEmail: 'meeran@instaglowwindows.co.uk',
        phone: '07988 570856'
    };

    /* -----------------------------------------------
       HEADER: sticky scroll class
    ----------------------------------------------- */
    const header = document.getElementById('mainHeader');
    window.addEventListener('scroll', () => {
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 60);
        }
    }, { passive: true });

    /* -----------------------------------------------
       MOBILE MENU
    ----------------------------------------------- */
    const menuToggle = document.getElementById('menuToggle');
    const navMenu    = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', navMenu.classList.contains('open'));
        });
        navMenu.querySelectorAll('.nav-link, .btn-nav').forEach(link => {
            link.addEventListener('click', () => navMenu.classList.remove('open'));
        });
    }

    /* -----------------------------------------------
       ACTIVE NAV ON SCROLL
    ----------------------------------------------- */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function activateNavLink() {
        let current = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 140) {
                current = sec.getAttribute('id');
            }
        });
        navLinks.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href') === `#${current}`) {
                a.classList.add('active');
            }
        });
    }
    window.addEventListener('scroll', activateNavLink, { passive: true });

    /* -----------------------------------------------
       PRODUCT TABS
    ----------------------------------------------- */
    const tabBtns   = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const panel = document.getElementById(target);
            if (panel) panel.classList.add('active');

            setTimeout(checkFadeTargets, 50);
        });
    });

    /* -----------------------------------------------
       SCROLL-TRIGGERED FADE ANIMATIONS
    ----------------------------------------------- */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    function checkFadeTargets() {
        document.querySelectorAll('.fade-up').forEach(el => {
            if (!el.classList.contains('visible')) observer.observe(el);
        });
    }
    checkFadeTargets();

    /* -----------------------------------------------
       HELPER: Send Form Data (API or Fallback Backup)
    ----------------------------------------------- */
    async function submitLead(payload) {
        // Save copy to localStorage as insurance against connectivity loss
        try {
            const savedLeads = JSON.parse(localStorage.getItem('instaglow_leads') || '[]');
            savedLeads.push({ ...payload, timestamp: new Date().toISOString() });
            localStorage.setItem('instaglow_leads', JSON.stringify(savedLeads));
        } catch (e) {
            // Storage quota or private browsing safeguard
        }

        // If an access key has been configured, dispatch via API
        if (FORM_CONFIG.accessKey && FORM_CONFIG.accessKey !== 'YOUR_ACCESS_KEY_HERE') {
            const response = await fetch(FORM_CONFIG.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    access_key: FORM_CONFIG.accessKey,
                    subject: payload.subject || 'New Quote Request — Instaglow Windows',
                    from_name: payload.name || 'Instaglow Lead Form',
                    ...payload
                })
            });
            const result = await response.json();
            if (!response.ok || result.success === false) {
                throw new Error(result.message || 'Submission failed');
            }
            return result;
        }

        // Development/Demo fallback: simulated delivery with lead logged
        console.info('[Instaglow Lead Received]', payload);
        console.info('Tip: Add your free Web3Forms access key in app.js (FORM_CONFIG.accessKey) to route leads straight to ' + FORM_CONFIG.recipientEmail);
        await new Promise(r => setTimeout(r, 900));
        return { success: true };
    }

    /* -----------------------------------------------
       HERO QUICK CALLBACK FORM
    ----------------------------------------------- */
    const heroForm = document.getElementById('heroCallbackForm');
    if (heroForm) {
        heroForm.addEventListener('submit', async e => {
            e.preventDefault();
            const btn = heroForm.querySelector('button[type="submit"]');
            const originalHTML = btn.innerHTML;

            const name = document.getElementById('heroName')?.value.trim();
            const phone = document.getElementById('heroPhone')?.value.trim();
            const interest = document.getElementById('heroInterest')?.value || 'Not specified';

            btn.disabled = true;
            btn.textContent = 'Submitting...';

            try {
                await submitLead({
                    subject: `Quick Consultation Request: ${name}`,
                    name,
                    phone,
                    interest,
                    form_type: 'Hero Callback Form'
                });

                btn.textContent = '✓ Request Received!';
                btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';

                setTimeout(() => {
                    heroForm.reset();
                    btn.disabled = false;
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                }, 4000);
            } catch (err) {
                btn.textContent = 'Error sending';
                btn.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                }, 3000);
            }
        });
    }

    /* -----------------------------------------------
       MAIN QUOTE FORM
    ----------------------------------------------- */
    const quoteForm  = document.getElementById('mainQuoteForm');
    const successMsg = document.getElementById('formSuccess');

    if (quoteForm) {
        quoteForm.addEventListener('submit', async e => {
            e.preventDefault();
            const btn = quoteForm.querySelector('button[type="submit"]');
            const originalHTML = btn.innerHTML;

            const name = document.getElementById('name')?.value.trim();
            const email = document.getElementById('email')?.value.trim();
            const phone = document.getElementById('phone')?.value.trim();
            const material = document.getElementById('material')?.value || '';
            const product = document.getElementById('product')?.value || '';
            const message = document.getElementById('message')?.value.trim() || '';

            btn.disabled = true;
            btn.textContent = 'Sending Quote Request...';

            try {
                await submitLead({
                    subject: `Detailed Quote Enquiry from ${name}`,
                    name,
                    email,
                    phone,
                    material,
                    product,
                    message,
                    form_type: 'Main Quote Form'
                });

                btn.textContent = '✓ Quote Request Sent!';
                btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
                if (successMsg) {
                    successMsg.style.display = 'block';
                }

                setTimeout(() => {
                    quoteForm.reset();
                    btn.disabled = false;
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                    if (successMsg) successMsg.style.display = 'none';
                }, 5000);
            } catch (err) {
                btn.textContent = 'Failed to send - Please call 07988 570856';
                btn.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                }, 4000);
            }
        });
    }

    /* -----------------------------------------------
       GALLERY LIGHTBOX
    ----------------------------------------------- */
    const galleryItems    = document.querySelectorAll('.gallery-item');
    const lightbox        = document.getElementById('galleryLightbox');
    const lightboxImg     = document.getElementById('lightboxImg');
    const lightboxTag     = document.getElementById('lightboxTag');
    const lightboxTitle   = document.getElementById('lightboxTitle');
    const lightboxLoc     = document.getElementById('lightboxLocation');
    const lightboxClose   = document.getElementById('lightboxClose');
    const lightboxBackdrop= document.getElementById('lightboxBackdrop');
    const lightboxPrev    = document.getElementById('lightboxPrev');
    const lightboxNext    = document.getElementById('lightboxNext');
    const lightboxEnquire = document.getElementById('lightboxEnquire');

    if (galleryItems.length > 0 && lightbox) {
        const galleryData = Array.from(galleryItems).map(item => {
            const img = item.querySelector('img');
            const tag = item.querySelector('.gallery-tag');
            const title = item.querySelector('h5');
            const loc = item.querySelector('p');
            return {
                src: img ? img.getAttribute('src') : '',
                alt: img ? img.getAttribute('alt') : '',
                tag: tag ? tag.textContent.trim() : '',
                title: title ? title.textContent.trim() : '',
                location: loc ? loc.textContent.trim() : ''
            };
        });

        let currentIndex = 0;

        function updateLightboxView(index) {
            currentIndex = (index + galleryData.length) % galleryData.length;
            const item = galleryData[currentIndex];

            if (lightboxImg) {
                lightboxImg.style.opacity = '0';
                setTimeout(() => {
                    lightboxImg.src = item.src;
                    lightboxImg.alt = item.alt;
                    lightboxImg.style.opacity = '1';
                }, 120);
            }
            if (lightboxTag) lightboxTag.textContent = item.tag;
            if (lightboxTitle) lightboxTitle.textContent = item.title;
            if (lightboxLoc) lightboxLoc.textContent = item.location;
        }

        function openLightbox(index) {
            updateLightboxView(index);
            lightbox.classList.add('active');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        galleryItems.forEach((item, idx) => {
            item.addEventListener('click', () => openLightbox(idx));
            item.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(idx);
                }
            });
        });

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
        if (lightboxPrev) lightboxPrev.addEventListener('click', () => updateLightboxView(currentIndex - 1));
        if (lightboxNext) lightboxNext.addEventListener('click', () => updateLightboxView(currentIndex + 1));

        if (lightboxEnquire) {
            lightboxEnquire.addEventListener('click', e => {
                closeLightbox();
                const quoteSec = document.getElementById('quote');
                if (quoteSec) {
                    const offset = header ? header.offsetHeight + 20 : 80;
                    window.scrollTo({ top: quoteSec.offsetTop - offset, behavior: 'smooth' });
                }
            });
        }

        // Keyboard navigation for lightbox
        window.addEventListener('keydown', e => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                updateLightboxView(currentIndex - 1);
            } else if (e.key === 'ArrowRight') {
                updateLightboxView(currentIndex + 1);
            }
        });
    }

    /* -----------------------------------------------
       SMOOTH SCROLL for anchor hrefs
    ----------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const href = link.getAttribute('href');
            if (href === '#' || href === '') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = header ? header.offsetHeight + 20 : 80;
                window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
            }
        });
    });

});
