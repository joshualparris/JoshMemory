// Minimal stand-ins for the Node built-ins a game server touches when it runs in a page.
export const tmpdir = () => '/tmp';
export const homedir = () => '/home';
export const join = (...p) => p.filter(Boolean).join('/').replace(/\/+/g, '/');
export const resolve = join;
export const dirname = (p) => String(p).replace(/\/[^/]*$/, '') || '/';
export const basename = (p) => String(p).split('/').pop();
export const extname = (p) => (String(p).match(/\.[^./]*$/) || [''])[0];
export const sep = '/';
export const fileURLToPath = (u) => String(u).replace(/^file:\/\//, '');
export const pathToFileURL = (p) => new URL('file://' + p);
export const readFile = async () => { throw new Error('No file system in the browser'); };
export const writeFile = async () => {};
export const mkdir = async () => {};
export default { tmpdir, homedir, join, resolve, dirname, basename, extname, sep, fileURLToPath, pathToFileURL, readFile, writeFile, mkdir, posix: { join, resolve, dirname, basename, extname, sep } };
