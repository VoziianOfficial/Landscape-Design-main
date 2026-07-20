<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, bool $success, string $message, array $errors = []): never
{
    http_response_code($status);
    echo json_encode(
        ['success' => $success, 'message' => $message, 'errors' => $errors],
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
    );
    exit;
}

function string_length(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function text_value(string $key, int $maxLength): string
{
    $value = isset($_POST[$key]) && is_string($_POST[$key]) ? trim($_POST[$key]) : '';
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '';
    if (string_length($value) > $maxLength) {
        respond(422, false, 'Please review the form and shorten the highlighted information.', [$key => 'This value is too long.']);
    }
    return $value;
}

function is_allowed(string $value, array $allowed, bool $optional = true): bool
{
    return ($optional && $value === '') || in_array($value, $allowed, true);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'This endpoint accepts contact form submissions only.');
}

$configPath = __DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'site.json';
$configJson = is_readable($configPath) ? file_get_contents($configPath) : false;
$config = $configJson !== false ? json_decode($configJson, true) : null;

if (!is_array($config)) {
    respond(500, false, 'The contact service is not configured correctly.');
}

$identityConfig = is_array($config['siteIdentity'] ?? null) ? $config['siteIdentity'] : [];
$brandName = trim((string) ($identityConfig['brandName'] ?? $config['brandName'] ?? $config['brand']['name'] ?? 'Verdeon'));
$legalName = trim((string) ($identityConfig['legalName'] ?? $config['legalName'] ?? $config['brand']['legalName'] ?? $brandName));
$recipient = trim((string) ($identityConfig['email'] ?? $config['email'] ?? $config['contact']['email'] ?? ''));
$identity = [
    'brandName' => $brandName,
    'legalName' => $legalName,
    'email' => $recipient,
    'addressLine1' => trim((string) ($identityConfig['addressLine1'] ?? $config['addressLine1'] ?? $config['contact']['addressLine1'] ?? '')),
    'cityStateZip' => trim((string) ($identityConfig['cityStateZip'] ?? $config['cityStateZip'] ?? $config['contact']['cityStateZip'] ?? '')),
    'country' => trim((string) ($identityConfig['country'] ?? $config['country'] ?? $config['contact']['country'] ?? '')),
];

function identity_text(string $value, array $identity): string
{
    return strtr($value, [
        'Verdeon Design Network LLC' => $identity['legalName'],
        '1847 Cedar Grove Avenue, Suite 210' => $identity['addressLine1'],
        'Portland, OR 97205' => $identity['cityStateZip'],
        'support@verdeon.com' => $identity['email'],
        'United States' => $identity['country'],
        'Verdeon' => $identity['brandName'],
    ]);
}

if (!filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
    respond(500, false, 'The contact service is not configured correctly.');
}

$fullName = text_value('fullName', 100);
$email = text_value('email', 190);
$inquiryType = text_value('inquiryType', 80);
$service = text_value('service', 100);
$propertyType = text_value('propertyType', 60);
$projectStage = text_value('projectStage', 80);
$budgetRange = text_value('budgetRange', 40);
$message = text_value('message', 3000);
$privacyConsent = text_value('privacyConsent', 10);
$sourcePage = text_value('sourcePage', 160);
$honeypot = text_value('company', 160);
$formStartedAt = text_value('formStartedAt', 24);

if ($honeypot !== '') {
    respond(422, false, 'The submission could not be accepted.');
}

$startedMilliseconds = ctype_digit($formStartedAt) ? (int) $formStartedAt : 0;
$elapsedMilliseconds = (int) round(microtime(true) * 1000) - $startedMilliseconds;
if ($startedMilliseconds < 1 || $elapsedMilliseconds < 3000 || $elapsedMilliseconds > 7200000) {
    respond(422, false, 'The form session expired or was submitted too quickly. Please review the form and try again.');
}

$errors = [];
if (string_length($fullName) < 2) {
    $errors['fullName'] = 'Enter your full name.';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email)) {
    $errors['email'] = 'Enter a valid email address.';
}

$allowedInquiryTypes = array_values(array_filter($config['form']['inquiryOptions'] ?? [], 'is_string'));
$allowedPropertyTypes = array_values(array_filter($config['form']['propertyOptions'] ?? [], 'is_string'));
$allowedProjectStages = array_values(array_filter($config['form']['stageOptions'] ?? [], 'is_string'));
$allowedBudgetRanges = array_values(array_filter($config['form']['budgetOptions'] ?? [], 'is_string'));
$allowedServices = [];
foreach (($config['services'] ?? []) as $serviceConfig) {
    if (is_array($serviceConfig) && isset($serviceConfig['slug']) && is_string($serviceConfig['slug'])) {
        $allowedServices[] = $serviceConfig['slug'];
    }
}

if (!is_allowed($inquiryType, $allowedInquiryTypes, false)) {
    $errors['inquiryType'] = 'Select a valid inquiry type.';
}
if ($inquiryType === 'Landscape Design Information' && !is_allowed($service, $allowedServices, false)) {
    $errors['service'] = 'Select a valid landscape design option.';
} elseif (!is_allowed($service, $allowedServices, true)) {
    $errors['service'] = 'Select a valid landscape design option.';
}
if (!is_allowed($propertyType, $allowedPropertyTypes, true)) {
    $errors['propertyType'] = 'Select a valid property type.';
}
if (!is_allowed($projectStage, $allowedProjectStages, true)) {
    $errors['projectStage'] = 'Select a valid project stage.';
}
if (!is_allowed($budgetRange, $allowedBudgetRanges, true)) {
    $errors['budgetRange'] = 'Select a valid budget range.';
}
if (string_length($message) < 20) {
    $errors['message'] = 'Provide at least 20 characters about your goals.';
}
if ($privacyConsent !== 'yes') {
    $errors['privacyConsent'] = 'Consent is required so ' . $brandName . ' can respond.';
}
if ($sourcePage === '' || preg_match('/[\r\n]/', $sourcePage)) {
    $errors['sourcePage'] = 'The source page is invalid.';
}

if ($errors !== []) {
    respond(422, false, 'Please review the highlighted fields.', $errors);
}

$safe = static fn(string $value): string => htmlspecialchars($value !== '' ? $value : 'Not provided', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$safeHeaderBrand = trim(preg_replace('/[\r\n<>]+/', '', $brandName) ?? '') ?: 'Website';
$fromDomain = substr(strrchr($recipient, '@') ?: '', 1) ?: 'example.com';
$fromEmail = 'no-reply@' . $fromDomain;
$subject = '[' . $safeHeaderBrand . '] ' . preg_replace('/[^A-Za-z0-9 &\-]/', '', $inquiryType) . ' inquiry';
$plainText = "New {$brandName} website inquiry\n\n"
    . "Name: {$fullName}\nEmail: {$email}\nInquiry type: {$inquiryType}\nService: " . ($service ?: 'Not provided')
    . "\nProperty type: " . ($propertyType ?: 'Not provided')
    . "\nProject stage: " . ($projectStage ?: 'Not provided')
    . "\nBudget range: " . ($budgetRange ?: 'Not provided')
    . "\nSource page: {$sourcePage}\n\nMessage:\n{$message}\n";

$html = '<!doctype html><html><body style="font-family:Arial,sans-serif;color:#171a17">'
    . '<h1 style="color:#1b291a">New ' . $safe($brandName) . ' website inquiry</h1>'
    . '<table cellpadding="8" cellspacing="0" style="border-collapse:collapse">'
    . '<tr><th align="left">Name</th><td>' . $safe($fullName) . '</td></tr>'
    . '<tr><th align="left">Email</th><td>' . $safe($email) . '</td></tr>'
    . '<tr><th align="left">Inquiry type</th><td>' . $safe($inquiryType) . '</td></tr>'
    . '<tr><th align="left">Service</th><td>' . $safe($service) . '</td></tr>'
    . '<tr><th align="left">Property type</th><td>' . $safe($propertyType) . '</td></tr>'
    . '<tr><th align="left">Project stage</th><td>' . $safe($projectStage) . '</td></tr>'
    . '<tr><th align="left">Budget range</th><td>' . $safe($budgetRange) . '</td></tr>'
    . '<tr><th align="left">Source page</th><td>' . $safe($sourcePage) . '</td></tr>'
    . '</table><h2>Message</h2><p>' . nl2br($safe($message), false) . '</p></body></html>';

$boundary = 'verdeon_' . bin2hex(random_bytes(12));
$headers = [
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
    'From: ' . $safeHeaderBrand . ' Website <' . $fromEmail . '>',
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . PHP_VERSION,
];

$body = '--' . $boundary . "\r\n"
    . "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n"
    . $plainText . "\r\n--" . $boundary . "\r\n"
    . "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n"
    . $html . "\r\n--" . $boundary . "--\r\n";

$sent = @mail($recipient, $subject, $body, implode("\r\n", $headers));
if (!$sent) {
    respond(502, false, 'The server could not send your request. Your entries remain available in the form; please try again or email ' . $recipient . '.');
}

$successMessage = identity_text(
    (string) ($config['form']['success'] ?? "Thank you. Your request was sent to {$brandName}."),
    $identity
);

respond(200, true, $successMessage);
