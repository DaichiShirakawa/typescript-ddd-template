import { withContext } from "../../../0-base/context";
import { TestBaseEntity } from "../../../1-entities/base/__test__/test-base-entity";
import { TestBaseModel } from "../../../2-models/base/__test__/test-base-model";
import { BaseService } from "../base-service";
import { TransactionFactory } from "../../../4-infrastructure/transaction/transaction-factory";

test("BaseService", () =>
  withContext([TransactionFactory.localDBContext()], async () => {
    const s = new TestBaseService();

    const e1 = await s.create({ seq: 1 });
    expect(e1.seq).toBe(1);

    const e2 = await s.increment(e1.id);
    expect(e2).not.toBe(e1);
    expect(e2.seq).toBe(2);

    const e3 = await s.find(e1.id);
    expect(e3).not.toBe(e2);
    expect(e3.seq).toBe(2);
  }));

class TestBaseService extends BaseService {
  create(init: Pick<TestBaseEntity, "seq">) {
    return this.startTx(async (tx) => {
      const m = TestBaseModel.register(init);
      return {
        returns: () => m.e,
        saveModels: [m],
      };
    });
  }

  increment(id: string) {
    return this.startTx(async (tx) => {
      const e = await tx.findOneOrFail(TestBaseEntity, id);
      const m = new TestBaseModel({ e, array: [] });
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
