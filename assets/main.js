// Формула Бизнеса — shared behaviours

// Immediate check before DOM ready to prevent any flicker on secondary page navigation
(function () {
  try {
    if (sessionStorage.getItem('formulabiz_splash_seen')) {
      document.documentElement.classList.add('splash-already-seen');
    }
  } catch (e) {}
})();

document.addEventListener('DOMContentLoaded', function () {
  // Preloader / Splash Screen Animation Controller (Runs only on first visit per session)
  var preloader = document.getElementById('site-preloader');
  if (preloader) {
    var hasSeenSplash = false;
    try {
      hasSeenSplash = !!sessionStorage.getItem('formulabiz_splash_seen');
    } catch (e) {}

    if (hasSeenSplash) {
      // Already seen in this session -> remove immediately
      preloader.style.display = 'none';
      if (preloader.parentNode) {
        preloader.parentNode.removeChild(preloader);
      }
    } else {
      // First visit -> mark as seen and play animation
      try {
        sessionStorage.setItem('formulabiz_splash_seen', '1');
      } catch (e) {}

      document.body.classList.add('preloader-active');

      // Trigger flash at 900ms when puzzle pieces snap together
      var flash = document.getElementById('flash');
      if (flash) {
        setTimeout(function () {
          flash.classList.add('active');
        }, 900);
      }

      // Dismiss preloader smoothly after animation completes
      var hidePreloader = function () {
        if (!preloader.classList.contains('preloader-hidden')) {
          preloader.classList.add('preloader-hidden');
          document.body.classList.remove('preloader-active');
          setTimeout(function () {
            if (preloader.parentNode) {
              preloader.style.display = 'none';
            }
          }, 700);
        }
      };

      // Auto-hide after full logo reveal (~2.3s)
      var dismissTimer = setTimeout(hidePreloader, 2300);

      // Fast-skip on click / tap
      preloader.addEventListener('click', function () {
        clearTimeout(dismissTimer);
        hidePreloader();
      });
    }
  }

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var header = document.querySelector('.site-header');
  if (toggle && header) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('open');
    });
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () {
        header.classList.remove('open');
      });
    });
  }

  // Lead-magnet form -> mailto fallback (variant B: no backend yet)
  var leadForm = document.getElementById('lead-form');
  if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('lm-name').value.trim();
      var phone = document.getElementById('lm-phone').value.trim();
      var email = document.getElementById('lm-email').value.trim();

      if (!name || !phone) {
        alert('Пожалуйста, заполните имя и телефон.');
        return;
      }

      var subject = 'Заявка на чек-лист «15 уязвимостей магазина»';
      var body =
        'Имя: ' + name + '\n' +
        'Телефон: ' + phone + '\n' +
        'Email: ' + (email || '—') + '\n\n' +
        'Заявка отправлена с сайта formulabiz.by (блок «Бесплатные материалы»).';

      var mailto = 'mailto:info@formulabiz.by' +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      window.location.href = mailto;

      var note = document.getElementById('lm-status');
      if (note) {
        note.textContent = 'Открываем ваш почтовый клиент — отправьте письмо, и мы вышлем PDF на указанный e-mail.';
      }
      leadForm.reset();
    });
  }

  // FAQ Accordion Toggle
  var faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = this.closest('.faq-item');
      var isActive = item.classList.contains('active');
      
      // Close other items
      document.querySelectorAll('.faq-item').forEach(function (other) {
        other.classList.remove('active');
      });
      
      // Toggle current item
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // Floating CTA Scroll Visibility
  var floatingCta = document.getElementById('floating-cta');
  if (floatingCta) {
    var checkScroll = function () {
      if (window.scrollY > 380) {
        floatingCta.classList.add('visible');
      } else {
        floatingCta.classList.remove('visible');
      }
    };
    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
  }

  // Scroll Reveal (Intersection Observer)
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback for older browsers
    document.querySelectorAll('.reveal-on-scroll').forEach(function (el) {
      el.classList.add('is-revealed');
    });
  }
});
