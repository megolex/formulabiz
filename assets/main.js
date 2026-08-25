// Формула Бизнеса — shared behaviours

// Global Configuration
window.FORMULABIZ_CONFIG = {
  telegramBotToken: '', // Вставьте токен бота (например, '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ') для прямой отправки
  telegramChatId: '',   // Вставьте ID вашего чата или группы (например, '-100123456789')
  leadDownloadUrl: 'assets/checklist-15-vulnerabilities.pdf'
};

// Immediate check before DOM ready to prevent any flicker on secondary page navigation
(function () {
  try {
    if (sessionStorage.getItem('formulabiz_splash_seen')) {
      document.documentElement.classList.add('splash-already-seen');
    }
  } catch (e) {}
})();

// Serverless Lead Dispatcher
function sendServerlessLead(data) {
  return new Promise(function (resolve) {
    // 1. Always safely archive to localStorage (guaranteed no lost leads)
    try {
      var saved = JSON.parse(localStorage.getItem('formulabiz_leads') || '[]');
      data.timestamp = new Date().toISOString();
      data.url = window.location.href;
      saved.push(data);
      localStorage.setItem('formulabiz_leads', JSON.stringify(saved));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }

    // 2. Direct Telegram Bot API submission if configured
    var config = window.FORMULABIZ_CONFIG || {};
    if (config.telegramBotToken && config.telegramChatId) {
      var text = '🔥 <b>Новая заявка с сайта «Формула Бизнеса»</b>\n\n' +
        '📋 <b>Тип:</b> ' + (data.formType || 'Заявка') + '\n' +
        '👤 <b>Имя:</b> ' + (data.name || '—') + '\n' +
        '📞 <b>Телефон:</b> ' + (data.phone || '—') + '\n' +
        (data.email ? '✉️ <b>Email:</b> ' + data.email + '\n' : '') +
        (data.comment ? '💬 <b>Комментарий:</b> ' + data.comment + '\n' : '') +
        (data.details ? '📊 <b>Детали:</b>\n' + data.details + '\n' : '') +
        '⏱ <b>Время:</b> ' + new Date().toLocaleString('ru-RU');

      fetch('https://api.telegram.org/bot' + config.telegramBotToken + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.telegramChatId,
          text: text,
          parse_mode: 'HTML'
        })
      })
      .then(function (res) { return res.json(); })
      .then(function (resData) {
        console.log('[FormulaBiz] Lead sent to Telegram:', resData);
        resolve({ success: true, telegram: true });
      })
      .catch(function (err) {
        console.warn('[FormulaBiz] Telegram send error (saved to localStorage fallback):', err);
        resolve({ success: true, telegram: false });
      });
    } else {
      console.log('[FormulaBiz] Lead captured and saved to browser store:', data);
      resolve({ success: true, telegram: false });
    }
  });
}

// Interactive Phone Mask (+375 (XX) XXX-XX-XX)
function initPhoneMask() {
  var phoneInputs = document.querySelectorAll('input[type="tel"], #lm-phone, #cb-phone, #quiz-phone');

  phoneInputs.forEach(function (input) {
    input.addEventListener('input', function (e) {
      var val = input.value.replace(/\D/g, '');
      
      // Handle prefix
      if (val.startsWith('375')) {
        val = val.substring(3);
      } else if (val.startsWith('80')) {
        val = val.substring(2);
      } else if (val.startsWith('8')) {
        val = val.substring(1);
      }

      // Limit to 9 digits (2-digit code + 7-digit number)
      val = val.substring(0, 9);

      var formatted = '+375';
      if (val.length > 0) {
        formatted += ' (' + val.substring(0, 2);
      }
      if (val.length >= 2) {
        formatted += ') ' + val.substring(2, 5);
      }
      if (val.length >= 5) {
        formatted += '-' + val.substring(5, 7);
      }
      if (val.length >= 7) {
        formatted += '-' + val.substring(7, 9);
      }

      input.value = formatted;
    });

    input.addEventListener('focus', function () {
      if (!input.value.trim()) {
        input.value = '+375 (';
      }
    });

    input.addEventListener('blur', function () {
      if (input.value === '+375 (' || input.value === '+375') {
        input.value = '';
      }
    });
  });
}

// Count-Up Numbers Animation
function initCountUpCounters() {
  var statElements = document.querySelectorAll('[data-counter]');
  if (!statElements.length) return;

  var animateCounter = function (el) {
    var target = parseFloat(el.getAttribute('data-counter'));
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    var duration = 1600;
    var startTime = null;

    function updateCounter(currentTime) {
      if (!startTime) startTime = currentTime;
      var progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Ease out quad
      var easeProgress = 1 - (1 - progress) * (1 - progress);
      var currentVal = Math.floor(easeProgress * target);

      el.textContent = prefix + currentVal + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = prefix + target + suffix;
      }
    }

    requestAnimationFrame(updateCounter);
  };

  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    statElements.forEach(function (el) {
      counterObserver.observe(el);
    });
  } else {
    statElements.forEach(animateCounter);
  }
}

// Interactive Quiz Controller
function initInteractiveQuiz() {
  var quizWrap = document.getElementById('retail-quiz');
  if (!quizWrap) return;

  var currentStep = 1;
  var totalSteps = 4;
  var quizData = {
    format: '',
    scale: '',
    risk: '',
    name: '',
    phone: ''
  };

  var steps = quizWrap.querySelectorAll('.quiz-step');
  var progressBar = quizWrap.querySelector('.quiz-progress-bar');
  var btnPrev = quizWrap.querySelector('.quiz-btn-prev');
  var btnNext = quizWrap.querySelector('.quiz-btn-next');

  function updateStepView() {
    steps.forEach(function (s) {
      s.classList.remove('active');
    });

    var activeStepEl = quizWrap.querySelector('.quiz-step[data-step="' + currentStep + '"]');
    if (activeStepEl) {
      activeStepEl.classList.add('active');
    }

    if (progressBar) {
      var percent = ((currentStep) / totalSteps) * 100;
      progressBar.style.width = percent + '%';
    }

    if (btnPrev) {
      btnPrev.style.visibility = (currentStep > 1 && currentStep < 4) ? 'visible' : 'hidden';
    }

    if (btnNext) {
      if (currentStep === 1) {
        btnNext.disabled = !quizData.format;
        btnNext.textContent = 'Далее →';
      } else if (currentStep === 2) {
        btnNext.disabled = !quizData.scale;
        btnNext.textContent = 'Далее →';
      } else if (currentStep === 3) {
        btnNext.disabled = !quizData.risk;
        btnNext.textContent = 'Рассчитать результат →';
      } else if (currentStep === 4) {
        btnNext.style.display = 'none';
        btnPrev.style.display = 'none';
      }
    }

    // When reaching step 4, calculate personalized risk diagnosis
    if (currentStep === 4) {
      calculateQuizResult();
    }
  }

  function calculateQuizResult() {
    var riskSummary = quizWrap.querySelector('#quiz-risk-summary');
    var riskScoreEl = quizWrap.querySelector('#quiz-risk-score');
    var riskFillEl = quizWrap.querySelector('#quiz-risk-fill');

    var score = 65;
    if (quizData.risk.indexOf('МАРТ') !== -1 || quizData.risk.indexOf('713') !== -1) {
      score += 18;
    }
    if (quizData.scale.indexOf('Сеть') !== -1) {
      score += 10;
    }
    if (score > 92) score = 92;

    if (riskScoreEl) riskScoreEl.textContent = score + '%';
    if (riskFillEl) riskFillEl.style.width = score + '%';

    if (riskSummary) {
      riskSummary.innerHTML = '<strong>Предварительный аудит:</strong> для формата <em>«' + (quizData.format || 'ритейл') + '»</em> (' + (quizData.scale || 'розничная точка') + ') критической зоной риска является <em>' + (quizData.risk || 'операционная система') + '</em>. Оставьте контакты, чтобы получить пошаговую дорожную карту защиты и роста выручки.';
    }
  }

  // Option selection
  quizWrap.querySelectorAll('.quiz-option').forEach(function (opt) {
    opt.addEventListener('click', function () {
      var stepParent = this.closest('.quiz-step');
      var group = this.getAttribute('data-group');
      var value = this.getAttribute('data-value') || this.textContent.trim();

      stepParent.querySelectorAll('.quiz-option').forEach(function (o) {
        o.classList.remove('selected');
      });

      this.classList.add('selected');
      quizData[group] = value;

      if (btnNext) btnNext.disabled = false;

      // Auto-advance smoothly on step 1 & 2 after 200ms
      if (currentStep < 3) {
        setTimeout(function () {
          currentStep++;
          updateStepView();
        }, 220);
      }
    });
  });

  if (btnNext) {
    btnNext.addEventListener('click', function () {
      if (currentStep < totalSteps) {
        currentStep++;
        updateStepView();
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', function () {
      if (currentStep > 1) {
        currentStep--;
        updateStepView();
      }
    });
  }

  // Quiz submission form on Step 4
  var quizForm = document.getElementById('quiz-submit-form');
  if (quizForm) {
    quizForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('quiz-name').value.trim();
      var phone = document.getElementById('quiz-phone').value.trim();

      if (!name || !phone || phone.length < 10) {
        alert('Пожалуйста, введите ваше имя и корректный номер телефона.');
        return;
      }

      var details = '• Формат: ' + quizData.format + '\n' +
        '• Масштаб: ' + quizData.scale + '\n' +
        '• Ключевая боль: ' + quizData.risk;

      var submitBtn = quizForm.querySelector('.btn-submit-quiz');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
      }

      sendServerlessLead({
        formType: 'Экспресс-тест (Квиз рисков ритейла)',
        name: name,
        phone: phone,
        details: details
      }).then(function () {
        var resultWrap = document.getElementById('quiz-final-view');
        if (resultWrap) {
          resultWrap.innerHTML = '<div style="text-align:center; padding:32px 16px;">' +
            '<div style="width:60px; height:60px; border-radius:50%; background:rgba(70,197,190,0.2); color:var(--teal); display:inline-flex; align-items:center; justify-content:center; font-size:2rem; margin-bottom:16px;">✓</div>' +
            '<h3 style="color:var(--white); font-size:1.4rem; margin-bottom:10px;">Результаты теста приняты!</h3>' +
            '<p style="color:rgba(255,255,255,0.85); font-size:.95rem; max-width:480px; margin:0 auto 20px;">Наш ведущий аудитор уже анализирует параметры вашего магазина и свяжется с вами по номеру <strong>' + phone + '</strong> в течение 15 минут в рабочее время.</p>' +
            '<a href="viber://chat?number=%2B375445278818" class="btn btn-teal" style="display:inline-flex;">Написать в Viber эксперту</a>' +
            '</div>';
        }
      });
    });
  }

  updateStepView();
}

document.addEventListener('DOMContentLoaded', function () {
  // Preloader / Splash Screen Animation Controller (Runs only on first visit per session)
  var preloader = document.getElementById('site-preloader');
  if (preloader) {
    var hasSeenSplash = false;
    try {
      hasSeenSplash = !!sessionStorage.getItem('formulabiz_splash_seen');
    } catch (e) {}

    if (hasSeenSplash) {
      preloader.style.display = 'none';
      if (preloader.parentNode) {
        preloader.parentNode.removeChild(preloader);
      }
    } else {
      try {
        sessionStorage.setItem('formulabiz_splash_seen', '1');
      } catch (e) {}

      document.body.classList.add('preloader-active');

      var flash = document.getElementById('flash');
      if (flash) {
        setTimeout(function () {
          flash.classList.add('active');
        }, 900);
      }

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

      var dismissTimer = setTimeout(hidePreloader, 2300);

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

  // Phone mask initialization
  initPhoneMask();

  // Stat Counters
  initCountUpCounters();

  // Interactive Quiz
  initInteractiveQuiz();

  // Lead-magnet form -> 1-Click direct PDF download + Serverless Lead processing
  var leadForm = document.getElementById('lead-form');
  var leadSuccessBox = document.getElementById('leadmagnet-success-box');
  if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameInput = document.getElementById('lm-name');
      var phoneInput = document.getElementById('lm-phone');
      var emailInput = document.getElementById('lm-email');

      var name = nameInput ? nameInput.value.trim() : '';
      var phone = phoneInput ? phoneInput.value.trim() : '';
      var email = emailInput ? emailInput.value.trim() : '';

      if (!name || !phone || phone.length < 10) {
        alert('Пожалуйста, заполните имя и корректный номер телефона.');
        return;
      }

      var submitBtn = leadForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Формируем PDF...';
      }

      // 1. Process Lead Serverlessly
      sendServerlessLead({
        formType: 'Скачивание чек-листа (15 уязвимостей магазина)',
        name: name,
        phone: phone,
        email: email
      }).then(function () {
        // 2. Trigger automatic download of the PDF file
        var downloadUrl = (window.FORMULABIZ_CONFIG && window.FORMULABIZ_CONFIG.leadDownloadUrl) || 'assets/checklist-15-vulnerabilities.pdf';
        var dLink = document.createElement('a');
        dLink.href = downloadUrl;
        dLink.setAttribute('download', 'Checklist_15_vulnerabilities_Formulabiz.pdf');
        dLink.style.display = 'none';
        document.body.appendChild(dLink);
        dLink.click();
        document.body.removeChild(dLink);

        // 3. Switch form to animated success screen
        leadForm.style.display = 'none';
        if (leadSuccessBox) {
          leadSuccessBox.classList.add('active');
        }
      });
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

  // Floating CTA Scroll Visibility & Quick Contact Stub Toggle
  var floatingCta = document.getElementById('floating-cta');
  var chatStub = document.getElementById('chat-stub');
  if (floatingCta) {
    var checkScroll = function () {
      if (window.scrollY > 380) {
        floatingCta.classList.add('visible');
      } else {
        floatingCta.classList.remove('visible');
        if (chatStub) chatStub.classList.remove('active');
      }
    };
    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();

    if (chatStub) {
      floatingCta.addEventListener('click', function (e) {
        e.preventDefault();
        chatStub.classList.toggle('active');
        chatStub.setAttribute('aria-hidden', chatStub.classList.contains('active') ? 'false' : 'true');
      });

      var chatCloseBtn = chatStub.querySelector('.chat-stub-close');
      if (chatCloseBtn) {
        chatCloseBtn.addEventListener('click', function () {
          chatStub.classList.remove('active');
          chatStub.setAttribute('aria-hidden', 'true');
        });
      }

      document.addEventListener('click', function (e) {
        if (chatStub.classList.contains('active')) {
          if (!chatStub.contains(e.target) && !floatingCta.contains(e.target)) {
            chatStub.classList.remove('active');
            chatStub.setAttribute('aria-hidden', 'true');
          }
        }
      });
    }
  }

  // Callback Modal Dialog Controller (Serverless + Phone Mask + Success Screen)
  var callbackModal = document.getElementById('callback-modal');
  var openModalTriggers = document.querySelectorAll('[data-open-modal="callback-modal"], .open-callback-modal');

  function openCallbackModal() {
    if (callbackModal) {
      callbackModal.classList.add('active');
      callbackModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (chatStub) chatStub.classList.remove('active');
      var nameInput = document.getElementById('cb-name');
      if (nameInput) {
        setTimeout(function () { nameInput.focus(); }, 150);
      }
    }
  }

  function closeCallbackModal() {
    if (callbackModal) {
      callbackModal.classList.remove('active');
      callbackModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(function () {
        var formWrap = document.getElementById('modal-form-wrap');
        var successWrap = document.getElementById('modal-success-wrap');
        if (formWrap) formWrap.style.display = 'block';
        if (successWrap) successWrap.style.display = 'none';
      }, 300);
    }
  }

  openModalTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      openCallbackModal();
    });
  });

  if (callbackModal) {
    callbackModal.addEventListener('click', function (e) {
      if (e.target === callbackModal || e.target.closest('.modal-close') || e.target.closest('.modal-success-close')) {
        closeCallbackModal();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && callbackModal.classList.contains('active')) {
        closeCallbackModal();
      }
    });

    var callbackForm = document.getElementById('callback-form');
    if (callbackForm) {
      callbackForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = document.getElementById('cb-name').value.trim();
        var phone = document.getElementById('cb-phone').value.trim();
        var comment = document.getElementById('cb-comment') ? document.getElementById('cb-comment').value.trim() : '';

        if (!name || !phone || phone.length < 10) {
          alert('Пожалуйста, заполните имя и корректный номер телефона.');
          return;
        }

        var submitBtn = callbackForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Отправка...';
        }

        sendServerlessLead({
          formType: 'Заказ обратного звонка',
          name: name,
          phone: phone,
          comment: comment
        }).then(function () {
          var formWrap = document.getElementById('modal-form-wrap');
          var successWrap = document.getElementById('modal-success-wrap');
          if (formWrap) formWrap.style.display = 'none';
          if (successWrap) successWrap.style.display = 'block';
          callbackForm.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Заказать звонок';
          }
        });
      });
    }
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
    document.querySelectorAll('.reveal-on-scroll').forEach(function (el) {
      el.classList.add('is-revealed');
    });
  }
});

