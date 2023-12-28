import { adapter } from '~/server/configs/bull_board';

adapter.setBasePath('/api/admin/bull-board');

export default adapter.getRouter();