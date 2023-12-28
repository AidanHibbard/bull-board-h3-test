import type {
  AppControllerRoute,
  AppViewRoute,
  BullBoardQueues,
  ControllerHandlerReturnType,
  FavIcon,
  IMiscLink,
  IServerAdapter,
  UIConfig,
} from '@bull-board/api/dist/typings/app';
import {
  eventHandler,
  EventHandler,
  getHeaders,
  H3Event,
  HTTPMethod,
  isMethod,
  setHeaders,
  readBody,
  createRouter, 
  defineEventHandler, 
  useBase
} from 'h3';
import type { Router, EventHandlerRequest } from 'h3';
// Needed to serve static bull board app
import serveStatic from 'serve-static';
import ejs from 'ejs';

// Example Express adapter -> https://github.com/felixmosh/bull-board/blob/master/packages/express/src/ExpressAdapter.ts
// Nested Router Docs -> https://nuxt.com/docs/guide/directory-structure/server#nested-router
export class H3Adapter implements IServerAdapter {
  protected router: Router;
  protected basePath = '';
  protected bullBoardQueues: BullBoardQueues | undefined;
  protected errorHandler: ((error: Error) => ControllerHandlerReturnType) | undefined;
  protected uiConfig: UIConfig = {};
  constructor() {
    this.router = createRouter();
  }
  setQueues(bullBoardQueues: BullBoardQueues): IServerAdapter {
    this.bullBoardQueues = bullBoardQueues;
    return this;
  }
  // I dont think we can use EJS?
  // https://github.com/felixmosh/bull-board/blob/b631a3c2e6c8dccb4dea99f3a8f693275cce5940/packages/express/src/ExpressAdapter.ts#L36
  setViewsPath(viewPath: string): IServerAdapter {
    throw new Error('Method not implemented.');
  }
  // Im not really sure how we get the event to the serveStatic method...
  setStaticPath(staticsRoute: string, staticsPath: string): IServerAdapter {
    this.router.use(staticsRoute, serveStatic(staticsPath));
    return this;
  }
  setEntryRoute(route: AppViewRoute): IServerAdapter {
    throw new Error('Method not implemented.');
  }
  setErrorHandler(handler: (error: Error) => ControllerHandlerReturnType): IServerAdapter {
    this.errorHandler = handler;
    return this;
  }
  setApiRoutes(routes: AppControllerRoute[]): IServerAdapter {
    throw new Error('Method not implemented.');
  }
  setUIConfig(config: UIConfig = {}): IServerAdapter {
    this.uiConfig = config;
    return this;
  }
  setBasePath(path: string): this {
    this.basePath = path;
    return this;
  };
  getRouter(): EventHandler<EventHandlerRequest, any> {
    return useBase(this.basePath, this.router.handler);
  };
};