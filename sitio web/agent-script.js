document.addEventListener('DOMContentLoaded', function() {
    // Crear el efecto de hexágonos en la sección hero
    createHexagonGrid();
    
    // Animación al hacer scroll
    animateOnScroll();
    
    // Configurar formulario de demostración
    setupDemoForm();
});

// Función para crear la cuadrícula de hexágonos
function createHexagonGrid() {
    // Crear el contenedor de hexágonos si no existe
    let hexagonGrid = document.querySelector('.hexagon-grid');
    if (!hexagonGrid) {
        hexagonGrid = document.createElement('div');
        hexagonGrid.classList.add('hexagon-grid');
        const agentHero = document.querySelector('.agent-hero');
        if (agentHero) {
            agentHero.appendChild(hexagonGrid);
        }
    }
    
    const colors = ['#FFC107', '#FFA000', '#FF6F00'];
    const sizes = [30, 40, 50, 60];
    const count = 40; // Número de hexágonos
    
    for (let i = 0; i < count; i++) {
        const hexagon = document.createElement('div');
        hexagon.classList.add('hexagon');
        
        // Propiedades aleatorias para cada hexágono
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = 15 + Math.random() * 15;
        const opacity = 0.1 + Math.random() * 0.3;
        
        // Aplicar estilos
        hexagon.style.width = `${size}px`;
        hexagon.style.height = `${size * 0.866}px`; // Proporción para hexágono
        hexagon.style.backgroundColor = color;
        hexagon.style.left = `${x}%`;
        hexagon.style.top = `${y}%`;
        hexagon.style.opacity = opacity;
        hexagon.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
        
        hexagonGrid.appendChild(hexagon);
    }
    
    // Añadir estilos CSS para los hexágonos si no existen
    if (!document.querySelector('#hexagon-styles')) {
        const style = document.createElement('style');
        style.id = 'hexagon-styles';
        style.textContent = `
            .hexagon-grid {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: 0;
            }
            .hexagon {
                position: absolute;
                clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                transform: rotate(30deg);
            }
            
            @keyframes float {
                0%, 100% {
                    transform: translate(0, 0) rotate(30deg);
                }
                50% {
                    transform: translate(20px, -20px) rotate(30deg);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Función para animar elementos al hacer scroll
function animateOnScroll() {
    // Seleccionar todos los elementos que queremos animar
    const elements = document.querySelectorAll('.feature-card, .stat-card, .workflow-step, .cs-stat');
    
    // Opciones para el Intersection Observer
    const options = {
        root: null, // Viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% del elemento visible
    };
    
    // Callback para el Intersection Observer
    const callback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target); // Dejar de observar una vez animado
            }
        });
    };
    
    // Crear el Intersection Observer
    const observer = new IntersectionObserver(callback, options);
    
    // Añadir estilos CSS para las animaciones
    const style = document.createElement('style');
    style.textContent = `
        .feature-card, .stat-card, .workflow-step, .cs-stat {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .feature-card.animate, .stat-card.animate, .workflow-step.animate, .cs-stat.animate {
            opacity: 1;
            transform: translateY(0);
        }
        
        .feature-card:nth-child(2), .stat-card:nth-child(2), .workflow-step:nth-child(2), .cs-stat:nth-child(2) {
            transition-delay: 0.2s;
        }
        
        .feature-card:nth-child(3), .stat-card:nth-child(3), .workflow-step:nth-child(3), .cs-stat:nth-child(3) {
            transition-delay: 0.4s;
        }
        
        .feature-card:nth-child(4), .workflow-step:nth-child(4) {
            transition-delay: 0.6s;
        }
        
        .feature-card:nth-child(5) {
            transition-delay: 0.8s;
        }
        
        .feature-card:nth-child(6) {
            transition-delay: 1s;
        }
    `;
    document.head.appendChild(style);
    
    // Observar cada elemento
    elements.forEach(element => {
        observer.observe(element);
    });
    
    // Añadir efecto de parallax al scroll
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        
        // Efecto parallax en el hero
        const heroSection = document.querySelector('.agent-hero');
        if (heroSection) {
            heroSection.style.backgroundPosition = `center ${scrollPosition * 0.5}px`;
        }
    });
}

// Función para configurar el formulario de demostración
function setupDemoForm() {
    const form = document.querySelector('.demo-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simular envío del formulario
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';
            
            // Simular una respuesta del servidor después de 2 segundos
            setTimeout(() => {
                // Crear mensaje de éxito
                const successMessage = document.createElement('div');
                successMessage.classList.add('success-message');
                successMessage.textContent = '¡Solicitud enviada con éxito! Un especialista se pondrá en contacto contigo pronto.';
                successMessage.style.color = '#4CAF50';
                successMessage.style.padding = '1rem';
                successMessage.style.marginTop = '1rem';
                successMessage.style.textAlign = 'center';
                successMessage.style.borderRadius = '8px';
                successMessage.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
                
                // Insertar mensaje después del formulario
                form.parentNode.insertBefore(successMessage, form.nextSibling);
                
                // Resetear el formulario
                form.reset();
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                
                // Eliminar el mensaje después de 5 segundos
                setTimeout(() => {
                    successMessage.style.opacity = '0';
                    successMessage.style.transition = 'opacity 0.5s ease';
                    
                    setTimeout(() => {
                        successMessage.remove();
                    }, 500);
                }, 5000);
            }, 2000);
        });
    }
}

// Función para manejar el scroll suave a las secciones
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80, // Ajuste para el header fijo
                behavior: 'smooth'
            });
        }
    });
});
