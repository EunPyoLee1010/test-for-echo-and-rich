export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function stableSetInterval(callback: () => any, ms: number) {
    const standardTime = new Date().getTime();
    let time = 1;
    callback();
    while (true) {
        if (new Date().getTime() > standardTime + time * ms) {
            callback();
            time += 1;
        }
        await sleep(100);
    }
}
