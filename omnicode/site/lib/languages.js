'use strict';
// OmniCode's first portable IR is EMIT(value). This lowers one canonical
// specification to 50 language-specific PROGRAMS. "generated" != "executed".
// Input is constrained to a harmless ASCII demo payload; templates do not
// evaluate submitted code. Only the explicitly marked local interpreters run.
const vm = require('node:vm');
const q = s => JSON.stringify(s);
const s = s => "'" + s.replace(/'/g, "''") + "'";
const py = s => q(s); // ASCII-only literals, safe in the supported syntaxes.
function bfEncode(message) {
  let previous = 0;
  let code = '';
  for (const ch of message) {
    const point = ch.charCodeAt(0);
    const diff = point - previous;
    code += (diff > 0 ? '+'.repeat(diff) : '-'.repeat(-diff)) + '.';
    previous = point;
  }
  return code;
}
function bfRun(program, maxInstructions = 50000) {
  const tape = new Uint8Array(30000);
  let ptr = 0, ip = 0, steps = 0, output = '';
  const jumps = new Map(), stack = [];
  for (let i = 0; i < program.length; i++) {
    if (program[i] === '[') stack.push(i);
    if (program[i] === ']') { if (!stack.length) throw Error('Unbalanced Brainfuck brackets'); const x = stack.pop(); jumps.set(i,x); jumps.set(x,i); }
  }
  if (stack.length) throw Error('Unbalanced Brainfuck brackets');
  while (ip < program.length) {
    if (++steps > maxInstructions) throw Error('Brainfuck instruction limit');
    switch (program[ip]) {
      case '>': if (++ptr === tape.length) throw Error('Tape boundary'); break;
      case '<': if (--ptr < 0) throw Error('Tape boundary'); break;
      case '+': tape[ptr]++; break;
      case '-': tape[ptr]--; break;
      case '.': output += String.fromCharCode(tape[ptr]); break;
      case '[': if (!tape[ptr]) ip = jumps.get(ip); break;
      case ']': if (tape[ptr]) ip = jumps.get(ip); break;
    }
    ip++;
  }
  return output;
}
function befungeEncode(message) {
  if (message.includes('"')) throw Error('Unsupported Befunge input');
  return '>"' + [...message].reverse().join('') + '"' + ','.repeat(message.length) + '@';
}
// A deliberately small subset of Befunge-98 used by the generated straight-line
// program. This is NOT advertised as a complete Befunge-98 implementation.
function befungeRun(program, maxInstructions = 500) {
  let stringMode = false, ip = 0, steps = 0, output = '';
  const stack = [];
  while (ip < program.length && ++steps < maxInstructions) {
    const ch = program[ip++];
    if (ch === '"') { stringMode = !stringMode; continue; }
    if (stringMode) { stack.push(ch.charCodeAt(0)); continue; }
    if (ch === '>') continue;
    if (ch === ',') { output += String.fromCharCode(stack.pop() || 0); continue; }
    if (ch === '@') return output;
    throw Error('Unsupported Befunge opcode');
  }
  throw Error('Befunge program did not halt');
}
const specs = [
  ['Python', 'py', m => `def main():\n    print(${py(m)})\n\nif __name__ == "__main__":\n    main()`],
  ['JavaScript', 'js', m => `console.log(${q(m)});`, 'node'],
  ['TypeScript', 'ts', m => `const message: string = ${q(m)};\nconsole.log(message);`],
  ['Go', 'go', m => `package main\nimport "fmt"\nfunc main() { fmt.Println(${q(m)}) }`],
  ['Java', 'java', m => `public class OmniStage {\n  public static void main(String[] args) { System.out.println(${q(m)}); }\n}`],
  ['Kotlin', 'kt', m => `fun main() { println(${q(m)}) }`],
  ['C', 'c', m => `#include <stdio.h>\nint main(void) { puts(${q(m)}); return 0; }`],
  ['C++', 'cpp', m => `#include <iostream>\nint main() { std::cout << ${q(m)} << '\\n'; }`],
  ['C#', 'cs', m => `using System;\nclass OmniStage { static void Main() { Console.WriteLine(${q(m)}); } }`],
  ['Rust', 'rs', m => `fn main() { println!(${q(m)}); }`],
  ['Ruby', 'rb', m => `puts ${q(m)}`],
  ['PHP', 'php', m => `<?php\necho ${q(m)}, PHP_EOL;`],
  ['Perl', 'pl', m => `use strict;\nuse warnings;\nprint ${s(m)}, "\\n";`],
  ['Bash', 'sh', m => `#!/usr/bin/env bash\nset -euo pipefail\nprintf '%s\\n' ${s(m)}`],
  ['PowerShell', 'ps1', m => `Write-Output ${s(m)}`],
  ['Lua', 'lua', m => `print(${q(m)})`],
  ['Swift', 'swift', m => `print(${q(m)})`],
  ['Dart', 'dart', m => `void main() { print(${q(m)}); }`],
  ['R', 'r', m => `cat(${q(m)}, "\\n", sep="")`],
  ['Julia', 'jl', m => `println(${q(m)})`],
  ['Haskell', 'hs', m => `main :: IO ()\nmain = putStrLn ${q(m)}`],
  ['OCaml', 'ml', m => `let () = print_endline ${q(m)}`],
  ['F#', 'fsx', m => `printfn "%s" ${q(m)}`],
  ['Elixir', 'exs', m => `IO.puts(${q(m)})`],
  ['Erlang', 'erl', m => `-module(omni_stage).\n-export([main/0]).\nmain() -> io:format("~s~n", [${q(m)}]).`],
  ['Scala', 'scala', m => `object OmniStage extends App { println(${q(m)}) }`],
  ['Clojure', 'clj', m => `(println ${q(m)})`],
  ['Common Lisp', 'lisp', m => `(format t "~a~%" ${q(m)})`],
  ['Scheme', 'scm', m => `(display ${q(m)}) (newline)`],
  ['Racket', 'rkt', m => `#lang racket\n(displayln ${q(m)})`],
  ['Tcl', 'tcl', m => `puts ${q(m)}`],
  ['AWK', 'awk', m => `BEGIN { print ${q(m)} }`],
  ['Fortran', 'f90', m => `program omni_stage\n  implicit none\n  print '(A)', ${q(m)}\nend program omni_stage`],
  ['COBOL', 'cob', m => `       IDENTIFICATION DIVISION.\n       PROGRAM-ID. OMNISTAGE.\n       PROCEDURE DIVISION.\n           DISPLAY ${q(m)}\n           STOP RUN.`],
  ['Pascal', 'pas', m => `program OmniStage;\nbegin\n  writeln(${s(m)});\nend.`],
  ['Ada', 'adb', m => `with Ada.Text_IO; use Ada.Text_IO;\nprocedure OmniStage is\nbegin\n  Put_Line(${q(m)});\nend OmniStage;`],
  ['Objective-C', 'm', m => `#import <Foundation/Foundation.h>\nint main(void) { @autoreleasepool { NSLog(@${q(m)}); } return 0; }`],
  ['Groovy', 'groovy', m => `println ${q(m)}`],
  ['Visual Basic .NET', 'vb', m => `Imports System\nModule OmniStage\n  Sub Main()\n    Console.WriteLine(${q(m)})\n  End Sub\nEnd Module`],
  ['Crystal', 'cr', m => `puts ${q(m)}`],
  ['Nim', 'nim', m => `echo ${q(m)}`],
  ['D', 'd', m => `import std.stdio;\nvoid main() { writeln(${q(m)}); }`],
  ['V', 'v', m => `fn main() { println(${s(m)}) }`],
  ['Prolog', 'plg', m => `:- initialization(main).\nmain :- writeln(${s(m)}), halt.`],
  ['Smalltalk', 'st', m => `${s(m)} displayNl.`],
  ['Fish', 'fish', m => `echo ${s(m)}`],
  ['Nushell', 'nu', m => `print ${q(m)}`],
  ['CoffeeScript', 'coffee', m => `console.log ${q(m)}`],
  ['Brainfuck', 'bf', bfEncode, 'brainfuck'],
  ['Befunge-98', 'b98', befungeEncode, 'befunge-subset'],
];
if (specs.length !== 50 || new Set(specs.map(x => x[0])).size !== 50) throw Error('Expected 50 unique language targets');
function validate(value) {
  if (typeof value !== 'string') throw Error('Expected a demo input string');
  const candidate = value.trim();
  if (!/^[a-zA-Z0-9._@+\-]{1,70}$/.test(candidate)) throw Error('Use 1–70 ASCII letters, digits or . _ @ + - characters');
  return candidate;
}
function translateOne(value, index) {
  const input = validate(value);
  const expectedOutput = 'OMNI:' + input;
  if (!Number.isInteger(index) || index < 0 || index >= specs.length) throw Error('Invalid stage index');
  const [language, ext, generate, proof] = specs[index];
  {
    const source = generate(expectedOutput);
    let status = 'translated', actualOutput = null, durationMs = null;
    if (proof) {
      const start = process.hrtime.bigint();
      if (proof === 'node') {
        const lines = [];
        vm.runInNewContext(source, { console: { log: x => lines.push(String(x)) } }, { timeout: 200 });
        actualOutput = lines.join('\n');
      } else if (proof === 'brainfuck') actualOutput = bfRun(source);
      else if (proof === 'befunge-subset') actualOutput = befungeRun(source);
      durationMs = Number(process.hrtime.bigint() - start) / 1e6;
      if (actualOutput !== expectedOutput) throw Error(language + ' output differed from canonical IR');
      status = 'executed';
    }
    return { index: index + 1, language, extension: ext, filename: (language === 'Java' ? 'OmniStage.java' : 'omni_stage.' + ext), status,
      source, expectedOutput, actualOutput, durationMs, proof: proof || null };
  }
}
function translate(value) {
  return specs.map((_, i) => translateOne(value, i));
}
module.exports = { translate, translateOne, validate, bfRun, befungeRun, specs };
