<?php
/**
 * Формула Бизнеса — Обработчик отправки заявок на Email
 * Email назначения: formula.consalt@gmail.com
 */

// Заголовки CORS и JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

// Получаем тело запроса
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    $data = $_POST;
}

$to = 'formula.consalt@gmail.com';
$formType = isset($data['formType']) ? trim($data['formType']) : 'Заявка с сайта';
$name = isset($data['name']) ? trim($data['name']) : 'Не указано';
$phone = isset($data['phone']) ? trim($data['phone']) : 'Не указан';
$email = isset($data['email']) ? trim($data['email']) : '';
$comment = isset($data['comment']) ? trim($data['comment']) : '';
$details = isset($data['details']) ? trim($data['details']) : '';
$pageUrl = isset($data['url']) ? trim($data['url']) : (isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : 'Сайт formulabiz.by');
$date = date('d.m.Y H:i:s');
$userIp = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '—';

// Валидация минимальных полей
if ((empty($phone) || $phone === 'Не указан') && empty($email)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Заполните обязательные поля']);
    exit;
}

// Тема письма
$subject = '🔥 Новая заявка: ' . $formType . ' — ' . $name . ' (' . $phone . ')';
$subjectEncoded = '=?UTF-8?B?' . base64_encode($subject) . '?=';

// Формируем HTML-тело письма
$htmlBody = '
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background-color: #f5f7f8; margin: 0; padding: 24px; color: #131c28; }
  .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(14,34,69,0.08); border: 1px solid #dce3e8; }
  .header { background: #0E2245; color: #ffffff; padding: 24px; text-align: left; }
  .header h2 { margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; }
  .header p { margin: 6px 0 0 0; color: #4FB8AC; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  .content { padding: 24px; }
  .field-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  .field-table td { padding: 12px 10px; border-bottom: 1px solid #edf1f3; font-size: 15px; vertical-align: top; }
  .field-label { width: 35%; color: #59677a; font-weight: 600; }
  .field-val { color: #131c28; font-weight: 500; }
  .field-val strong { color: #0E2245; font-size: 16px; }
  .phone-link { color: #0E2245; font-weight: 700; font-size: 17px; text-decoration: none; background: #e4f5f2; padding: 4px 10px; border-radius: 6px; display: inline-block; }
  .details-box { background: #f5f7f8; border-radius: 8px; padding: 12px 16px; margin-top: 12px; font-size: 14px; line-height: 1.5; color: #26406e; white-space: pre-wrap; }
  .footer { background: #fafbfc; padding: 16px 24px; font-size: 12px; color: #8a96a3; border-top: 1px solid #edf1f3; }
</style>
</head>
<body>
  <div class="card">
    <div class="header">
      <p>Формула Бизнеса · Консалтинг для ритейла</p>
      <h2>' . htmlspecialchars($formType) . '</h2>
    </div>
    <div class="content">
      <table class="field-table">
        <tr>
          <td class="field-label">👤 Имя клиента:</td>
          <td class="field-val"><strong>' . htmlspecialchars($name) . '</strong></td>
        </tr>
        <tr>
          <td class="field-label">📞 Телефон:</td>
          <td class="field-val"><a class="phone-link" href="tel:' . preg_replace('/[^\d\+]/', '', $phone) . '">' . htmlspecialchars($phone) . '</a></td>
        </tr>';

if (!empty($email)) {
    $htmlBody .= '
        <tr>
          <td class="field-label">✉️ Email:</td>
          <td class="field-val"><a href="mailto:' . htmlspecialchars($email) . '">' . htmlspecialchars($email) . '</a></td>
        </tr>';
}

if (!empty($comment)) {
    $htmlBody .= '
        <tr>
          <td class="field-label">💬 Комментарий:</td>
          <td class="field-val">' . nl2br(htmlspecialchars($comment)) . '</td>
        </tr>';
}

if (!empty($details)) {
    $htmlBody .= '
        <tr>
          <td class="field-label">📊 Ответы / Данные:</td>
          <td class="field-val"><div class="details-box">' . nl2br(htmlspecialchars($details)) . '</div></td>
        </tr>';
}

$htmlBody .= '
        <tr>
          <td class="field-label">🌐 Страница:</td>
          <td class="field-val"><a href="' . htmlspecialchars($pageUrl) . '" target="_blank" style="color:#379487; text-decoration:underline;">' . htmlspecialchars($pageUrl) . '</a></td>
        </tr>
        <tr>
          <td class="field-label">⏱ Время:</td>
          <td class="field-val">' . $date . '</td>
        </tr>
      </table>
    </div>
    <div class="footer">
      Сообщение отправлено автоматически с формы на сайте formulabiz.by (IP: ' . htmlspecialchars($userIp) . ')
    </div>
  </div>
</body>
</html>';

// Заголовки письма
$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-type: text/html; charset=utf-8';
$headers[] = 'From: =?UTF-8?B?' . base64_encode('Формула Бизнеса') . '?= <info@formulabiz.by>';
if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $headers[] = 'Reply-To: ' . $email;
} else {
    $headers[] = 'Reply-To: info@formulabiz.by';
}
$headers[] = 'X-Mailer: PHP/' . phpversion();

$headerStr = implode("\r\n", $headers);

// Отправка через встроенную функцию mail()
$sent = @mail($to, $subjectEncoded, $htmlBody, $headerStr, '-f info@formulabiz.by');
if (!$sent) {
    $sent = @mail($to, $subjectEncoded, $htmlBody, $headerStr);
}

if ($sent) {
    echo json_encode(['success' => true, 'message' => 'Lead sent to ' . $to]);
} else {
    // В случае если mail() отключен в php.ini, возвращаем fallback
    echo json_encode(['success' => false, 'error' => 'PHP mail() dispatch failed', 'fallback' => true]);
}
