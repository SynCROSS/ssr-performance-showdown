import { Elysia } from "elysia";

const WORKER_COUNT = 12;
const workers: Worker[] = [];

for (let i = 0; i < WORKER_COUNT; i += 1) {
  const worker = new Worker("src/worker.ts");
  workers.push(worker);
}

let currentWorkerIndex = 0;

const app = new Elysia()
  .get("/", async ({ set }) => {
    const worker = workers[currentWorkerIndex];
    currentWorkerIndex = (currentWorkerIndex + 1) % WORKER_COUNT;

    const response = await new Promise<String>((resolve) => {
      worker.addEventListener(
        "message",
        ({ data }) => {
          set.headers["Content-Type"] = "text/html; charset=utf-8";
          resolve(data);
        },
        { once: true }
      );

      worker.postMessage("start");
    });

    return response;
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
