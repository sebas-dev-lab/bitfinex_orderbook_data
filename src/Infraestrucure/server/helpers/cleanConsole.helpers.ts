import { spawnSync } from 'child_process';

export default function cleanConsole (): void {
    if (process.platform === 'win32') {
        spawnSync('cmd', ['/c', 'clear'], { stdio: 'inherit' });
    } else {
        spawnSync('cls', [], { stdio: 'inherit' });
    }
}
