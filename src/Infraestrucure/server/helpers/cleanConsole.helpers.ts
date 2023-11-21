import { spawnSync } from 'child_process';

export default function cleanConsole (): void {
    if (process.platform === 'win32') {
        console.log('entroo');

        spawnSync('cmd', ['/c', 'clear'], { stdio: 'inherit' });
    } else {
        console.log('entroo');
        spawnSync('cls', [], { stdio: 'inherit' });
    }
}
