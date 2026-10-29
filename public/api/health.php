<?php
// GET /api/health.php — checks that PHP runs and MySQL answers.
declare(strict_types=1);
require __DIR__ . '/_db.php';

try {
    $version = db()->query('SELECT VERSION() AS v')->fetch()['v'];
    json_out(['ok' => true, 'php' => PHP_VERSION, 'mysql' => $version]);
} catch (Throwable $e) {
    json_out(['ok' => false, 'php' => PHP_VERSION, 'error' => 'database unavailable'], 503);
}
