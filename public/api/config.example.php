<?php
// Copy to config.php on the server and fill in the hosting's MySQL credentials.
// config.php is not in git and is denied over HTTP by api/.htaccess.
return [
    'db' => [
        'host' => 'localhost',
        'port' => 3306,
        'name' => 'zell_site',
        'user' => 'zell_site',
        'pass' => 'change-me',
    ],
];
