const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. REFACTOR #pain-navigator into COMPACT SYMPTOM MATRIX
const oldPainNavigatorRegex = /<!-- SECTION: PAIN NAVIGATOR[\s\S]*?<!-- SECTION: TURNKEY STORE/;

const newPainNavigatorHtml = `<!-- SECTION: PAIN NAVIGATOR (Интерактивная матрица симптомов) -->
<div class="mode-operating-only">
<section class="section section-alt" id="pain-navigator">
  <div class="container">
    <div style="text-align:center; max-width:780px; margin:0 auto 24px;">
      <div class="eyebrow">От симптома к решению</div>
      <h2 style="font-size:2.3rem;">С какой проблемой столкнулся ваш магазин?</h2>
      <p style="font-size:1.02rem;">Собственники розницы не ищут теорию: они ищут выход из конкретных тупиков. Выберите ваш симптом — покажем точную причину и регламент решения:</p>
    </div>

    <!-- Symptom Selector Tabs -->
    <div class="symptom-tabs-wrap reveal-on-scroll">
      <button type="button" class="symptom-tab-btn active" data-symptom-target="pain-cashgap">
        <span class="pulse-dot"></span> 💸 Кассовый разрыв
      </button>
      <button type="button" class="symptom-tab-btn" data-symptom-target="pain-deadstock">
        <span class="pulse-dot teal"></span> 📦 Зависший неликвид
      </button>
      <button type="button" class="symptom-tab-btn" data-symptom-target="pain-staff">
        <span>👥 Текучка & лень персонала</span>
      </button>
      <button type="button" class="symptom-tab-btn" data-symptom-target="pain-mart">
        <span class="pulse-dot"></span> ⚖️ Проверки МАРТ (№ 713)
      </button>
      <button type="button" class="symptom-tab-btn" data-symptom-target="pain-sync">
        <span>🖥 Хаос в 1С и кассах</span>
      </button>
      <button type="button" class="symptom-tab-btn" data-symptom-target="pain-complaints">
        <span>💢 Жалобы и Книга замечаний</span>
      </button>
    </div>

    <!-- Dynamic Symptom View Panel -->
    <div class="symptom-detail-panel active reveal-on-scroll" id="pain-active-panel">
      
      <!-- 1. Cash Gap -->
      <div class="symptom-view-card active" data-symptom-id="pain-cashgap">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
          <div>
            <span class="pain-badge critical" style="margin-bottom:6px;"><span class="pulse-dot"></span> Угроза бизнесу · Финансовый тупик</span>
            <h3 style="font-size:1.45rem; margin:0;">Кассовый разрыв: выручка в кассе есть, а платить поставщикам нечем</h3>
          </div>
          <span style="font-size:.85rem; color:var(--muted); font-weight:700;">Решение за 14–21 день</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px; margin-bottom:20px;">
          <div style="background:var(--bg-alt); padding:16px; border-radius:var(--radius-sm); border-left:3px solid #ff4757;">
            <div style="font-weight:700; font-size:.84rem; color:#7a1c25; margin-bottom:6px;">Симптомы в магазине:</div>
            <ul style="margin:0; padding-left:18px; font-size:.86rem; color:var(--text); line-height:1.45;">
              <li>Поставщики звонят с претензиями и грозят остановкой отгрузок</li>
              <li>Собственник докладывает личные сбережения или берёт кредиты</li>
              <li>Прибыль на бумаге есть, но на расчетном счете пусто</li>
            </ul>
          </div>
          <div style="background:#E8F8F7; padding:16px; border-radius:var(--radius-sm); border-left:3px solid var(--teal-dark);">
            <div style="font-weight:700; font-size:.84rem; color:#0d5954; margin-bottom:6px;">Системное решение «Формулы Бизнеса»:</div>
            <p style="margin:0; font-size:.86rem; color:var(--navy); line-height:1.45;">Внедряем <strong>Блок 2.1 «Создание системы фондов»</strong>: разделение финансовой выручки на фонды (аренда, налоги, закупка, зарплата), оцифровка ежедневного ДДС и жёсткий платёжный календарь с отсрочками.</p>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; border-top:1px solid var(--line); padding-top:16px;">
          <div>
            <span style="font-size:.88rem; color:var(--navy); font-weight:700;">Оцифрованный результат:</span>
            <span style="font-size:.88rem; color:var(--muted);"> ликвидация кассовых разрывов и создание неснижаемого резервного фонда.</span>
          </div>
          <button type="button" class="btn btn-teal btn-sm" data-open-modal="callback-modal" data-modal-title="Ликвидация кассового разрыва" data-modal-form-type="Боль: Кассовый разрыв (система фондов)" data-modal-badge="Кассовый разрыв" data-modal-desc="Оставьте номер — ведущий эксперт перезвонит для экспресс-разбора вашей финансовой модели." data-modal-btn="Устранить кассовый разрыв">Устранить кассовый разрыв →</button>
        </div>
      </div>

      <!-- 2. Dead Stock -->
      <div class="symptom-view-card" data-symptom-id="pain-deadstock">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
          <div>
            <span class="pain-badge critical" style="margin-bottom:6px;"><span class="pulse-dot teal"></span> Заморозка оборотных средств</span>
            <h3 style="font-size:1.45rem; margin:0;">Зависший неликвид: склад забит товаром, а денег на свежие закупки нет</h3>
          </div>
          <span style="font-size:.85rem; color:var(--muted); font-weight:700;">Возврат до 35% денег со склада</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px; margin-bottom:20px;">
          <div style="background:var(--bg-alt); padding:16px; border-radius:var(--radius-sm); border-left:3px solid #ff4757;">
            <div style="font-weight:700; font-size:.84rem; color:#7a1c25; margin-bottom:6px;">Симптомы в магазине:</div>
            <ul style="margin:0; padding-left:18px; font-size:.86rem; color:var(--text); line-height:1.45;">
              <li>Полки заставлены позициями, которые не продаются месяцами</li>
              <li>Сроки годности подходят к критическим, риск списаний в убыток</li>
              <li>Нет свободных денег закупить маржинальные ходовые новинки</li>
            </ul>
          </div>
          <div style="background:#E8F8F7; padding:16px; border-radius:var(--radius-sm); border-left:3px solid var(--teal-dark);">
            <div style="font-weight:700; font-size:.84rem; color:#0d5954; margin-bottom:6px;">Системное решение «Формулы Бизнеса»:</div>
            <p style="margin:0; font-size:.86rem; color:var(--navy); line-height:1.45;">Внедряем <strong>Блок 2.2 «Ассортимент и неликвид»</strong>: ABC/XYZ-анализ матрицы, пакетные бандлы, календарь распродаж и внедрение правила обязательной ротации полок FIFO.</p>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; border-top:1px solid var(--line); padding-top:16px;">
          <div>
            <span style="font-size:.88rem; color:var(--navy); font-weight:700;">Оцифрованный результат:</span>
            <span style="font-size:.88rem; color:var(--muted);"> высвобождение от 15 000 до 60 000 BYN «застрявших» денег в оборот.</span>
          </div>
          <button type="button" class="btn btn-teal btn-sm" data-open-modal="callback-modal" data-modal-title="Зачистка склада от неликвида" data-modal-form-type="Боль: Зависший неликвид (высвобождение денег)" data-modal-badge="Зачистка неликвида" data-modal-desc="Оставьте номер — проведём экспресс-анализ матрицы и составим план распродажи стока." data-modal-btn="Высвободить деньги со склада">Высвободить деньги со склада →</button>
        </div>
      </div>

      <!-- 3. Personnel -->
      <div class="symptom-view-card" data-symptom-id="pain-staff">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
          <div>
            <span class="pain-badge warning" style="margin-bottom:6px;">Потери на кассе · Человеческий фактор</span>
            <h3 style="font-size:1.45rem; margin:0;">Персонал: лень, текучка, недостачи и слив покупателей</h3>
          </div>
          <span style="font-size:.85rem; color:var(--muted); font-weight:700;">Рост среднего чека на 18–30%</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px; margin-bottom:20px;">
          <div style="background:var(--bg-alt); padding:16px; border-radius:var(--radius-sm); border-left:3px solid #f39c12;">
            <div style="font-weight:700; font-size:.84rem; color:#935116; margin-bottom:6px;">Симптомы в магазине:</div>
            <ul style="margin:0; padding-left:18px; font-size:.86rem; color:var(--text); line-height:1.45;">
              <li>Продавцы сидят в смартфонах, не здороваются и не делают допродаж</li>
              <li>При инвентаризации регулярно вылезают необъяснимые недостачи</li>
              <li>Собственник вынужден сам стоять за кассой или контролировать каждый шаг</li>
            </ul>
          </div>
          <div style="background:#E8F8F7; padding:16px; border-radius:var(--radius-sm); border-left:3px solid var(--teal-dark);">
            <div style="font-weight:700; font-size:.84rem; color:#0d5954; margin-bottom:6px;">Системное решение «Формулы Бизнеса»:</div>
            <p style="margin:0; font-size:.86rem; color:var(--navy); line-height:1.45;">Внедряем <strong>Блок 2.3 «Персонал и стандарты»</strong>: настольная книга «Шпаргалки продавца», ежедневные чек-листы смен, прозрачные KPI от маржи и система быстрой адаптации новичков за 3 дня.</p>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; border-top:1px solid var(--line); padding-top:16px;">
          <div>
            <span style="font-size:.88rem; color:var(--navy); font-weight:700;">Оцифрованный результат:</span>
            <span style="font-size:.88rem; color:var(--muted);"> автономная дисциплина, исключение воровства и рост выручки с одного чека.</span>
          </div>
          <button type="button" class="btn btn-teal btn-sm" data-open-modal="callback-modal" data-modal-title="Внедрение стандартов персонала и KPI" data-modal-form-type="Боль: Персонал и KPI (Шпаргалки продавца)" data-modal-badge="Персонал и продажи" data-modal-desc="Оставьте контакты — вышлем пример книги стандартов «Шпаргалки продавца»." data-modal-btn="Настроить работу персонала">Настроить работу персонала →</button>
        </div>
      </div>

      <!-- 4. MART & 713 -->
      <div class="symptom-view-card" data-symptom-id="pain-mart">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
          <div>
            <span class="pain-badge critical" style="margin-bottom:6px;"><span class="pulse-dot"></span> Риск блокировки · МАРТ РБ</span>
            <h3 style="font-size:1.45rem; margin:0;">Проверки МАРТ: страх штрафов по Постановлению № 713</h3>
          </div>
          <span style="font-size:.85rem; color:var(--muted); font-weight:700;">100% юридическая защита</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px; margin-bottom:20px;">
          <div style="background:var(--bg-alt); padding:16px; border-radius:var(--radius-sm); border-left:3px solid #ff4757;">
            <div style="font-weight:700; font-size:.84rem; color:#7a1c25; margin-bottom:6px;">Симптомы в магазине:</div>
            <ul style="margin:0; padding-left:18px; font-size:.86rem; color:var(--text); line-height:1.45;">
              <li>Цены в 1С формируются вручную или «на глаз» товароведами</li>
              <li>Нет уверенности, что предельные торговые надбавки МАРТ не превышены</li>
              <li>Отсутствуют обязательные протоколы согласования цен или обоснования скидок</li>
            </ul>
          </div>
          <div style="background:#E8F8F7; padding:16px; border-radius:var(--radius-sm); border-left:3px solid var(--teal-dark);">
            <div style="font-weight:700; font-size:.84rem; color:#0d5954; margin-bottom:6px;">Системное решение «Формулы Бизнеса»:</div>
            <p style="margin:0; font-size:.86rem; color:var(--navy); line-height:1.45;">Внедряем <strong>Блок 2.2 и Блок 2.4 «Юридический щит»</strong>: жесткая автоматическая настройка предельных наценок в 1С, регламент входного контроля накладных и аудит Уголка покупателя.</p>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; border-top:1px solid var(--line); padding-top:16px;">
          <div>
            <span style="font-size:.88rem; color:var(--navy); font-weight:700;">Оцифрованный результат:</span>
            <span style="font-size:.88rem; color:var(--muted);"> нулевой риск штрафов (до 500 БВ) и спокойный сон собственника перед проверками.</span>
          </div>
          <button type="button" class="btn btn-teal btn-sm" data-open-modal="callback-modal" data-modal-title="Аудит ценообразования по Пост. № 713" data-modal-form-type="Боль: МАРТ и Постановление № 713 (Аудит 1С)" data-modal-badge="Защита МАРТ" data-modal-desc="Оставьте контакты — юрист проверит соответствие ваших наценок Постановлению № 713." data-modal-btn="Защитить магазин от проверок">Защитить магазин от проверок →</button>
        </div>
      </div>

      <!-- 5. 1C Sync -->
      <div class="symptom-view-card" data-symptom-id="pain-sync">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
          <div>
            <span class="pain-badge warning" style="margin-bottom:6px;">Технический хаос · Непрозрачность</span>
            <h3 style="font-size:1.45rem; margin:0;">Хаос в 1С и кассах: остатки не сходятся, сканеры глючат, GLN/EDI сбоит</h3>
          </div>
          <span style="font-size:.85rem; color:var(--muted); font-weight:700;">Сквозная синхронизация 1С</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px; margin-bottom:20px;">
          <div style="background:var(--bg-alt); padding:16px; border-radius:var(--radius-sm); border-left:3px solid #f39c12;">
            <div style="font-weight:700; font-size:.84rem; color:#935116; margin-bottom:6px;">Симптомы в магазине:</div>
            <ul style="margin:0; padding-left:18px; font-size:.86rem; color:var(--text); line-height:1.45;">
              <li>В программе товар числится, а на полке физически отсутствует</li>
              <li>Сбои электронных накладных (EDI) и маркировки «Электронный знак»</li>
              <li>Кассиры по 5 минут пробивают одну позицию, создавая нервные очереди</li>
            </ul>
          </div>
          <div style="background:#E8F8F7; padding:16px; border-radius:var(--radius-sm); border-left:3px solid var(--teal-dark);">
            <div style="font-weight:700; font-size:.84rem; color:#0d5954; margin-bottom:6px;">Системное решение «Формулы Бизнеса»:</div>
            <p style="margin:0; font-size:.86rem; color:var(--navy); line-height:1.45;">Внедряем <strong>Блок 2.5 «Кассовые и учетные программы»</strong>: отладка синхронизации 1С с КСА и терминалами, калибровка 2D-сканеров, бесшовная интеграция с EDI и регламент оприходования.</p>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; border-top:1px solid var(--line); padding-top:16px;">
          <div>
            <span style="font-size:.88rem; color:var(--navy); font-weight:700;">Оцифрованный результат:</span>
            <span style="font-size:.88rem; color:var(--muted);"> 100% точность остатков, скорость обслуживания чека до 30 секунд.</span>
          </div>
          <button type="button" class="btn btn-teal btn-sm" data-open-modal="callback-modal" data-modal-title="Настройка 1С, EDI и кассового узла" data-modal-form-type="Боль: Хаос в 1С и кассовом оборудовании" data-modal-badge="Настройка 1С" data-modal-desc="Оставьте номер — IT-инженер проконсультирует по синхронизации касс и 1С." data-modal-btn="Навести порядок в 1С">Навести порядок в 1С →</button>
        </div>
      </div>

      <!-- 6. Complaints -->
      <div class="symptom-view-card" data-symptom-id="pain-complaints">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
          <div>
            <span class="pain-badge warning" style="margin-bottom:6px;">Репутация & Проверки исполкома</span>
            <h3 style="font-size:1.45rem; margin:0;">Скандалы и Книга замечаний: потребительский экстремизм</h3>
          </div>
          <span style="font-size:.85rem; color:var(--muted); font-weight:700;">Правовые алгоритмы защиты</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px; margin-bottom:20px;">
          <div style="background:var(--bg-alt); padding:16px; border-radius:var(--radius-sm); border-left:3px solid #f39c12;">
            <div style="font-weight:700; font-size:.84rem; color:#935116; margin-bottom:6px;">Симптомы в магазине:</div>
            <ul style="margin:0; padding-left:18px; font-size:.86rem; color:var(--text); line-height:1.45;">
              <li>Покупатели требуют жалобную книгу по малейшему поводу</li>
              <li>Продавцы вступают в перепалки и хамят в ответ, усугубляя конфликт</li>
              <li>Риск внеплановой проверки райисполкома по каждой неотвеченной записи</li>
            </ul>
          </div>
          <div style="background:#E8F8F7; padding:16px; border-radius:var(--radius-sm); border-left:3px solid var(--teal-dark);">
            <div style="font-weight:700; font-size:.84rem; color:#0d5954; margin-bottom:6px;">Системное решение «Формулы Бизнеса»:</div>
            <p style="margin:0; font-size:.86rem; color:var(--navy); line-height:1.45;">Внедряем <strong>Блок 2.6 «Работа с претензиями»</strong>: пошаговый алгоритм гашения конфликтов на кассе, правила ведения Книги замечаний и предложений и юридически безупречные шаблоны официальных ответов.</p>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; border-top:1px solid var(--line); padding-top:16px;">
          <div>
            <span style="font-size:.88rem; color:var(--navy); font-weight:700;">Оцифрованный результат:</span>
            <span style="font-size:.88rem; color:var(--muted);"> 95% претензий закрываются на месте, ноль предписаний от исполкома.</span>
          </div>
          <button type="button" class="btn btn-teal btn-sm" data-open-modal="callback-modal" data-modal-title="Алгоритмы работы с жалобами и Книгой замечаний" data-modal-form-type="Боль: Жалобы и Книга замечаний" data-modal-badge="Антиконфликт" data-modal-desc="Оставьте контакты — предоставим регламент нейтрализации конфликтов в торговом зале." data-modal-btn="Внедрить регламент защиты">Внедрить регламент защиты →</button>
        </div>
      </div>

    </div>
  </div>
</section>
`;

if (oldPainNavigatorRegex.test(html)) {
  html = html.replace(oldPainNavigatorRegex, newPainNavigatorHtml + '\n\n<!-- SECTION: TURNKEY STORE');
  console.log('Successfully replaced #pain-navigator with compact Symptom Matrix');
} else {
  console.error('oldPainNavigatorRegex did not match');
}

fs.writeFileSync('index.html', html, 'utf8');
