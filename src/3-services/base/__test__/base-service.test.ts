import { TestContext } from "../../../0-base/__test__/context.test";
import { TestBaseEntity } from "../../../1-entities/base/__test__/base-entity.test";
import { TestBaseModel } from "../../../2-models/base/__test__/base-model.test";
import { BaseService } from "../base-service";
import { LocalDBTransaction } from "./local-db-transaction";

export class TestBaseService extends BaseService<TestContext> {
  create(init: Pick<TestBaseEntity, "seq">) {
    return this.startTx(async (tx) => {
      const m = TestBaseModel.register(this, init);
      return {
        returns: () => m.e,
        saveModels: [m],
      };
    });
  }

  increment(id: string) {
    return this.startTx(async (tx) => {
      const e = await tx.findOneOrFail(TestBaseEntity, id);
      const m = new TestBaseModel(this, { e, array: [] });
      m.incrementSeq();
      return {
        returns: () => m.e,
        saveModels: [m],
      };
    });
  }

  find(id: string) {
    return this.startReadonlyTx((tx) => tx.findOneOrFail(TestBaseEntity, id));
  }
}

test("BaseService", async () => {
  BaseService.TX_STARTERS = {
    tx: LocalDBTransaction.startTx,
    readonlyTx: LocalDBTransaction.startReadonlyTx,
  };

  const ch = { context: new TestContext("BaseService") };

  const s = new TestBaseService(ch);

  const e1 = await s.create({ seq: 1 });
  expect(e1.seq).toBe(1);

  const e2 = await s.increment(e1.id);
  expect(e2).not.toBe(e1);
  expect(e2.seq).toBe(2);

  const e3 = await s.find(e1.id);
  expect(e3).not.toBe(e2);
  expect(e3.seq).toBe(2);
});
