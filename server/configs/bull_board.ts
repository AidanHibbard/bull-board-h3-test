import { Queue } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { H3Adapter } from '../libs/h3_adapter';

// 
const queue = new Queue('queue', {
  connection: {
    // Your REDIS connection -> https://redis.io/
  },
});

export const adapter = new H3Adapter();
// I think this stuff is optional:
const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullAdapter(queue)],
  serverAdapter: adapter,
});