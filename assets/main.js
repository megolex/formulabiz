// Формула Бизнеса — shared behaviours

// Global Configuration
window.FORMULABIZ_CONFIG = {
  emailTo: 'formula.consalt@gmail.com',
  phpEndpoint: 'send_lead.php',
  formSubmitUrl: 'https://formsubmit.co/ajax/formula.consalt@gmail.com',
  telegramBotToken: '', // Вставьте токен бота (например, '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ') для дублирования в Telegram
  telegramChatId: '',   // Вставьте ID вашего чата или группы (например, '-100123456789')
  leadDownloadUrl: 'assets/checklist-15-vulnerabilities.pdf',
  roadmapDownloadUrl: 'assets/dorozhnaya-karta-rosta-pribyli.pdf'
};

// Immediate check before DOM ready to prevent any flicker on secondary page navigation
(function () {
  try {
    if (sessionStorage.getItem('formulabiz_splash_seen')) {
      document.documentElement.classList.add('splash-already-seen');
    }
  } catch (e) {}
})();

// Universal Lead Dispatcher (Email to info@formulabiz.by + LocalStorage + Telegram)
function sendServerlessLead(data) {
  return new Promise(function (resolve) {
    data.timestamp = new Date().toISOString();
    data.url = window.location.href;

    // 1. Always archive to localStorage (guaranteed zero lost leads)
    try {
      var saved = JSON.parse(localStorage.getItem('formulabiz_leads') || '[]');
      saved.push(data);
      localStorage.setItem('formulabiz_leads', JSON.stringify(saved));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }

    var config = window.FORMULABIZ_CONFIG || {};
    var emailSent = false;
    var promises = [];

    // 2. Send via PHP backend (send_lead.php)
    var phpPromise = fetch(config.phpEndpoint || 'send_lead.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (resData) {
      if (resData && resData.success) {
        emailSent = true;
        console.log('[FormulaBiz] Lead successfully sent via PHP mailer to ' + (config.emailTo || 'info@formulabiz.by'));
      } else {
        throw new Error('PHP mailer fallback needed');
      }
    })
    .catch(function () {
      // Fallback: Send directly via FormSubmit.co API if PHP mailer is unavailable
      var formSubmitPayload = {
        _subject: '🔥 Новая заявка с сайта «Формула Бизнеса»: ' + (data.formType || 'Заявка'),
        'Тип формы': data.formType || 'Заявка',
        'Имя клиента': data.name || '—',
        'Телефон': data.phone || '—',
        'Email': data.email || '—',
        'Комментарий': data.comment || '—',
        'Детали / Опросник': data.details || '—',
        'Страница': data.url,
        'Время': new Date().toLocaleString('ru-RU'),
        _template: 'table',
        _captcha: 'false'
      };

      var fallbackUrl = config.formSubmitUrl || ('https://formsubmit.co/ajax/' + (config.emailTo || 'info@formulabiz.by'));
      return fetch(fallbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formSubmitPayload)
      })
      .then(function (res) { return res.json(); })
      .then(function (resData) {
        console.log('[FormulaBiz] Lead delivered to ' + (config.emailTo || 'info@formulabiz.by') + ' via FormSubmit:', resData);
        emailSent = true;
      })
      .catch(function (err) {
        console.warn('[FormulaBiz] Email submission note:', err);
      });
    });

    promises.push(phpPromise);

    // 3. Telegram Bot API submission if configured
    if (config.telegramBotToken && config.telegramChatId) {
      var text = '🔥 <b>Новая заявка с сайта «Формула Бизнеса»</b>\n\n' +
        '📋 <b>Тип:</b> ' + (data.formType || 'Заявка') + '\n' +
        '👤 <b>Имя:</b> ' + (data.name || '—') + '\n' +
        '📞 <b>Телефон:</b> ' + (data.phone || '—') + '\n' +
        (data.email ? '✉️ <b>Email:</b> ' + data.email + '\n' : '') +
        (data.comment ? '💬 <b>Комментарий:</b> ' + data.comment + '\n' : '') +
        (data.details ? '📊 <b>Детали:</b>\n' + data.details + '\n' : '') +
        '🌐 <b>Страница:</b> ' + data.url + '\n' +
        '⏱ <b>Время:</b> ' + new Date().toLocaleString('ru-RU');

      var tgPromise = fetch('https://api.telegram.org/bot' + config.telegramBotToken + '/sendMessage', {
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
      })
      .catch(function (err) {
        console.warn('[FormulaBiz] Telegram send note:', err);
      });

      promises.push(tgPromise);
    }

    // Resolve after all delivery channels are triggered
    Promise.all(promises).then(function () {
      resolve({ success: true, emailSent: emailSent });
    });
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
        // Automatic PDF download of roadmap
        var roadmapUrl = (window.FORMULABIZ_CONFIG && window.FORMULABIZ_CONFIG.roadmapDownloadUrl) || 'assets/dorozhnaya-karta-rosta-pribyli.pdf';
        var link = document.createElement('a');
        link.href = roadmapUrl;
        link.download = 'Dorozhnaya_Karta_Rosta_Pribyli_Formulabiz.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        var resultWrap = document.getElementById('quiz-final-view');
        if (resultWrap) {
          resultWrap.innerHTML = '<div style="text-align:center; padding:32px 16px;">' +
            '<div style="width:60px; height:60px; border-radius:50%; background:rgba(70,197,190,0.2); color:var(--teal); display:inline-flex; align-items:center; justify-content:center; font-size:2rem; margin-bottom:16px;">✓</div>' +
            '<h3 style="color:var(--white); font-size:1.4rem; margin-bottom:10px;">Дорожная карта сформирована!</h3>' +
            '<p style="color:rgba(255,255,255,0.85); font-size:.95rem; max-width:520px; margin:0 auto 20px;">Скачивание PDF началось автоматически. Наш ведущий эксперт уже анализирует параметры вашего магазина и свяжется с вами по номеру <strong>' + phone + '</strong> в течение 15 минут в рабочее время.</p>' +
            '<div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">' +
            '<a href="' + roadmapUrl + '" download="Dorozhnaya_Karta_Rosta_Pribyli_Formulabiz.pdf" class="btn btn-teal" style="display:inline-flex; align-items:center; gap:8px;">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3v13m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Скачать PDF повторно</a>' +
            '<a href="https://t.me/formulabiz_by" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="border-color:rgba(255,255,255,0.25); display:inline-flex; align-items:center; gap:8px;">Написать в Telegram</a>' +
            '</div>' +
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

  // Callback / Express Audit Modal Dialog Controller
  var callbackModal = document.getElementById('callback-modal');
  var openModalTriggers = document.querySelectorAll('[data-open-modal="callback-modal"], .open-callback-modal');
  var currentFormType = 'Заказ обратного звонка';
  var defaultModalState = {
    badge: 'Экспресс-связь',
    title: 'Заказать обратный звонок',
    desc: 'Оставьте номер, и наш ведущий эксперт перезвонит вам в течение 15 минут в рабочее время.',
    btnText: 'Заказать звонок',
    formType: 'Заказ обратного звонка'
  };

  function openCallbackModal(options) {
    options = options || {};
    currentFormType = options.formType || defaultModalState.formType;

    if (callbackModal) {
      var badgeEl = callbackModal.querySelector('.modal-badge');
      var titleEl = callbackModal.querySelector('#modal-title');
      var descEl = callbackModal.querySelector('.modal-header p');
      var submitBtn = callbackModal.querySelector('#callback-form button[type="submit"]');

      if (badgeEl) {
        badgeEl.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2"/></svg> ' + (options.badge || defaultModalState.badge);
      }
      if (titleEl) {
        titleEl.textContent = options.title || defaultModalState.title;
      }
      if (descEl) {
        descEl.textContent = options.desc || defaultModalState.desc;
      }
      if (submitBtn) {
        submitBtn.textContent = options.btnText || defaultModalState.btnText;
      }

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
      var title = trigger.getAttribute('data-modal-title');
      var formType = trigger.getAttribute('data-modal-form-type');
      var badge = trigger.getAttribute('data-modal-badge');
      var desc = trigger.getAttribute('data-modal-desc');
      var btnText = trigger.getAttribute('data-modal-btn');

      // Auto-detect express audit button if no explicit attributes
      var triggerText = trigger.textContent.trim();
      if (!title && triggerText.toLowerCase().indexOf('экспресс-аудит') !== -1) {
        title = 'Записаться на экспресс-аудит';
        formType = 'Запись на экспресс-аудит';
        badge = 'Экспресс-аудит 360°';
        desc = 'Оставьте контакты — ведущий эксперт свяжется с вами для согласования удобного времени и параметров экспресс-диагностики розницы.';
        btnText = 'Записаться на экспресс-аудит';
      }

      openCallbackModal({
        title: title,
        formType: formType,
        badge: badge,
        desc: desc,
        btnText: btnText
      });
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
        var originalBtnText = submitBtn ? submitBtn.textContent : 'Заказать звонок';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Отправка заявки...';
        }

        sendServerlessLead({
          formType: currentFormType || 'Заказ обратного звонка',
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
            submitBtn.textContent = originalBtnText;
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

  // Cookie Consent & Privacy Policy Controller
  (function initCookieConsent() {
    var CONSENT_KEY = 'formulabiz_cookie_consent_accepted';
    
    // If already accepted, do not show
    try {
      if (localStorage.getItem(CONSENT_KEY) === 'true') {
        return;
      }
    } catch (e) {}

    var bar = document.getElementById('cookie-consent-bar');

    // Auto-inject if not already placed in HTML DOM
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'cookie-consent-bar';
      bar.className = 'cookie-bar';
      bar.setAttribute('aria-hidden', 'true');
      bar.setAttribute('role', 'region');
      bar.setAttribute('aria-label', 'Согласие на использование файлов cookie');
      bar.innerHTML = '<div class="cookie-bar-container">' +
        '<div class="cookie-bar-content">' +
          '<div class="cookie-bar-icon">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>' +
              '<path d="M8.5 8.5v.01"></path><path d="M7.5 15.5v.01"></path><path d="M12 12v.01"></path><path d="M11 17v.01"></path><path d="M16 16v.01"></path>' +
            '</svg>' +
          '</div>' +
          '<div class="cookie-bar-text">' +
            'Мы используем файлы cookie для удобства и аналитики. Оставаясь на сайте, вы соглашаетесь с <a href="assets/politika-obrabotki-dannyh.pdf" target="_blank" rel="noopener noreferrer" class="cookie-policy-link">Политикой обработки данных</a>.' +
          '</div>' +
        '</div>' +
        '<div class="cookie-bar-actions">' +
          '<a href="assets/politika-obrabotki-dannyh.pdf" target="_blank" rel="noopener noreferrer" class="btn btn-outline-cookie btn-sm">Ознакомиться с политикой</a>' +
          '<button type="button" id="cookie-accept-btn" class="btn btn-teal btn-sm">Принять</button>' +
          '<button type="button" id="cookie-close-btn" class="cookie-close" aria-label="Закрыть уведомление">✕</button>' +
        '</div>' +
      '</div>';
      document.body.appendChild(bar);
    }

    // Show with smooth animation after a short delay
    setTimeout(function () {
      bar.classList.add('active');
      bar.setAttribute('aria-hidden', 'false');
    }, 700);

    function hideCookieBar() {
      bar.classList.remove('active');
      bar.setAttribute('aria-hidden', 'true');
      try {
        localStorage.setItem(CONSENT_KEY, 'true');
      } catch (e) {}
    }

    var acceptBtn = bar.querySelector('#cookie-accept-btn');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', hideCookieBar);
    }

    var closeBtn = bar.querySelector('#cookie-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', hideCookieBar);
    }
  })();

  // Smooth scroll and focus highlight for Problem Chips and Pain Cards
  document.querySelectorAll('.hero-problem-tag, [data-scroll-to]').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      var targetId = this.getAttribute('data-scroll-to') || this.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        var targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          targetEl.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
          var origShadow = targetEl.style.boxShadow;
          var origBorder = targetEl.style.borderColor;
          targetEl.style.boxShadow = '0 0 0 3px rgba(79, 184, 172, 0.4), var(--shadow-card)';
          targetEl.style.borderColor = 'var(--teal)';
          setTimeout(function () {
            targetEl.style.boxShadow = origShadow;
            targetEl.style.borderColor = origBorder;
          }, 2000);
        }
      }
    });
  });

  // Hero Master Mode Switcher (Operating Store vs Turnkey Launch)
  (function initMasterModeSwitcher() {
    // Default page mode: operating store
    document.body.setAttribute('data-page-mode', 'operating');

    function setPageMode(mode) {
      document.body.setAttribute('data-page-mode', mode);

      var switchBtns = document.querySelectorAll('.mode-switch-btn');
      switchBtns.forEach(function (b) {
        if (b.getAttribute('data-hero-mode') === mode) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      var operatingTitle = document.getElementById('hero-title-operating');
      var launchTitle = document.getElementById('hero-title-launch');
      var tagsOperating = document.getElementById('hero-tags-operating');
      var tagsLaunch = document.getElementById('hero-tags-launch');

      if (mode === 'launch') {
        if (operatingTitle) operatingTitle.style.display = 'none';
        if (launchTitle) launchTitle.style.display = 'block';
        if (tagsOperating) tagsOperating.style.display = 'none';
        if (tagsLaunch) tagsLaunch.style.display = 'flex';
      } else {
        if (operatingTitle) operatingTitle.style.display = 'block';
        if (launchTitle) launchTitle.style.display = 'none';
        if (tagsOperating) tagsOperating.style.display = 'flex';
        if (tagsLaunch) tagsLaunch.style.display = 'none';
      }
    }

    document.querySelectorAll('.mode-switch-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = this.getAttribute('data-hero-mode');
        setPageMode(mode);
      });
    });

    // Cross-mode links (e.g. from banners)
    document.querySelectorAll('[data-switch-to-mode]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        var mode = this.getAttribute('data-switch-to-mode');
        setPageMode(mode);
        var targetId = this.getAttribute('data-scroll-to') || (mode === 'launch' ? '#turnkey-store' : '#pain-navigator');
        var targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  })();

  // Compact Symptom Selector Matrix (Pain Navigator)
  (function initSymptomMatrix() {
    var tabs = document.querySelectorAll('.symptom-tab-btn');
    var views = document.querySelectorAll('.symptom-view-card');
    if (!tabs.length || !views.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        views.forEach(function (v) { v.classList.remove('active'); });

        this.classList.add('active');
        var targetId = this.getAttribute('data-symptom-target');
        var targetView = document.querySelector('.symptom-view-card[data-symptom-id="' + targetId + '"]');
        if (targetView) {
          targetView.classList.add('active');
        }
      });
    });
  })();

  // Stage Collapsible Details (10 Stages of Turnkey Launch)
  (function initStageCollapsibles() {
    document.querySelectorAll('.btn-toggle-details').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = this.closest('.launch-step-card');
        if (!card) return;
        var collapse = card.querySelector('.stage-details-collapse');
        var label = this.querySelector('span');

        if (collapse) {
          var isOpen = collapse.classList.contains('open');
          if (isOpen) {
            collapse.classList.remove('open');
            this.classList.remove('open');
            if (label) label.textContent = label.getAttribute('data-closed-text') || 'Показать состав этапа ▾';
          } else {
            collapse.classList.add('open');
            this.classList.add('open');
            if (label) label.textContent = label.getAttribute('data-opened-text') || 'Свернуть состав этапа ▴';
          }
        }
      });
    });
  })();

  // Master-Detail Controller for Optimization Program (6 Modules)
  (function initOptimizationMasterDetail() {
    var navItems = document.querySelectorAll('.module-nav-item');
    var detailPanels = document.querySelectorAll('.module-detail-panel');
    if (!navItems.length || !detailPanels.length) return;

    navItems.forEach(function (item) {
      item.addEventListener('click', function () {
        navItems.forEach(function (i) { i.classList.remove('active'); });
        detailPanels.forEach(function (p) { p.classList.remove('active'); });

        this.classList.add('active');
        var targetId = this.getAttribute('data-module-target');
        var targetPanel = document.querySelector('.module-detail-panel[data-module-id="' + targetId + '"]');
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });
  })();

  // 10 Stages Phase Tabs Filter
  (function initRoadmapTabs() {
    var phaseBtns = document.querySelectorAll('.phase-tab-btn');
    if (!phaseBtns.length) return;

    var stageCards = document.querySelectorAll('.launch-timeline-grid .launch-step-card');

    phaseBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        phaseBtns.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        var filter = this.getAttribute('data-phase-filter');

        stageCards.forEach(function (card) {
          var cardPhase = card.getAttribute('data-phase');
          if (filter === 'all' || cardPhase === filter) {
            card.removeAttribute('data-hidden');
            card.style.opacity = '0';
            card.style.transform = 'scale(0.96)';
            setTimeout(function () {
              card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            }, 50);
          } else {
            card.setAttribute('data-hidden', 'true');
          }
        });
      });
    });
  })();

});



