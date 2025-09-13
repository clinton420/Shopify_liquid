/**
 * Global JavaScript for Minimalist Beauty Theme
 */

// Theme initialization
document.addEventListener('DOMContentLoaded', function() {
  initializeTheme();
});

function initializeTheme() {
  // Initialize mobile menu
  initMobileMenu();
  
  // Initialize search drawer
  initSearchDrawer();
  
  // Initialize cart functionality
  initCart();
  
  // Initialize scroll animations
  initScrollAnimations();
  
  // Initialize lazy loading
  initLazyLoading();
  
  // Initialize cookie banner
  initCookieBanner();
}

// Mobile Menu
function initMobileMenu() {
  const menuToggle = document.querySelector('.header-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const menuClose = document.querySelector('.mobile-menu-close');
  
  if (!menuToggle || !mobileMenu) return;
  
  menuToggle.addEventListener('click', function() {
    const isExpanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', !isExpanded);
    mobileMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });
  
  if (menuClose) {
    menuClose.addEventListener('click', function() {
      menuToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
    });
  }
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      menuToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  });
  
  // Handle submenu toggles
  const submenuToggles = document.querySelectorAll('.mobile-nav-item.has-children .mobile-nav-link');
  submenuToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const submenu = this.parentElement.querySelector('.mobile-submenu');
      if (submenu) {
        submenu.classList.toggle('active');
      }
    });
  });
}

// Search Drawer
function initSearchDrawer() {
  const searchToggle = document.querySelector('.search-toggle');
  const searchDrawer = document.querySelector('.search-drawer');
  
  if (!searchToggle || !searchDrawer) return;
  
  searchToggle.addEventListener('click', function() {
    const isExpanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', !isExpanded);
    searchDrawer.classList.toggle('active');
    
    if (!isExpanded) {
      const searchInput = searchDrawer.querySelector('.search-input');
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 100);
      }
    }
  });
  
  // Close drawer when clicking outside
  document.addEventListener('click', function(e) {
    if (!searchDrawer.contains(e.target) && !searchToggle.contains(e.target)) {
      searchToggle.setAttribute('aria-expanded', 'false');
      searchDrawer.classList.remove('active');
    }
  });
  
  // Handle search form submission
  const searchForm = document.querySelector('.search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      const searchInput = this.querySelector('.search-input');
      if (!searchInput.value.trim()) {
        e.preventDefault();
      }
    });
  }
}

// Cart Functionality
function initCart() {
  // Cart count updates
  updateCartCount();
  
  // Quick add functionality
  initQuickAdd();
}

function updateCartCount() {
  // This would typically fetch from Shopify's cart API
  // For now, we'll listen for cart updates
  document.addEventListener('cart:updated', function(e) {
    const cartCount = document.getElementById('cart-count');
    if (cartCount && e.detail && e.detail.item_count !== undefined) {
      cartCount.textContent = e.detail.item_count;
      
      // Animate cart count
      cartCount.style.transform = 'scale(1.2)';
      setTimeout(() => {
        cartCount.style.transform = 'scale(1)';
      }, 200);
    }
  });
}

function initQuickAdd() {
  const quickAddBtns = document.querySelectorAll('.quick-add-btn');
  
  quickAddBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const productForm = this.closest('.product-form');
      if (productForm) {
        // Add loading state
        this.classList.add('loading');
        this.disabled = true;
        
        // Submit form
        const formData = new FormData(productForm);
        
        fetch(window.routes.cart_add_url, {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.status === 422) {
            throw new Error(data.description);
          }
          
          // Show success message
          showNotification('Product added to cart!', 'success');
          
          // Dispatch cart update event
          document.dispatchEvent(new CustomEvent('cart:updated', {
            detail: { item_count: data.item_count }
          }));
        })
        .catch(error => {
          console.error('Error adding to cart:', error);
          showNotification('Error adding product to cart', 'error');
        })
        .finally(() => {
          // Remove loading state
          this.classList.remove('loading');
          this.disabled = false;
        });
      }
    });
  });
}

// Scroll Animations
function initScrollAnimations() {
  if (!window.IntersectionObserver) return;
  
  const animatedElements = document.querySelectorAll('[data-animate]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  animatedElements.forEach(el => {
    observer.observe(el);
  });
}

// Lazy Loading
function initLazyLoading() {
  if (!window.IntersectionObserver) return;
  
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });
  
  lazyImages.forEach(img => {
    imageObserver.observe(img);
  });
}

// Cookie Banner
function initCookieBanner() {
  const cookieBanner = document.querySelector('.cookie-banner');
  if (!cookieBanner) return;
  
  const acceptBtn = cookieBanner.querySelector('.cookie-accept');
  const declineBtn = cookieBanner.querySelector('.cookie-decline');
  
  // Check if user has already made a choice
  if (localStorage.getItem('cookie-consent')) {
    cookieBanner.style.display = 'none';
    return;
  }
  
  if (acceptBtn) {
    acceptBtn.addEventListener('click', function() {
      localStorage.setItem('cookie-consent', 'accepted');
      cookieBanner.style.display = 'none';
      // Enable analytics
      enableAnalytics();
    });
  }
  
  if (declineBtn) {
    declineBtn.addEventListener('click', function() {
      localStorage.setItem('cookie-consent', 'declined');
      cookieBanner.style.display = 'none';
    });
  }
}

function enableAnalytics() {
  // Enable Google Analytics if consent given
  if (window.gtag) {
    window.gtag('consent', 'update', {
      'analytics_storage': 'granted'
    });
  }
}

// Notification System
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.textContent = message;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    padding: 1.5rem 2rem;
    background: var(--color-accent);
    color: white;
    border-radius: var(--input-radius);
    box-shadow: var(--card-shadow-hover);
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  if (type === 'success') {
    notification.style.background = 'var(--color-secondary)';
    notification.style.color = 'var(--color-accent)';
  } else if (type === 'error') {
    notification.style.background = 'var(--color-sale)';
  }
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Utility Functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Export functions for global use
window.MinimalistBeauty = {
  showNotification,
  debounce,
  throttle
};
