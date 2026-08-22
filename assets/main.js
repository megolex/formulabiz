// Формула Бизнеса — shared behaviours

document.addEventListener('DOMContentLoaded', function () {
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
});
