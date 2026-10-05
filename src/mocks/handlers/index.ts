import { authHandlers } from './auth';
import { dashboardHandlers } from './dashboard';
import { orderHandlers } from './orders';
import { searchHandlers } from './search';
import { settingsHandlers } from './settings';
import { userHandlers } from './users';

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...orderHandlers,
  ...dashboardHandlers,
  ...searchHandlers,
  ...settingsHandlers,
];
