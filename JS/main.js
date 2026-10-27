// Animaciones del portafolio
document.addEventListener('DOMContentLoaded', () => {
    // 1. Aparición de elementos al hacer scroll (con pequeño escalonado)
    const reveals = document.querySelectorAll('.reveal');
    const grupos = new Map();
    reveals.forEach(el => {
        const padre = el.parentElement;
        const i = grupos.get(padre) || 0;
        el.style.transitionDelay = (i * 0.1) + 's';
        grupos.set(padre, i + 1);
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.classList.add('visible');
            // Barras de habilidades se llenan al verse
            const barra = el.querySelector('.progress');
            if (barra) setTimeout(() => barra.style.width = barra.dataset.width + '%', 300);
            observer.unobserve(el);
        });
    }, { threshold: 0.15 });
    reveals.forEach(el => observer.observe(el));

    // 2. Efecto de escritura en "DESARROLLADORA FULL STACK"
    // El texto que falta queda invisible pero ocupa su espacio, así la página no "salta" mientras se escribe
    const typing = document.getElementById('typing');
    if (typing) {
        const texto = typing.dataset.text;
        let i = 0;
        const pintar = () => {
            typing.innerHTML = '';
            typing.append(texto.slice(0, i));
            const cursor = document.createElement('span');
            cursor.className = 'cursor';
            typing.append(cursor);
            const resto = document.createElement('span');
            resto.className = 'typing-resto';
            resto.textContent = texto.slice(i);
            typing.append(resto);
        };
        pintar();
        const escribir = () => {
            if (i < texto.length) {
                i++;
                pintar();
                setTimeout(escribir, 85);
            }
        };
        setTimeout(escribir, 600);
    }

    // 3. Barra de progreso, navbar compacta y enlace activo
    const barraScroll = document.querySelector('.scroll-progress');
    const nav = document.querySelector('.navegador');
    const links = document.querySelectorAll('.navegador ul a');
    const secciones = [...links].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

    const alScroll = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        barraScroll.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
        nav.classList.toggle('scrolled', scrollY > 40);

        let actual = secciones[0];
        secciones.forEach(sec => { if (sec.getBoundingClientRect().top < innerHeight * 0.4) actual = sec; });
        links.forEach(a => a.classList.toggle('activo', a.getAttribute('href') === '#' + actual.id));
    };
    addEventListener('scroll', alScroll, { passive: true });
    alScroll();

    // Menú hamburguesa: se cierra al elegir una sección y bloquea el scroll mientras está abierto
    const toggle = document.getElementById('menu-toggle');
    if (toggle) {
        toggle.addEventListener('change', () => {
            document.body.style.overflow = toggle.checked ? 'hidden' : '';
        });
    }

    // Clic en el menú: cada sección queda siempre a la misma altura (título justo debajo de la barra)
    const ESPACIO = 28;
    const destinoDe = id => {
        if (id === 'inicio') return 0;
        const seccion = document.getElementById(id);
        const titulo = seccion.querySelector('h1') || seccion;
        const altoNav = nav.getBoundingClientRect().height;
        // Posición real del título, sin contar la animación de aparición (que lo desplaza mientras está oculto)
        let top = 0;
        for (let el = titulo; el; el = el.offsetParent) top += el.offsetTop + (el.offsetParent ? el.offsetParent.clientTop : 0);
        const y = top - altoNav - ESPACIO;
        return Math.min(Math.max(0, y), document.documentElement.scrollHeight - innerHeight);
    };
    let destinoActual = null;
    const corregir = () => {
        if (!destinoActual) return;
        const y = destinoDe(destinoActual);
        destinoActual = null;
        if (Math.abs(y - scrollY) > 1) scrollTo({ top: y, behavior: 'smooth' });
    };
    // Al terminar de desplazarse se recalcula (la barra cambia de tamaño al bajar)
    if ('onscrollend' in window) addEventListener('scrollend', corregir);
    let finScroll;
    addEventListener('scroll', () => {
        clearTimeout(finScroll);
        finScroll = setTimeout(corregir, 150);
    }, { passive: true });

    const irA = id => {
        destinoActual = id;
        scrollTo({ top: destinoDe(id), behavior: 'smooth' });
    };
    links.forEach(a => a.addEventListener('click', e => {
        e.preventDefault();
        if (toggle) {
            toggle.checked = false;
            document.body.style.overflow = '';
        }
        const id = a.getAttribute('href').slice(1);
        history.replaceState(null, '', '#' + id);
        irA(id);
    }));

    // 4. Filtros de habilidades
    const tabs = document.querySelectorAll('.skills-tab');
    const grid = document.querySelector('.skills-grid');
    const cards = document.querySelectorAll('.skill-card');
    tabs.forEach(tab => tab.addEventListener('click', () => {
        const filtro = tab.dataset.filtro;
        tabs.forEach(t => t.classList.toggle('activo', t === tab));
        grid.classList.toggle('filtrado', filtro !== 'todas');
        cards.forEach(card => {
            const mostrar = filtro === 'todas' || card.dataset.categoria === filtro;
            card.classList.toggle('oculta', !mostrar);
            card.classList.remove('aparece');
            if (mostrar) {
                card.classList.add('visible');
                card.querySelectorAll('.reveal').forEach(r => r.classList.add('visible'));
                card.querySelectorAll('.progress').forEach(b => b.style.width = b.dataset.width + '%');
                void card.offsetWidth;
                card.classList.add('aparece');
            }
        });
    }));

});
