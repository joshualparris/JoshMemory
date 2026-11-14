import { createHash } from 'node:crypto';
let input = '';
for await (const chunk of process.stdin) input += chunk;
const value = input.trim();
if (!value || value.length > 254) process.exit(1);
console.log(createHash('sha256').update(value).digest('hex').slice(0, 16));
