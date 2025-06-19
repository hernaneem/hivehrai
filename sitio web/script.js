document.addEventListener('DOMContentLoaded', function() {
    // Crear el efecto de hexágonos en la sección hero
    createHexagonGrid();
    
    // Animación al hacer scroll
    animateOnScroll();
    
    // Formulario de contacto
    setupContactForm();
});

// Función para crear la cuadrícula de hexágonos
function createHexagonGrid() {
    const hexagonGrid = document.querySelector('.hexagon-grid');
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
    
    // Añadir estilos CSS para los hexágonos
    const style = document.createElement('style');
    style.textContent = `
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

// Función para animar elementos al hacer scroll
function animateOnScroll() {
    // Seleccionar todos los elementos que queremos animar
    const elements = document.querySelectorAll('.feature, .agent-card, .step, .testimonial');
    
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
        .feature, .agent-card, .step, .testimonial {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .feature.animate, .agent-card.animate, .step.animate, .testimonial.animate {
            opacity: 1;
            transform: translateY(0);
        }
        
        .feature:nth-child(2), .agent-card:nth-child(2), .step:nth-child(2) {
            transition-delay: 0.2s;
        }
        
        .feature:nth-child(3), .agent-card:nth-child(3), .step:nth-child(3) {
            transition-delay: 0.4s;
        }
        
        .agent-card:nth-child(4), .step:nth-child(4) {
            transition-delay: 0.6s;
        }
        
        .agent-card:nth-child(5) {
            transition-delay: 0.8s;
        }
    `;
    document.head.appendChild(style);
    
    // Observar cada elemento
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Función para configurar el formulario de contacto
function setupContactForm() {
    const form = document.querySelector('.contact-form');
    
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
                successMessage.textContent = '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.';
                successMessage.style.color = '#4CAF50';
                successMessage.style.padding = '1rem';
                successMessage.style.marginTop = '1rem';
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
                top: targetElement.offsetTop,
                behavior: 'smooth'
            });
        }
    });
});
