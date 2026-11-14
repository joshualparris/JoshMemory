<?php
$domain = trim(stream_get_contents(STDIN));
$personal = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com'];
if (!$domain || strlen($domain) > 253) { exit(1); }
echo in_array($domain, $personal, true) ? 'personal-provider' : 'other-domain';
echo "\n";
