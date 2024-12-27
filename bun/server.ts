import { serve } from "bun";

const WORKER_COUNT = 12;
const workers: Worker[] = [];

for (let i = 0; i < WORKER_COUNT; i += 1) {
    const worker = new Worker('./worker.ts');
    workers.push(worker);
}

let currentWorkerIndex = 0;

export const main = () => {
    serve({
        async fetch(request, _server) {
            const url = new URL(request.url);
            if (url.pathname === '/') {
                const worker = workers[currentWorkerIndex];
                currentWorkerIndex = (currentWorkerIndex + 1) % WORKER_COUNT;

                const response = await new Promise<Response>(resolve => {
                    worker.addEventListener('message', ({ data }) => {
                        resolve(new Response(data, {
                            headers: {
                                "Content-Type": "text/html; charset=utf-8",
                            }
                        }));
                    }, { once: true });

                    worker.postMessage('start');
                });

                return response;
            }
            return new Response('Page Not Found');
        },
    })
}
