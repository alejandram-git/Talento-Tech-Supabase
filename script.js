// Initialize Lucide Icons
lucide.createIcons();

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    } else {
        navbar.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        navbar.style.background = 'rgba(255, 255, 255, 0.9)';
    }
});

// Animation on Scroll (Basic AOS implementation)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('appear');
            observer.unobserve(entry.target); // Only animate once
        }
    });
}, observerOptions);

document.querySelectorAll('[data-aos]').forEach(el => {
    observer.observe(el);
});

// Smooth Scroll for Nav Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form Submission Handling (with Formspree)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = contactForm.querySelector('.btn-submit');
        const originalText = btn.textContent;
        
        // Show loading state
        btn.disabled = true;
        btn.textContent = 'Enviando...';
        btn.style.opacity = '0.7';

        const formData = new FormData(contactForm);
        
        try {
            const response = await fetch(contactForm.action, {
                method: contactForm.method,
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                btn.textContent = '¡Inscripción Exitosa!';
                btn.style.background = '#10b981';
                alert('¡Gracias! Tu inscripción ha sido enviada correctamente. Talento Tech Oriente se pondrá en contacto contigo.');
                contactForm.reset();
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Error al enviar el formulario');
            }
        } catch (error) {
            btn.textContent = 'Error al enviar';
            btn.style.background = '#ef4444';
            alert('Hubo un problema: ' + error.message);
        } finally {
            // Revert button after 4 seconds
            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = originalText;
                btn.style.background = '';
                btn.style.opacity = '';
            }, 4000);
        }
    });
}

// Hover effects for area cards - extra flair
document.querySelectorAll('.area-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        const icon = card.querySelector('.area-icon');
        if (icon) {
            icon.style.transform = 'scale(1.1) rotate(5deg)';
            icon.style.transition = 'transform 0.3s ease';
        }
    });
    
    card.addEventListener('mouseleave', () => {
        const icon = card.querySelector('.area-icon');
        if (icon) {
            icon.style.transform = 'scale(1) rotate(0deg)';
        }
    });
});

// Supabase Initialization & Comments Logic
const supabaseUrl = 'https://hcpgejxnyplwnuxjwyca.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjcGdlanhueXBsd251eGp3eWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MzQ1MjIsImV4cCI6MjA4OTAxMDUyMn0.PYjVO3hPSDc3W6VbdDn969Eugk5Tehpp_bg3hYbJuyQ';

if (window.supabase) {
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Auth & UI Elements
    const authPrompt = document.getElementById('auth-prompt');
    const commentForm = document.getElementById('comment-form');
    const currentUserEmail = document.getElementById('current-user-email');
    const authModal = document.getElementById('auth-modal');
    const authForm = document.getElementById('auth-form');
    const authModalTitle = document.getElementById('auth-modal-title');
    const authErrorMsg = document.getElementById('auth-error-msg');
    const groupName = document.getElementById('group-name');
    const comentariosList = document.getElementById('comentarios-list');
    
    let isLoginMode = true;
    let currentUser = null;

    // --- Auth Listeners ---
    supabase.auth.getSession().then(({ data: { session } }) => {
        updateAuthState(session?.user);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
        updateAuthState(session?.user);
    });

    function updateAuthState(user) {
        currentUser = user;
        
        const navLoggedOut = document.getElementById('nav-logged-out');
        const navLoggedIn = document.getElementById('nav-logged-in');
        const navUserDisplay = document.getElementById('nav-user-display');
        
        if (user) {
            authPrompt.style.display = 'none';
            commentForm.style.display = 'block';
            const name = user.user_metadata?.name || user.email;
            currentUserEmail.textContent = `Sesión iniciada como: ${name}`;
            
            if (navLoggedOut) navLoggedOut.style.display = 'none';
            if (navLoggedIn) navLoggedIn.style.display = 'flex';
            if (navUserDisplay) navUserDisplay.textContent = name;
        } else {
            authPrompt.style.display = 'block';
            commentForm.style.display = 'none';
            
            if (navLoggedOut) navLoggedOut.style.display = 'flex';
            if (navLoggedIn) navLoggedIn.style.display = 'none';
        }
    }

    // --- Modal Logic ---
    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');
    const navLogout = document.getElementById('nav-logout');
    const btnShowRegisterPrompt = document.getElementById('btn-show-register-prompt');
    const btnCloseModal = document.getElementById('close-modal');
    
    function openLoginModal(e) {
        if(e) e.preventDefault();
        console.log('Abriendo modal login');
        isLoginMode = true;
        authModalTitle.textContent = 'Ingresar';
        groupName.style.display = 'none';
        document.getElementById('btn-auth-submit').textContent = 'Ingresar';
        authModal.style.display = 'flex';
        authErrorMsg.style.display = 'none';
    }

    function openRegisterModal(e) {
        if(e) e.preventDefault();
        console.log('Abriendo modal registro');
        isLoginMode = false;
        authModalTitle.textContent = 'Registro';
        groupName.style.display = 'block';
        document.getElementById('btn-auth-submit').textContent = 'Crear Cuenta';
        authModal.style.display = 'flex';
        authErrorMsg.style.display = 'none';
    }
    
    if (navLogin) {
        navLogin.addEventListener('click', openLoginModal);
    }
    if (navRegister) {
        navRegister.addEventListener('click', openRegisterModal);
    }
    if (btnShowRegisterPrompt) {
        btnShowRegisterPrompt.addEventListener('click', openRegisterModal);
    }

    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', () => {
            authModal.style.display = 'none';
        });
    }

    if (navLogout) {
        navLogout.addEventListener('click', async () => {
            await supabase.auth.signOut();
        });
    }

    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;
            const name = document.getElementById('auth-name').value;
            
            authErrorMsg.style.display = 'none';
            const submitBtn = document.getElementById('btn-auth-submit');
            const origText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Procesando...';
            submitBtn.style.opacity = '0.7';

            try {
                if (isLoginMode) {
                    const { error } = await supabase.auth.signInWithPassword({ email, password });
                    if (error) throw error;
                    authModal.style.display = 'none';
                    authForm.reset();
                } else {
                    const { data, error } = await supabase.auth.signUp({ 
                        email, 
                        password,
                        options: { data: { name: name || email.split('@')[0] } }
                    });
                    if (error) throw error;
                    
                    if (data.session) {
                        alert('¡Registro exitoso! Ya puedes interactuar en la sección de comentarios.');
                    } else {
                        alert('Registro exitoso. Revisa tu bandeja de entrada o SPAM para confirmar tu cuenta y poder ingresar.');
                    }
                    authModal.style.display = 'none';
                    authForm.reset();
                }
            } catch (err) {
                let errorTranslate = err.message;
                if (errorTranslate.includes('Invalid login credentials')) {
                    errorTranslate = 'El correo o la contraseña son incorrectos.';
                } else if (errorTranslate.includes('rate limit')) {
                    errorTranslate = 'Haz intentado muchas veces. Por favor espera una hora o intenta con otro correo.';
                } else if (errorTranslate.includes('already registered') || errorTranslate.includes('User already registered')) {
                    errorTranslate = 'Esta cuenta de correo ya se encuentra registrada. ¡Intenta iniciar sesión!';
                } else if (errorTranslate.includes('Password should be at least')) {
                    errorTranslate = 'La contraseña debe tener al menos 6 caracteres.';
                }
                
                authErrorMsg.textContent = errorTranslate;
                authErrorMsg.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = origText;
                submitBtn.style.opacity = '1';
            }
        });
    }

    // --- Comments Fetching ---
    async function fetchComments() {
        if (!comentariosList) return;
        
        try {
            const { data, error } = await supabase
                .from('comentarios')
                .select('*')
                .order('fecha', { ascending: false });
                
            if (error) throw error;
            
            if (data.length === 0) {
                comentariosList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Aún no hay comentarios. ¡Sé el primero en comentar!</p>';
                return;
            }
            
            comentariosList.innerHTML = data.map(comentario => {
                const fecha = new Date(comentario.fecha).toLocaleDateString('es-CO', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit'
                });
                
                return `
                <div class="comentario-item">
                    <div class="comentario-header">
                        <strong>${escapeHTML(comentario.nombre)}</strong>
                        <span class="comentario-date">${fecha}</span>
                    </div>
                    <div class="comentario-body">
                        ${escapeHTML(comentario.comentario).replace(/\n/g, '<br>')}
                    </div>
                </div>
                `;
            }).join('');
        } catch (err) {
            console.error('Error fetched comments:', err);
            comentariosList.innerHTML = '<p style="color: #ef4444; text-align: center;">Error al cargar comentarios.</p>';
        }
    }
    
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = document.getElementById('btn-comentar');
            const originalText = btn.textContent;
            
            // Validate auth
            if (!currentUser) {
                alert('Debes iniciar sesión para comentar.');
                return;
            }

            const inputNombre = currentUser.user_metadata?.name || currentUser.email || 'Anónimo';
            const inputComentario = document.getElementById('comment-text').value;

            btn.disabled = true;
            btn.textContent = 'Publicando...';
            btn.style.opacity = '0.7';

            try {
                const { data, error } = await supabase
                    .from('comentarios')
                    .insert([{ 
                        nombre: inputNombre, 
                        comentario: inputComentario 
                    }]);

                if (error) throw error;

                commentForm.reset();
                btn.textContent = '¡Comentario Publicado!';
                btn.style.background = '#10b981';
                
                fetchComments();
                
            } catch (err) {
                console.error('Error insert comment:', err);
                btn.textContent = 'Error al publicar';
                btn.style.background = '#ef4444';
            } finally {
                setTimeout(() => {
                    btn.disabled = false;
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.style.opacity = '';
                }, 3000);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', fetchComments);
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        fetchComments();
    }
} else {
    console.error('Supabase SDK no está cargado. Asegúrate de tener la etiqueta <script> de Supabase en tu HTML.');
}
