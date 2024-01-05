import {
  AppControllerRoute,
  AppViewRoute,
  BullBoardQueues,
  ControllerHandlerReturnType,
  IServerAdapter,
  UIConfig,
} from '@bull-board/api/dist/typings/app';
import { readFileSync, statSync } from 'fs';
import { createRouter, eventHandler, getRouterParams, getQuery, serveStatic } from 'h3';
import ejs from 'ejs';

export const getContentType = (filename?: string) => {
  let contentType = "text/html";

  if (!filename) return contentType;

  switch (filename.split(".").pop()) {
    case "js":
      contentType = "text/javascript";
      break;
    case "css":
      contentType = "text/css";
      break;
    case "png":
      contentType = "image/png";
      break;
    case "svg":
      contentType = "image/svg+xml";
      break;
    case "json":
      contentType = "application/json";
      break;
    case "ico":
      contentType = "image/x-icon";
      break;
  }

  return contentType;
};

export class H3Adapter implements IServerAdapter {
  private uiHandler = createRouter();
  private basePath = '/ui';
  private bullBoardQueues: BullBoardQueues | undefined;
  private viewPath: string | undefined;
  private uiConfig: UIConfig = {};

  public setBasePath(path: string): H3Adapter {
    this.basePath = path;
    return this;
  }

  public setStaticPath(staticsRoute: string, staticsPath: string): H3Adapter {
    const getStaticPath = (relativePath: string) =>
      `${staticsPath}${relativePath.replace(`${this.basePath}${staticsRoute}`, '')}`;

    this.uiHandler.get(
      `${this.basePath}${staticsRoute}/**`,
      eventHandler((event) => {
        serveStatic(event, {
          fallthrough: true,
          indexNames: undefined,
          getContents: (id) => readFileSync(getStaticPath(id)),
          getMeta: (id) => {
            const fileStat = statSync(getStaticPath(id));

            return {
              size: fileStat.size,
              type: getContentType(id),
            };
          },
        });
      })
    );

    return this;
  }

  public setViewsPath(viewPath: string): H3Adapter {
    this.viewPath = viewPath;

    return this;
  }

  public setErrorHandler(_handler: (error: Error) => ControllerHandlerReturnType) {
    return this;
  }

  public setApiRoutes(routes: AppControllerRoute[]): H3Adapter {
    routes.forEach(({ route, handler, method }) => {
      this.uiHandler.use(
        `${this.basePath}${route}`,
        eventHandler((event) => {
          const { body } = handler({
            queues: this.bullBoardQueues as BullBoardQueues,
            params: getRouterParams(event),
            query: getQuery(event),
          });

          return body;
        }),
        method
      );
    });

    return this;
  }

  public setEntryRoute(routeDef: AppViewRoute): H3Adapter {
    const { method, route } = routeDef;
    const routes = Array.isArray(route) ? route : [route];

    routes.forEach((route) => {
      this.uiHandler.use(
        `${this.basePath}${route}`,
        eventHandler(() => {
          ejs.renderFile(this.viewPath + '/index.ejs', {
            basePath: `${this.basePath}/`,
            title: this.uiConfig.boardTitle ?? 'BullMQ',
            favIconAlternative: this.uiConfig.favIcon?.alternative ?? '',
            favIconDefault: this.uiConfig.favIcon?.default ?? '',
            uiConfig: JSON.stringify(this.uiConfig),
          });
        }),
        method
      );
    });

    return this;
  }

  public setQueues(bullBoardQueues: BullBoardQueues): H3Adapter {
    this.bullBoardQueues = bullBoardQueues;
    return this;
  }

  public setUIConfig(config: UIConfig = {}): H3Adapter {
    this.uiConfig = config;

    return this;
  }

  public registerHandlers() {
    return this.uiHandler;
  }
}