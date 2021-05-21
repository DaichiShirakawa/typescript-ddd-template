import { executionAsyncId, executionAsyncResource } from "async_hooks";
import { Controller, Get, Path, Route, Security, Tags } from "tsoa";
import { HttpsError } from "../0-base/https-error";
import { logs } from "../0-base/logs-context";
import { wait } from "../0-base/wait";
import { Securities } from "./base/securities";

@Route("/samples")
@Tags("99: Sample")
export class SampleAPI extends Controller {
  @Get("/get/:path")
  @Security(Securities.NONE)
  sampleGet(@Path() path: string) {
    logs().info(path);
    return `Received: ${path}`;
  }

  @Get("/error")
  @Security(Securities.NONE)
  sampleError() {
    throw new HttpsError("ok", "It's HttpsError", {
      v1: "hello",
      v2: 9,
    });
  }

  @Get("/busy")
  @Security(Securities.NONE)
  async sampleBusy() {
    let asyncId: any = executionAsyncId();
    let cr: any = executionAsyncResource();
    logs().info(`START`, { asyncId, cr });

    await wait(5000);

    asyncId = executionAsyncId();
    cr = executionAsyncResource();
    logs().info(`FINISH`, { asyncId, cr });
    return "I'm Busy";
  }
}
